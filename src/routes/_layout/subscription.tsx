import { SubscriptionPage } from "@/components/subscription/SubscriptionPage";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_layout/subscription")({
  component: SubscriptionPage,
});
