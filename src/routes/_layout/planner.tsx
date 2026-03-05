import { PlannerPage } from "@/components/planner/PlannerPage";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_layout/planner")({
  component: PlannerPage,
});
