import { useState } from "react";
import { ChevronDown, ChevronUp, BookOpen, Lightbulb, ClipboardList } from "lucide-react";
import { cn } from "@/lib/utils";

/* ──────────────────────────────────────────────────────────────
   Data
   ────────────────────────────────────────────────────────────── */
const BRANCHES = [
  { id: "non-technical", label: "Non-Technical", icon: "🎓" },
  { id: "je",            label: "Junior Engineer (JE)",       icon: "⚙️" },
  { id: "sse",           label: "Sr. Section Engineer (SSE)", icon: "🔧" },
  { id: "ntpc",          label: "NTPC (Graduate)",            icon: "📋" },
  { id: "alp",           label: "ALP / Technician",           icon: "🚂" },
  { id: "group-d",       label: "Group D",                    icon: "🛠️" },
] as const;

type BranchId = (typeof BRANCHES)[number]["id"];

interface SubjectDef {
  subject: string;
  topics: string[];
  questions?: number;
  marks?: number;
  note?: string;
}
interface DeptDef {
  name: string;
  icon: string;
  subjects: { subject: string; topics: string[] }[];
}

const CBT1_COMMON: SubjectDef[] = [
  {
    subject: "Mathematics",
    topics: ["Number System", "Decimals & Fractions", "LCM & HCF", "Ratio & Proportion",
      "Percentage", "Mensuration", "Time & Work", "Time & Distance",
      "Simple & Compound Interest", "Profit & Loss", "Elementary Algebra",
      "Geometry & Trigonometry", "Elementary Statistics"],
    questions: 30, marks: 30,
  },
  {
    subject: "General Intelligence & Reasoning",
    topics: ["Analogies", "Alphabetical & Number Series", "Coding & Decoding",
      "Mathematical Operations", "Relationships", "Syllogism", "Jumbling",
      "Venn Diagram", "Data Interpretation & Sufficiency", "Conclusions & Decision Making",
      "Similarities & Differences", "Analytical Reasoning", "Classification", "Directions"],
    questions: 30, marks: 30,
  },
  {
    subject: "General Awareness",
    topics: ["Current Affairs (Science & Tech)", "Sports", "Culture & Personalities",
      "Economics", "Politics", "Indian Geography", "Indian History",
      "Indian Polity & Constitution", "Environmental Issues", "General Science"],
    questions: 20, marks: 20,
  },
];

const CBT1_NOTES: Record<BranchId, string> = {
  "non-technical": "CBT-1 is a screening round. Qualifying marks apply.",
  "je":            "CBT-1 is the same for all JE branches.",
  "sse":           "CBT-1 is the same for all SSE branches.",
  "ntpc":          "CBT-1 for NTPC includes General Science as a separate section.",
  "alp":           "ALP CBT-1 has 75 questions in 60 minutes.",
  "group-d":       "Single CBT for Group D. No CBT-2.",
};

const ALP_GENERAL_SCIENCE: SubjectDef = {
  subject: "General Science",
  topics: ["Physics", "Chemistry", "Life Sciences"],
  questions: 20, marks: 20,
};

// CBT-2 data per branch
const CBT2_FLAT: Record<string, SubjectDef[]> = {
  "non-technical": [
    { subject: "General Awareness", topics: ["Indian History & Freedom Struggle", "Indian Polity & Constitution", "Indian Economy", "Current Affairs", "Indian Geography", "General Science", "Computer Basics"], questions: 50, marks: 50 },
    { subject: "General Intelligence & Reasoning", topics: ["Analogies", "Syllogism", "Number Series", "Coding-Decoding", "Puzzles", "Direction Sense", "Venn Diagram", "Non-Verbal Reasoning"], questions: 35, marks: 35 },
    { subject: "Mathematics", topics: ["Arithmetic", "Algebra", "Geometry", "Statistics", "Trigonometry", "Time-Speed-Distance", "Profit-Loss"], questions: 35, marks: 35 },
  ],
  "ntpc": [
    { subject: "General Awareness", topics: ["History", "Geography", "Polity", "Economy", "Current Affairs", "Science & Tech", "Sports", "Culture"], questions: 50, marks: 50 },
    { subject: "Reasoning & Computer Aptitude", topics: ["Analogies", "Series", "Coding-Decoding", "Puzzles", "Computer Basics", "MS Office", "Internet", "Cyber Security"], questions: 35, marks: 35 },
    { subject: "Quantitative Aptitude", topics: ["Number System", "Algebra", "Geometry", "Statistics", "Data Interpretation", "Trigonometry"], questions: 35, marks: 35 },
  ],
};

const JE_DEPARTMENTS: DeptDef[] = [
  {
    name: "Civil Engineering", icon: "🏗️",
    subjects: [
      { subject: "Engineering Mechanics",       topics: ["Forces", "Moments", "Trusses", "Friction", "Virtual Work"] },
      { subject: "Strength of Materials",        topics: ["Stress & Strain", "Bending Moment", "Shear Force", "Deflection", "Columns"] },
      { subject: "Structural Analysis",          topics: ["Beams", "Frames", "Arches", "Cables", "Matrix Methods"] },
      { subject: "Soil Mechanics",               topics: ["Classification", "Permeability", "Shear Strength", "Consolidation", "Foundation"] },
      { subject: "Fluid Mechanics",              topics: ["Properties", "Bernoulli", "Flow Measurement", "Pipe Flow", "Open Channel"] },
      { subject: "Construction Technology",      topics: ["Building Materials", "Masonry", "Concrete", "Timber", "Painting"] },
      { subject: "RCC Design",                   topics: ["IS Code", "Beams", "Slabs", "Columns", "Footings"] },
      { subject: "Transportation Engineering",   topics: ["Highway Design", "Traffic Engineering", "Railways", "Airports", "Bridges"] },
    ],
  },
  {
    name: "Electrical Engineering", icon: "⚡",
    subjects: [
      { subject: "Basic Electrical",                  topics: ["Ohm's Law", "Kirchhoff's Laws", "Network Theorems", "AC Circuits", "Resonance"] },
      { subject: "Electrical Machines",               topics: ["DC Machines", "Transformers", "Induction Motors", "Synchronous Machines", "Special Machines"] },
      { subject: "Power Systems",                     topics: ["Generation", "Transmission", "Distribution", "Protection", "Switchgear"] },
      { subject: "Control Systems",                   topics: ["Transfer Function", "Block Diagram", "Stability", "Bode Plot", "Root Locus"] },
      { subject: "Measurements",                      topics: ["Ammeters", "Voltmeters", "Wattmeters", "Bridges", "CRO"] },
      { subject: "Electronics",                       topics: ["Diodes", "Transistors", "Amplifiers", "Oscillators", "Digital Logic"] },
      { subject: "Utilization of Electrical Energy",  topics: ["Illumination", "Electric Heating", "Electric Drives", "Traction", "Welding"] },
    ],
  },
  {
    name: "Mechanical Engineering", icon: "🔩",
    subjects: [
      { subject: "Engineering Mechanics",           topics: ["Statics", "Dynamics", "Kinematics", "Friction", "Virtual Work"] },
      { subject: "Thermodynamics",                  topics: ["Laws", "Carnot Cycle", "IC Engines", "Steam Engines", "Refrigeration"] },
      { subject: "Fluid Mechanics & Machinery",     topics: ["Fluid Properties", "Flow Equations", "Turbines", "Pumps", "Compressors"] },
      { subject: "Theory of Machines",              topics: ["Mechanisms", "Kinematics", "Governors", "Gyroscope", "Vibrations"] },
      { subject: "Machine Design",                  topics: ["Joints", "Shafts", "Springs", "Bearings", "Gear Design"] },
      { subject: "Manufacturing Technology",        topics: ["Casting", "Welding", "Forging", "Machining", "Metrology"] },
      { subject: "Industrial Engineering",          topics: ["Method Study", "Work Measurement", "Inventory", "CPM/PERT", "Quality Control"] },
    ],
  },
  {
    name: "Electronics & Communication", icon: "📡",
    subjects: [
      { subject: "Network Theory",     topics: ["KVL/KCL", "Mesh Analysis", "Thevenin/Norton", "Two-Port Networks", "Transients"] },
      { subject: "Electronic Devices", topics: ["Semiconductors", "Diodes", "BJT", "FET", "MOSFET"] },
      { subject: "Analog Circuits",    topics: ["Amplifiers", "Feedback", "Oscillators", "Op-Amps", "Filters"] },
      { subject: "Digital Circuits",   topics: ["Boolean Algebra", "Logic Gates", "Flip-Flops", "Counters", "ADC/DAC"] },
      { subject: "Signals & Systems",  topics: ["Fourier Transform", "Laplace Transform", "Z-Transform", "Sampling", "Convolution"] },
      { subject: "Communications",     topics: ["AM/FM", "SSB", "PCM", "Digital Modulation", "Satellite Comm"] },
      { subject: "Microprocessors",    topics: ["8085", "8086", "Assembly Language", "Memory Interfacing", "I/O"] },
    ],
  },
  {
    name: "Information Technology", icon: "💻",
    subjects: [
      { subject: "Programming Fundamentals", topics: ["C/C++", "Data Structures", "Algorithms", "OOPS", "Java Basics"] },
      { subject: "Database Management",      topics: ["DBMS Concepts", "SQL", "Normalization", "Transactions", "NoSQL"] },
      { subject: "Computer Networks",        topics: ["OSI Model", "TCP/IP", "Routing", "DNS", "Security"] },
      { subject: "Operating Systems",        topics: ["Process Management", "Memory Management", "File Systems", "Scheduling", "Deadlock"] },
      { subject: "Software Engineering",     topics: ["SDLC", "Testing", "UML", "Agile", "Project Management"] },
      { subject: "Web Technologies",         topics: ["HTML/CSS", "JavaScript", "PHP", "XML", "Web Security"] },
    ],
  },
];

const SSE_DEPARTMENTS: DeptDef[] = [
  {
    name: "Civil Engineering", icon: "🏗️",
    subjects: [
      { subject: "Advanced Structural Design",   topics: ["Pre-stressed Concrete", "Steel Structures", "Composite Structures", "Earthquake Engineering", "Wind Load Analysis"] },
      { subject: "Advanced Geotechnical",        topics: ["Ground Improvement", "Pile Foundation", "Retaining Walls", "Slope Stability", "Geosynthetics"] },
      { subject: "Water Resources Engineering",  topics: ["Hydrology", "Irrigation", "Dams", "Canals", "Drainage"] },
      { subject: "Environmental Engineering",    topics: ["Water Treatment", "Sewage Treatment", "Air Pollution", "Solid Waste", "EIA"] },
      { subject: "Railway Engineering",          topics: ["Track Geometry", "Track Components", "Signaling", "Station Design", "Bridge Maintenance"] },
    ],
  },
  {
    name: "Electrical Engineering", icon: "⚡",
    subjects: [
      { subject: "Advanced Power Systems",    topics: ["HVDC", "FACTS", "Smart Grid", "Power Quality", "Deregulation"] },
      { subject: "Railway Traction",          topics: ["Traction Systems", "Electric Locomotives", "OHE Design", "Substation", "Energy Saving"] },
      { subject: "Advanced Control Systems",  topics: ["PID Controllers", "State Space", "Optimal Control", "Fuzzy Logic", "Neural Networks"] },
      { subject: "Power Electronics",         topics: ["Thyristors", "Inverters", "Converters", "PWM", "Drives"] },
    ],
  },
  {
    name: "Mechanical Engineering", icon: "🔩",
    subjects: [
      { subject: "Advanced Manufacturing",   topics: ["CNC", "CAD/CAM", "Advanced Welding", "NDT", "Automation"] },
      { subject: "Maintenance Engineering",  topics: ["Preventive Maintenance", "Predictive Maintenance", "FMEA", "RCM", "Lubrication"] },
      { subject: "Railway Mechanical",       topics: ["Rolling Stock", "Wheel & Axle", "Braking Systems", "Coaches", "Wagon Design"] },
      { subject: "Advanced Thermodynamics",  topics: ["Exergy Analysis", "Combined Cycles", "Heat Exchangers", "Cryogenics", "Fuel Cells"] },
    ],
  },
];

const ALP_PART_A: SubjectDef = {
  subject: "Mathematics & General Aptitude",
  topics: ["Number System", "BODMAS", "Decimals", "Fractions", "LCM & HCF", "Ratio & Proportion",
    "Percentage", "Mensuration", "Time & Work", "Time-Speed-Distance",
    "Simple & Compound Interest", "Profit & Loss", "Algebra", "Geometry & Trigonometry", "Statistics"],
  questions: 100, marks: 100, note: "Part A: 100 Questions, 90 Minutes",
};

const ALP_PART_B: DeptDef[] = [
  {
    name: "Electrician / Wireman", icon: "⚡",
    subjects: [
      { subject: "Basic Electrical",  topics: ["Ohm's Law", "AC/DC Circuits", "Transformers", "Motors", "Protection"] },
      { subject: "Wiring Systems",    topics: ["Types of Wiring", "Earthing", "MCBs", "Switchgear", "Installation"] },
      { subject: "Trade Theory",      topics: ["ITI Electrician Syllabus", "Industrial Wiring", "Control Circuits", "Instrumentation", "Safety"] },
    ],
  },
  {
    name: "Fitter", icon: "🔧",
    subjects: [
      { subject: "Fitting Operations", topics: ["Marking", "Cutting", "Filing", "Drilling", "Tapping"] },
      { subject: "Measuring Tools",    topics: ["Vernier Caliper", "Micrometer", "Dial Gauge", "Sine Bar", "Gauges"] },
      { subject: "Trade Theory",       topics: ["ITI Fitter Syllabus", "Fasteners", "Bearings", "Lubrication", "Safety"] },
    ],
  },
  {
    name: "Welder", icon: "🔥",
    subjects: [
      { subject: "Welding Processes",  topics: ["Arc Welding", "MIG/TIG", "Gas Welding", "Spot Welding", "Thermit Welding"] },
      { subject: "Metallurgy Basics",  topics: ["Types of Metals", "Heat Treatment", "Welding Defects", "Testing", "Safety"] },
    ],
  },
  {
    name: "Diesel Mechanic", icon: "🚗",
    subjects: [
      { subject: "Engine Systems",  topics: ["Fuel System", "Cooling System", "Lubrication", "Ignition", "Emission"] },
      { subject: "Vehicle Systems", topics: ["Transmission", "Brakes", "Suspension", "Steering", "Electrical"] },
    ],
  },
];

const STUDY_TIPS = [
  {
    icon: "📅", title: "Study Plan",
    points: ["3-month crash course: Focus CBT-1 first, then branch-specific", "6-month plan: Build concepts, then practice", "Daily 4–6 hours minimum for freshers"],
  },
  {
    icon: "📚", title: "Best Resources",
    points: ["R.S. Aggarwal for Maths & Reasoning", "Lucent GK for General Awareness", "Standard branch-specific textbooks", "Previous year papers (2015–2024)"],
  },
  {
    icon: "🎯", title: "Exam Strategy",
    points: ["Attempt easy questions first", "Don't guess randomly (−1/3 negative marking)", "Time management: ~1 min/question", "Revise weak topics weekly"],
  },
  {
    icon: "💻", title: "Online Practice",
    points: ["Attempt 2 full mock tests per week", "Analyse mistakes thoroughly", "Improve speed with timed practice", "Topic-wise tests for weak areas"],
  },
  {
    icon: "⚠️", title: "Common Mistakes",
    points: ["Ignoring negative marking", "Skipping Current Affairs updates", "Not practising previous papers", "Poor time management in exam"],
  },
  {
    icon: "✅", title: "Exam Day Tips",
    points: ["Carry Admit Card + Photo ID", "Reach centre 30 min early", "Read questions carefully", "Stay calm — CBT-1 is a qualifying round"],
  },
];

const EXAM_PATTERN_ROWS = [
  ["Non-Technical", "100Q / 90 min", "120Q / 90 min",             "Document Verification"],
  ["JE / SSE",      "100Q / 90 min", "150Q / 120 min (Technical)", "Document Verification"],
  ["NTPC",          "100Q / 90 min", "120Q / 90 min",             "Skill Test (select posts)"],
  ["ALP",           "75Q / 60 min",  "Part A (100Q) + Part B",    "CBAT (ALP posts only)"],
  ["Group D",       "100Q / 90 min", "None",                      "PET + Document Verification"],
];

/* ──────────────────────────────────────────────────────────────
   Sub-components
   ────────────────────────────────────────────────────────────── */
function TopicPill({ topic }: { topic: string }) {
  return (
    <span className="inline-block bg-slate-100 text-slate-600 text-xs font-medium px-2.5 py-1 rounded-full m-0.5 border border-slate-200">
      {topic}
    </span>
  );
}

function SubjectCard({ subject, topics, questions, marks, note }: SubjectDef) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-gray-100 rounded-xl mb-2.5 overflow-hidden bg-white shadow-sm">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-slate-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="font-semibold text-gray-800 text-sm">{subject}</span>
          {questions && (
            <span className="text-xs font-semibold bg-brand-50 text-brand-600 border border-brand-200 px-2 py-0.5 rounded-full">
              {questions}Q / {marks}M
            </span>
          )}
        </div>
        {open ? <ChevronUp size={16} className="text-gray-400 shrink-0" /> : <ChevronDown size={16} className="text-gray-400 shrink-0" />}
      </button>
      {open && (
        <div className="px-4 pb-4 border-t border-gray-50">
          <div className="pt-3 flex flex-wrap">
            {topics.map((t) => <TopicPill key={t} topic={t} />)}
          </div>
          {note && (
            <div className="mt-3 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
              ℹ️ {note}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function DeptCard({ dept }: { dept: DeptDef }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-gray-100 rounded-xl mb-3 overflow-hidden bg-white shadow-sm">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3.5 text-left hover:bg-slate-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="text-xl">{dept.icon}</span>
          <span className="font-semibold text-gray-800">{dept.name}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">{dept.subjects.length} subjects</span>
          {open ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
        </div>
      </button>
      {open && (
        <div className="px-4 pb-4 border-t border-gray-50 pt-3">
          {dept.subjects.map((s) => <SubjectCard key={s.subject} subject={s.subject} topics={s.topics} />)}
        </div>
      )}
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────
   CBT-1 Section
   ────────────────────────────────────────────────────────────── */
function CBT1Section({ branchId }: { branchId: BranchId }) {
  return (
    <div>
      <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 mb-4 text-blue-800 text-sm">
        📋 <strong>CBT-1:</strong> 100 Questions | 90 Minutes | Negative Marking: −1/3 | Qualifying Round
      </div>
      {CBT1_COMMON.map((s) => <SubjectCard key={s.subject} {...s} />)}
      {branchId === "alp" && (
        <>
          <p className="text-sm font-semibold text-amber-700 mt-4 mb-2">⚡ Additional for ALP:</p>
          <SubjectCard {...ALP_GENERAL_SCIENCE} />
        </>
      )}
      <div className="mt-3 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
        ℹ️ {CBT1_NOTES[branchId]}
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────
   CBT-2 Section
   ────────────────────────────────────────────────────────────── */
function CBT2Section({ branchId }: { branchId: BranchId }) {
  if (branchId === "group-d") {
    return (
      <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-6 text-center">
        <div className="text-4xl mb-3">🛠️</div>
        <div className="font-bold text-gray-800 text-base">Group D — No CBT-2</div>
        <p className="text-gray-500 text-sm mt-2">
          Group D has a single Computer Based Test followed by Physical Efficiency Test (PET) and Document Verification.
        </p>
      </div>
    );
  }

  if (branchId === "non-technical" || branchId === "ntpc") {
    const data = CBT2_FLAT[branchId];
    return (
      <div>
        <div className="bg-brand-50 border border-brand-200 rounded-xl px-4 py-3 mb-4 text-brand-700 text-sm">
          📋 <strong>CBT-2:</strong> 120 Questions | 90 Minutes | Negative Marking: −1/3
        </div>
        {data.map((s) => <SubjectCard key={s.subject} {...s} />)}
      </div>
    );
  }

  if (branchId === "je") {
    return (
      <div>
        <div className="bg-brand-50 border border-brand-200 rounded-xl px-4 py-3 mb-4 text-brand-700 text-sm">
          📋 <strong>CBT-2:</strong> 150 Questions | 120 Minutes | Technical + General Awareness | Negative Marking: −1/3
        </div>
        <p className="text-sm text-gray-500 mb-3">Select your department to see technical subjects:</p>
        {JE_DEPARTMENTS.map((d) => <DeptCard key={d.name} dept={d} />)}
      </div>
    );
  }

  if (branchId === "sse") {
    return (
      <div>
        <div className="bg-brand-50 border border-brand-200 rounded-xl px-4 py-3 mb-4 text-brand-700 text-sm">
          📋 <strong>CBT-2:</strong> 150 Questions | 120 Minutes | Technical + General Awareness | Negative Marking: −1/3
        </div>
        <p className="text-sm text-gray-500 mb-3">Select your department to see technical subjects:</p>
        {SSE_DEPARTMENTS.map((d) => <DeptCard key={d.name} dept={d} />)}
      </div>
    );
  }

  if (branchId === "alp") {
    return (
      <div>
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-4 text-red-700 text-sm">
          📋 <strong>CBT-2 Part A:</strong> 100Q, 90 min &nbsp;|&nbsp; <strong>Part B:</strong> Trade Test (Qualifying)
        </div>
        <p className="font-semibold text-gray-800 mb-2 text-sm">Part A — Common Subjects</p>
        <SubjectCard {...ALP_PART_A} />
        <p className="font-semibold text-gray-800 mt-4 mb-2 text-sm">Part B — Trade-wise Technical (Qualifying)</p>
        {ALP_PART_B.map((d) => <DeptCard key={d.name} dept={d} />)}
      </div>
    );
  }

  return null;
}

/* ──────────────────────────────────────────────────────────────
   Study Tips Section
   ────────────────────────────────────────────────────────────── */
function StudyTipsSection() {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {STUDY_TIPS.map((card) => (
          <div key={card.title} className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-2xl">{card.icon}</span>
              <span className="font-bold text-gray-800 text-sm">{card.title}</span>
            </div>
            <ul className="space-y-1.5 pl-4 list-disc">
              {card.points.map((p) => (
                <li key={p} className="text-gray-500 text-xs leading-relaxed">{p}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Exam Pattern Summary Table */}
      <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-50">
          <h3 className="font-bold text-gray-800 flex items-center gap-2">
            <ClipboardList size={16} className="text-brand-500" />
            RRB Exam Pattern Summary
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-gray-100">
                {["Post", "CBT-1", "CBT-2", "Other Rounds"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {EXAM_PATTERN_ROWS.map((row, i) => (
                <tr key={i} className="hover:bg-slate-50 transition-colors">
                  {row.map((cell, j) => (
                    <td key={j} className={cn("px-4 py-3 text-sm", j === 0 ? "font-semibold text-gray-800" : "text-gray-500")}>
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────
   Main Page
   ────────────────────────────────────────────────────────────── */
export function ApplicationFeaturesPage() {
  const [selectedBranch, setSelectedBranch] = useState<BranchId>("non-technical");
  const [activeTab, setActiveTab] = useState<"cbt1" | "cbt2" | "tips">("cbt1");

  const branch = BRANCHES.find((b) => b.id === selectedBranch)!;
  const hasCBT2 = selectedBranch !== "group-d";

  const handleBranchChange = (id: BranchId) => {
    setSelectedBranch(id);
    setActiveTab("cbt1");
  };

  return (
    <div className="p-5 max-w-4xl mx-auto space-y-5">
      {/* Header */}
      <div className="rounded-2xl p-5 text-white relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)" }}>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-brand-500/20 border border-brand-500/30 rounded-xl flex items-center justify-center text-2xl shrink-0">
            🚂
          </div>
          <div>
            <h1 className="text-xl font-bold">RRB Preparation Hub</h1>
            <p className="text-slate-400 text-sm mt-0.5">
              Railway Recruitment Board — CBT-1 &amp; CBT-2 Complete Syllabus Guide
            </p>
          </div>
        </div>
      </div>

      {/* Branch Selector */}
      <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
        <div className="px-5 py-3.5 border-b border-gray-50 flex items-center gap-2">
          <BookOpen size={15} className="text-brand-500" />
          <span className="font-semibold text-gray-800 text-sm">Select Your Branch</span>
        </div>
        <div className="p-3 flex flex-wrap gap-2">
          {BRANCHES.map((b) => (
            <button
              key={b.id}
              onClick={() => handleBranchChange(b.id)}
              className={cn(
                "flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all",
                selectedBranch === b.id
                  ? "bg-brand-500 text-white shadow-sm"
                  : "bg-slate-50 text-gray-600 hover:bg-slate-100 border border-gray-100"
              )}
            >
              <span>{b.icon}</span> {b.label}
            </button>
          ))}
        </div>
      </div>

      {/* Branch Banner */}
      <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{branch.icon}</span>
          <div>
            <div className="font-bold text-gray-800">{branch.label}</div>
            <div className="text-gray-400 text-xs">RRB Exam Preparation</div>
          </div>
        </div>
        <div className="flex gap-2 flex-wrap text-xs font-semibold">
          {hasCBT2
            ? <span className="bg-brand-50 text-brand-600 border border-brand-200 px-2.5 py-1 rounded-full">CBT-1 + CBT-2</span>
            : <span className="bg-indigo-50 text-indigo-600 border border-indigo-200 px-2.5 py-1 rounded-full">Single CBT + PET</span>
          }
          {(selectedBranch === "je" || selectedBranch === "sse") && (
            <span className="bg-amber-50 text-amber-600 border border-amber-200 px-2.5 py-1 rounded-full">Technical Branch</span>
          )}
          {selectedBranch === "alp" && (
            <span className="bg-red-50 text-red-600 border border-red-200 px-2.5 py-1 rounded-full">Part A + Part B</span>
          )}
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
        <div className="flex border-b border-gray-100">
          {(["cbt1", ...(hasCBT2 ? ["cbt2"] : []), "tips"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as typeof activeTab)}
              className={cn(
                "flex-1 py-3 text-sm font-semibold transition-colors flex items-center justify-center gap-2",
                activeTab === tab
                  ? "text-brand-600 border-b-2 border-brand-500 bg-brand-50"
                  : "text-gray-500 hover:text-gray-700 hover:bg-slate-50"
              )}
            >
              {tab === "cbt1" && <><ClipboardList size={14} /> CBT-1</>}
              {tab === "cbt2" && <><ClipboardList size={14} /> CBT-2</>}
              {tab === "tips" && <><Lightbulb size={14} /> Study Tips</>}
            </button>
          ))}
        </div>

        <div className="p-5">
          {activeTab === "cbt1" && <CBT1Section branchId={selectedBranch} />}
          {activeTab === "cbt2" && hasCBT2 && <CBT2Section branchId={selectedBranch} />}
          {activeTab === "tips" && <StudyTipsSection />}
        </div>
      </div>
    </div>
  );
}
