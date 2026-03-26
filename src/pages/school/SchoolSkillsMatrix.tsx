import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSkillsMatrix, useSelectedObjectives, useSelectObjective, useDeselectObjective } from "@/hooks/useSkillsMatrix";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Target, Check, X, Loader2, BookOpen, Sprout, Briefcase } from "lucide-react";

const CURRENT_YEAR = new Date().getFullYear();
const SECTORS = [
  { value: "الأعمال", label: "مسار الأعمال", icon: Briefcase },
  { value: "الزراعة", label: "مسار الزراعة", icon: Sprout },
];

export default function SchoolSkillsMatrix() {
  const [selectedSector, setSelectedSector] = useState<string>("الأعمال");
  const [cycleYear] = useState(CURRENT_YEAR);
  const { role } = useAuth();

  const { data: matrix, isLoading: matrixLoading } = useSkillsMatrix(selectedSector);
  const { data: selected, isLoading: selectedLoading } = useSelectedObjectives(cycleYear);
  const selectMutation = useSelectObjective();
  const deselectMutation = useDeselectObjective();

  const isAdmin = role === "admin";
  const selectedIds = new Set((selected ?? []).map((s: any) => s.objective_id));
  const selectedCount = selected?.length ?? 0;

  const handleSelect = async (objectiveId: string) => {
    if (selectedCount >= 3) {
      toast.error("لا يمكن اختيار أكثر من 3 أهداف تدريبية لكل دورة");
      return;
    }
    try {
      await selectMutation.mutateAsync({ objectiveId, cycleYear });
      toast.success("تم اختيار الهدف بنجاح");
    } catch (e: any) {
      toast.error(e.message || "حدث خطأ");
    }
  };

  const handleDeselect = async (objectiveId: string) => {
    const record = selected?.find((s: any) => s.objective_id === objectiveId);
    if (!record) return;
    try {
      await deselectMutation.mutateAsync(record.id);
      toast.success("تم إلغاء اختيار الهدف");
    } catch (e: any) {
      toast.error(e.message || "حدث خطأ");
    }
  };

  const isLoading = matrixLoading || selectedLoading;

  return (
    <DashboardLayout>
      <div className="space-y-6" dir="rtl">
        {/* Header */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Target className="h-6 w-6 text-primary" />
              مصفوفة المهارات والأهداف التدريبية
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              اختر 3 أهداف تدريبية من المصفوفة لمدرستك للدورة {cycleYear}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant={selectedCount >= 3 ? "default" : "secondary"} className="text-sm px-3 py-1">
              {selectedCount} / 3 أهداف مختارة
            </Badge>
          </div>
        </div>

        {/* Sector Filter */}
        <div className="flex gap-3">
          {SECTORS.map((s) => (
            <Button
              key={s.value}
              variant={selectedSector === s.value ? "default" : "outline"}
              onClick={() => setSelectedSector(s.value)}
              className="gap-2"
            >
              <s.icon className="h-4 w-4" />
              {s.label}
            </Button>
          ))}
        </div>

        {/* Selected Objectives Summary */}
        {selected && selected.length > 0 && (
          <Card className="border-primary/30 bg-primary/5">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Check className="h-5 w-5 text-primary" />
                الأهداف المختارة لدورة {cycleYear}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {selected.map((s: any) => (
                  <Badge key={s.id} variant="default" className="gap-2 px-3 py-1.5 text-sm">
                    هدف {(s as any).pathway_skills_matrix?.objective_number}: {(s as any).pathway_skills_matrix?.objective_title}
                    {isAdmin && (
                      <button
                        onClick={() => handleDeselect(s.objective_id)}
                        className="mr-1 hover:text-destructive"
                        disabled={deselectMutation.isPending}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    )}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Matrix Grid */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {(matrix ?? []).map((obj: any) => {
              const isSelected = selectedIds.has(obj.id);
              return (
                <Card
                  key={obj.id}
                  className={`transition-all ${isSelected ? "ring-2 ring-primary border-primary/50 bg-primary/5" : "hover:shadow-md"}`}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <Badge variant="outline" className="text-xs">
                        هدف {obj.objective_number}
                      </Badge>
                      {isSelected && (
                        <Badge variant="default" className="text-xs gap-1">
                          <Check className="h-3 w-3" /> مختار
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="text-sm mt-2 leading-relaxed">
                      {obj.objective_title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {obj.topics?.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-muted-foreground mb-1">الموضوعات:</p>
                        <div className="flex flex-wrap gap-1">
                          {obj.topics.map((t: string, i: number) => (
                            <Badge key={i} variant="secondary" className="text-xs">{t}</Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    {obj.skills?.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-muted-foreground mb-1">المهارات:</p>
                        <div className="flex flex-wrap gap-1">
                          {obj.skills.map((s: string, i: number) => (
                            <Badge key={i} variant="outline" className="text-xs">{s}</Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    {obj.applications?.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-muted-foreground mb-1">التطبيقات:</p>
                        <div className="flex flex-wrap gap-1">
                          {obj.applications.map((a: string, i: number) => (
                            <Badge key={i} variant="secondary" className="text-xs bg-accent/50">{a}</Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {isAdmin && (
                      <div className="pt-2">
                        {isSelected ? (
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full text-destructive border-destructive/30 hover:bg-destructive/10"
                            onClick={() => handleDeselect(obj.id)}
                            disabled={deselectMutation.isPending}
                          >
                            <X className="h-4 w-4 ml-1" /> إلغاء الاختيار
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            className="w-full"
                            onClick={() => handleSelect(obj.id)}
                            disabled={selectMutation.isPending || selectedCount >= 3}
                          >
                            <Target className="h-4 w-4 ml-1" /> اختيار هذا الهدف
                          </Button>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
