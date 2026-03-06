import { AppSideBar } from "@/components/layout/AppSideBar";

export default function LayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="font-inter">
      <AppSideBar>{children}</AppSideBar>
    </div>
  );
}
