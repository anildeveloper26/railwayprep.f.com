import { ReservationPage } from "@/components/reservation/ReservationPage";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_layout/reservation")({
  component: ReservationPage,
});
