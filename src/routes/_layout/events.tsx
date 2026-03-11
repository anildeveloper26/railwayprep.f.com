import { LiveEventsPage } from "@/components/events/LiveEventsPage";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_layout/events")({
  component: LiveEventsPage,
});
