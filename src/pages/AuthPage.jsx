import React, { useState } from "react";
import { useApp } from "../context/AppContext";

const GOOGLE_SVG = (
  <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden="true">
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
    />
  </svg>
);

const FEATURES = [
  {
    icon: "psychology",
    title: "Explainable AI Matching",
    text: "See exactly why an internship fits you — skills, projects, academics and goals, all scored transparently.",
  },
  {
    icon: "description",
    title: "Resume Intelligence",
    text: "Upload your resume once. Skills are extracted, verified against evidence and mapped into your profile.",
  },
  {
    icon: "route",
    title: "Guided Skill Roadmaps",
    text: "Week-by-week plans that close your skill gaps before application deadlines hit.",
  },
];

const STATS = [
  { value: "12k+", label: "Live opportunities" },
  { value: "94%", label: "Match precision" },
  { value: "3,400+", label: "Students placed" },
];

function BrandMark({ size = "text-[24px]", text = "text-[20px]" }) {
  return (
    <div className="flex items-center gap-2 select-none">
      <span className={`material-symbols-outlined fill ${size}`}>verified</span>
      <span className={`font-semibold ${text}`}>SkillMatch</span>
    </div>
  );
}

function Field({
  label,
  icon,
  type = "text",
  value,
  onChange,
  placeholder,
  required = true,
  autoComplete,
  minLength,
  hint,
}) {
  const [show, setShow] = useState(false);
  const isPassword = type === "password";
  const inputType = isPassword && show ? "text" : type;

  return (
    <div>
      <label className="block text-body-sm font-medium text-on-surface mb-1.5">{label}</label>
      <div className="relative">
        <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[20px] text-outline pointer-events-none">
          {icon}
        </span>
        <input
          type={inputType}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          minLength={minLength}
          autoComplete={autoComplete}
          className="w-full pl-11 pr-11 py-3 rounded-xl bg-surface-container-low border border-surface-container-high text-base text-on-surface placeholder:text-outline/70 focus:outline-none focus:ring-2 focus:ring-primary/60 focus:border-primary focus:bg-surface-container-lowest transition-all"
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            aria-label={show ? "Hide password" : "Show password"}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-outline hover:text-on-surface hover:bg-surface-container-high transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">{show ? "visibility_off" : "visibility"}</span>
          </button>
        )}
      </div>
      {hint && <p className="text-label-md text-outline mt-1.5">{hint}</p>}
    </div>
  );
}

function passwordStrength(pw) {
  if (!pw) return null;
  const long = pw.length >= 8;
  const mixed = /[a-zA-Z]/.test(pw) && /\d/.test(pw);
  if (long && mixed) return { label: "Strong", pct: 100, cls: "bg-primary" };
  if (long) return { label: "Good", pct: 66, cls: "bg-primary/60" };
  return { label: "Weak — use 8+ characters", pct: 33, cls: "bg-error/60" };
}

export default function AuthPage() {
  const { login, register, googleAuth, addToast, setCurrentRoute } = useApp();
  const [tab, setTab] = useState("login");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Sign in
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Register
  const [fullName, setFullName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [college, setCollege] = useState("");
  const [degree, setDegree] = useState("");

  const strength = passwordStrength(regPassword);

  const switchTab = (next) => {
    setTab(next);
    setError("");
  };

  const finish = (message) => {
    addToast(message, "success");
    setCurrentRoute("dashboard");
    window.scrollTo({ top: 0 });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email.trim(), password);
      finish("Welcome back! Signed in successfully.");
    } catch (err) {
      setError(err.message || "Failed to sign in. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    if (regPassword.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }
    setLoading(true);
    try {
      await register({
        email: regEmail.trim(),
        password: regPassword,
        full_name: fullName.trim(),
        college: college.trim(),
        degree: degree.trim(),
      });
      finish("Account created! Your personalized dashboard is ready.");
    } catch (err) {
      setError(err.message || "Failed to create account. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setError("");
    setLoading(true);
    try {
      const name = fullName.trim() || regEmail.trim().split("@")[0] || "New Student";
      const mail = (tab === "register" && regEmail.trim()) || email.trim();
      await googleAuth({ email: mail || undefined, name, picture: null });
      finish("Signed in with Google!");
    } catch (err) {
      setError(err.message || "Google sign in failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = () => {
    setEmail("deepraj.roy@university.edu");
    setPassword("SkillMatch2026!");
    setError("");
  };

  const spinner = (
    <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
  );

  return (
    <div className="min-h-dvh w-full flex bg-surface">
      {/* ── Brand Showcase Panel (desktop / large tablets) ── */}
      <aside className="hidden lg:flex lg:w-[46%] xl:w-[48%] relative overflow-hidden bg-gradient-to-br from-[#00332f] via-[#005049] to-[#00685f] text-on-primary flex-col justify-between p-10 xl:p-14 select-none">
        {/* Decorative layers */}
        <div
          className="absolute inset-0 opacity-60"
          style={{
            backgroundImage: "radial-gradient(rgba(255,255,255,0.10) 1px, transparent 1px)",
            backgroundSize: "26px 26px",
          }}
        />
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-primary-fixed/20 blur-3xl" />
        <div className="absolute bottom-[-6rem] left-[-4rem] w-[28rem] h-[28rem] rounded-full bg-[#008378]/40 blur-3xl" />

        {/* Floating match chips */}
        <div className="absolute top-[18%] right-10 animate-float-slow hidden xl:flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-md shadow-lg">
          <span className="material-symbols-outlined text-primary-fixed">handshake</span>
          <div>
            <p className="text-label-sm text-white/70">AI/ML Intern · Vertex Labs</p>
            <p className="text-body-sm font-semibold">96% fit score</p>
          </div>
        </div>
        <div
          className="absolute bottom-[22%] right-24 animate-float-slow hidden xl:flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-md shadow-lg"
          style={{ animationDelay: "1.6s" }}
        >
          <span className="material-symbols-outlined text-primary-fixed">workspace_premium</span>
          <div>
            <p className="text-label-sm text-white/70">Hackathon · Smart India</p>
            <p className="text-body-sm font-semibold">Saved to roadmap</p>
          </div>
        </div>

        {/* Top brand */}
        <div className="relative z-10">
          <BrandMark size="text-[30px]" text="text-[24px]" />
        </div>

        {/* Headline + features */}
        <div className="relative z-10 max-w-lg space-y-8">
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 border border-white/15 text-label-md font-semibold uppercase tracking-wider text-primary-fixed mb-5">
              <span className="material-symbols-outlined text-[14px]">auto_awesome</span>
              Student Opportunity Engine
            </span>
            <h1 className="font-headline-xl text-white leading-[1.15]" style={{ fontSize: "clamp(30px, 3vw, 44px)" }}>
              Your skills,
              <br />
              matched to real opportunity.
            </h1>
            <p className="mt-4 text-body-lg text-primary-fixed/85 max-w-md">
              SkillMatch reads your resume, verifies your skills and connects you to internships,
              hackathons and projects you're genuinely ready for.
            </p>
          </div>

          <div className="space-y-3">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="flex items-start gap-4 p-4 rounded-2xl bg-white/[0.07] border border-white/10 backdrop-blur-sm hover:bg-white/[0.12] transition-colors"
              >
                <div className="w-10 h-10 shrink-0 rounded-xl bg-primary-fixed/15 border border-white/10 flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary-fixed text-[22px]">{f.icon}</span>
                </div>
                <div>
                  <h3 className="font-headline-sm text-white text-[16px]">{f.title}</h3>
                  <p className="text-body-sm text-white/65 leading-relaxed">{f.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="relative z-10 grid grid-cols-3 gap-4 pt-6 border-t border-white/15 max-w-lg">
          {STATS.map((s) => (
            <div key={s.label}>
              <p className="font-headline-lg text-white text-[24px]">{s.value}</p>
              <p className="text-label-md text-white/60">{s.label}</p>
            </div>
          ))}
        </div>
      </aside>

      {/* ── Auth Form Panel (all devices) ── */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Compact brand bar (mobile / tablet) */}
        <div className="lg:hidden px-6 sm:px-10 pt-7 pb-1 flex items-center justify-between text-primary">
          <BrandMark size="text-[26px]" text="text-[19px]" />
          <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 text-label-md font-semibold text-primary">
            <span className="material-symbols-outlined text-[14px]">devices</span>
            Works on all your devices
          </span>
        </div>

        <div className="flex-1 flex items-center justify-center px-4 py-8 sm:px-10 lg:py-12">
          <div className="w-full max-w-md animate-slide-up">
            <div className="bg-surface-container-lowest border border-surface-container-high/70 rounded-3xl shadow-[0_12px_48px_rgba(0,40,36,0.10)] p-6 sm:p-8">
              {/* Welcome header */}
              <div className="mb-6">
                <h2 className="font-headline-lg text-on-surface">
                  {tab === "login" ? "Welcome back" : "Create your account"}
                </h2>
                <p className="text-body-md text-on-surface-variant mt-1">
                  {tab === "login"
                    ? "Sign in to continue matching with opportunities."
                    : "Start matching with internships in under a minute."}
                </p>
              </div>

              {/* Segmented tabs */}
              <div className="grid grid-cols-2 gap-1 p-1 bg-surface-container rounded-xl mb-6" role="tablist">
                <button
                  type="button"
                  role="tab"
                  aria-selected={tab === "login"}
                  onClick={() => switchTab("login")}
                  className={`py-2.5 rounded-lg text-body-md font-medium transition-all ${
                    tab === "login"
                      ? "bg-surface-container-lowest text-primary shadow-sm ring-1 ring-surface-container-high"
                      : "text-on-surface-variant hover:text-on-surface"
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={tab === "register"}
                  onClick={() => switchTab("register")}
                  className={`py-2.5 rounded-lg text-body-md font-medium transition-all ${
                    tab === "register"
                      ? "bg-surface-container-lowest text-primary shadow-sm ring-1 ring-surface-container-high"
                      : "text-on-surface-variant hover:text-on-surface"
                  }`}
                >
                  Create Account
                </button>
              </div>

              {/* Error banner */}
              {error && (
                <div
                  role="alert"
                  className="flex items-start gap-2.5 p-3.5 mb-4 rounded-xl bg-error-container text-on-error-container text-body-sm animate-fade-in"
                >
                  <span className="material-symbols-outlined text-[18px] mt-0.5">error</span>
                  <span>{error}</span>
                </div>
              )}

              {/* Google */}
              <button
                type="button"
                onClick={handleGoogle}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl border border-surface-container-highest bg-surface-container-lowest hover:bg-surface-container-low text-on-surface text-body-md font-medium transition-all shadow-sm disabled:opacity-60"
              >
                {GOOGLE_SVG}
                <span>Continue with Google</span>
              </button>

              <div className="flex items-center my-5">
                <div className="flex-1 border-t border-surface-container-high" />
                <span className="px-3 text-label-sm text-outline uppercase tracking-wider">Or with email</span>
                <div className="flex-1 border-t border-surface-container-high" />
              </div>

              {tab === "login" ? (
                <form onSubmit={handleLogin} className="space-y-4" noValidate={false}>
                  <Field
                    label="Email"
                    icon="mail"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="student@university.edu"
                    autoComplete="email"
                  />
                  <Field
                    label="Password"
                    icon="lock"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="current-password"
                  />

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 rounded-xl bg-primary hover:bg-primary-container active:scale-[0.99] text-on-primary font-medium text-body-lg transition-all shadow-md disabled:opacity-60 flex items-center justify-center gap-2"
                  >
                    {loading ? spinner : <span className="material-symbols-outlined text-[18px]">login</span>}
                    {loading ? "Signing in…" : "Sign In"}
                  </button>

                  <button
                    type="button"
                    onClick={fillDemo}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-dashed border-outline/50 text-label-md text-on-surface-variant hover:border-primary hover:text-primary transition-colors"
                  >
                    <span className="material-symbols-outlined text-[16px]">bolt</span>
                    Use demo account (pre-fills credentials)
                  </button>
                </form>
              ) : (
                <form onSubmit={handleRegister} className="space-y-4">
                  <Field
                    label="Full Name"
                    icon="person"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Ananya Sharma"
                    autoComplete="name"
                  />
                  <Field
                    label="Email"
                    icon="mail"
                    type="email"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="ananya.sharma@university.edu"
                    autoComplete="email"
                  />
                  <Field
                    label="Password"
                    icon="lock"
                    type="password"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="Minimum 8 characters"
                    autoComplete="new-password"
                    minLength={8}
                    hint={
                      strength ? (
                        <span className="flex items-center gap-2">
                          <span className="flex-1 h-1.5 rounded-full bg-surface-container-high overflow-hidden">
                            <span
                              className={`block h-full rounded-full transition-all duration-500 ${strength.cls}`}
                              style={{ width: `${strength.pct}%` }}
                            />
                          </span>
                          <span className={strength.pct === 100 ? "text-primary" : ""}>{strength.label}</span>
                        </span>
                      ) : (
                        "Use 8+ characters with letters and numbers."
                      )
                    }
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field
                      label="College"
                      icon="school"
                      value={college}
                      onChange={(e) => setCollege(e.target.value)}
                      placeholder="University Institute of Technology"
                    />
                    <Field
                      label="Degree"
                      icon="menu_book"
                      value={degree}
                      onChange={(e) => setDegree(e.target.value)}
                      placeholder="B.Tech Computer Science"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full pt-1"
                  >
                    <span className="w-full py-3 rounded-xl bg-primary hover:bg-primary-container active:scale-[0.99] text-on-primary font-medium text-body-lg transition-all shadow-md disabled:opacity-60 flex items-center justify-center gap-2">
                      {loading ? spinner : <span className="material-symbols-outlined text-[18px]">rocket_launch</span>}
                      {loading ? "Creating profile…" : "Register & Start Matching"}
                    </span>
                  </button>
                </form>
              )}

              {/* Trust footnote */}
              <p className="mt-6 flex items-center justify-center gap-1.5 text-label-md text-outline text-center">
                <span className="material-symbols-outlined text-[14px]">lock</span>
                Credentials encrypted with bcrypt + JWT. Never stored in plaintext.
              </p>
            </div>

            {/* Switch prompt (mobile-friendly tap target) */}
            <p className="mt-5 text-center text-body-md text-on-surface-variant">
              {tab === "login" ? (
                <>
                  New to SkillMatch?{" "}
                  <button
                    type="button"
                    onClick={() => switchTab("register")}
                    className="font-semibold text-primary hover:underline underline-offset-4"
                  >
                    Create a free account
                  </button>
                </>
              ) : (
                <>
                  Already have an account?{" "}
                  <button
                    type="button"
                    onClick={() => switchTab("login")}
                    className="font-semibold text-primary hover:underline underline-offset-4"
                  >
                    Sign in instead
                  </button>
                </>
              )}
            </p>
          </div>
        </div>

        {/* Footer */}
        <footer className="px-6 pb-6 text-center text-label-md text-outline">
          © {new Date().getFullYear()} SkillMatch · Connect students with internships, hackathons & projects
        </footer>
      </main>
    </div>
  );
}
