import { PYQPage } from "@/components/pyq/PYQPage";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_layout/pyq")({
  component: PYQPage,
});
