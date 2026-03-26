import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Layers, Loader2 } from "lucide-react";
import { useAdminSectors } from "@/hooks/useAdminData";

const AdminSectors = () => {
  const { data: sectors = [], isLoading } = useAdminSectors();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Layers className="h-7 w-7 text-primary" />
          <h1 className="text-2xl font-bold">إدارة القطاعات</h1>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
        ) : sectors.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">لا توجد قطاعات</p>
        ) : (
          <>
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
              {sectors.map((s) => (
                <Card key={s.name} className="border-r-4 border-r-primary">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">{s.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <p className="text-2xl font-bold">
                      {s.studentCount} <span className="text-sm font-normal text-muted-foreground">طالب</span>
                    </p>
                    <p className="text-xs text-muted-foreground">{s.specializations.length} تخصص</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card>
              <CardHeader><CardTitle>تفاصيل القطاعات</CardTitle></CardHeader>
              <CardContent>
                <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
                  <Table className="min-w-[600px]">
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-right">القطاع</TableHead>
                        <TableHead className="text-right">التخصصات</TableHead>
                        <TableHead className="text-right">عدد الطلاب</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sectors.map((s) => (
                        <TableRow key={s.name}>
                          <TableCell className="text-right font-medium">{s.name}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex flex-wrap gap-1">
                              {s.specializations.map((sp) => (
                                <Badge key={sp} variant="secondary" className="text-xs">{sp}</Badge>
                              ))}
                            </div>
                          </TableCell>
                          <TableCell className="text-right font-semibold">{s.studentCount}</TableCell>
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

export default AdminSectors;
