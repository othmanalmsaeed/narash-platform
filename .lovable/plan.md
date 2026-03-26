# خطة التنفيذ — منصة WBL-PMS

---

## المرحلة الأولى ✅ — البنية التحتية (Auth + Schema + RLS + Route Protection)

### ما تم تنفيذه:
1. **تفعيل Lovable Cloud** — Supabase متصل ومفعّل
2. **قاعدة البيانات** — 21 جدول + 8 ENUMs + فهارس + constraints
3. **RLS** — سياسات أمان كاملة لكل جدول + دوال security definer
4. **المصادقة** — AuthContext + صفحة تسجيل دخول + حماية المسارات
5. **التخزين** — bucket "evidence" مع سياسات رفع/قراءة
6. **سجل التتبع** — audit_logs (append-only) مع دالة insert_audit_log

### الجداول:
schools, profiles, user_roles, specializations, companies, students, placements,
attendance, diary_entries, journal_entries, evidence_records, witness_statements,
evaluations_company, evaluations_school, observations, checklist_records,
learning_goals, audit_logs, program_cycles, qualification_mappings,
program_authorizations, program_risks

---

## المرحلة الثانية ✅ — ربط صفحات الطالب ومشرف العمل بقاعدة البيانات (CRUD حقيقي)

### ما تم تنفيذه:
- StudentDashboard, StudentAttendance, StudentDiary, StudentJournal, StudentEvidence
- CompanyDashboard, CompanyAttendance, CompanyChecklist, CompanyEvaluation, CompanyWitness
- جميع الصفحات تستخدم hooks حقيقية مع Supabase

---

## المرحلة الثالثة ✅ — ربط صفحات المشرف المدرسي والإدارة + رفع الملفات

### ما تم تنفيذه:
- SchoolAssessment, SchoolEvidence, SchoolLearningGoals, SchoolLogs, SchoolObservation
- AdminAccreditation, AdminAudit, AdminRisks, AdminAssurance, AdminSchedule, AdminRegulatory
- جميع الصفحات مربوطة بالبيانات الحقيقية

---

## المرحلة الرابعة ✅ — محرك التقييم المزدوج + سجل التتبع الحقيقي

### ما تم تنفيذه:
1. **محرك التقييم المزدوج** — صفحة SchoolDualAssessment
2. **قفل السجلات** — دالة lock_dual_assessment
3. **سجل التتبع الحقيقي** — triggers تلقائية
4. **حماية السجلات المقفلة** — سياسات RLS

---

## المرحلة الخامسة ✅ — دورة حياة الطالب من التسجيل إلى التخرج

### ما تم تنفيذه:
1. **توسيع حالات الطالب** — من 4 إلى 11 حالة:
   `enrolled → not_started → searching → matched → training → under_review → pending_graduation → graduated → completed → withdrawn → closed`

2. **أعمدة جديدة:**
   - `students`: grade_level, emergency_contact_*, current_phase, final_grade, graduated_at, graduation_approved_by, eligible_for_recognition
   - `placements`: agreement_signed, agreement_signed_date, learning_goals_text
   - `companies`: company_size
   - `profiles`: supervisor_capacity, supervisor_current_load

3. **جداول جديدة:**
   - `follow_up_visits` — متابعات الأسبوع 1/4/8
   - `student_phase_log` — سجل المراحل

4. **دوال وTriggers:**
   - `calc_final_grade()` — حساب الدرجة النهائية (BTEC: أقل درجة وحدة)
   - `log_student_phase_change()` — تسجيل تغيير المرحلة تلقائياً
   - `auto_transition_to_matched()` — انتقال تلقائي عند التوزيع
   - `auto_transition_to_training()` — انتقال تلقائي عند أول حضور

5. **مكونات وصفحات جديدة:**
   - `PhaseTracker.tsx` — شريط مراحل مرئي في لوحة الطالب
   - `SchoolFollowUps.tsx` — صفحة متابعات الزيارات
   - `useFollowUps.ts` — hooks المتابعات
   - `useGraduation.ts` — hook اعتماد التخرج

6. **تحديث AdminStudentManagement:**
   - لوحة إحصائية بعدد الطلاب حسب الحالة
   - أعمدة: الصف، المرحلة، الدرجة النهائية
   - زر "اعتماد التخرج" للطلاب في pending_graduation

---

## المرحلة 5.5 ✅ — تدقيق شامل لقواعد البيانات + تنظيف

### ما تم تنفيذه:
1. **إصلاح RLS**: إضافة UPDATE policy لـ placements + تصحيح attendance INSERT policy
2. **حذف trigger مكرر**: `trg_attendance_recalc_student_hours`
3. **تنظيف الكود**: حذف 13 ملف mock/lib/types ميت
4. **التحقق**: 35 جدول + 37 صفحة + جميع hooks مربوطة بقاعدة البيانات

---

## المرحلة السادسة 🔲 — بيانات تجريبية شاملة + اختبار نهائي + نشر
