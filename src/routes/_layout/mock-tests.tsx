import { MockTestsPage } from "@/components/tests/MockTestsPage";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_layout/mock-tests")({
  component: MockTestsPage,
});
