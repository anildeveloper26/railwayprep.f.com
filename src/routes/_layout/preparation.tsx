import { ApplicationFeaturesPage } from "@/components/preparation/ApplicationFeaturesPage";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_layout/preparation")({
  component: ApplicationFeaturesPage,
});
