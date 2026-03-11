import { DailyChallengePage } from "@/components/daily-challenge/DailyChallengePage";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_layout/daily-challenge")({
  component: DailyChallengePage,
});
