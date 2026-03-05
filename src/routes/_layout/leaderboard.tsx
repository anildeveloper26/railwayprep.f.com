import { LeaderboardPage } from "@/components/leaderboard/LeaderboardPage";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_layout/leaderboard")({
  component: LeaderboardPage,
});
