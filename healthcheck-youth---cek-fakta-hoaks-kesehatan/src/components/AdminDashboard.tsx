import React, { useState, useMemo } from 'react';
import {
  FileText,
  Clock,
  AlertOctagon,
  CheckCircle,
  AlertTriangle,
  Search,
  ExternalLink,
  Edit3,
  Trash2,
  RefreshCw,
  Database,
  Download,
  Filter,
  Video,
  Plus,
  ShieldCheck,
  Check,
  Sparkles
} from 'lucide-react';
import { ReportItem, ReportStatus, SocialPlatform } from '../types/index.ts';
import {
  calculateReportStats,
  filterReports,
  getStatusBadgeConfig,
  formatIndonesianDate,
  exportReportsToCSV,
} from '../utils/factCheckEngine.ts';

interface AdminDashboardProps {
  reports: ReportItem[];
  onOpenReview: (report: ReportItem) => void;
  onDeleteReport: (id: string) => Promise<void>;
  onRefresh: () => Promise<void>;
  onOpenSheetsModal: () => void;
  onOpenSubmitModal: () => void;
  sheetsConnected: boolean;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  reports,
  onOpenReview,
  onDeleteReport,
  onRefresh,
  onOpenSheetsModal,
  onOpenSubmitModal,
  sheetsConnected,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('SEMUA');
  const [platformFilter, setPlatformFilter] = useState<string>('SEMUA');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Statistics calculation
  const stats = useMemo(() => calculateReportStats(reports), [reports]);

  // Filtered reports for admin table
  const filteredReports = useMemo(() => {
    return filterReports(reports, searchQuery, statusFilter, platformFilter);
  }, [reports, searchQuery, statusFilter, platformFilter]);

  const handleRefreshClick = async () => {
    setIsRefreshing(true);
    await onRefresh();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const handleDeleteClick = async (id: string, claimText: string) => {
    const confirmDelete = window.confirm(`Hapus laporan ini?\n\n"${claimText.slice(0, 80)}..."`);
    if (!confirmDelete) return;

    setDeletingId(id);
    try {
      await onDeleteReport(id);
    } finally {
      setDeletingId(null);
    }
  };

  const handleDownloadCSV = () => {
    const csvContent = exportReportsToCSV(reports);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `laporan_admin_healthcheck_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Dashboard Title & Top Actions */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 text-xs font-semibold mb-2 border border-amber-300 dark:border-amber-800">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Admin Workspace • HealthCheck Youth</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Manajemen & Verifikasi Laporan Tren
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Tinjau klaim kesehatan viral, gunakan analisis otomatis Gemini AI, dan sinkronkan ke Google Spreadsheet.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Google Sheets Trigger */}
            <button
              onClick={onOpenSheetsModal}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold border flex items-center space-x-2 transition-all ${
                sheetsConnected
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800'
                  : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:bg-slate-100'
              }`}
            >
              <Database className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>{sheetsConnected ? 'Google Sheets Aktif' : 'Atur Google Sheets'}</span>
            </button>

            {/* Export CSV */}
            <button
              onClick={handleDownloadCSV}
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center space-x-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Ekspor CSV</span>
            </button>

            {/* Refresh */}
            <button
              onClick={handleRefreshClick}
              disabled={isRefreshing}
              className="p-2 rounded-xl bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50"
              title="Refresh Data"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>

            {/* Add New Report (Admin input) */}
            <button
              onClick={onOpenSubmitModal}
              className="px-4 py-2 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm flex items-center space-x-1.5 active:scale-95 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Entri Laporan Baru</span>
            </button>
          </div>
        </div>

        {/* 4 Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Laporan */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Laporan</p>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white">{stats.total}</h3>
              <p className="text-[11px] text-slate-400">{stats.verified} sudah diverifikasi</p>
            </div>
          </div>

          {/* Menunggu Review */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-amber-200/80 dark:border-amber-900/60 shadow-sm flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-amber-700 dark:text-amber-400">Menunggu Review</p>
              <h3 className="text-2xl font-black text-amber-600 dark:text-amber-400">{stats.pending}</h3>
              <p className="text-[11px] text-amber-500 font-medium">Perlu tindakan admin</p>
            </div>
          </div>

          {/* Terverifikasi Hoaks */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-rose-200/80 dark:border-rose-900/60 shadow-sm flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
              <AlertOctagon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-rose-700 dark:text-rose-400">Terverifikasi Hoaks</p>
              <h3 className="text-2xl font-black text-rose-600 dark:text-rose-400">{stats.hoaks}</h3>
              <p className="text-[11px] text-rose-500 font-medium">Klaim palsu & bahaya</p>
            </div>
          </div>

          {/* Terverifikasi Fakta */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-emerald-200/80 dark:border-emerald-900/60 shadow-sm flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <CheckCircle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">Terverifikasi Fakta</p>
              <h3 className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{stats.fakta}</h3>
              <p className="text-[11px] text-emerald-500 font-medium">Sesuai literatur medis</p>
            </div>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Live Search */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari berdasarkan klaim, nama pelapor, atau ID..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div className="flex items-center space-x-2">
            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 font-medium text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="SEMUA">Semua Status</option>
              <option value="MENUNGGU">Menunggu Review ({stats.pending})</option>
              <option value="HOAKS">Hoaks ({stats.hoaks})</option>
              <option value="FAKTA">Fakta ({stats.fakta})</option>
              <option value="MISINFORMASI">Misinformasi ({stats.misinformasi})</option>
            </select>

            {/* Platform Filter */}
            <select
              value={platformFilter}
              onChange={(e) => setPlatformFilter(e.target.value)}
              className="text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 font-medium text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="SEMUA">Semua Platform</option>
              <option value="TikTok">TikTok</option>
              <option value="Instagram">Instagram</option>
              <option value="Twitter/X">Twitter/X</option>
              <option value="YouTube">YouTube</option>
              <option value="WhatsApp">WhatsApp</option>
            </select>
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600 dark:text-slate-400">
              <thead className="bg-slate-50 dark:bg-slate-800/80 text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th scope="col" className="px-4 py-3.5">ID & Waktu</th>
                  <th scope="col" className="px-4 py-3.5">Pelapor</th>
                  <th scope="col" className="px-4 py-3.5">Platform</th>
                  <th scope="col" className="px-4 py-3.5 min-w-[280px]">Klaim Viral</th>
                  <th scope="col" className="px-4 py-3.5">Bukti</th>
                  <th scope="col" className="px-4 py-3.5">Status</th>
                  <th scope="col" className="px-4 py-3.5 text-right">Aksi Verifikasi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredReports.length > 0 ? (
                  filteredReports.map((report) => {
                    const badge = getStatusBadgeConfig(report.status);

                    return (
                      <tr
                        key={report.id}
                        className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors"
                      >
                        {/* ID & Date */}
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <span className="font-mono font-bold text-slate-900 dark:text-white">
                            {report.id}
                          </span>
                          <span className="block text-[11px] text-slate-400 mt-0.5">
                            {formatIndonesianDate(report.timestamp)}
                          </span>
                        </td>

                        {/* Reporter */}
                        <td className="px-4 py-3.5 font-medium text-slate-700 dark:text-slate-300 whitespace-nowrap">
                          {report.reporterName}
                        </td>

                        {/* Platform */}
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                            <Video className="w-3 h-3 text-slate-400" />
                            <span>{report.platform}</span>
                          </span>
                        </td>

                        {/* Claim */}
                        <td className="px-4 py-3.5">
                          <p className="font-semibold text-slate-900 dark:text-white line-clamp-2 leading-relaxed">
                            {report.claim}
                          </p>
                          {report.medicalExplanation && (
                            <p className="text-[11px] text-teal-600 dark:text-teal-400 mt-1 line-clamp-1">
                              💡 {report.medicalExplanation}
                            </p>
                          )}
                        </td>

                        {/* Evidence Link */}
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          {report.evidenceUrl ? (
                            <a
                              href={report.evidenceUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center space-x-1 font-semibold text-teal-600 hover:text-teal-700 dark:text-teal-400 hover:underline"
                            >
                              <span>Buka Video</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          ) : (
                            <span className="text-slate-400">-</span>
                          )}
                        </td>

                        {/* Status Badge */}
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[11px] font-bold border ${badge.bgColor}`}
                          >
                            <span>{badge.icon}</span>
                            <span>{badge.label}</span>
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-3.5 whitespace-nowrap text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              onClick={() => onOpenReview(report)}
                              className="px-3 py-1.5 rounded-xl bg-teal-50 dark:bg-teal-950/70 text-teal-700 dark:text-teal-300 hover:bg-teal-100 border border-teal-200 dark:border-teal-800 font-bold text-xs flex items-center space-x-1 shadow-sm transition-all"
                              title="Review status dan penjelasan medis"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                              <span>Review</span>
                            </button>

                            <button
                              onClick={() => handleDeleteClick(report.id, report.claim)}
                              disabled={deletingId === report.id}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                              title="Hapus laporan"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={7} className="px-4 py-10 text-center text-slate-400">
                      Tidak ada laporan yang sesuai dengan filter pencarian.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Table Footer */}
          <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
            <span>
              Menampilkan <strong>{filteredReports.length}</strong> dari total <strong>{reports.length}</strong> laporan
            </span>
            <span className="text-[11px]">
              Klik tombol &ldquo;Review&rdquo; untuk membuka AI Gemini Fact-Checker
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
