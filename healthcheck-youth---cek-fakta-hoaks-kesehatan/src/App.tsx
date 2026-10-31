import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header.tsx';
import { FeedPublic } from './components/FeedPublic.tsx';
import { AdminDashboard } from './components/AdminDashboard.tsx';
import { SubmitModal } from './components/SubmitModal.tsx';
import { ReviewModal } from './components/ReviewModal.tsx';
import { GoogleSheetsModal } from './components/GoogleSheetsModal.tsx';
import { ReportItem, ReportStatus, SocialPlatform } from './types/index.ts';
import { fetchReports, submitReport, updateReportReview, deleteReport } from './services/api.ts';
import { INITIAL_REPORTS } from './data/initialReports.ts';
import { Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';

export default function App() {
  // Determine initial view from URL path or search query (?view=admin or /admin.html)
  const getInitialView = (): 'public' | 'admin' => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname;
      const search = window.location.search;
      if (path.includes('admin') || search.includes('view=admin')) {
        return 'admin';
      }
    }
    return 'public';
  };

  const [currentView, setCurrentView] = useState<'public' | 'admin'>(getInitialView);
  const [reports, setReports] = useState<ReportItem[]>(INITIAL_REPORTS);
  const [loading, setLoading] = useState(true);
  const [sheetsConnected, setSheetsConnected] = useState(false);

  // Modals state
  const [isSubmitOpen, setIsSubmitOpen] = useState(false);
  const [selectedReviewReport, setSelectedReviewReport] = useState<ReportItem | null>(null);
  const [isSheetsOpen, setIsSheetsOpen] = useState(false);

  // Toast notifications
  const [toast, setToast] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ type, message });
    setTimeout(() => {
      setToast(null);
    }, 3500);
  };

  // Fetch reports on mount
  const loadReports = useCallback(async () => {
    try {
      const data = await fetchReports();
      if (data && data.length > 0) {
        setReports(data);
      }
    } catch (err) {
      console.warn('Using default reports:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadReports();
  }, [loadReports]);

  // Sync URL query when view changes
  const handleToggleView = (newView: 'public' | 'admin') => {
    setCurrentView(newView);
    if (typeof window !== 'undefined' && window.history) {
      const url = new URL(window.location.href);
      if (newView === 'admin') {
        url.searchParams.set('view', 'admin');
      } else {
        url.searchParams.delete('view');
      }
      window.history.replaceState({}, '', url.toString());
    }
    showToast(
      newView === 'admin'
        ? '🛡️ Selamat datang di Dashboard Admin!'
        : 'Berhasil kembali ke Halaman Publik',
      'info'
    );
  };

  // Public Report Submission
  const handleSubmitReport = async (data: {
    reporterName?: string;
    platform: SocialPlatform;
    claim: string;
    evidenceUrl: string;
  }) => {
    try {
      const created = await submitReport(data);
      setReports((prev) => [created, ...prev]);
      showToast('Laporan tren kesehatan Anda berhasil dikirim ke antrean review!');
    } catch (err: any) {
      showToast(err.message || 'Gagal mengirim laporan', 'error');
      throw err;
    }
  };

  // Admin Review Save
  const handleSaveReview = async (
    id: string,
    data: {
      status: ReportStatus;
      medicalExplanation: string;
      referenceUrl: string;
      reviewedBy?: string;
    }
  ) => {
    try {
      const updated = await updateReportReview(id, data);
      setReports((prev) => prev.map((r) => (r.id === id ? updated : r)));
      showToast(`Status laporan #${id} berhasil diverifikasi menjadi [${data.status}]!`);
    } catch (err: any) {
      showToast(err.message || 'Gagal menyimpan hasil verifikasi', 'error');
      throw err;
    }
  };

  // Admin Delete
  const handleDeleteReport = async (id: string) => {
    try {
      const ok = await deleteReport(id);
      if (ok) {
        setReports((prev) => prev.filter((r) => r.id !== id));
        showToast('Laporan berhasil dihapus');
      }
    } catch (err: any) {
      showToast(err.message || 'Gagal menghapus laporan', 'error');
    }
  };

  const pendingReportsCount = reports.filter((r) => r.status === 'MENUNGGU').length;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans selection:bg-teal-500 selection:text-white">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-bounce shadow-xl">
          <div
            className={`px-4 py-3 rounded-2xl flex items-center space-x-2.5 text-xs font-bold border backdrop-blur-md ${
              toast.type === 'success'
                ? 'bg-emerald-500 text-white border-emerald-400'
                : toast.type === 'info'
                ? 'bg-slate-900 text-white border-slate-700 dark:bg-teal-500 dark:text-slate-950'
                : 'bg-rose-500 text-white border-rose-400'
            }`}
          >
            {toast.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            ) : (
              <Sparkles className="w-4 h-4 shrink-0" />
            )}
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* Persistent Navigation Header with Easter Egg */}
      <Header
        currentView={currentView}
        onToggleView={handleToggleView}
        onOpenSubmit={() => setIsSubmitOpen(true)}
        onOpenSheets={() => setIsSheetsOpen(true)}
        sheetsConnected={sheetsConnected}
        pendingCount={pendingReportsCount}
      />

      {/* Main View: Public Feed or Admin Workspace */}
      {currentView === 'public' ? (
        <FeedPublic
          reports={reports}
          onOpenSubmit={() => setIsSubmitOpen(true)}
        />
      ) : (
        <AdminDashboard
          reports={reports}
          onOpenReview={(report) => setSelectedReviewReport(report)}
          onDeleteReport={handleDeleteReport}
          onRefresh={loadReports}
          onOpenSheetsModal={() => setIsSheetsOpen(true)}
          onOpenSubmitModal={() => setIsSubmitOpen(true)}
          sheetsConnected={sheetsConnected}
        />
      )}

      {/* Public Submit Modal */}
      <SubmitModal
        isOpen={isSubmitOpen}
        onClose={() => setIsSubmitOpen(false)}
        onSubmit={handleSubmitReport}
      />

      {/* Admin Review Modal with Gemini Fact-Checker */}
      <ReviewModal
        isOpen={selectedReviewReport !== null}
        report={selectedReviewReport}
        onClose={() => setSelectedReviewReport(null)}
        onSave={handleSaveReview}
      />

      {/* Google Sheets Headless CMS Modal */}
      <GoogleSheetsModal
        isOpen={isSheetsOpen}
        onClose={() => setIsSheetsOpen(false)}
        reports={reports}
        onRefreshReports={loadReports}
        sheetsConnected={sheetsConnected}
        onConnectionChange={(connected) => setSheetsConnected(connected)}
      />
    </div>
  );
}
