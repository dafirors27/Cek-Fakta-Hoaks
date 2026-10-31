import React, { useState, useEffect } from 'react';
import {
  X,
  Sparkles,
  Save,
  ExternalLink,
  BookOpen,
  AlertTriangle,
  CheckCircle,
  HelpCircle,
  Stethoscope,
  Loader2,
  Video,
  ShieldCheck,
  Check
} from 'lucide-react';
import { ReportItem, ReportStatus } from '../types/index.ts';
import { analyzeWithGemini } from '../services/api.ts';

interface ReviewModalProps {
  isOpen: boolean;
  report: ReportItem | null;
  onClose: () => void;
  onSave: (
    id: string,
    data: {
      status: ReportStatus;
      medicalExplanation: string;
      referenceUrl: string;
      reviewedBy?: string;
    }
  ) => Promise<void>;
}

export const ReviewModal: React.FC<ReviewModalProps> = ({
  isOpen,
  report,
  onClose,
  onSave,
}) => {
  const [status, setStatus] = useState<ReportStatus>('HOAKS');
  const [medicalExplanation, setMedicalExplanation] = useState('');
  const [referenceUrl, setReferenceUrl] = useState('');
  const [reviewerName, setReviewerName] = useState('dr. Sarah (Pakar Medis HealthCheck)');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [aiAnalysisLog, setAiAnalysisLog] = useState<{
    riskLevel?: string;
    keyPoints?: string[];
  } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (report) {
      setStatus(report.status === 'MENUNGGU' ? 'HOAKS' : report.status);
      setMedicalExplanation(report.medicalExplanation || '');
      setReferenceUrl(report.referenceUrl || '');
      setReviewerName(report.reviewedBy || 'dr. Sarah (Pakar Medis HealthCheck)');
      setAiAnalysisLog(null);
      setErrorMessage(null);
    }
  }, [report]);

  if (!isOpen || !report) return null;

  // Star feature: Automatic Gemini Fact-Checking
  const handleRunGeminiAnalysis = async () => {
    setIsAnalyzing(true);
    setErrorMessage(null);
    try {
      const result = await analyzeWithGemini(report.claim, report.evidenceUrl, report.platform);
      
      // Auto-fill form fields directly
      setStatus(result.status as ReportStatus);
      setMedicalExplanation(result.medicalExplanation);
      setReferenceUrl(result.referenceUrl);
      setAiAnalysisLog({
        riskLevel: result.riskLevel,
        keyPoints: result.keyPoints,
      });
    } catch (err: any) {
      setErrorMessage(err.message || 'Analisis Gemini gagal. Anda tetap dapat mengisi form secara manual.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleFormSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!medicalExplanation.trim()) {
      setErrorMessage('Penjelasan medis wajib diisi sebelum menyimpan hasil verifikasi.');
      return;
    }

    setIsSaving(true);
    setErrorMessage(null);
    try {
      await onSave(report.id, {
        status,
        medicalExplanation: medicalExplanation.trim(),
        referenceUrl: referenceUrl.trim() || 'https://kemkes.go.id',
        reviewedBy: reviewerName.trim() || 'Admin HealthCheck',
      });
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Gagal menyimpan review.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-8">
        {/* Header */}
        <div className="p-6 pb-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950/70 text-teal-600 dark:text-teal-400 flex items-center justify-center">
              <Stethoscope className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-snug">
                Panel Verifikasi Medis
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Laporan #{report.id} • Sumber: {report.platform} • Pelapor: {report.reporterName}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleFormSave} className="p-6 space-y-5">
          {/* Claim Summary Box */}
          <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <span className="font-semibold text-slate-700 dark:text-slate-300">Teks Klaim yang Dilaporkan:</span>
              {report.evidenceUrl && (
                <a
                  href={report.evidenceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-1 font-semibold text-teal-600 dark:text-teal-400 hover:underline"
                >
                  <Video className="w-3.5 h-3.5" />
                  <span>Buka Video Bukti Asli</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
            <p className="text-sm sm:text-base font-bold text-slate-900 dark:text-white leading-relaxed">
              &ldquo;{report.claim}&rdquo;
            </p>
          </div>

          {/* AI Fact Checker Highlight Trigger */}
          <div className="bg-gradient-to-r from-teal-500/10 via-emerald-500/10 to-transparent p-4 rounded-2xl border border-teal-200/80 dark:border-teal-800/80 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="space-y-0.5 text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start space-x-1.5 text-xs font-extrabold text-teal-700 dark:text-teal-400">
                <Sparkles className="w-4 h-4 text-teal-600 animate-spin-slow" />
                <span>Fitur Bintang: Gemini Fact-Checker Medis</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                Analisis literatur medis otomatis, penentuan status fakta/hoaks, dan pencarian sumber ilmiah.
              </p>
            </div>

            <button
              type="button"
              onClick={handleRunGeminiAnalysis}
              disabled={isAnalyzing}
              className="shrink-0 w-full sm:w-auto px-4 py-2.5 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center space-x-2 disabled:opacity-50 transition-all active:scale-95"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Menganalisis Medis...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>✨ Analisis Otomatis (Gemini AI)</span>
                </>
              )}
            </button>
          </div>

          {/* AI Log Notification */}
          {aiAnalysisLog && (
            <div className="p-3.5 rounded-xl bg-teal-50 dark:bg-teal-950/50 border border-teal-200 dark:border-teal-800 text-xs text-teal-900 dark:text-teal-200 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold flex items-center space-x-1 text-teal-700 dark:text-teal-300">
                  <Check className="w-3.5 h-3.5" />
                  <span>Analisis AI Berhasil Diisikan ke Form:</span>
                </span>
                {aiAnalysisLog.riskLevel && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-200/80 dark:bg-teal-800 text-teal-800 dark:text-teal-100">
                    Risiko: {aiAnalysisLog.riskLevel}
                  </span>
                )}
              </div>
              {aiAnalysisLog.keyPoints && aiAnalysisLog.keyPoints.length > 0 && (
                <ul className="list-disc pl-4 space-y-0.5 text-slate-600 dark:text-slate-300">
                  {aiAnalysisLog.keyPoints.map((pt, idx) => (
                    <li key={idx}>{pt}</li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300 flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Status Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
              Ubah Status Verifikasi:
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              {[
                {
                  id: 'FAKTA',
                  label: 'FAKTA',
                  icon: '✅',
                  color: 'border-emerald-500 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300',
                  inactive: 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400',
                },
                {
                  id: 'HOAKS',
                  label: 'HOAKS',
                  icon: '❌',
                  color: 'border-rose-500 bg-rose-50 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300',
                  inactive: 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400',
                },
                {
                  id: 'MISINFORMASI',
                  label: 'MISINFORMASI',
                  icon: '⚠️',
                  color: 'border-amber-500 bg-amber-50 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300',
                  inactive: 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400',
                },
              ].map((opt) => {
                const isSelected = status === opt.id;
                return (
                  <button
                    type="button"
                    key={opt.id}
                    onClick={() => setStatus(opt.id as ReportStatus)}
                    className={`py-2.5 px-3 rounded-xl text-xs font-bold border-2 flex items-center justify-center space-x-1.5 transition-all ${
                      isSelected ? opt.color : opt.inactive
                    }`}
                  >
                    <span>{opt.icon}</span>
                    <span>{opt.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Medical Explanation Textarea */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center space-x-1.5">
              <BookOpen className="w-3.5 h-3.5 text-teal-600" />
              <span>Penjelasan Medis Rasional (Bahasa ramah remaja):</span>
            </label>
            <textarea
              rows={4}
              value={medicalExplanation}
              onChange={(e) => setMedicalExplanation(e.target.value)}
              placeholder="Jelaskan dasar medis mengapa ini hoaks/fakta dan apa dampaknya jika dipraktikkan..."
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 leading-relaxed"
            />
          </div>

          {/* Reference Link Input */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center space-x-1.5">
              <ExternalLink className="w-3.5 h-3.5 text-teal-600" />
              <span>Link Sumber Referensi Ilmiah (Kemenkes / WHO / PubMed):</span>
            </label>
            <input
              type="url"
              value={referenceUrl}
              onChange={(e) => setReferenceUrl(e.target.value)}
              placeholder="https://kemkes.go.id/... atau https://who.int/..."
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          {/* Reviewer signature */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Nama / Gelar Reviewer:
            </label>
            <input
              type="text"
              value={reviewerName}
              onChange={(e) => setReviewerName(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-700 dark:text-slate-300"
            />
          </div>

          {/* Form Actions */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 dark:bg-teal-500 dark:hover:bg-teal-600 dark:text-slate-950 text-white font-bold text-xs rounded-xl shadow-md flex items-center space-x-2 disabled:opacity-50 active:scale-95 transition-all"
            >
              {isSaving ? (
                <span>Menyimpan...</span>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  <span>Simpan & Publikasikan Hasil</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
