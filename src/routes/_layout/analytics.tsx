import { AnalyticsPage } from "@/components/analytics/AnalyticsPage";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_layout/analytics")({
  component: AnalyticsPage,
});
