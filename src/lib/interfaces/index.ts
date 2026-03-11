// ─── Component-facing types ───────────────────────────────────────────────────

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  category: "UR" | "SC" | "ST" | "OBC" | "EWS";
  targetExam: string;
  subscriptionPlan: "free" | "monthly" | "quarterly" | "annual";
  avatar?: string;
  joinedAt: string;
  testsAttempted: number;
  averageScore: number;
  rank: number;
}

export interface Question {
  id: string;
  exam: string;
  year: number;
  subject: "maths" | "reasoning" | "gk" | "technical";
  topic: string;
  questionText: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  difficulty: "easy" | "medium" | "hard";
  language: "en" | "te" | "hi";
}

export interface MockTest {
  id: string;
  title: string;
  exam: string;
  duration: number;
  totalQuestions: number;
  subjects: string[];
  difficulty: "easy" | "medium" | "hard";
  negativeMarking: boolean;
  negativeMarkValue: number;
  isAttempted?: boolean;
  bestScore?: number;
  createdAt: string;
  totalAttempts: number;
}

export interface TestAttempt {
  id: string;
  testId: string;
  testTitle: string;
  userId: string;
  answers: (number | null)[];
  score: number;
  maxScore: number;
  percentage: number;
  timeTaken: number;
  rank: number;
  accuracy: number;
  correctCount: number;
  wrongCount: number;
  skippedCount: number;
  completedAt: string;
}

export interface ExamNotification {
  id: string;
  title: string;
  examType: string;
  vacancyCount: number;
  categoryWiseVacancy: { UR: number; SC: number; ST: number; OBC: number; EWS: number };
  applyStart: string;
  applyEnd: string;
  examDate?: string;
  resultDate?: string;
  officialLink: string;
  postedAt: string;
  isNew: boolean;
  status: "upcoming" | "active" | "closed" | "result_declared";
}

export interface StudyPlan {
  id: string;
  userId: string;
  examName: string;
  targetDate: string;
  dailyHours: number;
  dailyTasks: DailyTask[];
  weeklyTargets: WeeklyTarget[];
  progress: number;
}

export interface DailyTask {
  subject: string;
  topic: string;
  duration: number;
  completed: boolean;
  date: string;
}

export interface WeeklyTarget {
  week: number;
  topics: string[];
  mockTests: number;
  completed: boolean;
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  name: string;
  avatar?: string;
  category: string;
  testsAttempted: number;
  averageScore: number;
  totalPoints: number;
  badge: "gold" | "silver" | "bronze" | "none";
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  duration: string;
  features: string[];
  isPopular: boolean;
  badge?: string;
}

export interface AnalyticsData {
  subjectWise: { subject: string; score: number; total: number; percentage: number }[];
  topicWise: { topic: string; correct: number; total: number }[];
  recentTests: { date: string; score: number; name: string }[];
  weeklyActivity: { day: string; questions: number; time: number }[];
  accuracy: number;
  averageTime: number;
  strongTopics: string[];
  weakTopics: string[];
}

// ─── API Response types ───────────────────────────────────────────────────────

export interface ApiUser {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  category?: string;
  targetExam?: string;
  subscriptionPlan?: string;
  createdAt?: string;
  testsAttempted?: number;
  averageScore?: number;
  rank?: number;
  role?: string;
  isAdmin?: boolean;
}

export interface ApiTestSection {
  subject: string;
  questionCount: number;
  marksPerQuestion: number;
  negativeMarks: number;
}

export interface ApiTest {
  _id: string;
  title: string;
  exam: string;
  description?: string;
  totalQuestions: number;
  duration: number;
  totalMarks: number;
  difficulty: string;
  isPremium: boolean;
  sections: ApiTestSection[];
  createdAt: string;
  totalAttempts?: number;
}

export interface ApiQuestion {
  _id: string;
  subject: string;
  topic: string;
  difficulty: string;
  year: number;
  exam: string;
  questionText: string;
  options: Array<{ key: string; text: string }>;
  correctOption: string;
  explanation: string;
  isPYQ: boolean;
  tags: string[];
}

export interface ApiAttempt {
  _id: string;
  testId: string;
  userId: string;
  score: number;
  totalMarks: number;
  percentage: number;
  timeTaken: number;
  correctCount?: number;
  wrongCount?: number;
  skippedCount?: number;
  answers: Array<{
    questionId: string;
    selectedOption: string;
    isCorrect: boolean;
    timeTaken: number;
    isFlagged: boolean;
  }>;
  createdAt: string;
}

export interface ApiAnalytics {
  totalTests?: number;
  averageScore?: number;
  totalQuestions?: number;
  accuracy?: number;
  averageTime?: number;
  subjectWise?: Array<{ subject: string; score: number; total: number; percentage: number }>;
  topicWise?: Array<{ topic: string; correct: number; total: number }>;
  recentTests?: Array<{ date: string; score: number; name: string }>;
  weeklyActivity?: Array<{ day: string; questions: number; time: number }>;
  strongTopics?: string[];
  weakTopics?: string[];
}

export interface ApiLeaderboardEntry {
  rank: number;
  userId: string;
  name: string;
  avatar?: string;
  category: string;
  testsAttempted: number;
  averageScore: number;
  totalPoints: number;
  badge?: string;
}

export interface ApiNotification {
  _id: string;
  title: string;
  message: string;
  type: "info" | "warning" | "success" | "error";
  createdAt: string;
}

export interface ApiSubscriptionPlan {
  id: string;
  name: string;
  price: number;
  duration: string;
  features: string[];
  isPopular?: boolean;
  badge?: string;
}

export interface ApiPlannerTask {
  _id: string;
  title: string;
  subject: string;
  topic: string;
  priority: "High" | "Medium" | "Low";
  targetDate: string;
  estimatedMinutes: number;
  notes?: string;
  isCompleted?: boolean;
  completed?: boolean;
}

export interface ApiPlannerStats {
  totalTasks?: number;
  completedTasks?: number;
  pendingTasks?: number;
  progress?: number;
  daysRemaining?: number;
  topicsCompleted?: number;
  totalTopics?: number;
}

export interface ApiAdminDashboard {
  totalUsers?: number;
  totalTests?: number;
  totalQuestions?: number;
  activeSubscriptions?: number;
  recentActivity?: Array<{ action: string; detail: string; time: string; color?: string }>;
}

export interface ApiAdminUser {
  _id: string;
  name: string;
  email: string;
  category: string;
  testsAttempted?: number;
  averageScore?: number;
  totalPoints?: number;
  rank?: number;
}

export interface ApiPYQTopic {
  subject: string;
  topic: string;
  count: number;
}

// ─── Adapters ─────────────────────────────────────────────────────────────────

export function adaptUser(u: ApiUser): User {
  return {
    id: u._id,
    name: u.name,
    email: u.email,
    phone: u.phone ?? "",
    category: (u.category as User["category"]) ?? "UR",
    targetExam: u.targetExam ?? "RRB NTPC",
    subscriptionPlan: (u.subscriptionPlan as User["subscriptionPlan"]) ?? "free",
    joinedAt: u.createdAt ?? "",
    testsAttempted: u.testsAttempted ?? 0,
    averageScore: u.averageScore ?? 0,
    rank: u.rank ?? 0,
  };
}

export function adaptTest(t: ApiTest): MockTest {
  return {
    id: t._id,
    title: t.title,
    exam: t.exam,
    duration: t.duration ?? 90,
    totalQuestions: t.totalQuestions,
    subjects: t.sections?.map(s => s.subject?.toLowerCase()) ?? [],
    difficulty: t.difficulty?.toLowerCase() as MockTest["difficulty"],
    negativeMarking: t.sections?.some(s => s.negativeMarks > 0) ?? true,
    negativeMarkValue: t.sections?.[0]?.negativeMarks ?? 0.33,
    createdAt: t.createdAt,
    totalAttempts: t.totalAttempts ?? 0,
  };
}

export function adaptQuestion(q: ApiQuestion): Question {
  const correctIndex = q.options.findIndex(o => o.key === q.correctOption);
  return {
    id: q._id,
    exam: q.exam,
    year: q.year,
    subject: q.subject?.toLowerCase() as Question["subject"],
    topic: q.topic,
    questionText: q.questionText,
    options: q.options.map(o => o.text),
    correctAnswer: correctIndex >= 0 ? correctIndex : 0,
    explanation: q.explanation,
    difficulty: q.difficulty?.toLowerCase() as Question["difficulty"],
    language: "en",
  };
}

export function adaptLeaderboardEntry(e: ApiLeaderboardEntry): LeaderboardEntry {
  const badge = e.badge as LeaderboardEntry["badge"] ?? "none";
  return {
    rank: e.rank,
    userId: e.userId,
    name: e.name,
    avatar: e.avatar,
    category: e.category,
    testsAttempted: e.testsAttempted,
    averageScore: e.averageScore,
    totalPoints: e.totalPoints,
    badge: ["gold", "silver", "bronze"].includes(badge) ? badge : "none",
  };
}
