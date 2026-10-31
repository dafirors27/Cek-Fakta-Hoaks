import React, { useState, useMemo } from 'react';
import {
  Search,
  ExternalLink,
  ShieldAlert,
  BookOpen,
  Share2,
  Check,
  Filter,
  PlusCircle,
  Video,
  UserCheck,
  Sparkles,
  Info
} from 'lucide-react';
import { ReportItem, ReportStatus, SocialPlatform } from '../types/index.ts';
import { filterReports, getStatusBadgeConfig, formatIndonesianDate } from '../utils/factCheckEngine.ts';

interface FeedPublicProps {
  reports: ReportItem[];
  onOpenSubmit: () => void;
  onSelectClaimForSearch?: (term: string) => void;
}

export const FeedPublic: React.FC<FeedPublicProps> = ({ reports, onOpenSubmit }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('SEMUA');
  const [selectedPlatform, setSelectedPlatform] = useState<string>('SEMUA');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // In the public feed, by default show verified items (FAKTA, HOAKS, MISINFORMASI)
  // But if the user clicks "Semua", show all verified trends. We only filter out MENUNGGU from public feed as per requirement:
  // "Menampilkan daftar tren kesehatan viral yang sudah diverifikasi oleh admin."
  const verifiedReports = useMemo(() => {
    return reports.filter((r) => r.status !== 'MENUNGGU' && r.status !== 'DITOLAK');
  }, [reports]);

  // Live filter
  const filteredReports = useMemo(() => {
    return filterReports(verifiedReports, searchQuery, selectedStatus, selectedPlatform);
  }, [verifiedReports, searchQuery, selectedStatus, selectedPlatform]);

  const handleShare = (report: ReportItem) => {
    const text = `[${report.status}] Cek Fakta HealthCheck Youth:\n"${report.claim}"\n\nPenjelasan Medis: ${report.medicalExplanation}\nSumber: ${report.referenceUrl || 'HealthCheck Youth'}`;
    navigator.clipboard.writeText(text);
    setCopiedId(report.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const platforms: SocialPlatform[] = ['TikTok', 'Instagram', 'Twitter/X', 'YouTube', 'WhatsApp'];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-teal-500/10 via-emerald-500/5 to-transparent pt-10 pb-8 px-4 sm:px-6 lg:px-8 border-b border-slate-200/60 dark:border-slate-800/60">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-teal-100 dark:bg-teal-950/70 text-teal-800 dark:text-teal-300 text-xs font-semibold mb-4 border border-teal-200 dark:border-teal-800">
            <Sparkles className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
            <span>Anti-Misinformasi Kesehatan Generasi Muda</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-3">
            Saring Fakta, Tangkal <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-emerald-600">Hoaks Viral</span>
          </h1>

          <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base max-w-2xl mx-auto mb-8 leading-relaxed">
            Pusat verifikasi ilmiah untuk tren diet, suplemen, obat herbal, dan klaim medis viral di TikTok, Instagram, & X yang ditelaah langsung oleh pakar medis dan AI Gemini.
          </p>

          {/* Live Search Input */}
          <div className="relative max-w-2xl mx-auto shadow-lg shadow-teal-500/5 rounded-2xl">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
              <Search className="w-5 h-5" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder='Cari klaim (misal: "diet air putih", "bawang putih", "sunscreen")...'
              className="w-full pl-11 pr-24 py-3.5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm sm:text-base text-slate-900 dark:text-white placeholder-slate-400 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-3 my-auto h-7 px-2.5 text-xs font-medium text-slate-500 hover:text-slate-700 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 rounded-lg"
              >
                Reset
              </button>
            )}
          </div>

          {/* Quick Trending Tags */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-4 text-xs text-slate-500 dark:text-slate-400">
            <span className="font-semibold text-slate-700 dark:text-slate-300">Tren Populer:</span>
            {['Daun Sirih', 'Diet Air Putih', 'Sunscreen', 'Kopi Lemon', 'Bawang Putih'].map((tag) => (
              <button
                key={tag}
                onClick={() => setSearchQuery(tag)}
                className="px-2.5 py-1 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-teal-400 dark:hover:border-teal-500 transition-colors cursor-pointer"
              >
                #{tag}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        {/* Filter Controls Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-200 dark:border-slate-800">
          {/* Status Filter Tabs */}
          <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            {[
              { id: 'SEMUA', label: 'Semua Fakta & Hoaks', icon: null },
              { id: 'FAKTA', label: '✅ Fakta', count: verifiedReports.filter((r) => r.status === 'FAKTA').length },
              { id: 'HOAKS', label: '❌ Hoaks', count: verifiedReports.filter((r) => r.status === 'HOAKS').length },
              { id: 'MISINFORMASI', label: '⚠️ Misinformasi', count: verifiedReports.filter((r) => r.status === 'MISINFORMASI').length },
            ].map((tab) => {
              const active = selectedStatus === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setSelectedStatus(tab.id)}
                  className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all ${
                    active
                      ? 'bg-slate-900 text-white dark:bg-teal-500 dark:text-slate-950 shadow-sm'
                      : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {tab.label}
                  {tab.count !== undefined && (
                    <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] ${active ? 'bg-white/20' : 'bg-slate-100 dark:bg-slate-800 text-slate-600'}`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Platform Filter Dropdown & Submit Prompt */}
          <div className="flex items-center space-x-2 self-end sm:self-auto">
            <div className="flex items-center space-x-1 text-xs text-slate-500 dark:text-slate-400">
              <Filter className="w-3.5 h-3.5" />
              <span>Platform:</span>
            </div>
            <select
              value={selectedPlatform}
              onChange={(e) => setSelectedPlatform(e.target.value)}
              className="text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-teal-500 font-medium text-slate-700 dark:text-slate-300"
            >
              <option value="SEMUA">Semua Platform</option>
              {platforms.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Results Counter */}
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-4 px-1">
          <span>
            Menampilkan <strong className="text-slate-800 dark:text-slate-200">{filteredReports.length}</strong> tren kesehatan terverifikasi
            {searchQuery && ` untuk pencarian "${searchQuery}"`}
          </span>
          <button
            onClick={onOpenSubmit}
            className="inline-flex items-center space-x-1 text-teal-600 dark:text-teal-400 hover:underline font-semibold"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Ada video mencurigakan? Laporkan disini</span>
          </button>
        </div>

        {/* Feed Cards Grid */}
        {filteredReports.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filteredReports.map((report) => {
              const badge = getStatusBadgeConfig(report.status);

              return (
                <article
                  key={report.id}
                  className="group relative bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-sm hover:shadow-md transition-all flex flex-col justify-between overflow-hidden"
                >
                  {/* Top Badge & Metadata */}
                  <div className="p-5 sm:p-6 pb-3">
                    <div className="flex items-start justify-between gap-3 mb-3.5">
                      <div className="flex flex-wrap items-center gap-2">
                        {/* Status Badge */}
                        <span
                          className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold border ${badge.bgColor}`}
                        >
                          <span>{badge.icon}</span>
                          <span>{badge.label}</span>
                        </span>

                        {/* Platform Tag */}
                        <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          <Video className="w-3 h-3 text-slate-500" />
                          <span>{report.platform}</span>
                        </span>

                        {report.category && (
                          <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 hidden sm:inline">
                            • {report.category}
                          </span>
                        )}
                      </div>

                      {/* Share Button */}
                      <button
                        onClick={() => handleShare(report)}
                        className="text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        title="Salin ringkasan fakta ke clipboard"
                        aria-label="Bagikan fakta"
                      >
                        {copiedId === report.id ? (
                          <Check className="w-4 h-4 text-emerald-500" />
                        ) : (
                          <Share2 className="w-4 h-4" />
                        )}
                      </button>
                    </div>

                    {/* Viral Claim */}
                    <blockquote className="mb-4">
                      <p className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-snug tracking-tight">
                        &ldquo;{report.claim}&rdquo;
                      </p>
                    </blockquote>

                    {/* Medical Explanation */}
                    {report.medicalExplanation && (
                      <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-3.5 mb-4 border border-slate-100 dark:border-slate-800">
                        <div className="flex items-center space-x-1.5 text-xs font-bold text-teal-700 dark:text-teal-400 mb-1.5">
                          <BookOpen className="w-3.5 h-3.5" />
                          <span>Penjelasan Medis:</span>
                        </div>
                        <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                          {report.medicalExplanation}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Card Footer: Links & Reviewer Verification */}
                  <div className="px-5 sm:px-6 py-3.5 bg-slate-50/70 dark:bg-slate-900/60 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
                    <div className="flex items-center space-x-3">
                      {report.referenceUrl && (
                        <a
                          href={report.referenceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center space-x-1 font-semibold text-teal-600 hover:text-teal-700 dark:text-teal-400 hover:underline"
                        >
                          <BookOpen className="w-3.5 h-3.5" />
                          <span>Sumber Referensi</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}

                      {report.evidenceUrl && (
                        <a
                          href={report.evidenceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center space-x-1 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                        >
                          <Video className="w-3.5 h-3.5" />
                          <span>Video Bukti</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>

                    {report.reviewedBy && (
                      <div className="flex items-center space-x-1 text-[11px] text-slate-500 dark:text-slate-400">
                        <UserCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                        <span className="truncate max-w-[140px]">{report.reviewedBy}</span>
                      </div>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 p-12 text-center max-w-lg mx-auto">
            <div className="w-12 h-12 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto mb-3">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
              Tidak Ada Tren yang Cocok
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-5 leading-relaxed">
              Klaim dengan kata kunci &ldquo;{searchQuery}&rdquo; belum ada di feed kami. Kamu bisa melaporkannya agar tim dokter kami verifikasi!
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2">
              <button
                onClick={() => setSearchQuery('')}
                className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded-xl"
              >
                Hapus Pencarian
              </button>
              <button
                onClick={onOpenSubmit}
                className="px-4 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow-sm"
              >
                Lapor Tren Ini Sekarang
              </button>
            </div>
          </div>
        )}

        {/* Education Callout Banner */}
        <section className="mt-12 bg-gradient-to-r from-teal-700 to-emerald-800 text-white rounded-3xl p-6 sm:p-8 shadow-lg flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-white/10 text-xs font-semibold text-teal-100 backdrop-blur-sm">
              <Info className="w-3.5 h-3.5" />
              <span>Cerdas Bermedia Sosial</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
              Menemukan Video Kesehatan yang Janggal?
            </h2>
            <p className="text-teal-100 text-xs sm:text-sm max-w-xl leading-relaxed">
              Jangan langsung dicoba! Laporkan URL video TikTok atau Reel Instagram tersebut ke HealthCheck Youth. Tim medis kami bersama kecerdasan buatan Gemini akan membedah kebenarannya.
            </p>
          </div>
          <button
            onClick={onOpenSubmit}
            className="whitespace-nowrap px-6 py-3 bg-white text-teal-800 hover:bg-teal-50 font-bold text-sm rounded-2xl shadow-md transition-transform active:scale-95 flex items-center space-x-2"
          >
            <PlusCircle className="w-5 h-5 text-teal-600" />
            <span>Kirim Laporan Tren</span>
          </button>
        </section>
      </main>
    </div>
  );
};
