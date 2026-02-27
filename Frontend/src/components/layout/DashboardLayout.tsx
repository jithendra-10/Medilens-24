import { Link, Outlet, useLocation, Navigate } from "react-router-dom"
import { Activity, LayoutDashboard, UploadCloud, Settings, LogOut, FileText, Bell, Users, MessageSquare } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/utils/cn"
import { useAuth } from "@/contexts/AuthContext"

const navItems = [
  { icon: LayoutDashboard, label: "Overview", href: "/dashboard" },
  { icon: FileText, label: "Medical History", href: "/reports" },
  { icon: Users, label: "Family Hub", href: "/family" },
  { icon: MessageSquare, label: "AI Assistant", href: "/assistant" },
]

export function DashboardLayout() {
  const location = useLocation()
  const { user, logout } = useAuth()

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return (
    <div className="flex min-h-screen mesh-gradient font-sans text-slate-900 selection:bg-blue-100 selection:text-blue-700">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-50 w-72 flex-col border-r border-white/40 bg-white/60 backdrop-blur-2xl hidden md:flex transition-all duration-300">
        <div className="flex h-20 items-center gap-3 px-8">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30 animate-float">
            <Activity className="h-6 w-6" />
          </div>
          <span className="text-2xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700">HealthBridge</span>
        </div>

        <div className="flex-1 overflow-y-auto py-8 px-6 space-y-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.href || location.pathname.startsWith(item.href + "/")
            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition-all duration-200 group relative",
                  isActive
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-500/25 translate-x-1"
                    : "text-slate-500 hover:bg-white hover:text-slate-900 hover:shadow-sm"
                )}
              >
                <item.icon className={cn("h-5 w-5 transition-transform group-hover:scale-110", isActive ? "text-white" : "text-slate-400 group-hover:text-blue-500")} />
                {item.label}
                {isActive && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-white rounded-r-full" />
                )}
              </Link>
            )
          })}
        </div>

        <div className="p-6">
          <div className="flex items-center gap-3 rounded-3xl bg-white/80 border border-white p-4 shadow-sm">
            <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center text-blue-700 font-bold uppercase shadow-inner text-lg">
              {user?.email?.charAt(0) || "U"}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="truncate text-sm font-bold text-slate-900">{user?.email?.split('@')[0] || "User"}</p>
              <p className="truncate text-[10px] font-medium text-slate-400 uppercase tracking-widest">{user?.email || ""}</p>
            </div>
          </div>
          <Button
            onClick={() => logout()}
            variant="ghost"
            className="w-full justify-start gap-3 mt-4 rounded-xl text-slate-500 hover:text-red-600 hover:bg-red-50/50 transition-all"
          >
            <LogOut className="h-5 w-5" />
            <span className="font-semibold text-sm">Sign Out</span>
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:pl-72 flex flex-col min-h-screen relative">
        <header className="sticky top-0 z-40 flex h-20 items-center justify-between px-6 md:px-10 bg-white/40 backdrop-blur-md border-b border-white/20">
          <div className="flex items-center gap-4 md:hidden">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-lg">
              <Activity className="h-6 w-6" />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900">HealthBridge</span>
          </div>

          <div className="hidden md:flex items-center">
            <div className="glass-panel px-4 py-2 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-700">
              <div className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">Systems AI Stable</span>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex -space-x-2">
              <div className="h-8 w-8 rounded-full border-2 border-white bg-blue-100 flex items-center justify-center text-xs">👨‍⚕️</div>
              <div className="h-8 w-8 rounded-full border-2 border-white bg-indigo-100 flex items-center justify-center text-xs">🧙‍♂️</div>
            </div>
            <Button variant="ghost" size="icon" className="relative h-10 w-10 rounded-xl bg-white/50 border border-white/20 text-slate-500 hover:text-blue-600 transition-all">
              <Bell className="h-5 w-5" />
              <span className="absolute top-2.5 right-2.5 h-2 w-2 rounded-full bg-blue-600 border-2 border-white"></span>
            </Button>
          </div>
        </header>

        <div className="flex-1 p-4 md:p-8 overflow-x-hidden">
          <div className="mx-auto max-w-6xl">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  )
}
