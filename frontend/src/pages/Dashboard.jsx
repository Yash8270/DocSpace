import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCurrentUser } from '../hooks/useCurrentUser';
import { useDocuments } from '../hooks/useDocuments';
import { DocumentList } from '../components/DocumentList';
import { ShareModal } from '../components/ShareModal';
import { ImportModal } from '../components/ImportModal';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Plus, UploadCloud, Sparkles, AlertCircle, RefreshCw } from 'lucide-react';

export const Dashboard = () => {
  const navigate = useNavigate();
  const { currentUser } = useCurrentUser();
  const {
    ownedDocuments,
    sharedDocuments,
    loading,
    error,
    createDocument,
    deleteDocument,
    refreshDocuments
  } = useDocuments();

  const [shareModalDoc, setShareModalDoc] = useState(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [creating, setCreating] = useState(false);

  const handleOpenDocument = (docId) => {
    navigate(`/documents/${docId}`);
  };

  const handleCreateNew = async () => {
    try {
      setCreating(true);
      const newDoc = await createDocument('Untitled Document');
      navigate(`/documents/${newDoc.id}`);
    } catch (err) {
      console.error('Failed to create new document:', err);
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id, title) => {
    if (window.confirm(`Are you sure you want to delete "${title || 'Untitled Document'}"? This action cannot be undone.`)) {
      try {
        await deleteDocument(id);
      } catch (err) {
        alert(err.response?.data?.error || 'Failed to delete document.');
      }
    }
  };

  const handleImportSuccess = (newDoc) => {
    refreshDocuments();
    navigate(`/documents/${newDoc.id}`);
  };

  if (loading) {
    return <LoadingSpinner label="Loading document workspace..." size="lg" />;
  }

  return (
    <div className="space-y-8">
      {/* Banner / Header */}
      <div className="bg-gradient-to-r from-brand-600 via-brand-700 to-indigo-700 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-white/90 text-xs font-semibold backdrop-blur-md mb-3">
              <Sparkles className="w-3.5 h-3.5" /> Workspace Overview
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome back, {currentUser?.name || 'User'}!
            </h1>
            <p className="text-brand-100 text-xs sm:text-sm mt-1 max-w-xl">
              Create, edit, import, and share your team documents securely.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleCreateNew}
              disabled={creating}
              className="px-5 py-2.5 bg-white hover:bg-slate-50 text-brand-700 rounded-xl font-bold text-sm shadow-md transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              <Plus className="w-4 h-4 text-brand-600" />
              {creating ? 'Creating...' : 'New Document'}
            </button>
            <button
              onClick={() => setIsImportModalOpen(true)}
              className="px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl font-semibold text-sm backdrop-blur-sm transition-all flex items-center gap-2 cursor-pointer"
            >
              <UploadCloud className="w-4 h-4 text-brand-200" />
              Import File
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-between gap-3 text-amber-800 text-sm">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 shrink-0 text-amber-600" />
            <div>
              <p className="font-semibold">{error}</p>
              <p className="text-xs text-amber-700 mt-0.5">Please verify the Express backend server is running in another terminal window using <code className="bg-amber-100 px-1 py-0.5 rounded">npm run dev</code> inside <code className="bg-amber-100 px-1 py-0.5 rounded">backend/</code>.</p>
            </div>
          </div>
          <button
            onClick={refreshDocuments}
            className="px-3 py-1.5 bg-amber-600 text-white rounded-xl text-xs font-semibold hover:bg-amber-700 transition-colors flex items-center gap-1 shrink-0 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Retry
          </button>
        </div>
      )}

      {/* Document List Grid */}
      <DocumentList
        ownedDocuments={ownedDocuments}
        sharedDocuments={sharedDocuments}
        onOpenDocument={handleOpenDocument}
        onShareDocument={(doc) => setShareModalDoc(doc)}
        onDeleteDocument={handleDelete}
        onCreateNew={handleCreateNew}
        onOpenImport={() => setIsImportModalOpen(true)}
      />

      {/* Share Modal */}
      <ShareModal
        document={shareModalDoc}
        isOpen={!!shareModalDoc}
        onClose={() => setShareModalDoc(null)}
        onSharesUpdated={refreshDocuments}
      />

      {/* Import Modal */}
      <ImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImportSuccess={handleImportSuccess}
      />
    </div>
  );
};
