"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Upload,
  FileText,
  Settings,
  LogOut,
  Activity,
  User
} from "lucide-react";

const sidebarItems = [
  { icon: LayoutDashboard, label: "Overview", href: "/dashboard" },
  { icon: Upload, label: "Upload Report", href: "/upload" },
  { icon: FileText, label: "Analysis History", href: "/analysis" },
  { icon: Settings, label: "Settings", href: "/profile" },
];

import { useUser, useClerk } from "@clerk/nextjs";
import Image from "next/image";

export default function DashboardSidebar() {
  const pathname = usePathname();
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();

  return (
    <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-slate-200 h-screen fixed left-0 top-0 z-30">
      <div className="p-6 border-b border-slate-100">
        <Link href="/" className="flex items-center gap-2">
          <div className="bg-blue-600 p-1.5 rounded-lg">
            <Activity className="h-6 w-6 text-white" />
          </div>
          <span className="text-xl font-bold text-slate-900 tracking-tight">MediLens</span>
        </Link>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {sidebarItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-blue-50 text-blue-700 shadow-sm"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              )}
            >
              <item.icon className={cn("h-5 w-5", isActive ? "text-blue-600" : "text-slate-400")} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-100">
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-50 border border-slate-100 mb-2">
          {isLoaded && user ? (
            <div className="h-8 w-8 rounded-full overflow-hidden shrink-0">
              <Image src={user.imageUrl} alt="Profile" width={32} height={32} className="h-full w-full object-cover" />
            </div>
          ) : (
            <div className="h-8 w-8 rounded-full bg-slate-200 animate-pulse shrink-0"></div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-900 truncate">
              {isLoaded ? (user?.fullName || user?.username || "User") : "Loading..."}
            </p>
            <p className="text-xs text-slate-500 truncate">
              {isLoaded ? user?.primaryEmailAddress?.emailAddress : ""}
            </p>
          </div>
        </div>
        <button
          onClick={() => signOut({ redirectUrl: '/login' })}
          className="w-full flex items-center gap-3 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
