type FirebaseUser = {
  id: string;
  email?: string | null;
};

type Filter = { field: string; op: "==" | "!=" | "in"; value: any };
type Operation = "select" | "insert" | "update" | "delete";

const dbStore = new Map<string, any[]>();
let currentUser: FirebaseUser | null = null;

class FirestoreQueryBuilder {
  private filters: Filter[] = [];
  private orderByField?: string;
  private ascending = true;
  private maxCount?: number;
  private operation: Operation = "select";
  private payload: any = null;
  private expectSingle = false;

  constructor(private collectionName: string) {}

  select() { this.operation = "select"; return this; }
  insert(values: any) { this.operation = "insert"; this.payload = values; return this; }
  update(values: any) { this.operation = "update"; this.payload = values; return this; }
  delete() { this.operation = "delete"; return this; }
  eq(field: string, value: any) { this.filters.push({ field, op: "==", value }); return this; }
  neq(field: string, value: any) { this.filters.push({ field, op: "!=", value }); return this; }
  in(field: string, value: any[]) { this.filters.push({ field, op: "in", value }); return this; }
  order(field: string, options?: { ascending?: boolean }) { this.orderByField = field; this.ascending = options?.ascending !== false; return this; }
  limit(count: number) { this.maxCount = count; return this; }
  single() { this.expectSingle = true; this.maxCount = 1; return this; }
  maybeSingle() { this.expectSingle = true; this.maxCount = 1; return this; }

  private applyFilters(rows: any[]) {
    let output = rows.filter((row) => this.filters.every((f) => {
      if (f.op === "==") return row?.[f.field] === f.value;
      if (f.op === "!=") return row?.[f.field] !== f.value;
      return Array.isArray(f.value) ? f.value.includes(row?.[f.field]) : false;
    }));

    if (this.orderByField) {
      output = output.sort((a, b) => {
        if (a?.[this.orderByField!] === b?.[this.orderByField!]) return 0;
        const result = a?.[this.orderByField!] > b?.[this.orderByField!] ? 1 : -1;
        return this.ascending ? result : -result;
      });
    }

    if (this.maxCount) output = output.slice(0, this.maxCount);
    return output;
  }

  async execute() {
    try {
      const rows = dbStore.get(this.collectionName) ?? [];

      if (this.operation === "insert") {
        const values = Array.isArray(this.payload) ? this.payload : [this.payload];
        const next = values.map((v) => ({ id: crypto.randomUUID(), ...v }));
        dbStore.set(this.collectionName, [...rows, ...next]);
        return { data: this.expectSingle ? next[0] : next, error: null };
      }

      const filtered = this.applyFilters(rows);

      if (this.operation === "select") {
        return { data: this.expectSingle ? (filtered[0] ?? null) : filtered, error: null };
      }

      if (this.operation === "update") {
        const ids = new Set(filtered.map((x) => x.id));
        const updated = rows.map((row) => (ids.has(row.id) ? { ...row, ...this.payload } : row));
        dbStore.set(this.collectionName, updated);
        return { data: filtered.map((row) => ({ ...row, ...this.payload })), error: null };
      }

      const ids = new Set(filtered.map((x) => x.id));
      dbStore.set(this.collectionName, rows.filter((row) => !ids.has(row.id)));
      return { data: filtered, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  then(resolve: any, reject: any) {
    return this.execute().then(resolve, reject);
  }
}

export const firebaseService = {
  from(collectionName: string) {
    return new FirestoreQueryBuilder(collectionName);
  },
  async rpc(functionName: string) {
    return { data: null, error: { message: `RPC ${functionName} is not mapped in Firebase mode` } };
  },
  functions: {
    async invoke(functionName: string) {
      return { data: null, error: { message: `Cloud Function ${functionName} is not configured` } };
    },
  },
  auth: {
    onAuthStateChange(callback: (event: string, session: { user: FirebaseUser } | null) => void) {
      callback(currentUser ? "SIGNED_IN" : "SIGNED_OUT", currentUser ? { user: currentUser } : null);
      return { data: { subscription: { unsubscribe() {} } } };
    },
    async getSession() {
      return { data: { session: currentUser ? { user: currentUser } : null } };
    },
    async signInWithPassword({ email }: { email: string; password: string }) {
      currentUser = { id: crypto.randomUUID(), email };
      return { error: null };
    },
    async signOut() {
      currentUser = null;
      return { error: null };
    },
    async resetPasswordForEmail() {
      return { error: null };
    },
    async updateUser() {
      return { error: null };
    },
  },
  storage: {
    from(bucket: string) {
      return {
        async upload(path: string) {
          return { data: { path: `${bucket}/${path}` }, error: null };
        },
        async getPublicUrl(path: string) {
          return { data: { publicUrl: `firebase://${bucket}/${path}` } };
        },
        async createSignedUrl(path: string) {
          return { data: { signedUrl: `firebase://${bucket}/${path}` }, error: null };
        },
      };
    },
  },
  channel() {
    return { on() { return this; }, subscribe() { return { unsubscribe() {} }; } };
  },
  removeChannel() {},
};

export type { FirebaseUser as User };
