import React, { useState } from 'react';
import { X, Send, AlertCircle, CheckCircle2, ShieldCheck, Link2, MessageSquare, Video, User } from 'lucide-react';
import { SocialPlatform } from '../types/index.ts';
import { validateReportInput } from '../utils/factCheckEngine.ts';

interface SubmitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    reporterName?: string;
    platform: SocialPlatform;
    claim: string;
    evidenceUrl: string;
  }) => Promise<void>;
}

export const SubmitModal: React.FC<SubmitModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [claim, setClaim] = useState('');
  const [evidenceUrl, setEvidenceUrl] = useState('');
  const [platform, setPlatform] = useState<SocialPlatform>('TikTok');
  const [reporterName, setReporterName] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const validation = validateReportInput({ claim, evidenceUrl, platform });
    if (!validation.valid) {
      setErrors(validation.errors);
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        claim,
        evidenceUrl,
        platform,
        reporterName: isAnonymous ? 'Anonim' : reporterName.trim() || 'Anonim',
      });
      setSuccessMessage('Laporan Anda berhasil dikirim! Tim kurator medis akan segera memverifikasinya.');
      setTimeout(() => {
        setSuccessMessage(null);
        setClaim('');
        setEvidenceUrl('');
        setReporterName('');
        onClose();
      }, 1800);
    } catch (err: any) {
      setErrors({ form: err.message || 'Gagal mengirim laporan. Coba lagi.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const platforms: SocialPlatform[] = [
    'TikTok',
    'Instagram',
    'Twitter/X',
    'YouTube',
    'WhatsApp',
    'Facebook',
    'Lainnya',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-8">
        {/* Header */}
        <div className="p-6 pb-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-teal-50 dark:bg-teal-950/70 text-teal-600 dark:text-teal-400 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-snug">
                Lapor Tren Kesehatan Viral
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Bantu lindungi remaja dari paparan mitos berbahaya
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

        {/* Success Overlay State */}
        {successMessage ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10 animate-scale-up" />
            </div>
            <h4 className="text-lg font-bold text-slate-900 dark:text-white">Terima Kasih, Pejuang Fakta!</h4>
            <p className="text-sm text-slate-600 dark:text-slate-300 max-w-sm mx-auto">
              {successMessage}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {errors.form && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300 flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errors.form}</span>
              </div>
            )}

            {/* Platform Selection */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center space-x-1.5">
                <Video className="w-3.5 h-3.5 text-teal-600" />
                <span>Platform Media Sosial <span className="text-rose-500">*</span></span>
              </label>
              <select
                value={platform}
                onChange={(e) => setPlatform(e.target.value as SocialPlatform)}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                {platforms.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
              {errors.platform && <p className="text-[11px] text-rose-500 mt-1">{errors.platform}</p>}
            </div>

            {/* Claim Field */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center space-x-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-teal-600" />
                <span>Klaim Kesehatan Viral <span className="text-rose-500">*</span></span>
              </label>
              <textarea
                value={claim}
                onChange={(e) => setClaim(e.target.value)}
                rows={3}
                placeholder="Contoh: Meneteskan perasan jeruk nipis ke mata bisa menjernihkan penglihatan..."
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
              {errors.claim && <p className="text-[11px] text-rose-500 mt-1">{errors.claim}</p>}
            </div>

            {/* Evidence URL */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center space-x-1.5">
                <Link2 className="w-3.5 h-3.5 text-teal-600" />
                <span>Link Video / Bukti Postingan <span className="text-rose-500">*</span></span>
              </label>
              <input
                type="url"
                value={evidenceUrl}
                onChange={(e) => setEvidenceUrl(e.target.value)}
                placeholder="https://tiktok.com/@creator/video/123456789 atau https://instagram.com/reel/..."
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
              {errors.evidenceUrl && (
                <p className="text-[11px] text-rose-500 mt-1">{errors.evidenceUrl}</p>
              )}
            </div>

            {/* Reporter Name */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center space-x-1.5">
                  <User className="w-3.5 h-3.5 text-teal-600" />
                  <span>Nama Pelapor (Opsional)</span>
                </label>
                <label className="flex items-center space-x-1.5 cursor-pointer text-xs text-slate-500">
                  <input
                    type="checkbox"
                    checked={isAnonymous}
                    onChange={(e) => setIsAnonymous(e.target.checked)}
                    className="rounded text-teal-600 focus:ring-teal-500"
                  />
                  <span>Kirim sebagai Anonim</span>
                </label>
              </div>
              <input
                type="text"
                disabled={isAnonymous}
                value={isAnonymous ? '' : reporterName}
                onChange={(e) => setReporterName(e.target.value)}
                placeholder={isAnonymous ? 'Pelapor Anonim' : 'Nama atau inisial Anda'}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:opacity-50"
              />
            </div>

            {/* Submit Action */}
            <div className="pt-2 flex items-center justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2.5 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-semibold text-xs rounded-xl shadow-md flex items-center space-x-2 disabled:opacity-50 active:scale-95 transition-all"
              >
                {isSubmitting ? (
                  <span>Mengirim...</span>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Kirim Laporan</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
