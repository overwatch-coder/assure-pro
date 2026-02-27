"use client";

import { useAuth } from "@/components/providers/auth-provider";
import {
  LayoutDashboard,
  FolderOpen,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Menu,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Fiches", href: "/dashboard/fiches", icon: FolderOpen },
];

export function Sidebar({
  collapsed,
  setCollapsed,
}: {
  collapsed: boolean;
  setCollapsed: (val: boolean) => void;
}) {
  const { logout } = useAuth();
  const pathname = usePathname();

  const NavContent = () => (
    <div className="flex flex-col h-full bg-slate-900 text-white">
      <div
        className={cn(
          "flex items-center h-16 shrink-0 px-4",
          collapsed ? "justify-center" : "justify-between",
        )}
      >
        {!collapsed ? (
          <span className="font-bold text-lg tracking-wider">ASSUREPRO</span>
        ) : (
          <span className="font-bold text-lg tracking-wider">AP</span>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="hidden lg:flex text-slate-300 hover:text-slate-900 hover:bg-white"
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? (
            <ChevronRight className="h-5 w-5" />
          ) : (
            <ChevronLeft className="h-5 w-5" />
          )}
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto mt-4 px-3 space-y-1">
        {navigation.map((item) => {
          const isActive =
            pathname === item.href ||
            (pathname.startsWith(`${item.href}/`) &&
              item.href !== "/dashboard");
          const activeClass = isActive
            ? "bg-blue-600 text-white"
            : "text-slate-300 hover:bg-slate-800 hover:text-white";

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors",
                activeClass,
                collapsed && "justify-center",
              )}
              title={collapsed ? item.name : undefined}
            >
              <item.icon
                className={cn(
                  "shrink-0",
                  collapsed ? "h-6 w-6" : "mr-3 h-5 w-5",
                  isActive
                    ? "text-white"
                    : "text-slate-400 group-hover:text-white",
                )}
              />
              {!collapsed && item.name}
            </Link>
          );
        })}
      </div>

      <div className="shrink-0 p-4 border-t border-slate-800">
        <button
          onClick={logout}
          className={cn(
            "group flex w-full items-center px-2 py-2 text-sm font-medium rounded-md text-slate-300 hover:bg-slate-800 hover:text-white transition-colors",
            collapsed && "justify-center",
          )}
          title={collapsed ? "Déconnexion" : undefined}
        >
          <LogOut
            className={cn(
              "shrink-0",
              collapsed
                ? "h-6 w-6"
                : "mr-3 h-5 w-5 text-slate-400 group-hover:text-white",
            )}
          />
          {!collapsed && "Déconnexion"}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Sidebar */}
      <Sheet>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden absolute top-4 left-4 z-50"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-64 bg-slate-900 border-r-0">
          <NavContent />
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      <div
        className={cn(
          "hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 z-40 transition-all duration-300",
          collapsed ? "lg:w-20" : "lg:w-64",
        )}
      >
        <NavContent />
      </div>
    </>
  );
}
