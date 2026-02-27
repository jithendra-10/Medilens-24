import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Activity } from "lucide-react"

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white">
            <Activity className="h-5 w-5" />
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-900">HealthBridge AI</span>
        </Link>
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
          <a href="#how-it-works" className="hover:text-blue-600 transition-colors">How it Works</a>
          <a href="#benefits" className="hover:text-blue-600 transition-colors">Benefits</a>
          <a href="#pricing" className="hover:text-blue-600 transition-colors">Pricing</a>
          <a href="#faq" className="hover:text-blue-600 transition-colors">FAQ</a>
        </nav>
        <div className="flex items-center gap-4">
          <Link to="/login" className="hidden sm:block text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">
            Log in
          </Link>
          <Button asChild className="rounded-full px-6">
            <Link to="/signup">Get Started</Link>
          </Button>
        </div>
      </div>
    </header>
  )
}
