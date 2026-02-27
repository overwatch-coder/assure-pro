"use client";

import { useAuth } from "@/components/providers/auth-provider";
import { LogOut, User as UserIcon } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { usePathname } from "next/navigation";

export function Header() {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  let pageTitle = "Dashboard";
  if (pathname.startsWith("/dashboard/fiches"))
    pageTitle = "Fiches d'Assurance";

  if (!user) return null;

  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-x-4 border-b border-slate-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
      {/* Spacer for mobile menu button */}
      <div className="w-8 lg:hidden" aria-hidden="true"></div>

      <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6 h-full items-center">
        <h1 className="flex-1 text-2xl font-semibold text-slate-900">
          {pageTitle}
        </h1>

        <div className="flex items-center gap-x-4 lg:gap-x-6">
          <div className="hidden sm:flex flex-col items-end">
            <span className="text-sm font-medium text-slate-900 leading-none">
              {user.name}
            </span>
            <span className="text-xs text-blue-600 font-semibold mt-1">
              {user.role}
            </span>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger className="focus:outline-none">
              <Avatar className="h-9 w-9 border border-slate-200 cursor-pointer hover:opacity-80 transition-opacity">
                <AvatarFallback className="bg-blue-100 text-blue-700 font-semibold">
                  {user.name.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Mon Compte</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-xs font-mono text-slate-500">
                {user.email}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={logout}
                className="text-red-600 focus:text-red-600 cursor-pointer"
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Déconnexion</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
