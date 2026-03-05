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
  duration: number; // in minutes
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
  timeTaken: number; // in seconds
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
  categoryWiseVacancy: {
    UR: number;
    SC: number;
    ST: number;
    OBC: number;
    EWS: number;
  };
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
