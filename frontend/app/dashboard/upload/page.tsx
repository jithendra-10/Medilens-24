"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import UploadZone from "@/components/upload/UploadZone";
import { ArrowRight, ShieldCheck, FileText, Loader2, ArrowLeft, Users, UserCircle } from "lucide-react";
import { motion } from "motion/react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";

export default function DashboardUploadPage() {
  const { getToken } = useAuth();
  const [currentReport, setCurrentReport] = useState<File | null>(null);
  const [previousReport, setPreviousReport] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const router = useRouter();

  const [showProfilePrompt, setShowProfilePrompt] = useState(false);
  const [detectedPatient, setDetectedPatient] = useState<any>(null);
  const [analyzedData, setAnalyzedData] = useState<any>(null);

  const [profiles, setProfiles] = useState<any[]>([]);
  const [isLoadingProfiles, setIsLoadingProfiles] = useState(false);

  const apiUrl = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8001/api").replace(/\/$/, "");

  // Fetch profiles when the component mounts so they are ready for the modal
  useEffect(() => {
    const fetchProfiles = async () => {
      setIsLoadingProfiles(true);
      try {
        const token = await getToken();
        const res = await fetch(`${apiUrl}/profiles`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setProfiles(data);
        }
      } catch (error) {
        console.error("Failed to fetch profiles:", error);
      } finally {
        setIsLoadingProfiles(false);
      }
    };
    fetchProfiles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAnalyze = async () => {
    if (!currentReport) return;
    setIsProcessing(true);

    try {
      const formData = new FormData();
      formData.append("current_report", currentReport);

      if (previousReport) {
        formData.append("previous_report", previousReport);
      }

      const token = await getToken();

      const res = await fetch(`${apiUrl}/upload`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` },
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.detail || errorData.error || "Failed to analyze report");
      }

      const data = await res.json();
      setAnalyzedData(data); // Store for potential profile creation

      // The backend already saved the report! We just need the ID to link it later.
      if (data.report_id) {
        setDetectedPatient({
          name: data.patient_info?.name || data.patient_info?.["Patient Name"] || "Unknown Patient",
          age: data.patient_info?.age || data.patient_info?.["Age"],
          gender: data.patient_info?.gender || data.patient_info?.["Gender"],
          reportId: data.report_id
        });
        setShowProfilePrompt(true);
        setIsProcessing(false);
        return;
      } else {
        // Fallback: store result in localStorage and navigate to results if DB save failed
        localStorage.setItem("medilens_result", JSON.stringify(data));
        setIsProcessing(false);
        router.push("/dashboard/results");
      }
    } catch (error: any) {
      console.error(error);
      setIsProcessing(false);
      alert(error.message || "Error analyzing report. Please make sure the backend is running.");
    }
  };

  const handleCreateProfileAndProceed = async () => {
    try {
      const token = await getToken();

      // 1. Create the profile
      const res = await fetch(`${apiUrl}/profiles`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          name: detectedPatient.name,
          age: detectedPatient.age,
          gender: detectedPatient.gender
        }),
      });

      if (res.ok) {
        const profile = await res.json();
        const dashboardUrl = apiUrl + "/dashboard";
        // 2. Link the report to this new profile via PATCH
        await fetch(`${dashboardUrl}/reports/${detectedPatient.reportId}?profile_id=${profile.id}`, {
          method: "PATCH",
          headers: { "Authorization": `Bearer ${token}` }
        });
      }
    } finally {
      localStorage.setItem("medilens_result", JSON.stringify(analyzedData));
      router.push("/dashboard/results");
    }
  };

  const handleAssignToProfile = async (profileId: string) => {
    try {
      const token = await getToken();
      const dashboardUrl = apiUrl + "/dashboard";

      // Link the report to the selected EXISTING profile via PATCH
      await fetch(`${dashboardUrl}/reports/${detectedPatient.reportId}?profile_id=${profileId}`, {
        method: "PATCH",
        headers: { "Authorization": `Bearer ${token}` }
      });
    } catch (err) {
      console.error("Failed to link to profile:", err);
    } finally {
      localStorage.setItem("medilens_result", JSON.stringify(analyzedData));
      router.push("/dashboard/results");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-4xl mx-auto"
    >
      <div className="mb-8">
        <Link href="/dashboard" className="inline-flex items-center text-slate-500 hover:text-blue-600 transition-colors mb-4">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Dashboard
        </Link>
        <h1 className="text-3xl font-bold text-slate-900">Upload Your Lab Report</h1>
        <p className="mt-2 text-slate-600">
          We'll analyze your report securely and provide simple, actionable insights.
        </p>
      </div>

      <div className="neo-glass rounded-2xl border border-slate-200 overflow-hidden">
        <div className="p-8 space-y-8">
          {/* Upload Sections */}
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="bg-blue-100 p-1.5 rounded-md text-blue-600">
                  <FileText className="h-4 w-4" />
                </div>
                <h3 className="font-semibold text-slate-900">Current Report</h3>
              </div>
              <UploadZone
                label="Upload your latest lab report"
                onFileSelect={setCurrentReport}
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="bg-purple-100 p-1.5 rounded-md text-purple-600">
                  <FileText className="h-4 w-4" />
                </div>
                <h3 className="font-semibold text-slate-900">Previous Report (Optional)</h3>
              </div>
              <UploadZone
                label="Upload a past report for comparison"
                onFileSelect={setPreviousReport}
              />
              <p className="text-xs text-slate-500">
                Uploading a previous report allows us to show you trends and improvements over time.
              </p>
            </div>
          </div>

          {/* Security Note */}
          <div className="bg-emerald-50/80 border border-emerald-100 rounded-xl p-4 flex items-start gap-3">
            <ShieldCheck className="h-5 w-5 text-emerald-600 mt-0.5" />
            <div>
              <h4 className="text-sm font-semibold text-emerald-800">Your data is secure</h4>
              <p className="text-xs text-emerald-700 mt-1">
                We use bank-level encryption to process your files. Your reports are analyzed automatically and are not stored permanently without your permission.
              </p>
            </div>
          </div>
        </div>

        {/* Action Footer */}
        <div className="bg-slate-50/50 px-8 py-6 border-t border-slate-100 flex items-center justify-between">
          <Link href="/dashboard">
            <Button variant="ghost" className="text-slate-600 hover:bg-slate-100">Cancel</Button>
          </Link>
          <Button
            onClick={handleAnalyze}
            disabled={!currentReport || isProcessing}
            className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/20 px-8 h-11 rounded-xl transition-all hover:scale-105"
          >
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                Analyze Report
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Profile Prompt Modal */}
      {showProfilePrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
            onClick={() => router.push("/dashboard/results")}
          />
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            className="relative w-full max-w-lg liquid-glass bg-white p-10 rounded-[3.5rem] shadow-2xl border-white/40 flex flex-col max-h-[90vh]"
          >
            <div className="text-center mb-6">
              <div className="w-20 h-20 rounded-[2rem] bg-blue-50 flex items-center justify-center mx-auto mb-6 shadow-inner border border-blue-100">
                <FileText className="w-8 h-8 text-blue-600" />
              </div>

              <h2 className="text-2xl font-black text-slate-900 mb-2 tracking-tight">Report Analyzed</h2>
              <p className="text-slate-500 text-sm px-4">
                We extracted the following patient details from the report. Who does this report belong to?
              </p>
            </div>

            {/* Extracted Card */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 mb-6 text-left flex items-center gap-4 shadow-sm">
              <div className="bg-white p-3 rounded-xl shadow-sm border border-slate-100">
                <Users className="w-6 h-6 text-slate-400" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-0.5">Extracted Name</p>
                <p className="text-lg font-bold text-slate-900">{detectedPatient?.name}</p>
                <p className="text-sm text-slate-500">
                  {detectedPatient?.age ? `${detectedPatient.age} years` : "Age unknown"} • {detectedPatient?.gender || "Gender unknown"}
                </p>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 -mr-2 space-y-3 mb-6 custom-scrollbar">
              <h3 className="text-sm font-semibold text-slate-900 mb-3 px-1">Assign to Family Member:</h3>

              {isLoadingProfiles ? (
                <div className="text-center py-4 bg-slate-50 rounded-xl border border-slate-100 border-dashed">
                  <Loader2 className="w-5 h-5 animate-spin mx-auto text-slate-400 mb-2" />
                  <p className="text-sm text-slate-500">Loading family members...</p>
                </div>
              ) : (
                profiles.map((profile) => (
                  <button
                    key={profile.id}
                    onClick={() => handleAssignToProfile(profile.id)}
                    className="w-full text-left p-4 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 transition-all flex items-center gap-3 group bg-white shadow-sm"
                  >
                    <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">
                      <UserCircle className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-slate-900">{profile.name}</p>
                      <p className="text-xs text-slate-500">{profile.relation || "Family Member"} • {profile.age} years old</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
                  </button>
                ))
              )}

              <button
                onClick={handleCreateProfileAndProceed}
                className="w-full text-left p-4 rounded-xl border-2 border-dashed border-primary/30 hover:border-primary/60 hover:bg-primary/5 transition-all flex items-center gap-3 group mt-2"
              >
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                  <span className="text-xl font-medium">+</span>
                </div>
                <div>
                  <p className="font-semibold text-primary">Create New Profile</p>
                  <p className="text-xs text-primary/70">For {detectedPatient?.name}</p>
                </div>
              </button>
            </div>

            <div className="pt-4 border-t border-slate-100 mt-auto">
              <Button
                variant="ghost"
                onClick={() => {
                  localStorage.setItem("medilens_result", JSON.stringify(analyzedData));
                  router.push("/dashboard/results");
                }}
                className="w-full h-12 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 font-medium"
              >
                Skip Assignment (View Report Only)
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}
