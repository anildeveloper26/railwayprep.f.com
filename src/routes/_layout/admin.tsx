import { AdminPage } from "@/components/admin/AdminPage";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_layout/admin")({
  component: AdminPage,
});
