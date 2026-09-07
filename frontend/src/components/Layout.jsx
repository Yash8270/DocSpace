import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { UserSwitcher } from './UserSwitcher';
import { FileText, Sparkles, ArrowLeft } from 'lucide-react';

export const Layout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const isEditorPage = location.pathname.startsWith('/documents/');

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 relative">
      {/* Top Navbar with z-20 so modal backdrop (z-[100]) covers it cleanly */}
      <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-slate-200/80 px-4 lg:px-8 py-3 transition-all">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Logo & Navigation */}
          <div className="flex items-center gap-3">
            {isEditorPage ? (
              <button
                onClick={() => navigate('/')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
                title="Back to Documents"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Documents</span>
              </button>
            ) : (
              <div
                onClick={() => navigate('/')}
                className="flex items-center gap-2 cursor-pointer group"
              >
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-brand-500/20 group-hover:scale-105 transition-transform">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h1 className="font-extrabold text-slate-900 text-lg tracking-tight flex items-center gap-1">
                    DocSpace
                    <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-brand-50 text-brand-700 border border-brand-200">
                      v1.0
                    </span>
                  </h1>
                </div>
              </div>
            )}
          </div>

          {/* User Switcher */}
          <div className="flex items-center gap-3">
            <UserSwitcher />
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200/60 bg-white py-4 px-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="flex items-center gap-1 font-medium">
            <Sparkles className="w-3.5 h-3.5 text-brand-600" />
            <span>DocSpace — Collaborative Document Editor</span>
          </p>
          <p className="text-slate-400 text-[11px]">
            Demonstrating Rich Text, File Import (.txt/.md), Owner/Share Authorization, & SQLite Persistence.
          </p>
        </div>
      </footer>
    </div>
  );
};
