import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "next-themes";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { AuthProvider } from "@/contexts/AuthContext";
import { AccessibilityProvider } from "@/contexts/AccessibilityContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { Analytics } from "@vercel/analytics/react";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import ResetPassword from "./pages/ResetPassword";
import NotFound from "./pages/NotFound";

const StudentDashboard = lazy(() => import("./pages/student/StudentDashboard"));
const StudentJournal = lazy(() => import("./pages/student/StudentJournal"));
const StudentAttendance = lazy(() => import("./pages/student/StudentAttendance"));
const StudentDiary = lazy(() => import("./pages/student/StudentDiary"));
const StudentEvidence = lazy(() => import("./pages/student/StudentEvidence"));

const CompanyDashboard = lazy(() => import("./pages/company/CompanyDashboard"));
const CompanyAttendance = lazy(() => import("./pages/company/CompanyAttendance"));
const CompanyWitness = lazy(() => import("./pages/company/CompanyWitness"));
const CompanyEvaluation = lazy(() => import("./pages/company/CompanyEvaluation"));
const CompanyChecklist = lazy(() => import("./pages/company/CompanyChecklist"));
const CompanyIncidents = lazy(() => import("./pages/company/CompanyIncidents"));

const SchoolDashboard = lazy(() => import("./pages/school/SchoolDashboard"));
const SchoolObservation = lazy(() => import("./pages/school/SchoolObservation"));
const SchoolAssessment = lazy(() => import("./pages/school/SchoolAssessment"));
const SchoolLogs = lazy(() => import("./pages/school/SchoolLogs"));
const SchoolEvidence = lazy(() => import("./pages/school/SchoolEvidence"));
const SchoolLearningGoals = lazy(() => import("./pages/school/SchoolLearningGoals"));
const SchoolDualAssessment = lazy(() => import("./pages/school/SchoolDualAssessment"));
const SchoolSkillsMatrix = lazy(() => import("./pages/school/SchoolSkillsMatrix"));
const SchoolPolicyViolations = lazy(() => import("./pages/school/SchoolPolicyViolations"));
const CrossSchoolTraining = lazy(() => import("./pages/school/CrossSchoolTraining"));
const SchoolIncidents = lazy(() => import("./pages/school/SchoolIncidents"));
const SchoolFollowUps = lazy(() => import("./pages/school/SchoolFollowUps"));

const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const AdminRegulatory = lazy(() => import("./pages/admin/AdminRegulatory"));
const AdminSectors = lazy(() => import("./pages/admin/AdminSectors"));
const AdminAccreditation = lazy(() => import("./pages/admin/AdminAccreditation"));
const AdminCapacity = lazy(() => import("./pages/admin/AdminCapacity"));
const AdminPlacement = lazy(() => import("./pages/admin/AdminPlacement"));
const AdminSchedule = lazy(() => import("./pages/admin/AdminSchedule"));
const AdminRisks = lazy(() => import("./pages/admin/AdminRisks"));
const AdminAssurance = lazy(() => import("./pages/admin/AdminAssurance"));
const AdminAudit = lazy(() => import("./pages/admin/AdminAudit"));
const AdminTrainerContracts = lazy(() => import("./pages/admin/AdminTrainerContracts"));
const AdminStudentManagement = lazy(() => import("./pages/admin/AdminStudentManagement"));
const AdminSafety = lazy(() => import("./pages/admin/AdminSafety"));

const RegionalDashboard = lazy(() => import("./pages/regional/RegionalDashboard"));

const Settings = lazy(() => import("./pages/Settings"));
const Profile = lazy(() => import("./pages/Profile"));
const About = lazy(() => import("./pages/About"));

const queryClient = new QueryClient();

const RouteLoader = () => (
  <div className="flex min-h-[60vh] items-center justify-center">
    <Loader2 className="h-6 w-6 animate-spin text-primary" />
  </div>
);

const App = () => (
  <ErrorBoundary>
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AccessibilityProvider>
          <AuthProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Suspense fallback={<RouteLoader />}>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/reset-password" element={<ResetPassword />} />

                  {/* Student routes */}
                  <Route path="/student" element={<ProtectedRoute allowedRoles={["student"]}><StudentDashboard /></ProtectedRoute>} />
                  <Route path="/student/journal" element={<ProtectedRoute allowedRoles={["student"]}><StudentJournal /></ProtectedRoute>} />
                  <Route path="/student/attendance" element={<ProtectedRoute allowedRoles={["student"]}><StudentAttendance /></ProtectedRoute>} />
                  <Route path="/student/diary" element={<ProtectedRoute allowedRoles={["student"]}><StudentDiary /></ProtectedRoute>} />
                  <Route path="/student/evidence" element={<ProtectedRoute allowedRoles={["student"]}><StudentEvidence /></ProtectedRoute>} />

                  {/* Company supervisor routes */}
                  <Route path="/company" element={<ProtectedRoute allowedRoles={["company_supervisor"]}><CompanyDashboard /></ProtectedRoute>} />
                  <Route path="/company/attendance" element={<ProtectedRoute allowedRoles={["company_supervisor"]}><CompanyAttendance /></ProtectedRoute>} />
                  <Route path="/company/witness" element={<ProtectedRoute allowedRoles={["company_supervisor"]}><CompanyWitness /></ProtectedRoute>} />
                  <Route path="/company/evaluation" element={<ProtectedRoute allowedRoles={["company_supervisor"]}><CompanyEvaluation /></ProtectedRoute>} />
                  <Route path="/company/checklist" element={<ProtectedRoute allowedRoles={["company_supervisor"]}><CompanyChecklist /></ProtectedRoute>} />
                  <Route path="/company/incidents" element={<ProtectedRoute allowedRoles={["company_supervisor"]}><CompanyIncidents /></ProtectedRoute>} />

                  {/* School supervisor routes */}
                  <Route path="/school" element={<ProtectedRoute allowedRoles={["school_supervisor"]}><SchoolDashboard /></ProtectedRoute>} />
                  <Route path="/school/observation" element={<ProtectedRoute allowedRoles={["school_supervisor"]}><SchoolObservation /></ProtectedRoute>} />
                  <Route path="/school/assessment" element={<ProtectedRoute allowedRoles={["school_supervisor"]}><SchoolAssessment /></ProtectedRoute>} />
                  <Route path="/school/logs" element={<ProtectedRoute allowedRoles={["school_supervisor"]}><SchoolLogs /></ProtectedRoute>} />
                  <Route path="/school/evidence" element={<ProtectedRoute allowedRoles={["school_supervisor"]}><SchoolEvidence /></ProtectedRoute>} />
                  <Route path="/school/learning-goals" element={<ProtectedRoute allowedRoles={["school_supervisor"]}><SchoolLearningGoals /></ProtectedRoute>} />
                  <Route path="/school/dual-assessment" element={<ProtectedRoute allowedRoles={["school_supervisor"]}><SchoolDualAssessment /></ProtectedRoute>} />
                  <Route path="/school/skills-matrix" element={<ProtectedRoute allowedRoles={["school_supervisor", "admin"]}><SchoolSkillsMatrix /></ProtectedRoute>} />
                  <Route path="/school/policy-violations" element={<ProtectedRoute allowedRoles={["school_supervisor", "admin"]}><SchoolPolicyViolations /></ProtectedRoute>} />
                  <Route path="/school/cross-training" element={<ProtectedRoute allowedRoles={["student", "school_supervisor", "admin"]}><CrossSchoolTraining /></ProtectedRoute>} />
                  <Route path="/school/incidents" element={<ProtectedRoute allowedRoles={["school_supervisor"]}><SchoolIncidents /></ProtectedRoute>} />
                  <Route path="/school/follow-ups" element={<ProtectedRoute allowedRoles={["school_supervisor"]}><SchoolFollowUps /></ProtectedRoute>} />

                  {/* Admin routes */}
                  <Route path="/admin" element={<ProtectedRoute allowedRoles={["admin", "ministry"]}><AdminDashboard /></ProtectedRoute>} />
                  <Route path="/admin/regulatory" element={<ProtectedRoute allowedRoles={["admin", "ministry"]}><AdminRegulatory /></ProtectedRoute>} />
                  <Route path="/admin/sectors" element={<ProtectedRoute allowedRoles={["admin", "ministry"]}><AdminSectors /></ProtectedRoute>} />
                  <Route path="/admin/accreditation" element={<ProtectedRoute allowedRoles={["admin", "ministry"]}><AdminAccreditation /></ProtectedRoute>} />
                  <Route path="/admin/capacity" element={<ProtectedRoute allowedRoles={["admin", "ministry"]}><AdminCapacity /></ProtectedRoute>} />
                  <Route path="/admin/placement" element={<ProtectedRoute allowedRoles={["admin", "ministry"]}><AdminPlacement /></ProtectedRoute>} />
                  <Route path="/admin/schedule" element={<ProtectedRoute allowedRoles={["admin", "ministry"]}><AdminSchedule /></ProtectedRoute>} />
                  <Route path="/admin/risks" element={<ProtectedRoute allowedRoles={["admin", "ministry"]}><AdminRisks /></ProtectedRoute>} />
                  <Route path="/admin/assurance" element={<ProtectedRoute allowedRoles={["admin", "ministry"]}><AdminAssurance /></ProtectedRoute>} />
                  <Route path="/admin/trainer-contracts" element={<ProtectedRoute allowedRoles={["admin", "ministry"]}><AdminTrainerContracts /></ProtectedRoute>} />
                  <Route path="/admin/audit" element={<ProtectedRoute allowedRoles={["admin", "ministry"]}><AdminAudit /></ProtectedRoute>} />
                  <Route path="/admin/students" element={<ProtectedRoute allowedRoles={["admin", "ministry"]}><AdminStudentManagement /></ProtectedRoute>} />
                  <Route path="/admin/safety" element={<ProtectedRoute allowedRoles={["admin", "ministry"]}><AdminSafety /></ProtectedRoute>} />

                  {/* Regional routes */}
                  <Route path="/regional" element={<ProtectedRoute allowedRoles={["regional"]}><RegionalDashboard /></ProtectedRoute>} />

                  {/* Shared routes */}
                  <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
                  <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </BrowserRouter>
          </AuthProvider>
        </AccessibilityProvider>
      </TooltipProvider>
    </QueryClientProvider>
    </ThemeProvider>
    <Analytics />
  </ErrorBoundary>
);

export default App;
