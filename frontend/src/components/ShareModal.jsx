import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useCurrentUser } from '../hooks/useCurrentUser';
import { fetchDocumentShares, addDocumentShare, removeDocumentShare } from '../services/api';
import { X, UserPlus, Trash2, Shield, Lock, AlertCircle, ChevronDown } from 'lucide-react';
import { getAvatarColor } from '../utils/formatting';

export const ShareModal = ({ document: doc, isOpen, onClose, onSharesUpdated }) => {
  const [targetContainer, setTargetContainer] = useState(null);
  const { users, currentUser } = useCurrentUser();
  const [shares, setShares] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [permission, setPermission] = useState('EDIT');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const el = window.document.getElementById('modal-root') || window.document.body;
      setTargetContainer(el);
    }
  }, []);

  const isOwner = doc?.ownerId === currentUser?.id;

  // Filter users eligible to be shared with (exclude document owner)
  const availableUsers = users.filter((u) => u.id !== doc?.ownerId);

  const loadShares = async () => {
    if (!doc?.id || !isOwner) return;
    try {
      setLoading(true);
      setError('');
      const data = await fetchDocumentShares(doc.id);
      setShares(data);
    } catch (err) {
      console.error('Failed to load document shares:', err);
      setError(err.response?.data?.error || 'Failed to load access list.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && doc?.id) {
      loadShares();
    }
  }, [isOpen, doc?.id]);

  // Set default selected user whenever availableUsers changes
  useEffect(() => {
    if (availableUsers.length > 0) {
      const isCurrentValid = availableUsers.some(u => u.id === selectedUserId);
      if (!isCurrentValid) {
        setSelectedUserId(availableUsers[0].id);
      }
    } else {
      setSelectedUserId('');
    }
  }, [users, doc?.ownerId]);

  const handleAddShare = async (e) => {
    e.preventDefault();
    if (!selectedUserId) return;
    try {
      setSubmitting(true);
      setError('');
      await addDocumentShare(doc.id, { userId: selectedUserId, permission });
      await loadShares();
      onSharesUpdated?.();
    } catch (err) {
      console.error('Failed to share document:', err);
      setError(err.response?.data?.error || 'Failed to share document.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemoveShare = async (targetUserId) => {
    try {
      setError('');
      await removeDocumentShare(doc.id, targetUserId);
      await loadShares();
      onSharesUpdated?.();
    } catch (err) {
      console.error('Failed to revoke access:', err);
      setError(err.response?.data?.error || 'Failed to revoke access.');
    }
  };

  if (!isOpen || !doc || !targetContainer) return null;

  return createPortal(
    <div className="fixed inset-0 w-screen h-screen bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-[99999] animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden relative z-10">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-brand-600" />
            <h3 className="font-bold text-slate-900 text-base">Share "{doc.title || 'Untitled Document'}"</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-rose-700 text-xs font-medium">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {!isOwner ? (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs flex items-center gap-3">
              <Lock className="w-5 h-5 shrink-0 text-amber-600" />
              <div>
                <p className="font-semibold">Only the document owner can manage sharing settings.</p>
                <p className="mt-0.5 text-amber-700">You are viewing this document as a collaborator ({doc.userPermission}).</p>
              </div>
            </div>
          ) : (
            <>
              {/* Add person form */}
              <form onSubmit={handleAddShare} className="space-y-3">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                  Add Person
                </label>
                <div className="flex flex-col sm:flex-row gap-2">
                  {/* Select User Dropdown */}
                  <div className="relative flex-1">
                    <select
                      value={selectedUserId}
                      onChange={(e) => setSelectedUserId(e.target.value)}
                      className="w-full appearance-none pr-8 pl-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500/20 cursor-pointer"
                    >
                      {availableUsers.length === 0 ? (
                        <option value="">No other users available</option>
                      ) : (
                        availableUsers.map((u) => (
                          <option key={u.id} value={u.id}>
                            {u.name} ({u.email})
                          </option>
                        ))
                      )}
                    </select>
                    <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
                  </div>

                  {/* Select Permission Dropdown */}
                  <div className="relative shrink-0">
                    <select
                      value={permission}
                      onChange={(e) => setPermission(e.target.value)}
                      className="appearance-none pr-8 pl-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500/20 cursor-pointer"
                    >
                      <option value="EDIT">Can edit</option>
                      <option value="VIEW">Can view</option>
                    </select>
                    <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting || !selectedUserId}
                    className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-sm disabled:opacity-50 cursor-pointer shrink-0"
                  >
                    <UserPlus className="w-4 h-4" />
                    Share
                  </button>
                </div>
              </form>

              {/* People with access list */}
              <div className="space-y-3">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                  People With Access
                </label>

                <div className="divide-y divide-slate-100 border border-slate-100 rounded-xl overflow-hidden bg-slate-50/30">
                  {/* Document Owner */}
                  <div className="flex items-center justify-between p-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${getAvatarColor(doc.owner?.name || 'Owner')}`}>
                        {doc.owner?.name?.charAt(0) || 'O'}
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-slate-900">{doc.owner?.name} <span className="text-[10px] text-brand-600 bg-brand-50 px-1.5 py-0.5 rounded font-bold ml-1">You</span></p>
                        <p className="text-[11px] text-slate-500">{doc.owner?.email}</p>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                      Owner
                    </span>
                  </div>

                  {/* Shared Users */}
                  {loading ? (
                    <div className="p-4 text-center text-xs text-slate-400">Loading access list...</div>
                  ) : shares.length === 0 ? (
                    <div className="p-4 text-center text-xs text-slate-400">No one else has access to this document.</div>
                  ) : (
                    shares.map((share) => (
                      <div key={share.id} className="flex items-center justify-between p-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${getAvatarColor(share.user.name)}`}>
                            {share.user.name.charAt(0)}
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-slate-900">{share.user.name}</p>
                            <p className="text-[11px] text-slate-500">{share.user.email}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded ${
                            share.permission === 'EDIT' ? 'bg-emerald-50 text-emerald-700' : 'bg-blue-50 text-blue-700'
                          }`}>
                            {share.permission === 'EDIT' ? 'Can Edit' : 'Can View'}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveShare(share.userId)}
                            className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                            title="Remove access"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-slate-200 rounded-xl font-semibold text-xs text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>,
    targetContainer
  );
};
