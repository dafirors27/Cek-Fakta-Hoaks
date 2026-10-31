import { ReportItem, AIAnalysisResponse } from '../types/index.ts';

export async function fetchReports(): Promise<ReportItem[]> {
  try {
    const res = await fetch('/api/reports');
    if (!res.ok) throw new Error('Gagal mengambil data laporan');
    const data = await res.json();
    return data.data || [];
  } catch (err) {
    console.warn('API error, using cached data:', err);
    return [];
  }
}

export async function submitReport(payload: {
  reporterName?: string;
  platform: string;
  claim: string;
  evidenceUrl: string;
}): Promise<ReportItem> {
  const res = await fetch('/api/reports', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || 'Gagal mengirim laporan');
  }
  const data = await res.json();
  return data.data;
}

export async function updateReportReview(
  id: string,
  payload: {
    status: string;
    medicalExplanation: string;
    referenceUrl: string;
    reviewedBy?: string;
  }
): Promise<ReportItem> {
  const res = await fetch(`/api/reports/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || 'Gagal menyimpan hasil verifikasi');
  }
  const data = await res.json();
  return data.data;
}

export async function deleteReport(id: string): Promise<boolean> {
  const res = await fetch(`/api/reports/${id}`, {
    method: 'DELETE',
  });
  return res.ok;
}

export async function analyzeWithGemini(claim: string, evidenceUrl: string, platform?: string): Promise<AIAnalysisResponse> {
  const res = await fetch('/api/gemini/analyze-claim', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ claim, evidenceUrl, platform }),
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || 'Gagal menganalisis dengan AI');
  }
  const data = await res.json();
  return data.data;
}

export async function getAppsScriptCode(): Promise<string> {
  const res = await fetch('/api/apps-script-code');
  const data = await res.json();
  return data.code;
}

export async function testSheetsConnection(appsScriptUrl: string) {
  const res = await fetch('/api/config/sheets', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ appsScriptUrl }),
  });
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || 'Koneksi gagal');
  }
  return data;
}

export async function triggerSheetsSync() {
  const res = await fetch('/api/sync-sheets', {
    method: 'POST',
  });
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || 'Sinkronisasi gagal');
  }
  return data;
}
