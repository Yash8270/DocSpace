import React from 'react';
import { DocumentCard } from './DocumentCard';
import { FileText, Users, Plus, UploadCloud } from 'lucide-react';

export const DocumentList = ({
  ownedDocuments,
  sharedDocuments,
  onOpenDocument,
  onShareDocument,
  onDeleteDocument,
  onCreateNew,
  onOpenImport
}) => {
  return (
    <div className="space-y-10">
      {/* My Documents Section */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-6 bg-brand-600 rounded-full" />
            <h2 className="text-lg font-bold text-slate-900">My Documents</h2>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
              {ownedDocuments.length}
            </span>
          </div>
        </div>

        {ownedDocuments.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-8 text-center flex flex-col items-center justify-center">
            <div className="p-3 bg-brand-50 rounded-2xl text-brand-600 mb-3">
              <FileText className="w-8 h-8" />
            </div>
            <h3 className="font-bold text-slate-800 text-base mb-1">No documents yet</h3>
            <p className="text-xs text-slate-500 max-w-sm mb-4">
              Create your first rich-text document or import an existing .md or .txt file to get started.
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={onCreateNew}
                className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors"
              >
                <Plus className="w-4 h-4" /> New Document
              </button>
              <button
                onClick={onOpenImport}
                className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <UploadCloud className="w-4 h-4 text-slate-500" /> Import File
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {ownedDocuments.map((doc) => (
              <DocumentCard
                key={doc.id}
                document={doc}
                onOpen={onOpenDocument}
                onShare={onShareDocument}
                onDelete={onDeleteDocument}
              />
            ))}
          </div>
        )}
      </section>

      {/* Shared With Me Section */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-6 bg-indigo-600 rounded-full" />
            <h2 className="text-lg font-bold text-slate-900">Shared With Me</h2>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
              {sharedDocuments.length}
            </span>
          </div>
        </div>

        {sharedDocuments.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200/80 p-8 text-center flex flex-col items-center justify-center">
            <div className="p-3 bg-indigo-50 rounded-2xl text-indigo-600 mb-3">
              <Users className="w-8 h-8" />
            </div>
            <h3 className="font-bold text-slate-800 text-base mb-1">No shared documents</h3>
            <p className="text-xs text-slate-500 max-w-sm">
              Documents shared with you by other team members (e.g. Alice, Bob, Charlie) will appear here.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {sharedDocuments.map((doc) => (
              <DocumentCard
                key={doc.id}
                document={doc}
                onOpen={onOpenDocument}
                onShare={onShareDocument}
                onDelete={onDeleteDocument}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
