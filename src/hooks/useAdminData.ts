import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

// ============ Admin Stats ============

export function useAdminStats() {
  const { schoolId } = useAuth();
  return useQuery({
    queryKey: ["admin-stats", schoolId],
    enabled: !!schoolId,
    queryFn: async () => {
      const { data: students, error } = await supabase
        .from("students")
        .select("id, status, completed_hours, total_hours")
        .eq("school_id", schoolId!);
      if (error) throw error;

      const all = students ?? [];
      const training = all.filter((s) => s.status === "training").length;
      const completed = all.filter((s) => s.status === "completed").length;

      // unmatched = students without an active placement
      const { data: placements } = await supabase
        .from("placements")
        .select("student_id")
        .eq("school_id", schoolId!)
        .eq("status", "active");
      const placedIds = new Set((placements ?? []).map((p) => p.student_id));
      const unmatched = all.filter((s) => !placedIds.has(s.id) && s.status !== "completed" && s.status !== "withdrawn").length;

      return { totalStudents: all.length, currentlyTraining: training, completed, unmatched };
    },
  });
}

// ============ Students Table ============

export function useAdminStudents() {
  const { schoolId } = useAuth();
  return useQuery({
    queryKey: ["admin-students", schoolId],
    enabled: !!schoolId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("students")
        .select("id, student_number, national_id, gender, status, completed_hours, total_hours, profiles!inner(full_name, phone)")
        .eq("school_id", schoolId!);
      if (error) throw error;

      // Get placements for company & supervisor info
      const { data: placements } = await supabase
        .from("placements")
        .select("student_id, companies(name), profiles!placements_school_supervisor_id_fkey(full_name)")
        .eq("school_id", schoolId!)
        .eq("status", "active");

      const placementMap = new Map<string, { company: string; supervisor: string }>();
      (placements ?? []).forEach((p) => {
        placementMap.set(p.student_id, {
          company: (p.companies as any)?.name ?? "—",
          supervisor: (p.profiles as any)?.full_name ?? "—",
        });
      });

      const statusMap: Record<string, string> = {
        enrolled: "مسجّل",
        training: "قيد التدريب",
        completed: "مكتمل",
        withdrawn: "منسحب",
      };

      return (data ?? []).map((s) => {
        const pm = placementMap.get(s.id);
        const progress = s.total_hours ? Math.round(((s.completed_hours ?? 0) / s.total_hours) * 100) : 0;
        return {
          id: s.id,
          name: (s.profiles as any)?.full_name ?? "",
          phone: (s.profiles as any)?.phone ?? "—",
          nationalId: s.national_id ?? "—",
          gender: s.gender === "male" ? "ذكر" : s.gender === "female" ? "أنثى" : "—",
          company: pm?.company ?? "—",
          supervisor: pm?.supervisor ?? "—",
          status: statusMap[s.status ?? "enrolled"] ?? s.status,
          progress,
        };
      });
    },
  });
}

// ============ Attendance Records ============

export function useAdminAttendance() {
  const { schoolId } = useAuth();
  return useQuery({
    queryKey: ["admin-attendance", schoolId],
    enabled: !!schoolId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("attendance")
        .select("*, students!inner(profiles!inner(full_name))")
        .eq("school_id", schoolId!)
        .order("date", { ascending: false })
        .limit(50);
      if (error) throw error;

      const statusMap: Record<string, string> = {
        present: "حاضر",
        absent: "غائب",
        late: "متأخر",
        early_leave: "خروج مبكر",
        excused: "معذور",
      };

      return (data ?? []).map((r) => ({
        id: r.id,
        date: r.date,
        studentName: (r.students as any)?.profiles?.full_name ?? "",
        entryTime: r.entry_time ?? "—",
        exitTime: r.exit_time ?? "—",
        status: statusMap[r.status] ?? r.status,
      }));
    },
  });
}

// ============ Witness Statements ============

export function useAdminWitness() {
  const { schoolId } = useAuth();
  return useQuery({
    queryKey: ["admin-witness", schoolId],
    enabled: !!schoolId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("witness_statements")
        .select("*, students!inner(profiles!inner(full_name))")
        .eq("school_id", schoolId!)
        .order("date", { ascending: false })
        .limit(50);
      if (error) throw error;
      return (data ?? []).map((w) => ({
        id: w.id,
        studentName: (w.students as any)?.profiles?.full_name ?? "",
        unitNumber: w.unit_number,
        activity: w.activity,
        gradeP: w.grade_p,
        gradeM: w.grade_m,
        gradeD: w.grade_d,
        date: w.date,
      }));
    },
  });
}

// ============ Evaluations (company) ============

export function useAdminEvaluations() {
  const { schoolId } = useAuth();
  return useQuery({
    queryKey: ["admin-evaluations", schoolId],
    enabled: !!schoolId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("evaluations_company")
        .select("*, students!inner(profiles!inner(full_name))")
        .eq("school_id", schoolId!)
        .order("date", { ascending: false })
        .limit(50);
      if (error) throw error;
      return (data ?? []).map((e) => ({
        id: e.id,
        studentName: (e.students as any)?.profiles?.full_name ?? "",
        rating: e.rating,
        comment: e.comment ?? "",
        date: e.date,
      }));
    },
  });
}

// ============ Observations ============

export function useAdminObservations() {
  const { schoolId } = useAuth();
  return useQuery({
    queryKey: ["admin-observations", schoolId],
    enabled: !!schoolId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("observations")
        .select("*, students!inner(profiles!inner(full_name))")
        .eq("school_id", schoolId!)
        .order("date", { ascending: false })
        .limit(50);
      if (error) throw error;
      return (data ?? []).map((o) => ({
        id: o.id,
        studentName: (o.students as any)?.profiles?.full_name ?? "",
        date: o.date,
        activities: o.activities ?? "",
        questions: o.questions ?? "",
        evidence: o.evidence ?? "",
        recommendations: o.recommendations ?? "",
      }));
    },
  });
}

// ============ Chart data derived from stats ============

export function useAdminChartData() {
  const { data: stats } = useAdminStats();
  const { data: students } = useAdminStudents();

  const barData = stats
    ? [
        { name: "قيد التدريب", value: stats.currentlyTraining },
        { name: "مكتمل", value: stats.completed },
        { name: "غير مُطابق", value: stats.unmatched },
      ]
    : [];

  const pieData = stats
    ? [
        { name: "قيد التدريب", value: stats.currentlyTraining, color: "hsl(267, 56%, 35%)" },
        { name: "مكتمل", value: stats.completed, color: "hsl(142, 71%, 45%)" },
        { name: "غير مُطابق", value: stats.unmatched, color: "hsl(0, 84%, 60%)" },
      ]
    : [];

  return { barData, pieData };
}

// ============ Placements (for AdminPlacement) ============

export function useAdminPlacements() {
  const { schoolId } = useAuth();
  return useQuery({
    queryKey: ["admin-placements", schoolId],
    enabled: !!schoolId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("placements")
        .select(`
          id, status, start_date, student_id,
          students!inner(profiles!inner(full_name), specialization_id, specializations(name)),
          companies!inner(name, sector)
        `)
        .eq("school_id", schoolId!)
        .order("created_at", { ascending: false });
      if (error) throw error;

      const statusLabels: Record<string, string> = {
        pending: "معلّق",
        active: "معتمد",
        completed: "مكتمل",
        cancelled: "ملغى",
      };

      return (data ?? []).map((p) => ({
        id: p.id,
        studentName: (p.students as any)?.profiles?.full_name ?? "",
        companyName: (p.companies as any)?.name ?? "",
        pathway: (p.students as any)?.specializations?.name ?? (p.companies as any)?.sector ?? "—",
        status: p.status ?? "pending",
        statusLabel: statusLabels[p.status ?? "pending"] ?? p.status,
        assignmentDate: p.start_date,
      }));
    },
  });
}

// ============ Capacity (for AdminCapacity) ============

export function useAdminCapacity() {
  const { schoolId } = useAuth();
  return useQuery({
    queryKey: ["admin-capacity", schoolId],
    enabled: !!schoolId,
    queryFn: async () => {
      const { data: companies, error } = await supabase
        .from("companies")
        .select("id, name, capacity")
        .eq("school_id", schoolId!)
        .eq("is_active", true);
      if (error) throw error;

      // Count active placements per company
      const { data: placements } = await supabase
        .from("placements")
        .select("company_id")
        .eq("school_id", schoolId!)
        .eq("status", "active");

      const occupiedMap = new Map<string, number>();
      (placements ?? []).forEach((p) => {
        occupiedMap.set(p.company_id, (occupiedMap.get(p.company_id) ?? 0) + 1);
      });

      return (companies ?? []).map((c) => {
        const occupied = occupiedMap.get(c.id) ?? 0;
        return {
          id: c.id,
          companyName: c.name,
          totalSeats: c.capacity,
          occupiedSeats: occupied,
          remainingSeats: Math.max(0, c.capacity - occupied),
        };
      });
    },
  });
}

// ============ Sectors (for AdminSectors) ============

export function useAdminSectors() {
  const { schoolId } = useAuth();
  return useQuery({
    queryKey: ["admin-sectors", schoolId],
    enabled: !!schoolId,
    queryFn: async () => {
      const { data: specs, error } = await supabase
        .from("specializations")
        .select("id, name, sector");
      if (error) throw error;

      const { data: students } = await supabase
        .from("students")
        .select("id, specialization_id")
        .eq("school_id", schoolId!);

      const specCountMap = new Map<string, number>();
      (students ?? []).forEach((s) => {
        if (s.specialization_id) {
          specCountMap.set(s.specialization_id, (specCountMap.get(s.specialization_id) ?? 0) + 1);
        }
      });

      const sectorMap = new Map<string, { name: string; specializations: string[]; studentCount: number }>();
      (specs ?? []).forEach((sp) => {
        const existing = sectorMap.get(sp.sector);
        const count = specCountMap.get(sp.id) ?? 0;
        if (existing) {
          existing.specializations.push(sp.name);
          existing.studentCount += count;
        } else {
          sectorMap.set(sp.sector, {
            name: sp.sector,
            specializations: [sp.name],
            studentCount: count,
          });
        }
      });

      return Array.from(sectorMap.values());
    },
  });
}

// ============ Companies / Accreditation (for AdminAccreditation) ============

export function useAdminCompanies() {
  const { schoolId } = useAuth();
  return useQuery({
    queryKey: ["admin-companies", schoolId],
    enabled: !!schoolId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("companies")
        .select("*")
        .eq("school_id", schoolId!)
        .order("name");
      if (error) throw error;
      return data ?? [];
    },
  });
}

// ============ Audit Logs (for AdminAudit) ============

export function useAdminAuditLogs() {
  const { schoolId } = useAuth();
  return useQuery({
    queryKey: ["admin-audit-logs", schoolId],
    enabled: !!schoolId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("audit_logs")
        .select("*")
        .eq("school_id", schoolId!)
        .order("created_at", { ascending: false })
        .limit(100);
      if (error) throw error;
      return data ?? [];
    },
  });
}

// ============ Risks (computed from real data) ============

export function useAdminRisks() {
  const { schoolId } = useAuth();
  return useQuery({
    queryKey: ["admin-risks", schoolId],
    enabled: !!schoolId,
    queryFn: async () => {
      const risks: Array<{
        id: string;
        type: string;
        typeLabel: string;
        description: string;
        severity: "Low" | "Moderate" | "Critical";
        relatedEntityName: string;
        detectedDate: string;
        suggestedAction: string;
        status: "Open" | "UnderReview" | "Resolved";
      }> = [];

      // 1. Students with high absence
      const { data: attendance } = await supabase
        .from("attendance")
        .select("student_id, status, date, students!inner(profiles!inner(full_name))")
        .eq("school_id", schoolId!);

      const studentAbsences = new Map<string, { name: string; absent: number; total: number }>();
      (attendance ?? []).forEach((a) => {
        const name = (a.students as any)?.profiles?.full_name ?? "";
        const existing = studentAbsences.get(a.student_id) ?? { name, absent: 0, total: 0 };
        existing.total++;
        if (a.status === "absent") existing.absent++;
        studentAbsences.set(a.student_id, existing);
      });

      studentAbsences.forEach((v, studentId) => {
        if (v.total >= 3 && v.absent / v.total > 0.3) {
          risks.push({
            id: `abs-${studentId}`,
            type: "StudentAbsence",
            typeLabel: "غياب طالب",
            description: `نسبة غياب ${Math.round((v.absent / v.total) * 100)}% (${v.absent} من ${v.total})`,
            severity: v.absent / v.total > 0.5 ? "Critical" : "Moderate",
            relatedEntityName: v.name,
            detectedDate: new Date().toISOString().split("T")[0],
            suggestedAction: "التواصل مع الطالب وولي الأمر",
            status: "Open",
          });
        }
      });

      // 2. Companies over capacity
      const { data: companies } = await supabase
        .from("companies")
        .select("id, name, capacity")
        .eq("school_id", schoolId!)
        .eq("is_active", true);

      const { data: activePlacements } = await supabase
        .from("placements")
        .select("company_id")
        .eq("school_id", schoolId!)
        .eq("status", "active");

      const companyPlacementCount = new Map<string, number>();
      (activePlacements ?? []).forEach((p) => {
        companyPlacementCount.set(p.company_id, (companyPlacementCount.get(p.company_id) ?? 0) + 1);
      });

      (companies ?? []).forEach((c) => {
        const occupied = companyPlacementCount.get(c.id) ?? 0;
        if (c.capacity > 0 && occupied > c.capacity) {
          risks.push({
            id: `cap-${c.id}`,
            type: "CapacityViolation",
            typeLabel: "تجاوز سعة",
            description: `${occupied} متدرب من أصل ${c.capacity} مقعد`,
            severity: "Critical",
            relatedEntityName: c.name,
            detectedDate: new Date().toISOString().split("T")[0],
            suggestedAction: "إعادة توزيع المتدربين أو زيادة السعة",
            status: "Open",
          });
        }
      });

      // 3. Students without evidence
      const { data: students } = await supabase
        .from("students")
        .select("id, profiles!inner(full_name)")
        .eq("school_id", schoolId!)
        .eq("status", "training");

      const { data: evidenceRecords } = await supabase
        .from("evidence_records")
        .select("student_id")
        .eq("school_id", schoolId!);

      const studentsWithEvidence = new Set((evidenceRecords ?? []).map((e) => e.student_id));
      (students ?? []).forEach((s) => {
        if (!studentsWithEvidence.has(s.id)) {
          risks.push({
            id: `evi-${s.id}`,
            type: "MissingEvidence",
            typeLabel: "أدلة مفقودة",
            description: "لم يرفع أي دليل حتى الآن",
            severity: "Moderate",
            relatedEntityName: (s.profiles as any)?.full_name ?? "",
            detectedDate: new Date().toISOString().split("T")[0],
            suggestedAction: "تذكير الطالب برفع الأدلة",
            status: "Open",
          });
        }
      });

      return risks;
    },
  });
}

// ============ Assurance KPIs (computed from real data) ============

export function useAdminAssurance() {
  const { schoolId } = useAuth();
  return useQuery({
    queryKey: ["admin-assurance", schoolId],
    enabled: !!schoolId,
    queryFn: async () => {
      // Companies
      const { data: companies } = await supabase
        .from("companies")
        .select("id, capacity, is_active, accreditation_status")
        .eq("school_id", schoolId!);

      const totalCapacity = (companies ?? []).reduce((sum, c) => sum + (c.capacity ?? 0), 0);
      const activeCompanies = (companies ?? []).filter((c) => c.is_active).length;
      const approvedCompanies = (companies ?? []).filter((c) => c.accreditation_status === "approved").length;

      // Students
      const { data: students } = await supabase
        .from("students")
        .select("id, status")
        .eq("school_id", schoolId!);

      const totalStudents = (students ?? []).length;
      const trainingStudents = (students ?? []).filter((s) => s.status === "training").length;
      const completedStudents = (students ?? []).filter((s) => s.status === "completed").length;

      // Placements
      const { data: placements } = await supabase
        .from("placements")
        .select("id, status")
        .eq("school_id", schoolId!);

      const activePlacements = (placements ?? []).filter((p) => p.status === "active").length;

      // Attendance compliance
      const { data: attendance } = await supabase
        .from("attendance")
        .select("status")
        .eq("school_id", schoolId!);

      const totalAttendance = (attendance ?? []).length;
      const presentCount = (attendance ?? []).filter((a) => a.status === "present" || a.status === "late").length;
      const attendanceRate = totalAttendance > 0 ? (presentCount / totalAttendance) * 100 : 0;

      const utilizationRate = totalCapacity > 0 ? (activePlacements / totalCapacity) * 100 : 0;
      const completionRate = totalStudents > 0 ? (completedStudents / totalStudents) * 100 : 0;
      const varianceIndex = totalCapacity > 0 ? Math.abs(totalCapacity - activePlacements) / totalCapacity * 100 : 0;

      return {
        totalCapacity,
        activeCompanies,
        approvedCompanies,
        totalStudents,
        trainingStudents,
        completedStudents,
        activePlacements,
        utilizationRate,
        completionRate,
        attendanceRate,
        varianceIndex,
        seatsData: [
          { name: "السعة الكلية", value: totalCapacity },
          { name: "موزع", value: activePlacements },
          { name: "نشط", value: trainingStudents },
          { name: "مكتمل", value: completedStudents },
        ],
      };
    },
  });
}

// ============ Program Cycles (for AdminSchedule) ============

interface ScheduleWindow {
  label: string;
  from: string;
  to: string;
}

interface ReportingDeadline {
  label: string;
  date: string;
}

export interface ProgramCycleRow {
  id: string;
  school_id: string;
  name: string;
  start_date: string;
  end_date: string;
  status: string;
  visit_windows: ScheduleWindow[];
  assessment_windows: ScheduleWindow[];
  reporting_deadlines: ReportingDeadline[];
}

export function useAdminProgramCycles() {
  const { schoolId } = useAuth();
  return useQuery({
    queryKey: ["admin-program-cycles", schoolId],
    enabled: !!schoolId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("program_cycles" as any)
        .select("*")
        .eq("school_id", schoolId!)
        .order("start_date", { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as ProgramCycleRow[];
    },
  });
}

export function useCreateProgramCycle() {
  const { schoolId } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (cycle: {
      name: string;
      start_date: string;
      end_date: string;
      status: string;
      visit_windows: ScheduleWindow[];
      assessment_windows: ScheduleWindow[];
      reporting_deadlines: ReportingDeadline[];
    }) => {
      const { error } = await supabase
        .from("program_cycles" as any)
        .insert({ ...cycle, school_id: schoolId! } as any);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-program-cycles"] }),
  });
}

// ============ Regulatory: Qualification Mappings ============

export function useAdminQualificationMappings() {
  const { schoolId } = useAuth();
  return useQuery({
    queryKey: ["admin-qualification-mappings", schoolId],
    enabled: !!schoolId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("qualification_mappings" as any)
        .select("*")
        .eq("school_id", schoolId!)
        .order("sector");
      if (error) throw error;
      return (data ?? []) as unknown as Array<{
        id: string;
        school_id: string;
        sector: string;
        pathway_name: string;
        mapped_nqf_level: number;
        learning_outcome_domains: string[];
        endorsed_by: string;
        endorsement_reference: string;
        valid_from: string | null;
        valid_to: string | null;
        status: "Draft" | "Endorsed" | "Expired";
      }>;
    },
  });
}

// ============ Regulatory: Program Authorizations ============

export function useAdminProgramAuthorizations() {
  const { schoolId } = useAuth();
  return useQuery({
    queryKey: ["admin-program-authorizations", schoolId],
    enabled: !!schoolId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("program_authorizations" as any)
        .select("*")
        .eq("school_id", schoolId!)
        .order("cycle_year", { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as Array<{
        id: string;
        school_id: string;
        cycle_year: number;
        authorized_student_quota: number;
        authorized_sectors: string[];
        approval_authority: string;
        approval_reference: string;
        approval_date: string | null;
        budget_envelope_reference: string;
        status: "Proposed" | "Approved" | "Suspended" | "Closed";
      }>;
    },
  });
}

// ============ Regulatory: Program Risks ============

export function useAdminProgramRisks() {
  const { schoolId } = useAuth();
  return useQuery({
    queryKey: ["admin-program-risks", schoolId],
    enabled: !!schoolId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("program_risks" as any)
        .select("*")
        .eq("school_id", schoolId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as Array<{
        id: string;
        school_id: string;
        category: "Capacity" | "Industry" | "Financial" | "Safety" | "Policy";
        description: string;
        likelihood: "Low" | "Medium" | "High";
        impact: "Moderate" | "Serious" | "Critical";
        mitigation_plan: string;
        owner_authority: string;
        review_frequency: string;
        last_reviewed: string | null;
        status: "Open" | "Monitoring" | "Mitigated" | "Escalated";
      }>;
    },
  });
}

// ============ Regulatory: Status Summary (computed) ============

export function useAdminRegulatoryStatus() {
  const { data: authorizations } = useAdminProgramAuthorizations();
  const { data: mappings } = useAdminQualificationMappings();
  const { data: risks } = useAdminProgramRisks();
  const { data: students } = useAdminStudents();

  const currentYear = new Date().getFullYear();
  const currentAuth = (authorizations ?? []).find((a) => a.cycle_year === currentYear);
  const authorized = currentAuth?.status === "Approved";

  const endorsedCount = (mappings ?? []).filter((m) => m.status === "Endorsed").length;
  const totalMappings = (mappings ?? []).length;

  const activeRisks = (risks ?? []).filter(
    (r) => r.status === "Open" || r.status === "Monitoring" || r.status === "Escalated"
  );
  const criticalCount = activeRisks.filter(
    (r) => r.impact === "Critical" || r.status === "Escalated"
  ).length;
  const highCount = activeRisks.filter(
    (r) => r.likelihood === "High" && r.impact === "Serious"
  ).length;
  const hasCriticalThreshold = criticalCount > 0 || highCount >= 2;

  let overallStatus: "COMPLIANT" | "WARNING" | "NON_COMPLIANT" = "COMPLIANT";
  if (!authorized) overallStatus = "NON_COMPLIANT";
  else if (hasCriticalThreshold || endorsedCount < totalMappings) overallStatus = "WARNING";

  const activeStudents = (students ?? []).length;

  return {
    overallStatus,
    authorized,
    currentAuth: currentAuth ?? null,
    endorsedCount,
    totalMappings,
    criticalCount,
    highCount,
    hasCriticalThreshold,
    activeStudents,
  };
}

// ============ New Feature Stats for Dashboard ============

export function useAdminNewFeatureStats() {
  const { schoolId } = useAuth();
  return useQuery({
    queryKey: ["admin-new-feature-stats", schoolId],
    enabled: !!schoolId,
    queryFn: async () => {
      // Policy violations
      const { data: violations } = await supabase
        .from("policy_violations")
        .select("id, status, severity, violation_type")
        .eq("school_id", schoolId!);

      const openViolations = (violations ?? []).filter(v => v.status === "open" || v.status === "escalated").length;
      const resolvedViolations = (violations ?? []).filter(v => v.status === "resolved").length;
      const totalViolations = (violations ?? []).length;
      const violationsByType = {
        absence: (violations ?? []).filter(v => v.violation_type === "absence").length,
        non_submission: (violations ?? []).filter(v => v.violation_type === "non_submission").length,
        late_submission: (violations ?? []).filter(v => v.violation_type === "late_submission").length,
        evidence_rejected: (violations ?? []).filter(v => v.violation_type === "evidence_rejected").length,
      };
      const violationsBySeverity = {
        warning: (violations ?? []).filter(v => v.severity === "warning").length,
        formal_warning: (violations ?? []).filter(v => v.severity === "formal_warning").length,
        action_plan: (violations ?? []).filter(v => v.severity === "action_plan").length,
        referral: (violations ?? []).filter(v => v.severity === "referral").length,
      };

      // Trainer contracts
      const { data: contracts } = await supabase
        .from("external_trainer_contracts")
        .select("id, status, completed_hours, total_hours, financial_amount")
        .eq("school_id", schoolId!);

      const activeContracts = (contracts ?? []).filter(c => c.status === "active").length;
      const completedContracts = (contracts ?? []).filter(c => c.status === "completed").length;
      const totalContracts = (contracts ?? []).length;
      const totalTrainingHours = (contracts ?? []).reduce((s, c) => s + (c.total_hours ?? 0), 0);
      const completedTrainingHours = (contracts ?? []).reduce((s, c) => s + (c.completed_hours ?? 0), 0);
      const totalFinancial = (contracts ?? []).reduce((s, c) => s + (Number(c.financial_amount) || 0), 0);

      // Skills matrix selections
      const { data: selections } = await supabase
        .from("school_selected_objectives")
        .select("id, objective_id, pathway_skills_matrix!inner(sector)")
        .eq("school_id", schoolId!);

      const selectedObjectives = (selections ?? []).length;
      const sectorSelections: Record<string, number> = {};
      (selections ?? []).forEach((s: any) => {
        const sector = s.pathway_skills_matrix?.sector ?? "غير محدد";
        sectorSelections[sector] = (sectorSelections[sector] ?? 0) + 1;
      });

      // Cross-school training
      const { data: crossRequests } = await supabase
        .from("cross_school_training_requests")
        .select("id, status")
        .or(`source_school_id.eq.${schoolId},destination_school_id.eq.${schoolId}`);

      const pendingCross = (crossRequests ?? []).filter(r => r.status === "pending" || r.status === "approved_source" || r.status === "approved_destination").length;
      const approvedCross = (crossRequests ?? []).filter(r => r.status === "fully_approved").length;
      const totalCross = (crossRequests ?? []).length;

      // Corrective actions
      const { data: correctiveActions } = await supabase
        .from("corrective_action_plans")
        .select("id, status")
        .eq("school_id", schoolId!);

      const activeCorrective = (correctiveActions ?? []).filter(a => a.status === "pending" || a.status === "in_progress").length;

      // Resubmissions
      const { data: resubmissions } = await supabase
        .from("resubmission_requests")
        .select("id, status")
        .eq("school_id", schoolId!);

      const pendingResubs = (resubmissions ?? []).filter(r => r.status === "pending").length;

      return {
        violations: { total: totalViolations, open: openViolations, resolved: resolvedViolations, byType: violationsByType, bySeverity: violationsBySeverity },
        contracts: { total: totalContracts, active: activeContracts, completed: completedContracts, totalHours: totalTrainingHours, completedHours: completedTrainingHours, totalFinancial },
        skillsMatrix: { selectedObjectives, sectorSelections },
        crossTraining: { total: totalCross, pending: pendingCross, approved: approvedCross },
        corrective: { active: activeCorrective },
        resubmissions: { pending: pendingResubs },
      };
    },
  });
}
