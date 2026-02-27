/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import LandingPage from "./pages/LandingPage"
import LoginPage from "./pages/LoginPage"
import SignupPage from "./pages/SignupPage"
import { DashboardLayout } from "./components/layout/DashboardLayout"
import DashboardPage from "./pages/DashboardPage"
import UploadPage from "./pages/UploadPage"
import AnalysisPage from "./pages/AnalysisPage"
import SettingsPage from "./pages/SettingsPage"
import MyReportsPage from "./pages/MyReportsPage"
import FamilyHubPage from "./pages/FamilyHubPage"
import AIAssistantPage from "./pages/AIAssistantPage"
import { AuthProvider } from "./contexts/AuthContext"

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />

          {/* Protected Routes (simulated with layout) */}
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/upload" element={<UploadPage />} />
            <Route path="/analysis" element={<AnalysisPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/reports" element={<MyReportsPage />} />
            <Route path="/family" element={<FamilyHubPage />} />
            <Route path="/assistant" element={<AIAssistantPage />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  )
}
