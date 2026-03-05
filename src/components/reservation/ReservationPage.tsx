import { ShieldCheck, ChevronDown, ChevronUp, AlertCircle, CheckCircle2, Info } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const CATEGORIES = ["SC", "ST", "OBC", "EWS"];

const CATEGORY_DATA = {
  SC: {
    name: "Scheduled Caste (SC)",
    color: "bg-yellow-500",
    benefits: [
      { title: "Age Relaxation", value: "+5 Years", desc: "Upper age limit is relaxed by 5 years for SC candidates (18-33 years instead of 18-28 years)" },
      { title: "Application Fee", value: "₹250", desc: "SC candidates pay ₹250 instead of ₹500. 50% fee reduction." },
      { title: "Cutoff Difference", value: "~15-25 marks lower", desc: "SC cutoff is typically 15-25 marks below UR cutoff in RRB NTPC. For example, UR: 85/100, SC: 65/100." },
      { title: "Medical Standards", value: "Same as UR", desc: "Medical standards are generally the same. However, for certain posts, relaxations may apply for hearing impairment." },
      { title: "Selection Priority", value: "Separate Merit List", desc: "SC candidates are evaluated in a separate merit list within reserved quota (15% of vacancies)." },
      { title: "Vacancy Reservation", value: "15% seats reserved", desc: "15% of all vacancies in every RRB recruitment are mandatorily reserved for SC candidates." },
    ],
    cutoffs: [
      { exam: "RRB NTPC 2022", level1: "65.2", level2: "61.8", level3: "58.4" },
      { exam: "RRB NTPC 2021", level1: "62.8", level2: "59.4", level3: "55.7" },
      { exam: "RRB Group D 2022", level1: "55.4", level2: "51.2", level3: "47.8" },
    ],
    docs: [
      "SC Caste Certificate issued by competent authority (Tahsildar or above)",
      "Income certificate (if required for specific posts)",
      "Domicile certificate",
      "Valid photo ID (Aadhaar, Passport, etc.)",
      "Class 10 or 12 marksheet (for age proof)",
    ],
    strategy: [
      "Focus on scoring 65-70% to be safe in most SC cutoffs",
      "Practice 3-4 mock tests per week — consistent practice matters more than cutoff",
      "GK & Current Affairs section usually has lower cutoff variance — score high here",
      "Don't underestimate the exam — competition within SC category is also high",
      "Apply for multiple RRB zones to maximize chances",
      "Get your caste certificate ready BEFORE the notification — don't wait",
    ],
  },
  ST: {
    name: "Scheduled Tribe (ST)",
    color: "bg-orange-500",
    benefits: [
      { title: "Age Relaxation", value: "+5 Years", desc: "Same as SC — upper age limit relaxed by 5 years." },
      { title: "Application Fee", value: "₹250", desc: "50% reduction from the general ₹500 fee." },
      { title: "Cutoff Difference", value: "~18-28 marks lower", desc: "ST cutoff is generally slightly lower than SC cutoff due to smaller eligible pool." },
      { title: "Vacancy Reservation", value: "7.5% seats reserved", desc: "7.5% of all vacancies reserved for ST candidates across all RRB exams." },
      { title: "Selection List", value: "Separate merit list", desc: "Separate merit list within the ST quota with 7.5% reservation." },
    ],
    cutoffs: [
      { exam: "RRB NTPC 2022", level1: "60.4", level2: "56.8", level3: "53.2" },
      { exam: "RRB NTPC 2021", level1: "58.2", level2: "54.6", level3: "50.9" },
      { exam: "RRB Group D 2022", level1: "50.8", level2: "46.4", level3: "42.1" },
    ],
    docs: [
      "ST Caste Certificate from competent authority",
      "Tribe notification proof (if required)",
      "Domicile/residence proof",
      "Photo ID and age proof documents",
    ],
    strategy: [
      "Target 60-65% for a safe margin in most ST cutoffs",
      "Mathematics is usually the differentiator — practice daily",
      "Join Telegram groups for ST aspirants to track cutoff trends",
      "Verify your caste certificate is in the correct format per state guidelines",
    ],
  },
  OBC: {
    name: "Other Backward Classes (OBC)",
    color: "bg-blue-500",
    benefits: [
      { title: "Age Relaxation", value: "+3 Years", desc: "OBC-NCL candidates get 3 years age relaxation (18-31 years instead of 18-28 years)." },
      { title: "Application Fee", value: "₹400", desc: "OBC pays ₹400 instead of ₹500. ₹100 reduction." },
      { title: "Cutoff Difference", value: "~8-15 marks lower", desc: "OBC cutoff is moderately lower than UR cutoff, but higher than SC/ST." },
      { title: "Vacancy Reservation", value: "27% seats reserved", desc: "27% of all vacancies reserved for OBC-NCL candidates — the largest reserved quota." },
      { title: "Non-Creamy Layer", value: "Required", desc: "Only OBC-NCL (Non-Creamy Layer) candidates are eligible. Family income must be below ₹8 lakh per annum." },
    ],
    cutoffs: [
      { exam: "RRB NTPC 2022", level1: "75.8", level2: "72.4", level3: "68.1" },
      { exam: "RRB NTPC 2021", level1: "73.2", level2: "69.8", level3: "65.7" },
      { exam: "RRB Group D 2022", level1: "65.4", level2: "61.2", level3: "56.9" },
    ],
    docs: [
      "OBC-NCL Certificate issued on or after April 1 of current financial year",
      "Certificate must be from Sub-Divisional Magistrate or above",
      "Non-Creamy Layer declaration",
      "Income proof supporting NCL status",
    ],
    strategy: [
      "Target 75%+ to be safely above the OBC cutoff",
      "Get your OBC-NCL certificate updated — it must be within the financial year",
      "OBC has the largest quota (27%) — competition is high within the category",
      "Focus heavily on maths and reasoning as these are usually cutoff deciders",
    ],
  },
  EWS: {
    name: "Economically Weaker Sections (EWS)",
    color: "bg-purple-500",
    benefits: [
      { title: "Age Relaxation", value: "None", desc: "EWS candidates do not get age relaxation. Age limit is 18-28 years (same as UR)." },
      { title: "Application Fee", value: "₹500", desc: "EWS pays the same fee as UR (₹500). No fee reduction." },
      { title: "Cutoff Difference", value: "~5-10 marks lower", desc: "EWS cutoff is slightly lower than UR. Relatively new quota introduced in 2019." },
      { title: "Vacancy Reservation", value: "10% seats reserved", desc: "10% of vacancies reserved for EWS candidates from general category families." },
      { title: "Income Limit", value: "Below ₹8 LPA", desc: "Annual family income must be less than ₹8 lakh. Also based on land and property criteria." },
    ],
    cutoffs: [
      { exam: "RRB NTPC 2022", level1: "80.2", level2: "76.8", level3: "73.5" },
      { exam: "RRB NTPC 2021", level1: "78.6", level2: "75.1", level3: "71.8" },
      { exam: "RRB Group D 2022", level1: "70.2", level2: "66.8", level3: "63.4" },
    ],
    docs: [
      "EWS Income & Asset Certificate from Tehsildar/SDM/Revenue Officer",
      "Certificate valid for the financial year of recruitment",
      "Income proof from all sources",
      "Land holding documents (if applicable)",
    ],
    strategy: [
      "Target 80%+ for EWS — cutoffs are close to UR",
      "EWS has fewer vacancies (10%) but also fewer eligible aspirants",
      "Keep EWS certificate ready before notification releases",
      "Focus on all sections equally — you need a high overall score",
    ],
  },
};

type CatKey = keyof typeof CATEGORY_DATA;

export function ReservationPage() {
  const [activeTab, setActiveTab] = useState<CatKey>("SC");
  const [expanded, setExpanded] = useState<string | null>("benefits");

  const data = CATEGORY_DATA[activeTab];

  return (
    <div className="p-5 max-w-5xl mx-auto space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <ShieldCheck size={20} className="text-blue-600" /> SC/ST/OBC/EWS Reservation Guide
        </h1>
        <p className="text-gray-500 text-sm mt-0.5">
          Complete guide to reservation benefits, cutoffs, and strategy for reserved category aspirants
        </p>
      </div>

      {/* Important Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
        <Info size={18} className="text-blue-600 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-blue-800">
          <span className="font-semibold">Important:</span> Most platforms don't explain reservation benefits clearly.
          This section gives you accurate, exam-specific guidance so you can plan your preparation with full awareness
          of your actual competition and target scores.
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2 flex-wrap">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveTab(cat as CatKey)}
            className={cn(
              "px-5 py-2.5 rounded-xl font-semibold text-sm border-2 transition-all",
              activeTab === cat
                ? "bg-blue-600 text-white border-blue-600 shadow-md"
                : "bg-white text-gray-600 border-gray-200 hover:border-blue-300"
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Active Category Content */}
      <div className="space-y-4">
        {/* Category Header */}
        <div className={cn("rounded-2xl p-5 text-white", data.color)}>
          <h2 className="text-lg font-bold mb-1">{data.name}</h2>
          <p className="text-white/80 text-sm">
            Key reservation facts every {activeTab} aspirant must know before starting preparation.
          </p>
        </div>

        {/* Benefits Accordion */}
        {[
          { key: "benefits", title: "🎯 Reservation Benefits", content: (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {data.benefits.map(b => (
                <div key={b.title} className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <span className="text-sm font-semibold text-gray-800">{b.title}</span>
                    <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2.5 py-1 rounded-lg flex-shrink-0">{b.value}</span>
                  </div>
                  <p className="text-xs text-gray-500 leading-relaxed">{b.desc}</p>
                </div>
              ))}
            </div>
          )},
          { key: "cutoffs", title: "📊 Historical Cutoffs", content: (
            <div className="overflow-x-auto pt-1">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left py-2 px-3 text-gray-500 font-semibold text-xs">Exam</th>
                    <th className="text-center py-2 px-3 text-gray-500 font-semibold text-xs">Level 1</th>
                    <th className="text-center py-2 px-3 text-gray-500 font-semibold text-xs">Level 2</th>
                    <th className="text-center py-2 px-3 text-gray-500 font-semibold text-xs">Level 3</th>
                  </tr>
                </thead>
                <tbody>
                  {data.cutoffs.map(c => (
                    <tr key={c.exam} className="border-b border-gray-50 hover:bg-gray-50 transition">
                      <td className="py-3 px-3 font-medium text-gray-800">{c.exam}</td>
                      <td className="py-3 px-3 text-center font-bold text-blue-600">{c.level1}</td>
                      <td className="py-3 px-3 text-center font-bold text-green-600">{c.level2}</td>
                      <td className="py-3 px-3 text-center font-bold text-orange-600">{c.level3}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )},
          { key: "docs", title: "📄 Required Documents", content: (
            <ul className="space-y-2 pt-1">
              {data.docs.map((d, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                  <CheckCircle2 size={15} className="text-green-500 flex-shrink-0 mt-0.5" />
                  {d}
                </li>
              ))}
            </ul>
          )},
          { key: "strategy", title: "🧠 Preparation Strategy", content: (
            <ul className="space-y-2.5 pt-1">
              {data.strategy.map((s, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 text-[11px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  <span className="text-sm text-gray-700">{s}</span>
                </li>
              ))}
            </ul>
          )},
        ].map(section => (
          <div key={section.key} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <button
              onClick={() => setExpanded(expanded === section.key ? null : section.key)}
              className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition"
            >
              <span className="font-semibold text-gray-800">{section.title}</span>
              {expanded === section.key ? <ChevronUp size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />}
            </button>
            {expanded === section.key && (
              <div className="px-5 pb-5 border-t border-gray-50">
                {section.content}
              </div>
            )}
          </div>
        ))}

        {/* Caution */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle size={18} className="text-yellow-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-yellow-800">
            <span className="font-semibold">Disclaimer:</span> Cutoff data shown is approximate based on previous years.
            Actual cutoffs vary by notification, zone, and post. Always verify from the official RRB website.
          </div>
        </div>
      </div>
    </div>
  );
}
