import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchDocumentById, updateDocument, deleteDocument } from '../services/api';
import { useCurrentUser } from '../hooks/useCurrentUser';
import { DocumentEditor } from '../components/DocumentEditor';
import { SaveStatus } from '../components/SaveStatus';
import { ShareModal } from '../components/ShareModal';
import { LiveCollaborators } from '../components/LiveCollaborators';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { socket } from '../services/socket';
import { exportToMarkdown, exportToPdf } from '../utils/exportUtils';
import {
  ArrowLeft,
  Share2,
  Trash2,
  AlertCircle,
  AlertTriangle,
  Download,
  FileText,
  FileCode,
  ChevronDown
} from 'lucide-react';

export const EditorPage = () => {
  const { id: documentId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useCurrentUser();

  const [document, setDocument] = useState(null);
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saveStatus, setSaveStatus] = useState('saved');
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [deletedNotice, setDeletedNotice] = useState('');

  // Export Dropdown State
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
  const exportMenuRef = useRef(null);

  // WebSockets Real-time State
  const [activeUsers, setActiveUsers] = useState([]);
  const [remoteEditingUser, setRemoteEditingUser] = useState(null);
  const [remoteCursors, setRemoteCursors] = useState({});

  const titleInputRef = useRef(null);

  const loadDocument = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await fetchDocumentById(documentId);
      setDocument(data);
      setTitle(data.title || 'Untitled Document');
      setSaveStatus('saved');
    } catch (err) {
      console.error('Error fetching document details:', err);
      setError(err.response?.data?.error || 'Failed to load document.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (documentId) {
      loadDocument();
    }
  }, [documentId, currentUser?.id]);

  // Click outside to close export menu dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(e.target)) {
        setIsExportMenuOpen(false);
      }
    };
    window.addEventListener('mousedown', handleClickOutside);
    return () => window.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // WebSockets Real-time Presence, Cursor Sync, Deletion & Live Updates
  useEffect(() => {
    if (!documentId || !currentUser) return;

    if (!socket.connected) {
      socket.connect();
    }

    socket.emit('join-document', {
      documentId,
      user: currentUser
    });

    socket.on('presence-update', ({ activeUsers: onlineUsers }) => {
      const activeIds = new Set((onlineUsers || []).map(u => u.id));
      setActiveUsers(onlineUsers || []);

      setRemoteCursors(prev => {
        const updated = { ...prev };
        Object.keys(updated).forEach(id => {
          if (!activeIds.has(id)) {
            delete updated[id];
          }
        });
        return updated;
      });
    });

    // Listen for live remote cursor & text selection range updates
    socket.on('remote-cursor-changed', ({ user: remoteUser, from, to }) => {
      if (remoteUser?.id !== currentUser.id && typeof from === 'number' && from > 0) {
        setRemoteCursors(prev => ({
          ...prev,
          [remoteUser.id]: { user: remoteUser, from, to }
        }));
      }
    });

    // Listen for live document deletion by owner
    socket.on('document-deleted-notify', ({ ownerName }) => {
      setDeletedNotice(`${ownerName || 'The document owner'} has deleted this document. Returning to workspace...`);
      setTimeout(() => {
        navigate('/');
      }, 2500);
    });

    // Listen for live updates from other collaborators
    socket.on('remote-document-changed', ({ user: editingUser, title: remoteTitle, content: remoteContent }) => {
      if (editingUser?.id !== currentUser.id) {
        setRemoteEditingUser(editingUser);

        if (remoteTitle) setTitle(remoteTitle);

        setDocument(prev => prev ? {
          ...prev,
          title: remoteTitle || prev.title,
          content: remoteContent || prev.content
        } : prev);

        setTimeout(() => setRemoteEditingUser(null), 3000);
      }
    });

    return () => {
      socket.emit('leave-document', { documentId });
      socket.off('presence-update');
      socket.off('remote-cursor-changed');
      socket.off('document-deleted-notify');
      socket.off('remote-document-changed');
    };
  }, [documentId, currentUser, navigate]);

  const handleCursorChange = (from, to) => {
    if (socket.connected && documentId && currentUser && typeof from === 'number' && from > 0) {
      socket.emit('cursor-position-changed', {
        documentId,
        user: currentUser,
        from,
        to: typeof to === 'number' ? to : from
      });
    }
  };

  // Handle Title Save on Blur or Enter
  const handleTitleBlur = async () => {
    if (!document || (!document.isOwner && document.userPermission !== 'EDIT')) return;
    const trimmed = title.trim() || 'Untitled Document';
    if (trimmed === document.title) return;

    try {
      setSaveStatus('saving');
      const updated = await updateDocument(document.id, { title: trimmed });
      setDocument(updated);
      setTitle(updated.title);
      setSaveStatus('saved');

      socket.emit('document-content-changed', {
        documentId: document.id,
        user: currentUser,
        title: trimmed,
        content: document.content
      });
    } catch (err) {
      console.error('Failed to update document title:', err);
      setSaveStatus('error');
    }
  };

  // Handle Content Autosave callback from DocumentEditor
  const handleContentChange = async (jsonContent) => {
    if (!document) return;
    try {
      setSaveStatus('saving');
      const updated = await updateDocument(document.id, { content: jsonContent });
      setDocument(updated);
      setSaveStatus('saved');

      socket.emit('document-content-changed', {
        documentId: document.id,
        user: currentUser,
        title: document.title,
        content: jsonContent
      });
    } catch (err) {
      console.error('Failed to save document content:', err);
      setSaveStatus('error');
    }
  };

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete "${title}"?`)) {
      try {
        socket.emit('document-deleted', {
          documentId: document.id,
          ownerName: currentUser.name
        });
        await deleteDocument(document.id);
        navigate('/');
      } catch (err) {
        alert(err.response?.data?.error || 'Failed to delete document.');
      }
    }
  };

  // Export Handlers
  const handleExportMarkdown = () => {
    setIsExportMenuOpen(false);
    exportToMarkdown(title, document.content);
  };

  const handleExportPdf = () => {
    setIsExportMenuOpen(false);
    const editorEl = window.document.querySelector('.ProseMirror');
    exportToPdf(title, editorEl);
  };

  if (loading) {
    return <LoadingSpinner label="Loading document editor..." size="lg" />;
  }

  if (error || !document) {
    return (
      <div className="max-w-xl mx-auto my-12 p-6 bg-white rounded-2xl border border-slate-200 shadow-sm text-center">
        <div className="p-3 bg-rose-50 rounded-full w-12 h-12 flex items-center justify-center text-rose-600 mx-auto mb-3">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h3 className="font-bold text-slate-900 text-lg mb-1">Access Error</h3>
        <p className="text-sm text-slate-500 mb-6">{error || 'Document not found or access denied.'}</p>
        <button
          onClick={() => navigate('/')}
          className="px-5 py-2.5 bg-brand-600 text-white rounded-xl font-semibold text-xs transition-colors hover:bg-brand-700 inline-flex items-center gap-1.5 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Return to Documents
        </button>
      </div>
    );
  }

  const readOnly = !document.isOwner && document.userPermission !== 'EDIT';

  return (
    <div className="space-y-6">
      {/* Live Deletion Notification Banner */}
      {deletedNotice && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center justify-between gap-3 text-rose-800 text-sm shadow-md animate-fade-in">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 animate-bounce" />
            <div>
              <p className="font-bold">{deletedNotice}</p>
            </div>
          </div>
        </div>
      )}

      {/* Editor Header Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left: Title & Status */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <button
            onClick={() => navigate('/')}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors shrink-0 cursor-pointer"
            title="Back to Documents"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <input
                ref={titleInputRef}
                type="text"
                value={title}
                readOnly={readOnly}
                onChange={(e) => setTitle(e.target.value)}
                onBlur={handleTitleBlur}
                onKeyDown={(e) => e.key === 'Enter' && titleInputRef.current?.blur()}
                className={`font-extrabold text-slate-900 text-lg sm:text-xl truncate bg-transparent focus:bg-slate-50 rounded-lg px-1.5 py-0.5 border border-transparent focus:border-slate-300 focus:outline-none w-full max-w-lg transition-colors ${
                  readOnly ? 'cursor-default' : 'hover:bg-slate-50 cursor-text'
                }`}
                placeholder="Untitled Document"
              />
              <SaveStatus status={saveStatus} readOnly={readOnly} />
            </div>

            <div className="flex items-center gap-2 mt-1 text-xs text-slate-500 pl-1.5">
              <span>Owner: <strong className="text-slate-700">{document.owner?.name}</strong></span>
              <span>•</span>
              <span className={`font-semibold px-2 py-0.5 rounded text-[11px] ${
                document.isOwner
                  ? 'bg-slate-100 text-slate-700'
                  : document.userPermission === 'EDIT'
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'bg-blue-50 text-blue-700'
              }`}>
                {document.isOwner ? 'Owner' : document.userPermission === 'EDIT' ? 'Can Edit' : 'Can View'}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Live Collaborators & Actions */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0 flex-wrap">
          <LiveCollaborators activeUsers={activeUsers} remoteEditingUser={remoteEditingUser} />

          {/* Export Dropdown */}
          <div className="relative" ref={exportMenuRef}>
            <button
              onClick={() => setIsExportMenuOpen(prev => !prev)}
              className="px-3.5 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 rounded-xl font-semibold text-xs transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
              title="Export document"
            >
              <Download className="w-4 h-4 text-slate-500" />
              <span>Export</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {isExportMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-2xl shadow-xl z-30 py-1.5 animate-fade-in">
                <div className="px-3 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Export Format
                </div>
                <button
                  onClick={handleExportMarkdown}
                  className="w-full px-3.5 py-2 text-left text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <FileCode className="w-4 h-4 text-emerald-600" />
                  <span>Export as Markdown (.md)</span>
                </button>
                <button
                  onClick={handleExportPdf}
                  className="w-full px-3.5 py-2 text-left text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <FileText className="w-4 h-4 text-rose-600" />
                  <span>Export as PDF (.pdf)</span>
                </button>
              </div>
            )}
          </div>

          {/* Owner Actions */}
          {document.isOwner && (
            <>
              <button
                onClick={() => setIsShareModalOpen(true)}
                className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-semibold text-xs shadow-sm transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Share2 className="w-4 h-4" /> Share
              </button>
              <button
                onClick={handleDelete}
                className="p-2 border border-slate-200 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                title="Delete document"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Editor Canvas */}
      <DocumentEditor
        initialContent={document.content}
        readOnly={readOnly}
        remoteCursors={remoteCursors}
        onSaveStatusChange={setSaveStatus}
        onContentChange={handleContentChange}
        onCursorChange={handleCursorChange}
      />

      {/* Share Modal */}
      <ShareModal
        document={document}
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        onSharesUpdated={loadDocument}
      />
    </div>
  );
};
