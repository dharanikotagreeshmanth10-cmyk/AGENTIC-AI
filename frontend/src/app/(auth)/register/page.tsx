"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Sparkles, UserPlus, AlertCircle, CheckCircle2 } from "lucide-react";

function generateUniqueId(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let id = "ECO-";
  for (let i = 0; i < 6; i++) {
    id += chars[Math.floor(Math.random() * chars.length)];
  }
  return id;
}

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState<{ uniqueId: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const validate = () => {
    if (!form.name.trim()) return "Full name is required.";
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) return "A valid email is required.";
    if (!form.phone.trim() || !/^\+?[\d\s\-()]{7,15}$/.test(form.phone)) return "A valid phone number is required.";
    if (form.password.length < 6) return "Password must be at least 6 characters.";
    if (form.password !== form.confirmPassword) return "Passwords do not match.";
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    try {
      const users: any[] = JSON.parse(localStorage.getItem("eco_users") || "[]");

      // Check duplicate email
      if (users.find((u) => u.email.toLowerCase() === form.email.toLowerCase())) {
        setError("An account with this email already exists.");
        setLoading(false);
        return;
      }

      const uniqueId = generateUniqueId();
      const newUser = {
        uniqueId,
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        phone: form.phone.trim(),
        password: form.password,
        createdAt: new Date().toISOString(),
      };

      users.push(newUser);
      localStorage.setItem("eco_users", JSON.stringify(users));
      setSuccess({ uniqueId });
    } catch {
      setError("Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-[#080b11] flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[-10%] left-[-5%] w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-[-10%] right-[-5%] w-[400px] h-[400px] bg-cyan-500/10 rounded-full blur-[100px] animate-pulse" />
        </div>
        <div className="relative z-10 w-full max-w-md mx-4">
          <div className="bg-[#0d1427]/80 backdrop-blur-xl border border-[#1a233a] rounded-2xl shadow-2xl shadow-black/50 p-8 text-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-emerald-500/30 mx-auto mb-5">
              <CheckCircle2 className="w-8 h-8 text-slate-950" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Account Created!</h2>
            <p className="text-slate-400 text-sm mb-6">Your EcoGenius account is ready. Save your Unique ID below — you&apos;ll need it to log in.</p>
            <div className="bg-[#111827] border border-cyan-500/30 rounded-xl p-4 mb-6">
              <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-1">Your Unique ID</p>
              <p className="text-3xl font-bold text-cyan-400 tracking-widest">{success.uniqueId}</p>
            </div>
            <button
              id="go-to-login-btn"
              onClick={() => router.push("/login")}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 text-slate-950 font-bold text-sm hover:from-cyan-400 hover:to-emerald-400 transition-all shadow-lg shadow-cyan-500/20 hover:scale-[1.01]"
            >
              Go to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#080b11] flex items-center justify-center relative overflow-hidden py-10">
      {/* Animated background orbs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[400px] h-[400px] bg-cyan-500/10 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: "1s" }} />
        <div className="absolute top-[50%] left-[50%] w-[300px] h-[300px] bg-blue-500/8 rounded-full blur-[80px] animate-pulse" style={{ animationDelay: "2s" }} />
      </div>

      {/* Grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: "linear-gradient(#10b981 1px, transparent 1px), linear-gradient(90deg, #10b981 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      <div className="relative z-10 w-full max-w-md mx-4">
        <div className="bg-[#0d1427]/80 backdrop-blur-xl border border-[#1a233a] rounded-2xl shadow-2xl shadow-black/50 p-8">
          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-emerald-500/30 mb-4">
              <Sparkles className="w-7 h-7 text-slate-950" />
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Create Account</h1>
            <p className="text-sm text-slate-400 mt-1">Join EcoGenius AI Platform</p>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm px-4 py-3 rounded-lg mb-5">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <div>
              <label htmlFor="register-name" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Full Name
              </label>
              <input
                id="register-name"
                name="name"
                type="text"
                autoComplete="name"
                value={form.name}
                onChange={handleChange}
                placeholder="John Doe"
                className="w-full px-4 py-3 rounded-xl bg-[#111827] border border-[#1e2a4a] text-slate-100 placeholder-slate-600 text-sm focus:outline-none focus:border-emerald-500/60 focus:ring-2 focus:ring-emerald-500/20 transition-all"
              />
            </div>

            {/* Email */}
            <div>
              <label htmlFor="register-email" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <input
                id="register-email"
                name="email"
                type="email"
                autoComplete="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className="w-full px-4 py-3 rounded-xl bg-[#111827] border border-[#1e2a4a] text-slate-100 placeholder-slate-600 text-sm focus:outline-none focus:border-emerald-500/60 focus:ring-2 focus:ring-emerald-500/20 transition-all"
              />
            </div>

            {/* Phone */}
            <div>
              <label htmlFor="register-phone" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Phone Number
              </label>
              <input
                id="register-phone"
                name="phone"
                type="tel"
                autoComplete="tel"
                value={form.phone}
                onChange={handleChange}
                placeholder="+91 98765 43210"
                className="w-full px-4 py-3 rounded-xl bg-[#111827] border border-[#1e2a4a] text-slate-100 placeholder-slate-600 text-sm focus:outline-none focus:border-emerald-500/60 focus:ring-2 focus:ring-emerald-500/20 transition-all"
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="register-password" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  id="register-password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Min. 6 characters"
                  className="w-full px-4 py-3 pr-12 rounded-xl bg-[#111827] border border-[#1e2a4a] text-slate-100 placeholder-slate-600 text-sm focus:outline-none focus:border-emerald-500/60 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="register-confirm-password" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  id="register-confirm-password"
                  name="confirmPassword"
                  type={showConfirm ? "text" : "password"}
                  autoComplete="new-password"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  placeholder="Repeat password"
                  className="w-full px-4 py-3 pr-12 rounded-xl bg-[#111827] border border-[#1e2a4a] text-slate-100 placeholder-slate-600 text-sm focus:outline-none focus:border-emerald-500/60 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                  aria-label="Toggle confirm password visibility"
                >
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Info note */}
            <div className="bg-cyan-500/5 border border-cyan-500/20 rounded-lg px-3 py-2 text-xs text-cyan-400/80">
              ℹ️ A unique ID will be auto-generated for you after registration.
            </div>

            {/* Submit */}
            <button
              id="register-submit-btn"
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 font-bold text-sm hover:from-emerald-400 hover:to-cyan-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 hover:scale-[1.01] active:scale-[0.99] mt-1"
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-slate-950/30 border-t-slate-950 rounded-full animate-spin" />
              ) : (
                <UserPlus className="w-4 h-4" />
              )}
              {loading ? "Creating account..." : "Create Account"}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-6">
            Already have an account?{" "}
            <Link href="/login" className="text-cyan-400 hover:text-cyan-300 font-semibold transition-colors">
              Sign In
            </Link>
          </p>
        </div>

        <p className="text-center text-xs text-slate-600 mt-4">
          EcoGenius AI · Enterprise Sustainability Platform · v2.0
        </p>
      </div>
    </div>
  );
}
