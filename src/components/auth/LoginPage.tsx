import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Train, Eye, EyeOff, Loader2 } from "lucide-react";
import Cookies from "js-cookie";
import { authApi } from "@/lib/api";

export function LoginPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await authApi.login(form.email, form.password);
      Cookies.set("rrb_token", res.accessToken, { expires: 7 });
      navigate({ to: "/dashboard" });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex" style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e293b 60%, #0f172a 100%)" }}>
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 flex-col items-center justify-center p-12 relative">
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 40px, rgba(255,255,255,0.3) 40px, rgba(255,255,255,0.3) 41px), repeating-linear-gradient(90deg, transparent, transparent 40px, rgba(255,255,255,0.3) 40px, rgba(255,255,255,0.3) 41px)"
        }} />
        <div className="relative text-center">
          <div className="w-20 h-20 bg-brand-500/20 border-2 border-orange-500/40 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <Train size={40} className="text-orange-400" />
          </div>
          <h2 className="text-4xl font-extrabold text-white mb-3">RailwayPrep</h2>
          <p className="text-slate-400 text-lg mb-8">India's #1 RRB Exam Preparation Platform</p>
          <div className="grid grid-cols-2 gap-4 text-center">
            {[
              { val: "50,000+", label: "Students" },
              { val: "1000+",   label: "Questions" },
              { val: "100+",    label: "Mock Tests" },
              { val: "95%",     label: "Success Rate" },
            ].map(s => (
              <div key={s.label} className="bg-white/5 border border-white/10 rounded-2xl p-4">
                <div className="text-2xl font-extrabold text-orange-400">{s.val}</div>
                <div className="text-slate-400 text-sm mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel - form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-2xl p-8">
            <div className="text-center mb-7">
              <div className="w-12 h-12 bg-brand-500 rounded-xl flex items-center justify-center mx-auto mb-3 lg:hidden">
                <Train size={24} className="text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Welcome back!</h1>
              <p className="text-gray-500 text-sm mt-1">Sign in to continue your preparation</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email</label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Password</label>
                <div className="relative">
                  <input
                    type={showPwd ? "text" : "password"}
                    placeholder="Enter password"
                    value={form.password}
                    onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 pr-11 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwd(!showPwd)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-2.5">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-brand-500 hover:bg-brand-600 text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {loading ? <><Loader2 size={18} className="animate-spin" /> Signing in...</> : "Sign In"}
              </button>
            </form>

            <div className="mt-6 text-center text-sm text-gray-500">
              Don't have an account?{" "}
              <Link to="/register" className="text-brand-500 font-bold hover:underline">
                Register free
              </Link>
            </div>
          </div>

          <div className="text-center mt-4 text-slate-500 text-xs">
            <Link to="/" className="hover:text-slate-300 transition-colors">← Back to home</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
