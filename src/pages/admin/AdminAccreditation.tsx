import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Building2, Loader2 } from "lucide-react";
import { useAdminCompanies } from "@/hooks/useAdminData";

const statusLabels: Record<string, string> = {
  pending: "قيد المراجعة",
  approved: "معتمد",
  suspended: "معلّق",
  revoked: "مسحوب",
};

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100",
  approved: "bg-green-100 text-green-800 hover:bg-green-100",
  suspended: "bg-orange-100 text-orange-800 hover:bg-orange-100",
  revoked: "bg-red-100 text-red-800 hover:bg-red-100",
};

const AdminAccreditation = () => {
  const { data: companies = [], isLoading } = useAdminCompanies();

  const stages = ["pending", "approved", "suspended", "revoked"] as const;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Building2 className="h-7 w-7 text-primary" />
          <h1 className="text-2xl font-bold">اعتماد الشركات</h1>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
        ) : (
          <>
            {/* Pipeline View */}
            <div className="grid gap-3 grid-cols-2 md:grid-cols-4">
              {stages.map((stage) => {
                const filtered = companies.filter((c) => (c.accreditation_status ?? "pending") === stage);
                return (
                  <Card key={stage}>
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-xs font-medium">{statusLabels[stage]}</CardTitle>
                        <Badge variant="outline" className="text-xs">{filtered.length}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {filtered.map((c) => (
                        <div key={c.id} className="rounded-lg border p-2 text-sm space-y-1">
                          <p className="font-medium">{c.name}</p>
                          <p className="text-xs text-muted-foreground">{c.sector} • {c.region}</p>
                        </div>
                      ))}
                      {filtered.length === 0 && <p className="text-xs text-muted-foreground text-center py-4">لا توجد شركات</p>}
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Full Table */}
            <Card>
              <CardHeader><CardTitle>جميع الشركات ({companies.length})</CardTitle></CardHeader>
              <CardContent>
                <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
                  <Table className="min-w-[700px]">
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-right">الشركة</TableHead>
                        <TableHead className="text-right">القطاع</TableHead>
                        <TableHead className="text-right">المنطقة</TableHead>
                        <TableHead className="text-right">السعة</TableHead>
                        <TableHead className="text-right">جهة التواصل</TableHead>
                        <TableHead className="text-right">الحالة</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {companies.map((c) => (
                        <TableRow key={c.id}>
                          <TableCell className="text-right font-medium">{c.name}</TableCell>
                          <TableCell className="text-right">{c.sector}</TableCell>
                          <TableCell className="text-right">{c.region}</TableCell>
                          <TableCell className="text-right font-semibold">{c.capacity}</TableCell>
                          <TableCell className="text-right text-sm">{c.contact_person ?? "—"}</TableCell>
                          <TableCell className="text-right">
                            <Badge className={statusColors[c.accreditation_status ?? "pending"]}>
                              {statusLabels[c.accreditation_status ?? "pending"]}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AdminAccreditation;
