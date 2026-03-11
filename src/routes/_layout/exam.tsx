import { ExamPage } from "@/components/exam/ExamPage";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_layout/exam")({
  component: ExamPage,
});
