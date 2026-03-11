import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Train, Loader2 } from "lucide-react";
import Cookies from "js-cookie";
import { authApi } from "@/lib/api";

const EXAMS = ["RRB NTPC", "RRB Group D", "RRB JE", "RRB ALP", "Technician"];
const CATEGORIES = ["UR", "SC", "ST", "OBC", "EWS"];

export function RegisterPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "", email: "", password: "",
    category: "SC", targetExam: "RRB NTPC",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await authApi.register({
        name: form.name,
        email: form.email,
        password: form.password,
        category: form.category,
        targetExam: form.targetExam,
      });
      Cookies.set("rrb_token", res.accessToken, { expires: 7 });
      navigate({ to: "/dashboard" });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const inputCls = "w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition bg-white";

  return (
    <div className="min-h-screen flex items-center justify-center p-4 py-10"
      style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e293b 60%, #0f172a 100%)" }}>
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="text-center mb-7">
            <div className="w-12 h-12 bg-brand-500 rounded-xl flex items-center justify-center mx-auto mb-3">
              <Train size={24} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Create Account</h1>
            <p className="text-gray-500 text-sm mt-1">Start your RRB preparation journey today</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Full Name</label>
                <input type="text" placeholder="Your name" required className={inputCls}
                  value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email</label>
                <input type="email" placeholder="you@example.com" required className={inputCls}
                  value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Category</label>
                <select className={inputCls} value={form.category}
                  onChange={e => setForm(p => ({ ...p, category: e.target.value }))}>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Target Exam</label>
                <select className={inputCls} value={form.targetExam}
                  onChange={e => setForm(p => ({ ...p, targetExam: e.target.value }))}>
                  {EXAMS.map(e => <option key={e} value={e}>{e}</option>)}
                </select>
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Password</label>
                <input type="password" placeholder="Create a password" required minLength={6} className={inputCls}
                  value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} />
              </div>
            </div>

            {form.category !== "UR" && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-800">
                <span className="font-bold">{form.category} category benefit:</span> Age relaxation,
                fee waiver & lower cutoff. Check the SC/ST/OBC Guide section for details.
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-2.5">
                {error}
              </div>
            )}

            <button
              type="submit" disabled={loading}
              className="w-full bg-brand-500 hover:bg-brand-600 text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {loading ? <><Loader2 size={18} className="animate-spin" /> Creating account...</> : "Create Free Account"}
            </button>
          </form>

          <div className="mt-5 text-center text-sm text-gray-500">
            Already have an account?{" "}
            <Link to="/login" className="text-brand-500 font-bold hover:underline">Sign in</Link>
          </div>
        </div>
        <div className="text-center mt-4 text-slate-500 text-xs">
          <Link to="/" className="hover:text-slate-300 transition-colors">← Back to home</Link>
        </div>
      </div>
    </div>
  );
}
