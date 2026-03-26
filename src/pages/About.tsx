import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, Users, Target, BookOpen, Award, Globe, Sparkles, ChevronDown } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import pearsonLogo from "@/assets/pearson-logo.svg";
import teamPhoto from "@/assets/team-photo.jpeg";
import { useRef } from "react";

const teamMembers = [
  "Sameh Mohammad Abdel Latif Zawati",
  "Mohammad Walid Ali Aburahma",
  "Ahmad Numan Ali Malkwai",
  "Samar Sami Mohammad Ayoub",
  "Ekhlass Muhammad A. Al Mazaideh",
  "Abeer Moh'd Salem Shamaileh",
  "Saif Mohammed Fahed Bani Hani",
  "Mohammad Salem Basheer Alkhlaifat",
  "Mutaz Ahmad Falah Alammairih",
  "Jehad Ahmad Salem Mheidat",
  "Safwan Mohammad Faleh Mahafzeh",
  "Nadia Shehab Ali Sheyyab",
];

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: "easeOut" as const },
  }),
};

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.2 } },
};

const staggerItem = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.5, ease: "easeOut" as const } },
};

/* ── Floating Orbs (matching Auth page) ── */
const orbs = [
  { x: "10%", y: "15%", size: 300, color: "rgba(99,102,241,0.12)", duration: 20 },
  { x: "80%", y: "5%", size: 250, color: "rgba(59,130,246,0.10)", duration: 24 },
  { x: "60%", y: "60%", size: 350, color: "rgba(139,92,246,0.08)", duration: 22 },
];

const About = () => {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 100]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      {/* Header */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-50"
      >
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={pearsonLogo} alt="Pearson" className="h-8" />
            <span className="text-lg font-bold text-foreground">WBL Platform</span>
          </div>
          <Link to="/auth">
            <Button variant="outline" size="sm">
              تسجيل الدخول
              <ArrowRight className="h-4 w-4 mr-2" />
            </Button>
          </Link>
        </div>
      </motion.header>

      {/* Hero — cinematic style */}
      <section ref={heroRef} className="relative overflow-hidden py-28 md:py-36">
        {/* Animated background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a0e27] via-[#131842] to-[#0d1230]" />
        {orbs.map((orb, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full pointer-events-none"
            style={{
              left: orb.x, top: orb.y,
              width: orb.size, height: orb.size,
              background: `radial-gradient(circle, ${orb.color}, transparent 70%)`,
              filter: "blur(40px)",
            }}
            animate={{ x: [0, 25, -15, 0], y: [0, -20, 10, 0], scale: [1, 1.1, 0.9, 1] }}
            transition={{ duration: orb.duration, repeat: Infinity, ease: "easeInOut" }}
          />
        ))}
        <div className="absolute inset-0 opacity-[0.04]" style={{
          backgroundImage: "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }} />
        <div className="absolute inset-0 bg-black/20" />

        <motion.div style={{ y: heroY, opacity: heroOpacity }} className="relative z-10 container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/[0.12] text-white/80 px-5 py-2.5 rounded-full text-sm font-medium mb-8"
          >
            <Globe className="h-4 w-4" />
            🇯🇴 BTEC Work-Based Learning — الأردن
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="text-4xl md:text-6xl font-extrabold text-white mb-5 tracking-tight"
          >
            حول المنصة
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-lg md:text-xl text-white/50 max-w-2xl mx-auto leading-relaxed"
          >
            منصة إدارة التعلم القائم على العمل بالتعاون مع Pearson Education لتطوير التعليم المهني في الأردن
          </motion.p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="mt-12"
          >
            <ChevronDown className="h-6 w-6 text-white/30 mx-auto animate-bounce" />
          </motion.div>
        </motion.div>
      </section>

      {/* Vision & Mission */}
      <section className="py-20 container mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, x: -40, rotateY: 5 }}
            whileInView={{ opacity: 1, x: 0, rotateY: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: "easeOut" as const }}
            whileHover={{ y: -4, boxShadow: "0 20px 40px -12px rgba(0,0,0,0.1)" }}
            className="bg-card rounded-2xl p-8 border shadow-sm transition-all"
          >
            <div className="flex items-center gap-3 mb-4">
              <motion.div
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
                className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center"
              >
                <Target className="h-6 w-6 text-primary" />
              </motion.div>
              <h2 className="text-2xl font-bold text-foreground">الرؤية</h2>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              بناء منظومة تعليم مهني متكاملة تربط بين المدارس والشركات والطلاب، وتضمن جودة التدريب العملي وفقاً لمعايير Pearson BTEC الدولية، مما يسهم في تأهيل كوادر وطنية قادرة على المنافسة في سوق العمل.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 40, rotateY: -5 }}
            whileInView={{ opacity: 1, x: 0, rotateY: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.15, ease: "easeOut" as const }}
            whileHover={{ y: -4, boxShadow: "0 20px 40px -12px rgba(0,0,0,0.1)" }}
            className="bg-card rounded-2xl p-8 border shadow-sm transition-all"
          >
            <div className="flex items-center gap-3 mb-4">
              <motion.div
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
                className="h-12 w-12 rounded-xl bg-accent/20 flex items-center justify-center"
              >
                <BookOpen className="h-6 w-6 text-accent-foreground" />
              </motion.div>
              <h2 className="text-2xl font-bold text-foreground">الرسالة</h2>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              توفير منصة رقمية شاملة تدعم متابعة وتقييم التدريب الميداني للطلاب، وتمكّن المشرفين من رصد الأداء والحضور والأدلة، وتوفر لوحات تحكم ذكية للإدارة لضمان سلامة البرنامج وجودته.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Pearson Section */}
      <section className="py-20 bg-muted/30 overflow-hidden">
        <div className="container mx-auto px-4 text-center max-w-3xl">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <motion.img
              src={pearsonLogo}
              alt="Pearson Education"
              className="h-12 mx-auto mb-6"
              whileHover={{ scale: 1.1 }}
              transition={{ type: "spring", stiffness: 300 }}
            />
            <h2 className="text-2xl font-bold text-foreground mb-4">بالتعاون مع Pearson Education</h2>
            <p className="text-muted-foreground leading-relaxed">
              Pearson هي شركة تعليمية عالمية رائدة تقدم مؤهلات BTEC المعترف بها دولياً. يعتمد هذا البرنامج على معايير BTEC لضمان حصول الطلاب على تدريب عملي عالي الجودة يتوافق مع متطلبات سوق العمل العالمي.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-4">
            <Sparkles className="h-4 w-4" />
            المميزات
          </div>
          <h2 className="text-3xl font-bold text-foreground">مميزات المنصة</h2>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto"
        >
          {[
            { icon: "📊", title: "لوحات تحكم ذكية", desc: "لوحات مخصصة لكل دور: طالب، مشرف عمل، مشرف مدرسي، إدارة" },
            { icon: "📋", title: "تتبع الحضور", desc: "نظام حضور رقمي متكامل مع تنبيهات وسياسات غياب تلقائية" },
            { icon: "📁", title: "إدارة الأدلة", desc: "رفع ومراجعة الأدلة مع نظام موافقات متعدد المستويات" },
            { icon: "🔒", title: "تقييم مزدوج", desc: "تقييم من المشرف المدرسي ومشرف العمل مع آلية قفل وتتبع" },
            { icon: "📈", title: "مصفوفة المهارات", desc: "ربط أهداف التعلم بمعايير BTEC مع تتبع التقدم" },
            { icon: "🛡️", title: "أمان وحوكمة", desc: "سجل تتبع كامل، صلاحيات متقدمة، وسياسات حماية البيانات" },
          ].map((f, i) => (
            <motion.div
              key={i}
              variants={staggerItem}
              whileHover={{ y: -6, scale: 1.02, boxShadow: "0 20px 40px -12px rgba(0,0,0,0.12)" }}
              className="bg-card rounded-xl p-6 border shadow-sm text-center cursor-default transition-colors"
            >
              <motion.span
                className="text-4xl mb-4 block"
                whileHover={{ scale: 1.3, rotate: [0, -10, 10, 0] }}
                transition={{ duration: 0.4 }}
              >
                {f.icon}
              </motion.span>
              <h3 className="font-bold text-foreground mb-2">{f.title}</h3>
              <p className="text-sm text-muted-foreground">{f.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Team Photo */}
      <section className="py-20 bg-muted/30 overflow-hidden">
        <div className="container mx-auto px-4 text-center max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <div className="flex items-center justify-center gap-3 mb-8">
              <motion.div
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
                className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center"
              >
                <Users className="h-6 w-6 text-primary" />
              </motion.div>
              <h2 className="text-3xl font-bold text-foreground">فريق العمل</h2>
            </div>
            <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
              الفريق الذي ساهم في تصميم وتطوير وتنفيذ منصة التعلم القائم على العمل
            </p>
            <motion.div
              initial={{ opacity: 0, scale: 0.92 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: "easeOut" as const }}
              whileHover={{ scale: 1.01 }}
              className="rounded-2xl overflow-hidden shadow-lg border mb-12"
            >
              <img src={teamPhoto} alt="فريق العمل" className="w-full object-cover" />
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Team Members */}
      <section className="py-20 container mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          {/* Supervisor */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-10"
          >
            <div className="inline-flex items-center gap-2 bg-warning/10 text-warning-foreground px-4 py-2 rounded-full text-sm font-medium mb-4">
              <Award className="h-4 w-4" />
              إشراف وتوجيه
            </div>
            <motion.div
              whileHover={{ y: -4, boxShadow: "0 20px 40px -12px rgba(0,0,0,0.1)" }}
              className="bg-card rounded-2xl p-6 border shadow-sm max-w-sm mx-auto transition-all"
            >
              <motion.div
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
                className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3"
              >
                <span className="text-2xl font-bold text-primary">SZ</span>
              </motion.div>
              <h3 className="font-bold text-lg text-foreground">Sameh Zawati</h3>
              <p className="text-sm text-muted-foreground">Supervisor</p>
            </motion.div>
          </motion.div>

          {/* Developer */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-4">
              💻 تطوير المنصة
            </div>
            <motion.div
              whileHover={{ y: -4, boxShadow: "0 20px 40px -12px rgba(0,0,0,0.1)" }}
              className="bg-card rounded-2xl p-6 border shadow-sm max-w-sm mx-auto transition-all"
            >
              <motion.div
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
                className="h-16 w-16 rounded-full bg-accent/20 flex items-center justify-center mx-auto mb-3"
              >
                <span className="text-2xl font-bold text-accent-foreground">YM</span>
              </motion.div>
              <h3 className="font-bold text-lg text-foreground">Yousef Al-Masaied</h3>
              <p className="text-sm text-muted-foreground">Developer</p>
            </motion.div>
          </motion.div>

          {/* Team JCGT */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-8"
          >
            <div className="inline-flex items-center gap-2 bg-success text-white px-6 py-3 rounded-full text-base font-bold shadow-md mb-4">
              <Users className="h-5 w-5" />
              TEAM JCGT — أعضاء الفريق
            </div>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-w-5xl mx-auto"
          >
            {teamMembers.map((name, i) => (
              <motion.div
                key={i}
                custom={i}
                variants={fadeUp}
                whileHover={{ y: -4, scale: 1.03, boxShadow: "0 12px 24px -6px rgba(0,0,0,0.1)" }}
                className="bg-card rounded-xl p-4 border shadow-sm text-center cursor-default transition-all"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.05 * i }}
                  className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-3"
                >
                  <span className="text-sm font-bold text-muted-foreground">
                    {name.split(" ").slice(0, 2).map(n => n[0]).join("")}
                  </span>
                </motion.div>
                <h4 className="font-semibold text-sm text-foreground leading-tight">{name}</h4>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="border-t bg-card py-8"
      >
        <div className="container mx-auto px-4 text-center space-y-2">
          <p className="font-bold text-foreground">© 2026 WBL Platform — جميع الحقوق محفوظة</p>
          <p className="text-sm text-muted-foreground">
            Supervised by: Sameh Zawati · Developed by: Yousef Al-Masaied · In cooperation with: TEAM JCGT
          </p>
        </div>
      </motion.footer>
    </div>
  );
};

export default About;
