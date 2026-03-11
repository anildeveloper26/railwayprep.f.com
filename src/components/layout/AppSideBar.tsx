import { useState } from "react";
import { Link, Outlet, useLocation } from "@tanstack/react-router";
import {
  LayoutDashboard,
  FileText,
  BookOpen,
  Bell,
  Calendar,
  ShieldCheck,
  BarChart2,
  Trophy,
  CreditCard,
  Settings,
  LogOut,
  Train,
  Menu,
  X,
  ChevronRight,
  UserCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { authApi } from "@/lib/api";
import { adaptUser } from "@/lib/interfaces";
import Cookies from "js-cookie";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard",    path: "/dashboard" },
  { icon: FileText,        label: "Mock Tests",   path: "/mock-tests" },
  { icon: BookOpen,        label: "PYQ Bank",     path: "/pyq" },
  { icon: Bell,            label: "Notifications",path: "/notifications" },
  { icon: Calendar,        label: "Study Planner",path: "/planner" },
  { icon: ShieldCheck,     label: "SC/ST/OBC Guide", path: "/reservation" },
  { icon: BarChart2,       label: "Analytics",    path: "/analytics" },
  { icon: Trophy,          label: "Leaderboard",  path: "/leaderboard" },
  { icon: CreditCard,      label: "Subscription", path: "/subscription" },
];

const adminItems = [
  { icon: Settings, label: "Admin Panel", path: "/admin" },
];

export function AppSideBar() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  const { data: apiUser } = useQuery({
    queryKey: ["me"],
    queryFn: authApi.getMe,
    retry: false,
  });
  const user = apiUser ? adaptUser(apiUser) : null;

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = () => {
    Cookies.remove("rrb_token");
    window.location.href = "/";
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className={cn(
        "flex items-center gap-3 p-4 border-b border-white/10",
        collapsed ? "justify-center px-2" : ""
      )}>
        <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
          <Train className="w-5 h-5 text-white" />
        </div>
        {!collapsed && (
          <div>
            <div className="text-white font-bold text-base leading-none">RailwayPrep</div>
            <div className="text-blue-200 text-xs mt-0.5">Crack RRB Exams</div>
          </div>
        )}
      </div>

      {/* User Badge */}
      {!collapsed && (
        <div className="mx-3 mt-3 p-3 bg-white/10 rounded-xl">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
              <UserCircle className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-white text-xs font-semibold truncate">{user?.name ?? "..."}</div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-blue-200 text-[10px] truncate">{user?.targetExam ?? ""}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Nav Items */}
      <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto hide-scrollbar">
        {!collapsed && (
          <div className="text-blue-300 text-[10px] font-semibold uppercase tracking-wider px-2 mb-2">
            Preparation
          </div>
        )}
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            onClick={() => setMobileOpen(false)}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150 group",
              isActive(item.path)
                ? "bg-white/20 text-white font-semibold shadow-sm"
                : "text-blue-100 hover:bg-white/10 hover:text-white",
              collapsed ? "justify-center px-2" : ""
            )}
            title={collapsed ? item.label : undefined}
          >
            <item.icon className={cn(
              "w-4.5 h-4.5 flex-shrink-0",
              isActive(item.path) ? "text-white" : "text-blue-200 group-hover:text-white"
            )} size={18} />
            {!collapsed && (
              <>
                <span className="flex-1">{item.label}</span>
                {isActive(item.path) && <ChevronRight className="w-3.5 h-3.5 text-white/60" />}
              </>
            )}
          </Link>
        ))}

        {!collapsed && (
          <div className="text-blue-300 text-[10px] font-semibold uppercase tracking-wider px-2 mt-4 mb-2">
            Management
          </div>
        )}
        {adminItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            onClick={() => setMobileOpen(false)}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150 group",
              isActive(item.path)
                ? "bg-white/20 text-white font-semibold"
                : "text-blue-100 hover:bg-white/10 hover:text-white",
              collapsed ? "justify-center px-2" : ""
            )}
            title={collapsed ? item.label : undefined}
          >
            <item.icon className="w-4.5 h-4.5 flex-shrink-0 text-blue-200 group-hover:text-white" size={18} />
            {!collapsed && <span className="flex-1">{item.label}</span>}
          </Link>
        ))}
      </nav>

      {/* Bottom */}
      <div className="px-2 pb-3 border-t border-white/10 pt-3 space-y-0.5">
        <button
          onClick={handleLogout}
          className={cn(
            "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-red-300 hover:bg-red-500/20 hover:text-red-200 transition-all duration-150",
            collapsed ? "justify-center" : ""
          )}
        >
          <LogOut size={18} className="flex-shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Desktop Sidebar */}
      <aside className={cn(
        "hidden md:flex flex-col bg-gradient-to-b from-[#1e3a8a] to-[#1a56db] transition-all duration-300 shadow-xl flex-shrink-0",
        collapsed ? "w-16" : "w-60"
      )}>
        {/* Collapse Toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute top-4 -right-3 z-50 w-6 h-6 bg-white border border-gray-200 rounded-full shadow flex items-center justify-center hover:bg-gray-50"
          style={{ position: "relative", alignSelf: "flex-end", margin: "8px 8px 0 0" }}
        >
          {collapsed ? <ChevronRight size={12} /> : <X size={12} />}
        </button>
        <SidebarContent />
      </aside>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-gradient-to-b from-[#1e3a8a] to-[#1a56db] shadow-2xl transition-transform duration-300 md:hidden",
        mobileOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <SidebarContent />
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile Top Bar */}
        <header className="md:hidden flex items-center gap-3 px-4 py-3 bg-white border-b border-gray-200 shadow-sm">
          <button
            onClick={() => setMobileOpen(true)}
            className="p-1.5 rounded-lg hover:bg-gray-100"
          >
            <Menu size={20} />
          </button>
          <div className="flex items-center gap-2">
            <Train size={20} className="text-blue-600" />
            <span className="font-bold text-gray-800">RailwayPrep</span>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-gray-50">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
