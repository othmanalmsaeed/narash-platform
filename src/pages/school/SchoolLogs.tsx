import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Star, CalendarDays, Loader2 } from "lucide-react";
import { useSchoolJournals, useSchoolDiaries, useSchoolWitness, useSchoolCompanyEvals } from "@/hooks/useSchoolData";

const SchoolLogs = () => {
  const { data: journals = [], isLoading: l1 } = useSchoolJournals();
  const { data: diaries = [], isLoading: l2 } = useSchoolDiaries();
  const { data: witnesses = [], isLoading: l3 } = useSchoolWitness();
  const { data: evals = [], isLoading: l4 } = useSchoolCompanyEvals();

  const Loading = () => <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  const Empty = ({ text }: { text: string }) => <p className="text-center text-muted-foreground py-8">{text}</p>;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">📂 السجلات</h1>

        <Tabs defaultValue="journal">
          <div className="overflow-x-auto -mx-3 px-3 sm:mx-0 sm:px-0">
            <TabsList className="w-max min-w-full sm:w-auto">
              <TabsTrigger value="journal">سجلات الطلاب</TabsTrigger>
              <TabsTrigger value="diary">يوميات الطلاب</TabsTrigger>
              <TabsTrigger value="witness">شهادات الشاهد</TabsTrigger>
              <TabsTrigger value="eval">التقييمات</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="journal" className="space-y-4 mt-4">
            {l1 ? <Loading /> : journals.length === 0 ? <Empty text="لا توجد سجلات" /> : journals.map((entry) => (
              <Card key={entry.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{entry.studentName} — {entry.week_label}</CardTitle>
                    <span className="text-sm text-muted-foreground">{entry.date}</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div><span className="font-semibold text-primary">ما تعلمته:</span> {entry.learned}</div>
                  <div><span className="font-semibold text-primary">التحديات:</span> {entry.challenges}</div>
                  <div><span className="font-semibold text-primary">الحلول:</span> {entry.solutions}</div>
                  <div><span className="font-semibold text-primary">الأهداف:</span> {entry.goals}</div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="diary" className="space-y-4 mt-4">
            {l2 ? <Loading /> : diaries.length === 0 ? <Empty text="لا توجد يوميات" /> : diaries.map((entry) => (
              <Card key={entry.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <CalendarDays className="h-4 w-4 text-primary" />
                    <CardTitle className="text-base">{entry.studentName}</CardTitle>
                    <span className="text-sm text-muted-foreground mr-auto">{entry.date}</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-relaxed text-muted-foreground">{entry.content}</p>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="witness" className="mt-4">
            {l3 ? <Loading /> : witnesses.length === 0 ? <Empty text="لا توجد شهادات" /> : (
              <Card>
                <CardContent className="pt-6">
                  <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
                    <Table className="min-w-[650px]">
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-right">الطالب</TableHead>
                          <TableHead className="text-right">الوحدة</TableHead>
                          <TableHead className="text-right">النشاط</TableHead>
                          <TableHead className="text-right">P</TableHead>
                          <TableHead className="text-right">M</TableHead>
                          <TableHead className="text-right">D</TableHead>
                          <TableHead className="text-right">التاريخ</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {witnesses.map((w) => (
                          <TableRow key={w.id}>
                            <TableCell className="text-right font-medium">{w.studentName}</TableCell>
                            <TableCell className="text-right">{w.unit_number}</TableCell>
                            <TableCell className="text-right max-w-[200px] truncate">{w.activity}</TableCell>
                            <TableCell className="text-right">{w.grade_p ? <Badge className="bg-green-100 text-green-800 hover:bg-green-100">✓</Badge> : "—"}</TableCell>
                            <TableCell className="text-right">{w.grade_m ? <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">✓</Badge> : "—"}</TableCell>
                            <TableCell className="text-right">{w.grade_d ? <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100">✓</Badge> : "—"}</TableCell>
                            <TableCell className="text-right">{w.date}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="eval" className="mt-4">
            {l4 ? <Loading /> : evals.length === 0 ? <Empty text="لا توجد تقييمات" /> : (
              <Card>
                <CardContent className="pt-6">
                  <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
                    <Table className="min-w-[500px]">
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-right">الطالب</TableHead>
                          <TableHead className="text-right">التقييم</TableHead>
                          <TableHead className="text-right">الملاحظات</TableHead>
                          <TableHead className="text-right">التاريخ</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {evals.map((e) => (
                          <TableRow key={e.id}>
                            <TableCell className="text-right font-medium">{e.studentName}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex gap-0.5">
                                {[1, 2, 3, 4, 5].map((i) => (
                                  <Star key={i} className={`h-4 w-4 ${i <= e.rating ? "fill-accent text-accent" : "text-muted-foreground/30"}`} />
                                ))}
                              </div>
                            </TableCell>
                            <TableCell className="text-right max-w-[250px] truncate">{e.comment}</TableCell>
                            <TableCell className="text-right">{e.date}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default SchoolLogs;
