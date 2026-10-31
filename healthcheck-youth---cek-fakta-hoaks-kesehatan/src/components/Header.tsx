import React, { useState } from 'react';
import { ShieldCheck, PlusCircle, LayoutDashboard, Home, Database, Sparkles, CheckCircle2 } from 'lucide-react';

interface HeaderProps {
  currentView: 'public' | 'admin';
  onToggleView: (view: 'public' | 'admin') => void;
  onOpenSubmit: () => void;
  onOpenSheets: () => void;
  sheetsConnected: boolean;
  pendingCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onToggleView,
  onOpenSubmit,
  onOpenSheets,
  sheetsConnected,
  pendingCount,
}) => {
  const [clickCount, setClickCount] = useState(0);
  const [showSecretHint, setShowSecretHint] = useState(false);

  // Easter egg: Clicking the logo switches between public and admin
  const handleLogoClick = () => {
    setClickCount((prev) => prev + 1);
    setShowSecretHint(true);
    setTimeout(() => setShowSecretHint(false), 2500);

    // Switch view
    onToggleView(currentView === 'public' ? 'admin' : 'public');
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Left: Easter Egg Logo */}
        <div className="flex items-center space-x-3">
          <button
            onClick={handleLogoClick}
            className="group flex items-center space-x-2 text-left p-1 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 transition-transform active:scale-95"
            title="Klik logo untuk beralih antara Mode Publik & Dashboard Admin (Easter Egg Rahasia)"
          >
            <div className="relative w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-500 to-emerald-400 flex items-center justify-center text-white shadow-md shadow-teal-500/20 group-hover:scale-105 transition-all">
              <ShieldCheck className="w-6 h-6 stroke-[2.2]" />
              {currentView === 'admin' && (
                <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-amber-500 rounded-full border-2 border-white dark:border-slate-900 animate-pulse" />
              )}
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-extrabold text-slate-900 dark:text-white tracking-tight text-lg">
                  HealthCheck
                </span>
                <span className="text-teal-600 dark:text-teal-400 font-extrabold text-lg">
                  Youth
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium leading-none">
                {currentView === 'admin' ? '🛡️ Dashboard Panel Admin' : 'Saring Hoaks Kesehatan'}
              </p>
            </div>
          </button>

          {/* Secret Toast / Easter Egg feedback */}
          {showSecretHint && (
            <div className="hidden sm:inline-flex items-center space-x-1.5 text-xs bg-teal-50 text-teal-800 dark:bg-teal-950/80 dark:text-teal-300 px-2.5 py-1 rounded-full border border-teal-200 dark:border-teal-800 shadow-sm animate-bounce">
              <Sparkles className="w-3.5 h-3.5 text-teal-600" />
              <span>
                {currentView === 'admin' ? 'Beralih ke Dashboard Admin!' : 'Kembali ke Beranda Publik'}
              </span>
            </div>
          )}
        </div>

        {/* Right Actions */}
        <div className="flex items-center space-x-3">
          {/* Google Sheets Status Badge */}
          <button
            onClick={onOpenSheets}
            className={`hidden md:flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
              sheetsConnected
                ? 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800'
                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'
            }`}
            title="Pengaturan Database Google Spreadsheet (Headless CMS)"
          >
            <Database className="w-3.5 h-3.5" />
            <span>{sheetsConnected ? 'Google Sheets Aktif' : 'Atur Google Sheets'}</span>
            {sheetsConnected && <CheckCircle2 className="w-3 h-3 text-emerald-500" />}
          </button>

          {/* Switch Mode Button */}
          {currentView === 'public' ? (
            <>
              <button
                onClick={onOpenSubmit}
                className="flex items-center space-x-2 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-semibold text-sm px-4 py-2 rounded-xl shadow-sm shadow-teal-600/30 active:scale-95 transition-all"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Lapor Tren</span>
              </button>

              <button
                onClick={() => onToggleView('admin')}
                className="hidden lg:flex items-center space-x-1.5 text-xs text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700"
                title="Buka Panel Admin"
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span>Admin View</span>
                {pendingCount > 0 && (
                  <span className="w-4 h-4 bg-amber-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center">
                    {pendingCount}
                  </span>
                )}
              </button>
            </>
          ) : (
            <div className="flex items-center space-x-2">
              <span className="hidden sm:inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-amber-100 text-amber-900 border border-amber-300 dark:bg-amber-950 dark:text-amber-200 dark:border-amber-800">
                Mode Admin
              </span>
              <button
                onClick={() => onToggleView('public')}
                className="flex items-center space-x-1.5 bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 text-sm font-semibold px-3.5 py-2 rounded-xl shadow-sm transition-all"
              >
                <Home className="w-4 h-4" />
                <span>Ke Beranda Publik</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
