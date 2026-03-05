import { NotificationsPage } from "@/components/notifications/NotificationsPage";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_layout/notifications")({
  component: NotificationsPage,
});
