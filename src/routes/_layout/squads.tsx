import { SquadsPage } from "@/components/squads/SquadsPage";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_layout/squads")({
  component: SquadsPage,
});
