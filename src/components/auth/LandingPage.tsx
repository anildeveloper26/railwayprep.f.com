import { Link } from "@tanstack/react-router";
import {
  Train, BookOpen, BarChart2, Trophy, Bell, Calendar,
  ShieldCheck, ArrowRight, CheckCircle, Users, Star,
  TrendingUp, Clock,
} from "lucide-react";

const features = [
  { icon: BookOpen,    title: "Mock Tests",       desc: "Full-length timed tests with auto-scoring, negative marking & rank prediction" },
  { icon: BarChart2,   title: "PYQ Bank",         desc: "5000+ previous year questions sorted by year, subject & difficulty with explanations" },
  { icon: Bell,        title: "Exam Alerts",      desc: "Instant notifications for RRB vacancies, exam dates, hall tickets & results" },
  { icon: Calendar,    title: "Study Planner",    desc: "Personalized daily & weekly study plans generated based on your target date" },
  { icon: ShieldCheck, title: "SC/ST/OBC Guide",  desc: "Dedicated guidance on age relaxation, fee waiver, cutoffs & document checklist" },
  { icon: Trophy,      title: "Leaderboard",      desc: "Compete with aspirants in your category and track your rank improvement" },
];

const exams = [
  { name: "RRB NTPC",    vacancies: "11,558", color: "bg-blue-500" },
  { name: "RRB Group D", vacancies: "32,438", color: "bg-green-500" },
  { name: "RRB JE",      vacancies: "7,951",  color: "bg-purple-500" },
  { name: "RRB ALP",     vacancies: "9,144",  color: "bg-orange-500" },
];

const stats = [
  { icon: Users,     value: "50,000+",  label: "Aspirants" },
  { icon: BookOpen,  value: "5,000+",   label: "PYQ Questions" },
  { icon: Clock,     value: "200+",     label: "Mock Tests" },
  { icon: TrendingUp,value: "85%",      label: "Selection Rate" },
];

export function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-gray-100 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Train size={18} className="text-white" />
            </div>
            <span className="font-bold text-gray-900 text-lg">RailwayPrep</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login" className="text-sm text-gray-600 hover:text-gray-900 font-medium">
              Login
            </Link>
            <Link
              to="/register"
              className="bg-blue-600 text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Start Free
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="bg-gradient-to-br from-[#1e3a8a] via-[#1a56db] to-[#3b82f6] text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/15 px-4 py-2 rounded-full text-sm mb-6 backdrop-blur-sm">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            RRB NTPC 2024 — 11,558 Vacancies Open Now
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-5 leading-tight">
            Crack RRB Exams with<br />
            <span className="text-yellow-300">Smart Preparation 🚂</span>
          </h1>
          <p className="text-blue-100 text-lg mb-8 max-w-2xl mx-auto">
            Built by an aspirant, for aspirants. Mock tests in Telugu & Hindi,
            SC/ST/OBC guidance, PYQ bank, and personalized study plans — all at ₹199/month.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="flex items-center justify-center gap-2 bg-white text-blue-700 font-bold px-7 py-3.5 rounded-xl hover:bg-blue-50 transition-all shadow-lg"
            >
              Start Free Today <ArrowRight size={18} />
            </Link>
            <Link
              to="/login"
              className="flex items-center justify-center gap-2 border-2 border-white/40 text-white font-semibold px-7 py-3.5 rounded-xl hover:bg-white/10 transition-all"
            >
              I have an account
            </Link>
          </div>
          <div className="mt-8 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-blue-200">
            {["No credit card required", "Free tier forever", "Cancel anytime"].map(t => (
              <div key={t} className="flex items-center gap-1.5">
                <CheckCircle size={14} className="text-green-300" /> {t}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-gray-900 py-8">
        <div className="max-w-4xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map(({ icon: Icon, value, label }) => (
            <div key={label} className="text-center">
              <div className="flex justify-center mb-1">
                <Icon size={20} className="text-blue-400" />
              </div>
              <div className="text-white font-bold text-2xl">{value}</div>
              <div className="text-gray-400 text-sm">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Exams Covered */}
      <section className="py-14 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">Exams We Cover</h2>
          <p className="text-gray-500 text-center mb-8">All exams conducted by Railway Recruitment Board (RRB)</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {exams.map(exam => (
              <div key={exam.name} className="border border-gray-100 rounded-xl p-4 text-center hover:shadow-md transition-shadow">
                <div className={`w-10 h-10 ${exam.color} rounded-xl mx-auto mb-3 flex items-center justify-center`}>
                  <Train size={20} className="text-white" />
                </div>
                <div className="font-semibold text-gray-800">{exam.name}</div>
                <div className="text-blue-600 font-bold text-sm mt-1">{exam.vacancies}</div>
                <div className="text-gray-400 text-xs">vacancies</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-14 px-4 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">Everything You Need to Succeed</h2>
          <p className="text-gray-500 text-center mb-10">Features designed specifically for RRB aspirants</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map(feat => (
              <div key={feat.title} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center mb-3">
                  <feat.icon size={20} className="text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">{feat.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{feat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Teaser */}
      <section className="py-14 px-4 bg-white">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Start Free. Upgrade When Ready.</h2>
          <p className="text-gray-500 mb-8">Less than a cup of coffee per day for full access</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { plan: "Free",     price: "₹0",    tag: "Forever",   color: "border-gray-200 bg-gray-50" },
              { plan: "Monthly",  price: "₹199",  tag: "per month", color: "border-blue-500 bg-blue-50 ring-2 ring-blue-500" },
              { plan: "Annual",   price: "₹999",  tag: "per year",  color: "border-green-200 bg-green-50" },
            ].map(p => (
              <div key={p.plan} className={`border rounded-xl p-5 ${p.color}`}>
                <div className="font-semibold text-gray-800 mb-1">{p.plan}</div>
                <div className="text-3xl font-bold text-gray-900">{p.price}</div>
                <div className="text-gray-500 text-sm">{p.tag}</div>
              </div>
            ))}
          </div>
          <Link
            to="/register"
            className="inline-flex items-center gap-2 mt-8 bg-blue-600 text-white font-bold px-8 py-3.5 rounded-xl hover:bg-blue-700 transition-colors shadow-lg"
          >
            Get Started Free <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* Testimonial */}
      <section className="py-14 px-4 bg-gradient-to-br from-[#1e3a8a] to-[#1a56db]">
        <div className="max-w-2xl mx-auto text-center text-white">
          <div className="flex justify-center gap-1 mb-4">
            {[...Array(5)].map((_, i) => <Star key={i} size={20} className="text-yellow-400 fill-yellow-400" />)}
          </div>
          <blockquote className="text-lg font-medium text-blue-100 mb-4">
            "The SC/ST guidance section alone is worth ₹199. I finally understood the cutoff difference
            and saved months of anxiety. Mock tests are exactly like real RRB pattern."
          </blockquote>
          <div className="text-white font-semibold">Priya Devi</div>
          <div className="text-blue-300 text-sm">RRB NTPC 2024 Qualified · SC Category · Hyderabad</div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 py-8 px-4 text-center text-gray-400 text-sm">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Train size={16} className="text-blue-400" />
          <span className="text-white font-semibold">RailwayPrep</span>
        </div>
        <p>Your trusted partner for RRB exam preparation</p>
        <p className="mt-1 text-gray-600">© 2025 RailwayPrep. Built for RRB aspirants across India.</p>
      </footer>
    </div>
  );
}
