import { TakeTestPage } from "@/components/tests/TakeTestPage";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_layout/take-test/$testId")({
  component: TakeTestPage,
});
