import React from 'react';
import { FileText, Share2, Trash2, Clock, User, ShieldCheck, Eye, Edit3 } from 'lucide-react';
import { formatDate } from '../utils/formatting';

export const DocumentCard = ({ document, onOpen, onShare, onDelete }) => {
  const { title, owner, updatedAt, isOwner, userPermission, shares = [] } = document;

  return (
    <div
      onClick={() => onOpen(document.id)}
      className="group relative bg-white rounded-2xl border border-slate-200/80 p-5 hover:border-brand-300 hover:shadow-xl transition-all duration-200 cursor-pointer flex flex-col justify-between"
    >
      <div>
        {/* Header Badges */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-1.5">
            <div className="p-2 rounded-xl bg-brand-50 text-brand-600 group-hover:bg-brand-600 group-hover:text-white transition-colors">
              <FileText className="w-5 h-5" />
            </div>
            <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${
              isOwner
                ? 'bg-slate-100 text-slate-700 border-slate-200'
                : 'bg-indigo-50 text-indigo-700 border-indigo-200'
            }`}>
              {isOwner ? 'Owned by you' : `Shared by ${owner?.name || 'Someone'}`}
            </span>
          </div>

          {!isOwner && (
            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full flex items-center gap-1 ${
              userPermission === 'EDIT'
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'bg-blue-50 text-blue-700 border border-blue-200'
            }`}>
              {userPermission === 'EDIT' ? (
                <>
                  <Edit3 className="w-3 h-3" /> Editor
                </>
              ) : (
                <>
                  <Eye className="w-3 h-3" /> Viewer
                </>
              )}
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="font-bold text-slate-900 text-base line-clamp-2 group-hover:text-brand-600 transition-colors mb-2">
          {title || 'Untitled Document'}
        </h3>
      </div>

      {/* Footer Info */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center gap-1">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          <span>Updated {formatDate(updatedAt)}</span>
        </div>

        <div className="flex items-center gap-1 opacity-90 group-hover:opacity-100 transition-opacity">
          {isOwner && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onShare(document);
                }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-brand-600 hover:bg-brand-50 transition-colors"
                title="Share document"
              >
                <Share2 className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(document.id, title);
                }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                title="Delete document"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
