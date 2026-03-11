import { FlashcardsPage } from "@/components/flashcards/FlashcardsPage";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_layout/flashcards")({
  component: FlashcardsPage,
});
