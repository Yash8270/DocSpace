import React from 'react';
import { CheckCircle2, Loader2, AlertCircle, Edit3 } from 'lucide-react';

export const SaveStatus = ({ status, lastSavedAt, readOnly = false }) => {
  if (readOnly) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
        Read-Only Mode
      </span>
    );
  }

  switch (status) {
    case 'saving':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
          Saving...
        </span>
      );
    case 'saved':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          ✓ Saved
        </span>
      );
    case 'unsaved':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
          <Edit3 className="w-3.5 h-3.5 text-slate-500" />
          Unsaved changes
        </span>
      );
    case 'error':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-rose-50 text-rose-700 border border-rose-200">
          <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
          Unable to save changes
        </span>
      );
    default:
      return null;
  }
};
