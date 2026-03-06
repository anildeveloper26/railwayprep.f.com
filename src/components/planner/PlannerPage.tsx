"use client";

import { useState } from "react";
import { Calendar, CheckCircle2, Circle, Zap, Target, Clock } from "lucide-react";
import { CURRENT_USER } from "@/lib/constants/mockData";
import { cn } from "@/lib/utils";

const EXAMS = ["RRB NTPC", "RRB Group D", "RRB JE", "RRB ALP"];

const GENERATED_PLAN = {
  dailyTasks: [
    { subject: "Mathematics",   topic: "Percentage & Profit-Loss",  duration: 45, completed: true,  date: "Today" },
    { subject: "Reasoning",     topic: "Number Series",             duration: 30, completed: true,  date: "Today" },
    { subject: "GK",            topic: "Indian Railways History",   duration: 30, completed: false, date: "Today" },
    { subject: "Mock Practice", topic: "30-Question Sectional Test",duration: 40, completed: false, date: "Today" },
    { subject: "Revision",      topic: "Yesterday's weak topics",   duration: 20, completed: false, date: "Today" },
  ],
  weeklyTargets: [
    { week: 1,  topics: ["Percentage", "SI & CI", "Number Series", "Analogies"],       mockTests: 2,  completed: true  },
    { week: 2,  topics: ["Profit & Loss", "Ratio & Proportion", "Coding-Decoding", "Blood Relations"], mockTests: 3, completed: true },
    { week: 3,  topics: ["Time & Work", "Speed Distance", "Direction Sense", "Indian History"], mockTests: 3, completed: false },
    { week: 4,  topics: ["Geometry", "Mensuration", "Seating Arrangement", "Indian Geography"], mockTests: 4, completed: false },
    { week: 5,  topics: ["Revision Week 1-4", "Full Mock Tests", "Weak Topic Focus"],  mockTests: 5,  completed: false },
  ],
  progress: 42,
  daysRemaining: 67,
  topicsCompleted: 14,
  totalTopics: 34,
};

export function PlannerPage() {
  const [targetExam, setTargetExam] = useState(CURRENT_USER.targetExam);
  const [targetDate, setTargetDate] = useState("");
  const [generated, setGenerated] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [tasks, setTasks] = useState(GENERATED_PLAN.dailyTasks);

  const todayCompleted = tasks.filter(t => t.completed).length;
  const todayTotal = tasks.length;

  const handleGenerate = async () => {
    if (!targetDate) return;
    setGenerating(true);
    await new Promise(r => setTimeout(r, 1200));
    setGenerated(true);
    setGenerating(false);
  };

  const toggleTask = (idx: number) => {
    setTasks(prev => prev.map((t, i) => i === idx ? { ...t, completed: !t.completed } : t));
  };

  return (
    <div className="p-5 max-w-5xl mx-auto space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <Calendar size={20} className="text-blue-600" /> Study Planner
        </h1>
        <p className="text-gray-500 text-sm mt-0.5">AI-powered personalized study plans for your target exam</p>
      </div>

      {/* Plan Generator */}
      <div className="bg-gradient-to-r from-[#1e3a8a] to-[#1a56db] rounded-2xl p-5 text-white">
        <div className="flex items-center gap-2 mb-4">
          <Zap size={18} className="text-yellow-300" />
          <h2 className="font-semibold">Generate Your Study Plan</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="text-blue-200 text-xs mb-1.5 block font-medium">Target Exam</label>
            <select
              value={targetExam}
              onChange={e => setTargetExam(e.target.value)}
              className="w-full bg-white/15 border border-white/20 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-white/30"
            >
              {EXAMS.map(e => <option key={e} value={e} className="text-gray-800">{e}</option>)}
            </select>
          </div>
          <div>
            <label className="text-blue-200 text-xs mb-1.5 block font-medium">Target Date (Exam)</label>
            <input
              type="date"
              value={targetDate}
              onChange={e => setTargetDate(e.target.value)}
              className="w-full bg-white/15 border border-white/20 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-white/30 [color-scheme:dark]"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={handleGenerate}
              disabled={generating || !targetDate}
              className="w-full bg-yellow-400 text-yellow-900 font-bold py-2.5 rounded-xl hover:bg-yellow-300 transition disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {generating ? (
                <><span className="w-4 h-4 border-2 border-yellow-900 border-t-transparent rounded-full animate-spin" /> Generating...</>
              ) : (
                <><Zap size={16} /> Generate Plan</>
              )}
            </button>
          </div>
        </div>
      </div>

      {generated && (
        <>
          {/* Overall Progress */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: Target, label: "Overall Progress", value: `${GENERATED_PLAN.progress}%`,       color: "text-blue-600"  },
              { icon: Clock,  label: "Days Remaining",   value: GENERATED_PLAN.daysRemaining,         color: "text-orange-600" },
              { icon: CheckCircle2, label: "Topics Done", value: `${GENERATED_PLAN.topicsCompleted}/${GENERATED_PLAN.totalTopics}`, color: "text-green-600" },
              { icon: Zap,    label: "Today's Progress", value: `${todayCompleted}/${todayTotal}`,    color: "text-purple-600" },
            ].map(s => (
              <div key={s.label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
                <s.icon size={18} className={cn("mb-2", s.color)} />
                <div className={cn("text-2xl font-bold", s.color)}>{s.value}</div>
                <div className="text-gray-400 text-xs mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Progress Bar */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">Study Plan Progress</span>
              <span className="text-blue-600 font-bold text-sm">{GENERATED_PLAN.progress}%</span>
            </div>
            <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full transition-all duration-500"
                style={{ width: `${GENERATED_PLAN.progress}%` }}
              />
            </div>
          </div>

          {/* Today's Tasks */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
              <h2 className="font-semibold text-gray-800 flex items-center gap-2">
                📅 Today's Tasks
              </h2>
              <span className={cn(
                "text-xs font-semibold px-2.5 py-1 rounded-full",
                todayCompleted === todayTotal ? "bg-green-100 text-green-700" : "bg-blue-50 text-blue-700"
              )}>
                {todayCompleted}/{todayTotal} done
              </span>
            </div>
            <div className="divide-y divide-gray-50">
              {tasks.map((task, i) => (
                <div
                  key={i}
                  className={cn(
                    "flex items-center gap-4 px-5 py-3.5 cursor-pointer hover:bg-gray-50 transition",
                    task.completed ? "opacity-70" : ""
                  )}
                  onClick={() => toggleTask(i)}
                >
                  {task.completed
                    ? <CheckCircle2 size={20} className="text-green-500 flex-shrink-0" />
                    : <Circle size={20} className="text-gray-300 flex-shrink-0" />
                  }
                  <div className="flex-1">
                    <div className={cn("text-sm font-medium", task.completed ? "line-through text-gray-400" : "text-gray-800")}>
                      {task.topic}
                    </div>
                    <div className="text-xs text-gray-400 mt-0.5">{task.subject}</div>
                  </div>
                  <div className="flex items-center gap-1.5 text-gray-400 text-xs">
                    <Clock size={12} /> {task.duration} min
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Weekly Targets */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
            <div className="px-5 py-4 border-b border-gray-50">
              <h2 className="font-semibold text-gray-800">📊 Weekly Targets — {targetExam}</h2>
            </div>
            <div className="divide-y divide-gray-50">
              {GENERATED_PLAN.weeklyTargets.map(w => (
                <div key={w.week} className={cn("px-5 py-4", w.completed ? "opacity-75" : "")}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className={cn(
                        "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold",
                        w.completed ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"
                      )}>
                        W{w.week}
                      </div>
                      <span className={cn("text-sm font-medium", w.completed ? "text-gray-400" : "text-gray-800")}>
                        Week {w.week}
                        {w.completed ? " ✓" : ""}
                      </span>
                    </div>
                    <span className="text-xs text-gray-400 bg-gray-50 border border-gray-100 px-2.5 py-1 rounded-lg">
                      {w.mockTests} mock tests
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 ml-9">
                    {w.topics.map(topic => (
                      <span key={topic} className={cn(
                        "text-[11px] px-2.5 py-1 rounded-full border font-medium",
                        w.completed
                          ? "bg-green-50 border-green-200 text-green-700"
                          : "bg-gray-50 border-gray-200 text-gray-600"
                      )}>
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
