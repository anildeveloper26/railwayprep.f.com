import { ReferralPage } from "@/components/referral/ReferralPage";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_layout/referral")({
  component: ReferralPage,
});
