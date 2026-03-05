import { AppSideBar } from "@/components/layout/AppSideBar";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_layout")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="font-inter">
      <AppSideBar />
    </div>
  );
}
