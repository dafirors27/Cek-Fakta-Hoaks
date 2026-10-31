import React, { useState, useEffect } from 'react';
import {
  X,
  Database,
  Copy,
  Check,
  ExternalLink,
  RefreshCw,
  Download,
  AlertCircle,
  CheckCircle2,
  FileSpreadsheet,
  Terminal,
  ArrowRight
} from 'lucide-react';
import { getAppsScriptCode, testSheetsConnection, triggerSheetsSync } from '../services/api.ts';
import { exportReportsToCSV } from '../utils/factCheckEngine.ts';
import { ReportItem } from '../types/index.ts';

interface GoogleSheetsModalProps {
  isOpen: boolean;
  onClose: () => void;
  reports: ReportItem[];
  onRefreshReports: () => Promise<void>;
  sheetsConnected: boolean;
  onConnectionChange: (connected: boolean) => void;
}

export const GoogleSheetsModal: React.FC<GoogleSheetsModalProps> = ({
  isOpen,
  onClose,
  reports,
  onRefreshReports,
  sheetsConnected,
  onConnectionChange,
}) => {
  const [activeTab, setActiveTab] = useState<'connect' | 'code' | 'export'>('connect');
  const [appsScriptUrl, setAppsScriptUrl] = useState('');
  const [scriptCode, setScriptCode] = useState('');
  const [copiedCode, setCopiedCode] = useState(false);
  const [testing, setTesting] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (isOpen) {
      getAppsScriptCode().then((code) => setScriptCode(code)).catch(console.error);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(scriptCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    setTesting(true);
    setStatusMessage(null);
    try {
      const res = await testSheetsConnection(appsScriptUrl.trim());
      setStatusMessage({ type: 'success', text: res.message || 'Koneksi ke Google Sheets berhasil!' });
      onConnectionChange(true);
      await onRefreshReports();
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Gagal terhubung ke Google Sheets.' });
    } finally {
      setTesting(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      await testSheetsConnection('');
      setAppsScriptUrl('');
      onConnectionChange(false);
      setStatusMessage({ type: 'success', text: 'Koneksi Google Sheets dinonaktifkan. Beralih ke penyimpanan lokal server.' });
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message });
    }
  };

  const handleSyncNow = async () => {
    setSyncing(true);
    setStatusMessage(null);
    try {
      const res = await triggerSheetsSync();
      setStatusMessage({ type: 'success', text: res.message || 'Sinkronisasi berhasil!' });
      await onRefreshReports();
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Gagal menyinkronkan data.' });
    } finally {
      setSyncing(false);
    }
  };

  const handleDownloadCSV = () => {
    const csvContent = exportReportsToCSV(reports);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `healthcheck_youth_laporan_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-8">
        {/* Header */}
        <div className="p-6 pb-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950/70 text-teal-600 dark:text-teal-400 flex items-center justify-center">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-snug">
                Integrasi Database Google Sheets
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Arsitektur Headless CMS: Kelola dan simpan seluruh data laporan langsung di spreadsheet Anda
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

        {/* Tab Navigation */}
        <div className="flex items-center px-6 pt-3 border-b border-slate-100 dark:border-slate-800 space-x-4">
          <button
            onClick={() => setActiveTab('connect')}
            className={`pb-3 text-xs font-bold border-b-2 transition-all ${
              activeTab === 'connect'
                ? 'border-teal-500 text-teal-600 dark:text-teal-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Koneksi Web App
          </button>
          <button
            onClick={() => setActiveTab('code')}
            className={`pb-3 text-xs font-bold border-b-2 transition-all ${
              activeTab === 'code'
                ? 'border-teal-500 text-teal-600 dark:text-teal-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Salin Kode Apps Script
          </button>
          <button
            onClick={() => setActiveTab('export')}
            className={`pb-3 text-xs font-bold border-b-2 transition-all ${
              activeTab === 'export'
                ? 'border-teal-500 text-teal-600 dark:text-teal-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Ekspor & Backup CSV
          </button>
        </div>

        <div className="p-6">
          {statusMessage && (
            <div
              className={`p-3.5 rounded-xl text-xs mb-4 flex items-center space-x-2 border ${
                statusMessage.type === 'success'
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                  : 'bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border-rose-200 dark:border-rose-800'
              }`}
            >
              {statusMessage.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0" />
              )}
              <span>{statusMessage.text}</span>
            </div>
          )}

          {activeTab === 'connect' && (
            <div className="space-y-4">
              <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 text-xs space-y-2">
                <span className="font-bold text-slate-800 dark:text-slate-200 block">
                  Status Database Saat Ini:
                </span>
                <div className="flex items-center space-x-2">
                  <span
                    className={`inline-block w-2.5 h-2.5 rounded-full ${
                      sheetsConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
                    }`}
                  />
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    {sheetsConnected
                      ? 'Tersambung ke Google Spreadsheet Live'
                      : 'Mode Server Lokal (Data tetap tersimpan, belum dihubungkan ke spreadsheet Google Anda)'}
                  </span>
                </div>
              </div>

              <form onSubmit={handleConnect} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    URL Google Apps Script Web App:
                  </label>
                  <input
                    type="url"
                    value={appsScriptUrl}
                    onChange={(e) => setAppsScriptUrl(e.target.value)}
                    placeholder="https://script.google.com/macros/s/.../exec"
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 font-mono"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">
                    Dapatkan URL ini dari menu <strong>Deploy &gt; New deployment &gt; Web app</strong> di Apps Script Google Spreadsheet Anda.
                  </p>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setActiveTab('code')}
                    className="text-xs text-teal-600 dark:text-teal-400 font-semibold hover:underline flex items-center space-x-1"
                  >
                    <span>Belum pasang Apps Script? Lihat kodenya</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>

                  <div className="flex items-center space-x-2">
                    {sheetsConnected && (
                      <button
                        type="button"
                        onClick={handleDisconnect}
                        className="px-3 py-2 text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-xl"
                      >
                        Putuskan Koneksi
                      </button>
                    )}
                    <button
                      type="submit"
                      disabled={testing || !appsScriptUrl.trim()}
                      className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl disabled:opacity-50 flex items-center space-x-1.5"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${testing ? 'animate-spin' : ''}`} />
                      <span>{testing ? 'Menguji...' : 'Hubungkan & Tes'}</span>
                    </button>
                  </div>
                </div>
              </form>

              {sheetsConnected && (
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-xs text-slate-500">
                    Sinkronkan data lokal dengan baris baru di spreadsheet Anda:
                  </span>
                  <button
                    type="button"
                    onClick={handleSyncNow}
                    disabled={syncing}
                    className="px-3.5 py-2 bg-slate-900 dark:bg-slate-700 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl flex items-center space-x-1.5"
                  >
                    <RefreshCw className={`w-3 h-3 ${syncing ? 'animate-spin' : ''}`} />
                    <span>{syncing ? 'Sinkronisasi...' : 'Sinkronkan Sekarang'}</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'code' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-600 dark:text-slate-400">
                  Salin skrip ini ke <strong>Extensions &gt; Apps Script</strong> pada Google Spreadsheet Anda:
                </span>
                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="px-3 py-1.5 rounded-lg bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 font-bold text-xs flex items-center space-x-1.5 hover:bg-teal-100 border border-teal-200 dark:border-teal-800"
                >
                  {copiedCode ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                      <span>Tersalin!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Salin Kode</span>
                    </>
                  )}
                </button>
              </div>

              <div className="relative rounded-2xl bg-slate-900 text-slate-100 p-4 font-mono text-[11px] max-h-64 overflow-y-auto border border-slate-800">
                <pre>{scriptCode || '// Mengambil kode skrip...'}</pre>
              </div>

              <div className="bg-amber-50 dark:bg-amber-950/40 p-3 rounded-xl border border-amber-200 dark:border-amber-800 text-[11px] text-amber-800 dark:text-amber-200">
                <strong>Catatan Penting Deploy:</strong> Saat melakukan Deploy di Apps Script, pastikan memilih <strong>Execute as: &quot;Me&quot;</strong> dan <strong>Who has access: &quot;Anyone&quot;</strong> agar frontend web dapat mengirimkan data laporan secara langsung tanpa hambatan login.
              </div>
            </div>
          )}

          {activeTab === 'export' && (
            <div className="space-y-4 text-center py-4">
              <div className="w-12 h-12 rounded-2xl bg-teal-50 dark:bg-teal-950 text-teal-600 dark:text-teal-400 flex items-center justify-center mx-auto">
                <Download className="w-6 h-6" />
              </div>
              <div className="max-w-md mx-auto">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
                  Unduh Salinan CSV Laporan
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                  Anda bisa mengunduh seluruh {reports.length} rekaman data verifikasi dan mengimpornya langsung ke Google Sheets secara offline.
                </p>
                <button
                  type="button"
                  onClick={handleDownloadCSV}
                  className="px-5 py-2.5 bg-gradient-to-r from-teal-600 to-emerald-600 text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center space-x-2 mx-auto active:scale-95"
                >
                  <Download className="w-4 h-4" />
                  <span>Unduh File CSV ({reports.length} Baris Data)</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
