import { WeaknessDrillPage } from "@/components/weakness-drill/WeaknessDrillPage";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_layout/weakness-drill")({
  component: WeaknessDrillPage,
});
