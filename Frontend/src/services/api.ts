import axios from 'axios';

// @ts-ignore
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const uploadReports = async (currentReport: File, previousReport?: File | null) => {
  const formData = new FormData();
  formData.append('current_report', currentReport);

  if (previousReport) {
    formData.append('previous_report', previousReport);
  }

  const response = await api.post('/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data;
};

export const exportPdf = async (analysisData: any, language: string = "English", forceRegenerate: boolean = false) => {
  const payload = {
    patient_age: analysisData.structured_data?.patient_info?.age || 30,
    patient_gender: analysisData.structured_data?.patient_info?.gender || "Unknown",
    tests: analysisData.tests || {},
    analytics: analysisData.dynamic_analysis || {},
    alert: analysisData.dynamic_analysis?.analysis_summary || {},
    confidence: { ai_confidence: 0.95, extraction_quality: "High" },
    explanation: forceRegenerate ? "" : (analysisData.explanation || analysisData.dynamic_analysis?.priority_list?.[0]?.reason || "Analysis completed."),
    priority_list: analysisData.dynamic_analysis?.priority_list || [],
    trend: analysisData.trend || null,
    language: language,
    mode: "patient"
  };

  const response = await api.post('/generate-pdf', payload, {
    responseType: 'blob',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  return response.data; // This is a Blob
};

export default api;
