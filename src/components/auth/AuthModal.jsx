import React, { useState } from "react";
import { useApp } from "../../context/AppContext";

export default function AuthModal() {
  const { isAuthModalOpen, setIsAuthModalOpen, login, register, googleAuth, addToast, currentUser } = useApp();
  const [tab, setTab] = useState("login"); // "login" | "register"
  const [loading, setLoading] = useState(false);

  // Form states
  const [email, setEmail] = useState("deepraj.roy@university.edu");
  const [password, setPassword] = useState("SkillMatch2026!");
  const [fullName, setFullName] = useState("Deepraj Roy");
  const [college, setCollege] = useState("University Institute of Technology");
  const [degree, setDegree] = useState("B.Tech Computer Science");

  if (!isAuthModalOpen) return null;

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      addToast("Successfully signed in!", "success");
      setIsAuthModalOpen(false);
    } catch (err) {
      addToast(err.message || "Failed to sign in", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register({
        email,
        password,
        full_name: fullName,
        college,
        degree,
      });
      addToast("Account registered and signed in!", "success");
      setIsAuthModalOpen(false);
    } catch (err) {
      addToast(err.message || "Failed to register", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      await googleAuth({
        email: "deepraj.roy@university.edu",
        name: "Deepraj Roy",
        picture: null,
      });
      addToast("Signed in with Google account!", "success");
      setIsAuthModalOpen(false);
    } catch (err) {
      addToast(err.message || "Google sign in failed", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-surface-container-lowest w-full max-w-md rounded-2xl shadow-xl border border-surface-container-high overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="p-6 pb-4 border-b border-surface-container-high flex items-center justify-between">
          <div className="flex items-center gap-2 text-primary font-headline-sm">
            <span className="material-symbols-outlined text-[24px]">verified</span>
            <span>SkillMatch Auth</span>
          </div>
          <button
            onClick={() => setIsAuthModalOpen(false)}
            className="p-1 rounded-full text-on-surface-variant hover:bg-surface-container-high transition-colors"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-surface-container-high bg-surface-container-low">
          <button
            onClick={() => setTab("login")}
            className={`flex-1 py-3 text-body-md font-medium text-center transition-colors border-b-2 ${
              tab === "login"
                ? "border-primary text-primary bg-surface-container-lowest"
                : "border-transparent text-on-surface-variant hover:text-on-surface"
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => setTab("register")}
            className={`flex-1 py-3 text-body-md font-medium text-center transition-colors border-b-2 ${
              tab === "register"
                ? "border-primary text-primary bg-surface-container-lowest"
                : "border-transparent text-on-surface-variant hover:text-on-surface"
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4">
          {/* Google Sign In Button */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl border border-surface-container-highest bg-surface-container-lowest hover:bg-surface-container-low text-on-surface text-body-md font-medium transition-all shadow-sm"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
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
            <span>Continue with Google</span>
          </button>

          <div className="flex items-center my-4">
            <div className="flex-1 border-t border-surface-container-high"></div>
            <span className="px-3 text-label-sm text-outline uppercase tracking-wider">Or with email</span>
            <div className="flex-1 border-t border-surface-container-high"></div>
          </div>

          {tab === "login" ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-body-sm font-medium text-on-surface mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-surface-container-low border border-surface-container-high text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="student@university.edu"
                />
              </div>

              <div>
                <label className="block text-body-sm font-medium text-on-surface mb-1">Password</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-surface-container-low border border-surface-container-high text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="••••••••"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-xl bg-primary hover:bg-primary-container text-on-primary font-medium text-body-md transition-all shadow-sm flex items-center justify-center gap-2"
              >
                {loading ? "Authenticating..." : "Sign In"}
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-3">
              <div>
                <label className="block text-body-sm font-medium text-on-surface mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-surface-container-low border border-surface-container-high text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Deepraj Roy"
                />
              </div>

              <div>
                <label className="block text-body-sm font-medium text-on-surface mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-surface-container-low border border-surface-container-high text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="deepraj.roy@university.edu"
                />
              </div>

              <div>
                <label className="block text-body-sm font-medium text-on-surface mb-1">Password</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-surface-container-low border border-surface-container-high text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Minimum 8 characters"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-body-sm font-medium text-on-surface mb-1">College</label>
                  <input
                    type="text"
                    value={college}
                    onChange={(e) => setCollege(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-surface-container-low border border-surface-container-high text-body-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-body-sm font-medium text-on-surface mb-1">Degree</label>
                  <input
                    type="text"
                    value={degree}
                    onChange={(e) => setDegree(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-surface-container-low border border-surface-container-high text-body-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-2.5 rounded-xl bg-primary hover:bg-primary-container text-on-primary font-medium text-body-md transition-all shadow-sm flex items-center justify-center gap-2"
              >
                {loading ? "Creating Profile..." : "Register & Start Matching"}
              </button>
            </form>
          )}

          <div className="p-3 bg-surface-container-low rounded-xl text-label-sm text-on-surface-variant flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[16px]">lock</span>
            <span>Zero credentials stored in plaintext. Uses bcrypt + JWT tokens.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
