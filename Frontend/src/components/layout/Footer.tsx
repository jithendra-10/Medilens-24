import { Link } from "react-router-dom"
import { Activity } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white py-12 md:py-16">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white">
                <Activity className="h-5 w-5" />
              </div>
              <span className="text-xl font-bold tracking-tight text-slate-900">HealthBridge AI</span>
            </Link>
            <p className="text-sm text-slate-500 max-w-xs">
              Transforming complex medical lab reports into simple, visual, understandable health insights for you and your family.
            </p>
          </div>
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">Product</h4>
            <ul className="space-y-2 text-sm text-slate-500">
              <li><a href="#features" className="hover:text-blue-600 transition-colors">Features</a></li>
              <li><a href="#how-it-works" className="hover:text-blue-600 transition-colors">How it Works</a></li>
              <li><a href="#pricing" className="hover:text-blue-600 transition-colors">Pricing</a></li>
              <li><a href="#faq" className="hover:text-blue-600 transition-colors">FAQ</a></li>
            </ul>
          </div>
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">Company</h4>
            <ul className="space-y-2 text-sm text-slate-500">
              <li><Link to="/about" className="hover:text-blue-600 transition-colors">About Us</Link></li>
              <li><Link to="/contact" className="hover:text-blue-600 transition-colors">Contact</Link></li>
              <li><Link to="/privacy" className="hover:text-blue-600 transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-blue-600 transition-colors">Terms of Service</Link></li>
            </ul>
          </div>
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">Connect</h4>
            <ul className="space-y-2 text-sm text-slate-500">
              <li><a href="#" className="hover:text-blue-600 transition-colors">Twitter</a></li>
              <li><a href="#" className="hover:text-blue-600 transition-colors">LinkedIn</a></li>
              <li><a href="#" className="hover:text-blue-600 transition-colors">Facebook</a></li>
              <li><a href="#" className="hover:text-blue-600 transition-colors">Instagram</a></li>
            </ul>
          </div>
        </div>
        <div className="mt-12 border-t border-slate-200 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-slate-500">
            &copy; {new Date().getFullYear()} HealthBridge AI. All rights reserved.
          </p>
          <div className="text-xs text-slate-400">
            Disclaimer: HealthBridge AI is for educational purposes only and does not provide medical diagnosis.
          </div>
        </div>
      </div>
    </footer>
  )
}
