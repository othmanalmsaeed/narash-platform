import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";

const severityColors: Record<string, string> = {
  minor: "bg-green-100 text-green-800 hover:bg-green-100",
  moderate: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100",
  serious: "bg-orange-100 text-orange-800 hover:bg-orange-100",
  critical: "bg-red-100 text-red-800 hover:bg-red-100",
};

const statusColors: Record<string, string> = {
  reported: "bg-blue-100 text-blue-800 hover:bg-blue-100",
  first_aid: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100",
  medical_report: "bg-purple-100 text-purple-800 hover:bg-purple-100",
  under_treatment: "bg-orange-100 text-orange-800 hover:bg-orange-100",
  resolved: "bg-green-100 text-green-800 hover:bg-green-100",
  closed: "bg-muted text-muted-foreground hover:bg-muted",
};

interface IncidentTableProps {
  incidents: any[];
  updateStatus?: any;
  canUpdate?: boolean;
}

export function IncidentTable({ incidents, updateStatus, canUpdate = false }: IncidentTableProps) {
  return (
    <Card>
      <CardHeader><CardTitle>سجل الحوادث والإصابات ({incidents.length})</CardTitle></CardHeader>
      <CardContent>
        <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
          <Table className="min-w-[900px]">
            <TableHeader>
              <TableRow>
                <TableHead className="text-right">التاريخ</TableHead>
                <TableHead className="text-right">الطالب</TableHead>
                <TableHead className="text-right">النوع</TableHead>
                <TableHead className="text-right">الشدة</TableHead>
                <TableHead className="text-right">الوصف</TableHead>
                <TableHead className="text-right">الموقع</TableHead>
                <TableHead className="text-right">الحالة</TableHead>
                {canUpdate && <TableHead className="text-right">إجراءات</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {incidents.map((inc: any) => (
                <TableRow key={inc.id}>
                  <TableCell className="text-right whitespace-nowrap">{inc.incident_date}</TableCell>
                  <TableCell className="text-right font-medium">{inc.studentName}</TableCell>
                  <TableCell className="text-right"><Badge variant="outline">{inc.typeLabel}</Badge></TableCell>
                  <TableCell className="text-right"><Badge className={severityColors[inc.severity]}>{inc.severityLabel}</Badge></TableCell>
                  <TableCell className="text-right max-w-[200px] truncate">{inc.description}</TableCell>
                  <TableCell className="text-right">{inc.location ?? "—"}</TableCell>
                  <TableCell className="text-right"><Badge className={statusColors[inc.status]}>{inc.statusLabel}</Badge></TableCell>
                  {canUpdate && (
                    <TableCell className="text-right">
                      {!["resolved", "closed"].includes(inc.status) && updateStatus && (
                        <Select
                          value=""
                          onValueChange={async (v) => {
                            try {
                              await updateStatus.mutateAsync({ incidentId: inc.id, status: v });
                              toast.success("تم تحديث حالة الإصابة");
                            } catch {
                              toast.error("حدث خطأ");
                            }
                          }}
                        >
                          <SelectTrigger className="h-8 w-[120px]"><SelectValue placeholder="تحديث" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="first_aid">إسعاف أولي</SelectItem>
                            <SelectItem value="medical_report">تقرير طبي</SelectItem>
                            <SelectItem value="under_treatment">قيد العلاج</SelectItem>
                            <SelectItem value="resolved">تم الحل</SelectItem>
                            <SelectItem value="closed">مغلق</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
