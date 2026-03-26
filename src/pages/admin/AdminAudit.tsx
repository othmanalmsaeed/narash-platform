import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollText, Loader2 } from "lucide-react";
import { useAdminAuditLogs } from "@/hooks/useAdminData";

const actionLabel: Record<string, string> = {
  CREATE: "إنشاء",
  UPDATE: "تعديل",
  DELETE: "حذف",
  APPROVE: "موافقة",
  REJECT: "رفض",
  LOCK: "قفل",
};

const actionColor: Record<string, string> = {
  CREATE: "bg-blue-100 text-blue-800 hover:bg-blue-100",
  UPDATE: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100",
  DELETE: "bg-red-100 text-red-800 hover:bg-red-100",
  APPROVE: "bg-green-100 text-green-800 hover:bg-green-100",
  REJECT: "bg-orange-100 text-orange-800 hover:bg-orange-100",
  LOCK: "bg-purple-100 text-purple-800 hover:bg-purple-100",
};

const roleLabel: Record<string, string> = {
  admin: "مدير",
  school_supervisor: "مشرف مدرسي",
  company_supervisor: "مشرف عمل",
  student: "طالب",
  regional: "منسق إقليمي",
  ministry: "وزارة",
};

const AdminAudit = () => {
  const [actionFilter, setActionFilter] = useState<string>("all");
  const [entityFilter, setEntityFilter] = useState<string>("all");
  const { data: allRecords = [], isLoading } = useAdminAuditLogs();

  const records = allRecords.filter(
    (r) =>
      (actionFilter === "all" || r.action_type === actionFilter) &&
      (entityFilter === "all" || r.entity_type === entityFilter)
  );

  const entityTypes = [...new Set(allRecords.map((r) => r.entity_type))];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <ScrollText className="h-7 w-7 text-primary" />
          <h1 className="text-2xl font-bold">سجل التتبع</h1>
        </div>

        <div className="flex flex-wrap gap-4">
          <Select value={actionFilter} onValueChange={setActionFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="نوع الإجراء" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">جميع الإجراءات</SelectItem>
              {["CREATE", "UPDATE", "DELETE", "APPROVE", "REJECT", "LOCK"].map((t) => (
                <SelectItem key={t} value={t}>{actionLabel[t]}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={entityFilter} onValueChange={setEntityFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="نوع الكيان" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">جميع الكيانات</SelectItem>
              {entityTypes.map((t) => (
                <SelectItem key={t} value={t}>{t}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>سجلات التتبع ({records.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {records.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">لا توجد سجلات تتبع بعد</p>
              ) : (
                <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
                  <Table className="min-w-[750px]">
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-right">الكيان</TableHead>
                        <TableHead className="text-right">الإجراء</TableHead>
                        <TableHead className="text-right">الدور</TableHead>
                        <TableHead className="text-right">السبب</TableHead>
                        <TableHead className="text-right">الزمن</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {records.map((r) => (
                        <TableRow key={r.id}>
                          <TableCell className="text-right">
                            <Badge variant="outline">{r.entity_type}</Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Badge className={actionColor[r.action_type] ?? "bg-muted text-muted-foreground"}>
                              {actionLabel[r.action_type] ?? r.action_type}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right text-sm">
                            {roleLabel[r.role ?? ""] ?? r.role ?? "—"}
                          </TableCell>
                          <TableCell className="text-right text-sm max-w-[250px] truncate">{r.reason ?? "—"}</TableCell>
                          <TableCell className="text-right text-xs">
                            {r.created_at
                              ? new Date(r.created_at).toLocaleDateString("ar-JO", {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })
                              : "—"}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AdminAudit;
