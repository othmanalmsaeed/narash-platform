import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface IncidentSummaryCardsProps {
  total: number;
  active: number;
  critical: number;
  resolved: number;
}

export function IncidentSummaryCards({ total, active, critical, resolved }: IncidentSummaryCardsProps) {
  return (
    <div className="grid gap-4 grid-cols-2 sm:grid-cols-4">
      <Card className="border-r-4 border-r-primary">
        <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">إجمالي الحوادث</CardTitle></CardHeader>
        <CardContent><div className="text-3xl font-bold">{total}</div></CardContent>
      </Card>
      <Card className="border-r-4 border-r-orange-500">
        <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">حالات نشطة</CardTitle></CardHeader>
        <CardContent><div className="text-3xl font-bold text-orange-600">{active}</div></CardContent>
      </Card>
      <Card className="border-r-4 border-r-red-500">
        <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">خطيرة / حرجة</CardTitle></CardHeader>
        <CardContent><div className="text-3xl font-bold text-red-600">{critical}</div></CardContent>
      </Card>
      <Card className="border-r-4 border-r-green-500">
        <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">تم حلها</CardTitle></CardHeader>
        <CardContent><div className="text-3xl font-bold text-green-600">{resolved}</div></CardContent>
      </Card>
    </div>
  );
}
