import { cn } from "@/lib/utils";
import { Check, UserPlus, Search, Handshake, GraduationCap, ClipboardCheck, Award } from "lucide-react";

const phases = [
  { phase: 1, label: "التسجيل", icon: UserPlus, statuses: ["enrolled", "not_started"] },
  { phase: 2, label: "المطابقة", icon: Search, statuses: ["searching", "matched"] },
  { phase: 3, label: "التدريب", icon: Handshake, statuses: ["training"] },
  { phase: 4, label: "التقييم", icon: ClipboardCheck, statuses: ["under_review"] },
  { phase: 5, label: "الاعتماد", icon: Award, statuses: ["pending_graduation"] },
  { phase: 6, label: "التخرج", icon: GraduationCap, statuses: ["graduated", "completed", "closed"] },
];

const phaseRequirements: Record<number, string[]> = {
  1: ["إكمال البيانات الشخصية", "التحقق من التغطية الصحية"],
  2: ["البحث عن شركة مناسبة", "توقيع اتفاقية التدريب"],
  3: ["تسجيل الحضور يومياً", "تعبئة اليومية وسجل المهارات", "إتمام الساعات المطلوبة"],
  4: ["تقييم المشرف المدرسي (P/M/D)", "تقييم مشرف العمل", "قفل التقييم المزدوج"],
  5: ["مراجعة الأدمن للملف الكامل", "اعتماد الدرجة النهائية"],
  6: ["تم التخرج بنجاح 🎓"],
};

interface PhaseTrackerProps {
  currentPhase: number;
  status: string;
  finalGrade?: string | null;
}

export function PhaseTracker({ currentPhase, status, finalGrade }: PhaseTrackerProps) {
  return (
    <div className="w-full space-y-4">
      {/* Stepper */}
      <div className="flex items-center justify-between gap-1">
        {phases.map((p, i) => {
          const isCompleted = currentPhase > p.phase;
          const isCurrent = currentPhase === p.phase;
          const Icon = isCompleted ? Check : p.icon;

          return (
            <div key={p.phase} className="flex flex-1 items-center">
              <div className="flex flex-col items-center gap-1.5 flex-shrink-0">
                <div
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all duration-300",
                    isCompleted && "border-primary bg-primary text-primary-foreground",
                    isCurrent && "border-primary bg-primary/10 text-primary ring-4 ring-primary/20",
                    !isCompleted && !isCurrent && "border-muted-foreground/30 bg-muted text-muted-foreground/50"
                  )}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <span
                  className={cn(
                    "text-[11px] font-medium text-center leading-tight max-w-[70px]",
                    isCurrent && "text-primary font-bold",
                    isCompleted && "text-primary/70",
                    !isCompleted && !isCurrent && "text-muted-foreground/60"
                  )}
                >
                  {p.label}
                </span>
              </div>
              {i < phases.length - 1 && (
                <div
                  className={cn(
                    "h-0.5 flex-1 mx-1 mt-[-18px] rounded-full transition-all duration-300",
                    currentPhase > p.phase ? "bg-primary" : "bg-muted-foreground/20"
                  )}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Current phase requirements */}
      {currentPhase <= 6 && (
        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-semibold text-foreground">
              المرحلة الحالية: {phases.find((p) => p.phase === currentPhase)?.label}
            </h4>
            {finalGrade && currentPhase === 6 && (
              <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-sm font-bold text-primary">
                الدرجة النهائية: {finalGrade}
              </span>
            )}
          </div>
          <ul className="space-y-1">
            {(phaseRequirements[currentPhase] ?? []).map((req, i) => (
              <li key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="h-1.5 w-1.5 rounded-full bg-primary/40 flex-shrink-0" />
                {req}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
