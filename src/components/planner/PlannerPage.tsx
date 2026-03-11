import { useState } from "react";
import { Calendar, CheckCircle2, Circle, Zap, Target, Clock, Plus, Trash2, Loader2, Sparkles } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { plannerApi, authApi, aiApi } from "@/lib/api";
import { adaptUser } from "@/lib/interfaces";
import type { ApiPlannerTask } from "@/lib/interfaces";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const EXAMS = ["RRB NTPC", "RRB Group D", "RRB JE", "RRB ALP"];
const SUBJECTS = ["Mathematics", "Reasoning", "General Knowledge", "Technical"];
const PRIORITIES = ["High", "Medium", "Low"] as const;

export function PlannerPage() {
  const queryClient = useQueryClient();
  const { data: apiUser } = useQuery({ queryKey: ["me"], queryFn: authApi.getMe, retry: false });
  const user = apiUser ? adaptUser(apiUser) : null;

  const { data: tasks, isLoading: tasksLoading } = useQuery({
    queryKey: ["planner-tasks"],
    queryFn: plannerApi.getTasks,
  });

  const { data: stats } = useQuery({
    queryKey: ["planner-stats"],
    queryFn: plannerApi.getStats,
  });

  const [targetExam, setTargetExam] = useState(user?.targetExam ?? "RRB NTPC");
  const [examDate, setExamDate] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTask, setNewTask] = useState<{
    title: string; subject: string; topic: string;
    priority: typeof PRIORITIES[number]; targetDate: string; estimatedMinutes: number; notes: string;
  }>({
    title: "", subject: "Mathematics", topic: "",
    priority: "High", targetDate: "", estimatedMinutes: 60, notes: "",
  });

  const taskList: ApiPlannerTask[] = Array.isArray(tasks) ? tasks : [];
  const todayCompleted = taskList.filter(t => t.isCompleted || t.completed).length;
  const totalTasks = taskList.length;

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof plannerApi.updateTask>[1] }) =>
      plannerApi.updateTask(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["planner-tasks"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: plannerApi.deleteTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["planner-tasks"] });
      queryClient.invalidateQueries({ queryKey: ["planner-stats"] });
      toast.success("Task deleted");
    },
  });

  const aiPlanMutation = useMutation({
    mutationFn: (date: string) => aiApi.generateStudyPlan(date),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["planner-tasks"] });
      queryClient.invalidateQueries({ queryKey: ["planner-stats"] });
      toast.success(`AI generated ${(res as { tasks: unknown[] }).tasks?.length ?? 0} tasks!`);
    },
    onError: () => toast.error("AI plan generation failed"),
  });

  const createMutation = useMutation({
    mutationFn: plannerApi.createTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["planner-tasks"] });
      queryClient.invalidateQueries({ queryKey: ["planner-stats"] });
      setShowAddForm(false);
      setNewTask({ title: "", subject: "Mathematics", topic: "", priority: "High" as const, targetDate: "", estimatedMinutes: 60, notes: "" });
      toast.success("Task created!");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const toggleTask = (task: ApiPlannerTask) => {
    updateMutation.mutate({ id: task._id, data: { isCompleted: !(task.isCompleted || task.completed) } });
  };

  const progress = stats?.progress ?? (totalTasks > 0 ? Math.round((todayCompleted / totalTasks) * 100) : 0);
  const daysRemaining = stats?.daysRemaining;

  return (
    <div className="p-5 max-w-5xl mx-auto space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <Calendar size={20} className="text-orange-500" /> Study Planner
        </h1>
        <p className="text-gray-500 text-sm mt-0.5">Manage your study tasks and track your preparation</p>
      </div>

      {/* Plan Controls */}
      <div className="rounded-2xl p-5 text-white" style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)" }}>
        <div className="flex items-center gap-2 mb-4">
          <Zap size={18} className="text-yellow-300" />
          <h2 className="font-semibold">Study Plan</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-slate-400 text-xs mb-1.5 block font-medium">Target Exam</label>
            <select
              value={targetExam}
              onChange={e => setTargetExam(e.target.value)}
              className="w-full bg-white/15 border border-white/20 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-white/30"
            >
              {EXAMS.map(e => <option key={e} value={e} className="text-gray-800">{e}</option>)}
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={() => setShowAddForm(true)}
              className="w-full bg-yellow-400 text-yellow-900 font-bold py-2.5 rounded-xl hover:bg-yellow-300 transition flex items-center justify-center gap-2"
            >
              <Plus size={16} /> Add New Task
            </button>
          </div>
        </div>
        <div className="mt-3 pt-3 border-t border-white/10">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles size={14} className="text-yellow-300" />
            <span className="text-slate-300 text-xs font-medium">Generate AI Study Plan</span>
          </div>
          <div className="flex gap-2">
            <input
              type="date"
              value={examDate}
              onChange={e => setExamDate(e.target.value)}
              className="flex-1 bg-white/15 border border-white/20 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-white/30"
              placeholder="Exam date"
            />
            <button
              onClick={() => examDate && aiPlanMutation.mutate(examDate)}
              disabled={!examDate || aiPlanMutation.isPending}
              className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white text-sm font-semibold rounded-xl disabled:opacity-50 transition flex items-center gap-1.5"
            >
              {aiPlanMutation.isPending ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
              Generate
            </button>
          </div>
        </div>
      </div>

      {/* Add Task Form */}
      {showAddForm && (
        <div className="bg-white rounded-xl border border-orange-200 shadow-sm p-5">
          <h3 className="font-semibold text-gray-800 mb-4">New Task</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="sm:col-span-2">
              <label className="text-xs font-medium text-gray-600 mb-1 block">Task Title</label>
              <input
                value={newTask.title}
                onChange={e => setNewTask(p => ({ ...p, title: e.target.value }))}
                placeholder="e.g. Revise Percentage"
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Subject</label>
              <select
                value={newTask.subject}
                onChange={e => setNewTask(p => ({ ...p, subject: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
              >
                {SUBJECTS.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Topic</label>
              <input
                value={newTask.topic}
                onChange={e => setNewTask(p => ({ ...p, topic: e.target.value }))}
                placeholder="e.g. Number System"
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Priority</label>
              <select
                value={newTask.priority}
                onChange={e => setNewTask(p => ({ ...p, priority: e.target.value as typeof PRIORITIES[number] }))}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
              >
                {PRIORITIES.map(p => <option key={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Target Date</label>
              <input
                type="date"
                value={newTask.targetDate}
                onChange={e => setNewTask(p => ({ ...p, targetDate: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Duration (minutes)</label>
              <input
                type="number" min={5} max={240}
                value={newTask.estimatedMinutes}
                onChange={e => setNewTask(p => ({ ...p, estimatedMinutes: parseInt(e.target.value) || 60 }))}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button
              onClick={() => setShowAddForm(false)}
              className="flex-1 border border-gray-200 py-2 rounded-xl text-sm font-medium hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              onClick={() => createMutation.mutate(newTask)}
              disabled={createMutation.isPending || !newTask.title || !newTask.topic}
              className="flex-1 bg-orange-500 text-white py-2 rounded-xl text-sm font-semibold hover:bg-orange-600 disabled:opacity-60 transition flex items-center justify-center gap-2"
            >
              {createMutation.isPending ? <Loader2 size={14} className="animate-spin" /> : null}
              Create Task
            </button>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: Target,      label: "Progress",       value: `${progress}%`,                                          color: "text-orange-500" },
          { icon: Clock,       label: "Days Remaining",  value: daysRemaining ?? "—",                                    color: "text-orange-600" },
          { icon: CheckCircle2,label: "Completed",       value: `${stats?.completedTasks ?? todayCompleted}/${stats?.totalTasks ?? totalTasks}`, color: "text-green-600" },
          { icon: Zap,         label: "Pending",         value: stats?.pendingTasks ?? (totalTasks - todayCompleted),    color: "text-purple-600" },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <s.icon size={18} className={cn("mb-2", s.color)} />
            <div className={cn("text-2xl font-bold", s.color)}>{s.value}</div>
            <div className="text-gray-400 text-xs mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Progress Bar */}
      {totalTasks > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">Overall Progress</span>
            <span className="text-orange-500 font-bold text-sm">{progress}%</span>
          </div>
          <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-orange-500 to-orange-400 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Tasks List */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
          <h2 className="font-semibold text-gray-800 flex items-center gap-2">
            📅 My Tasks
          </h2>
          <span className={cn(
            "text-xs font-semibold px-2.5 py-1 rounded-full",
            todayCompleted === totalTasks && totalTasks > 0 ? "bg-green-100 text-green-700" : "bg-orange-50 text-orange-700"
          )}>
            {todayCompleted}/{totalTasks} done
          </span>
        </div>

        {tasksLoading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 size={24} className="animate-spin text-orange-500" />
          </div>
        ) : taskList.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <Calendar size={36} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">No tasks yet. Add your first task above!</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {taskList.map(task => {
              const done = task.isCompleted || task.completed;
              const priorityColor = task.priority === "High" ? "text-red-500 bg-red-50" : task.priority === "Medium" ? "text-yellow-600 bg-yellow-50" : "text-gray-500 bg-gray-50";
              return (
                <div key={task._id} className="flex items-center gap-4 px-5 py-3.5">
                  <button onClick={() => toggleTask(task)} className="flex-shrink-0">
                    {done
                      ? <CheckCircle2 size={20} className="text-green-500" />
                      : <Circle size={20} className="text-gray-300" />
                    }
                  </button>
                  <div className="flex-1 min-w-0">
                    <div className={cn("text-sm font-medium", done ? "line-through text-gray-400" : "text-gray-800")}>
                      {task.title}
                    </div>
                    <div className="text-xs text-gray-400 mt-0.5">{task.subject} · {task.topic}</div>
                  </div>
                  <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0", priorityColor)}>
                    {task.priority}
                  </span>
                  <div className="flex items-center gap-1.5 text-gray-400 text-xs flex-shrink-0">
                    <Clock size={12} /> {task.estimatedMinutes}m
                  </div>
                  <button
                    onClick={() => deleteMutation.mutate(task._id)}
                    disabled={deleteMutation.isPending}
                    className="p-1.5 hover:bg-red-50 rounded-lg text-red-400 transition flex-shrink-0"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
