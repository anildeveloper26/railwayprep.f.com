import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date) {
  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function formatTime(seconds: number) {
  if (!seconds || isNaN(seconds)) return "00:00";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export function getScoreColor(percentage: number) {
  if (percentage >= 80) return "text-green-600";
  if (percentage >= 60) return "text-blue-600";
  if (percentage >= 40) return "text-yellow-600";
  return "text-red-600";
}

export function getScoreBadgeColor(percentage: number) {
  if (percentage >= 80) return "bg-green-100 text-green-800";
  if (percentage >= 60) return "bg-blue-100 text-blue-800";
  if (percentage >= 40) return "bg-yellow-100 text-yellow-800";
  return "bg-red-100 text-red-800";
}

export function getDifficultyColor(difficulty: string) {
  switch (difficulty.toLowerCase()) {
    case "easy": return "bg-green-100 text-green-700";
    case "medium": return "bg-yellow-100 text-yellow-700";
    case "hard": return "bg-red-100 text-red-700";
    default: return "bg-gray-100 text-gray-700";
  }
}
