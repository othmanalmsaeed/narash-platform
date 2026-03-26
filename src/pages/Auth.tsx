import { useEffect, useState } from "react";
import { Navigate, Link } from "react-router-dom";
import { useAuth, type AppRole } from "@/contexts/AuthContext";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, ArrowRight, Mail, Lock, Sun, Moon } from "lucide-react";
import wblLogo from "@/assets/wbl-logo.png";
import { useTheme } from "next-themes";
import pearsonLogo from "@/assets/pearson-logo-2025.png";
import moeLogo from "@/assets/moe-logo.png";
import moeLogoDark from "@/assets/moe-logo-dark.png";
import { toast } from "sonner";
import { firebaseService } from "@/integrations/firebase/client";
import { motion, useReducedMotion } from "framer-motion";
import { useIsMobile } from "@/hooks/use-mobile";

const roleDashboard: Record<AppRole, string> = {
  student: "/student",
  company_supervisor: "/company",
  school_supervisor: "/school",
  admin: "/admin",
  regional: "/regional",
  ministry: "/admin",
};

type AuthView = "login" | "forgot";

/* ── Floating Orbs ── */
const orbs = [
  { x: "10%", y: "20%", size: 320, duration: 18 },
  { x: "75%", y: "10%", size: 260, duration: 22 },
  { x: "50%", y: "70%", size: 380, duration: 25 },
  { x: "85%", y: "60%", size: 200, duration: 20 },
  { x: "20%", y: "80%", size: 280, duration: 16 },
];

const lightOrbColors = [
  "rgba(99,102,241,0.08)",
  "rgba(59,130,246,0.06)",
  "rgba(139,92,246,0.05)",
  "rgba(45,212,191,0.04)",
  "rgba(99,102,241,0.06)",
];

const darkOrbColors = [
  "rgba(99,102,241,0.15)",
  "rgba(59,130,246,0.12)",
  "rgba(139,92,246,0.10)",
  "rgba(45,212,191,0.08)",
  "rgba(99,102,241,0.10)",
];

function AnimatedBackground({ isDark, reduceMotion }: { isDark: boolean; reduceMotion: boolean }) {
  const orbColors = isDark ? darkOrbColors : lightOrbColors;

  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden">
      {/* Base gradient */}
      <div
        className={
          isDark
            ? "absolute inset-0 bg-gradient-to-br from-[#0a0e27] via-[#131842] to-[#0d1230]"
            : "absolute inset-0 bg-gradient-to-br from-white via-[#f8f9ff] to-[#f0f2ff]"
        }
      />

      {/* Grid pattern (cheap, keep on mobile) */}
      <div
        className={isDark ? "absolute inset-0 opacity-[0.04]" : "absolute inset-0 opacity-[0.08]"}
        style={{
          backgroundImage: isDark
            ? "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)"
            : "linear-gradient(rgba(99,102,241,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.08) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      {/* Heavy effects disabled on mobile/reduced motion */}
      {!reduceMotion && (
        <>
          {orbs.map((orb, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full"
              style={{
                left: orb.x,
                top: orb.y,
                width: orb.size,
                height: orb.size,
                background: `radial-gradient(circle, ${orbColors[i]}, transparent 70%)`,
                filter: "blur(40px)",
                willChange: "transform",
              }}
              animate={{
                x: [0, 30, -20, 0],
                y: [0, -25, 15, 0],
                scale: [1, 1.15, 0.9, 1],
              }}
              transition={{
                duration: orb.duration,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          ))}

          {/* Noise texture */}
          <div
            className="absolute inset-0 opacity-[0.02]"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`,
            }}
          />
        </>
      )}
    </div>
  );
}

/* ── Stagger container ── */
const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.3 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } },
};

/* ── Dark Mode Toggle ── */
function DarkModeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  const isDark = resolvedTheme === "dark";

  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={`h-9 w-9 rounded-xl border backdrop-blur-sm flex items-center justify-center transition-colors ${
        isDark
          ? "border-white/[0.12] bg-white/[0.07] text-white/70 hover:text-white hover:bg-white/[0.12]"
          : "border-foreground/10 bg-foreground/[0.04] text-foreground/60 hover:text-foreground hover:bg-foreground/[0.08]"
      }`}
      aria-label="تبديل الوضع الداكن"
      disabled={!mounted}
    >
      {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </motion.button>
  );
}

/* ── Main Auth Page ── */
const Auth = () => {
  const { role, user } = useAuth();
  const { resolvedTheme } = useTheme();
  const [view, setView] = useState<AuthView>("login");
  const isDark = resolvedTheme === "dark";
  const isMobile = useIsMobile();
  const reduceMotion = useReducedMotion() || isMobile;

  if (user && role) {
    return <Navigate to={roleDashboard[role]} replace />;
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 py-8 sm:p-6" dir="rtl">
      <AnimatedBackground isDark={isDark} reduceMotion={reduceMotion} />

      {/* Top logos */}
      <div className="absolute top-3 left-3 right-3 sm:top-4 sm:left-6 sm:right-6 z-20 flex items-center justify-between">
        <img
          src={moeLogoDark}
          alt="وزارة التربية والتعليم"
          className="h-12 sm:h-16 md:h-20 object-contain drop-shadow-lg"
        />
        <div className="flex items-center gap-2 sm:gap-3">
          <DarkModeToggle />
          <img
            src={pearsonLogo}
            alt="Pearson"
            className={isDark ? "h-5 sm:h-7 md:h-9 object-contain brightness-0 invert" : "h-5 sm:h-7 md:h-9 object-contain opacity-90"}
          />
        </div>
      </div>

      {/* Login card */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full max-w-md mt-14 sm:mt-20"
      >
        {view === "login" && <LoginForm onForgot={() => setView("forgot")} isDark={isDark} reduceMotion={reduceMotion} />}
        {view === "forgot" && <ForgotPasswordForm onBack={() => setView("login")} isDark={isDark} reduceMotion={reduceMotion} />}
      </motion.div>

      {/* Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="relative z-10 mt-6 mb-4 text-center space-y-0.5"
      >
        <p className={`text-xs font-bold ${isDark ? "text-white/70" : "text-foreground/70"}`}>
          © {new Date().getFullYear()} WBL Platform — جميع الحقوق محفوظة
        </p>
        <div className={`text-[10px] sm:text-xs space-y-0.5 ${isDark ? "text-white/50" : "text-foreground/50"}`}>
          <p>Supervised by: <span className="font-semibold">Sameh Zawati</span> · Developed by: <span className="font-semibold">Yousef Al-Masaied</span></p>
          <p>In cooperation with: <span className="font-semibold">TEAM JCGT</span></p>
          <Link to="/about" className="inline-block mt-1 text-primary hover:text-primary/80 transition-colors font-semibold">
            حول المنصة
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

/* ── Login Form ── */
function LoginForm({ onForgot, isDark, reduceMotion }: { onForgot: () => void; isDark: boolean; reduceMotion: boolean }) {
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await signIn(email, password);
    setLoading(false);
    if (error) {
      toast.error(error);
    } else {
      toast.success("تم تسجيل الدخول بنجاح ✅");
    }
  };

  const blurClass = reduceMotion ? "backdrop-blur-none" : "backdrop-blur-xl";
  const cardBg = isDark
    ? `bg-[#0d1230]/90 ${blurClass} shadow-[0_8px_60px_-12px_rgba(0,0,0,0.5)]`
    : `bg-white/90 ${blurClass} shadow-[0_8px_60px_-12px_rgba(99,102,241,0.12)]`;

  const inputClass = isDark
    ? "h-11 rounded-xl border-white/10 bg-white/[0.06] text-white placeholder:text-white/25 focus-visible:ring-indigo-500/40 focus-visible:border-indigo-400/30 transition-all"
    : "h-11 rounded-xl border-foreground/10 bg-foreground/[0.03] text-foreground placeholder:text-foreground/30 focus-visible:ring-primary/40 focus-visible:border-primary/30 transition-all";

  const labelClass = isDark
    ? "text-xs font-medium text-white flex items-center gap-1.5"
    : "text-xs font-medium text-foreground flex items-center gap-1.5";

  return (
    <div className="relative rounded-3xl p-[1.5px] overflow-hidden">
      {reduceMotion ? (
        <>
          <div
            className="absolute inset-0 rounded-3xl opacity-70"
            style={{
              background:
                "conic-gradient(from 0deg, #6366f1aa, #8b5cf688, #06b6d466, #10b98155, #6366f1aa)",
            }}
          />
          <div
            className={`absolute inset-0 rounded-3xl blur-2xl ${isDark ? "opacity-10" : "opacity-5"}`}
            style={{
              background: "radial-gradient(circle at 30% 20%, rgba(99,102,241,0.35), transparent 55%)",
            }}
          />
        </>
      ) : (
        <>
          {/* Animated border — slower, softer */}
          <motion.div
            className="absolute inset-0 rounded-3xl"
            style={{
              background:
                "conic-gradient(from 0deg, #6366f1aa, #8b5cf688, #06b6d466, #10b98155, #6366f1aa)",
            }}
            animate={{ rotate: 360 }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          />
          {/* Subtle glow */}
          <motion.div
            className={`absolute inset-0 rounded-3xl blur-2xl ${isDark ? "opacity-15" : "opacity-8"}`}
            style={{
              background: "conic-gradient(from 0deg, #6366f1, #8b5cf6, #06b6d4, #10b981, #6366f1)",
            }}
            animate={{ rotate: 360 }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          />
        </>
      )}

      <motion.div
        variants={stagger}
        initial="hidden"
        animate="show"
        className={`relative rounded-3xl p-6 sm:p-8 md:p-10 ${cardBg}`}
      >
        {/* Header */}
        <motion.div variants={fadeUp} className="text-center mb-6 sm:mb-8">
          <img src={wblLogo} alt="WBL Platform" className="mx-auto mb-3 h-14 w-14 sm:h-20 sm:w-20 object-contain" />
          <h1 className={`text-xl sm:text-2xl font-bold tracking-tight ${isDark ? "text-white" : "text-foreground"}`}>
            Work Based Learning Platform
          </h1>
          <p className={`mt-1.5 text-sm font-medium ${isDark ? "text-white/90" : "text-foreground"}`}>
            منصة التعلم القائم على العمل — الأردن 🇯🇴
          </p>
          <p className={`mt-2 text-xs leading-relaxed max-w-xs mx-auto ${isDark ? "text-white/70" : "text-foreground/80"}`}>
            تابع تدريبك وتقييماتك وتقدم طلابك من مكان واحد.
          </p>
        </motion.div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email */}
          <motion.div variants={fadeUp} className="space-y-2">
            <Label htmlFor="email" className={labelClass}>
              <Mail className="h-3 w-3" /> البريد الإلكتروني
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="example@school.edu.jo"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              dir="ltr"
              className={inputClass}
            />
          </motion.div>

          {/* Password */}
          <motion.div variants={fadeUp} className="space-y-2">
            <Label htmlFor="password" className={labelClass}>
              <Lock className="h-3 w-3" /> كلمة المرور
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              dir="ltr"
              className={inputClass}
            />
          </motion.div>

          {/* Remember + Forgot */}
          <motion.div variants={fadeUp} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Checkbox
                id="remember"
                className={isDark
                  ? "border-white/20 data-[state=checked]:bg-indigo-500 data-[state=checked]:border-indigo-500"
                  : "border-foreground/20 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                }
              />
              <label htmlFor="remember" className={`text-xs cursor-pointer select-none ${isDark ? "text-white" : "text-foreground"}`}>
                تذكرني
              </label>
            </div>
            <button
              type="button"
              onClick={onForgot}
              className={`text-xs transition-colors ${isDark ? "text-white hover:text-white/80" : "text-primary/70 hover:text-primary"}`}
            >
              نسيت كلمة المرور؟
            </button>
          </motion.div>

          {/* Submit */}
          <motion.div variants={fadeUp}>
            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white font-semibold text-sm transition-all hover:shadow-[0_0_24px_-4px_rgba(99,102,241,0.5)] hover:brightness-110 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              تسجيل الدخول
            </button>
          </motion.div>
        </form>
      </motion.div>
    </div>
  );
}

/* ── Forgot Password ── */
function ForgotPasswordForm({ onBack, isDark, reduceMotion }: { onBack: () => void; isDark: boolean; reduceMotion: boolean }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await firebaseService.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);
    if (error) {
      toast.error(error.message);
    } else {
      setSent(true);
      toast.success("تم إرسال رابط إعادة تعيين كلمة المرور ✅");
    }
  };

  const blurClass = reduceMotion ? "backdrop-blur-none" : "backdrop-blur-xl";
  const cardBg = isDark
    ? `bg-[#0d1230]/90 ${blurClass} shadow-[0_8px_60px_-12px_rgba(0,0,0,0.5)]`
    : `bg-white/90 ${blurClass} shadow-[0_8px_60px_-12px_rgba(99,102,241,0.12)]`;

  const inputClass = isDark
    ? "h-11 rounded-xl border-white/10 bg-white/[0.06] text-white placeholder:text-white/25 focus-visible:ring-indigo-500/40 focus-visible:border-indigo-400/30 transition-all"
    : "h-11 rounded-xl border-foreground/10 bg-foreground/[0.03] text-foreground placeholder:text-foreground/30 focus-visible:ring-primary/40 focus-visible:border-primary/30 transition-all";

  const labelClass = isDark
    ? "text-xs font-medium text-white/60 flex items-center gap-1.5"
    : "text-xs font-medium text-foreground/60 flex items-center gap-1.5";

  if (sent) {
    return (
      <div className={`rounded-3xl border ${isDark ? "border-white/[0.12]" : "border-foreground/[0.08]"} ${cardBg} p-8 sm:p-10 text-center space-y-5`}>
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
          className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400"
        >
          <span className="text-3xl">✓</span>
        </motion.div>
        <p className={`font-semibold text-lg ${isDark ? "text-white" : "text-foreground"}`}>تم إرسال رابط إعادة التعيين</p>
        <p className={`text-sm ${isDark ? "text-white/50" : "text-foreground/50"}`}>تحقق من بريدك الإلكتروني ({email})</p>
        <button
          onClick={onBack}
          className={`inline-flex items-center gap-2 text-sm transition-colors mt-2 ${isDark ? "text-indigo-300/80 hover:text-indigo-200" : "text-primary/80 hover:text-primary"}`}
        >
          <ArrowRight className="h-4 w-4" />
          العودة لتسجيل الدخول
        </button>
      </div>
    );
  }

  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="show"
      className={`rounded-3xl border ${isDark ? "border-white/[0.12]" : "border-foreground/[0.08]"} ${cardBg} p-8 sm:p-10`}
    >
      <motion.div variants={fadeUp} className="text-center mb-6">
        <h2 className={`text-xl font-bold ${isDark ? "text-white" : "text-foreground"}`}>إعادة تعيين كلمة المرور</h2>
        <p className={`mt-2 text-sm ${isDark ? "text-white/40" : "text-foreground/40"}`}>أدخل بريدك الإلكتروني وسنرسل لك رابط إعادة التعيين</p>
      </motion.div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <motion.div variants={fadeUp} className="space-y-2">
          <Label htmlFor="reset-email" className={labelClass}>
            <Mail className="h-3 w-3" /> البريد الإلكتروني
          </Label>
          <Input
            id="reset-email"
            type="email"
            placeholder="example@school.edu.jo"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            dir="ltr"
            className={inputClass}
          />
        </motion.div>

        <motion.div variants={fadeUp}>
          <button
            type="submit"
            disabled={loading}
            className="w-full h-11 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white font-semibold text-sm transition-all hover:shadow-[0_0_24px_-4px_rgba(99,102,241,0.5)] hover:brightness-110 active:scale-[0.98] disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            إرسال رابط إعادة التعيين
          </button>
        </motion.div>

        <motion.div variants={fadeUp}>
          <button
            type="button"
            onClick={onBack}
            className={`w-full h-10 text-sm transition-colors flex items-center justify-center gap-2 ${isDark ? "text-white/50 hover:text-white/80" : "text-foreground/50 hover:text-foreground/80"}`}
          >
            <ArrowRight className="h-4 w-4" />
            العودة لتسجيل الدخول
          </button>
        </motion.div>
      </form>
    </motion.div>
  );
}

export default Auth;
