import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { importDocumentFile } from '../services/api';
import { X, UploadCloud, FileText, AlertCircle, Loader2 } from 'lucide-react';

export const ImportModal = ({ isOpen, onClose, onImportSuccess }) => {
  const [targetContainer, setTargetContainer] = useState(null);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const el = window.document.getElementById('modal-root') || window.document.body;
      setTargetContainer(el);
    }
  }, []);

  if (!isOpen || !targetContainer) return null;

  const validateAndSetFile = (selectedFile) => {
    setError('');
    if (!selectedFile) return;

    const ext = selectedFile.name.split('.').pop()?.toLowerCase();
    if (!['txt', 'md', 'markdown'].includes(ext)) {
      setError(`Invalid file type '.${ext}'. Supported formats: .txt, .md`);
      setFile(null);
      return;
    }

    setFile(selectedFile);
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleImportSubmit = async (e) => {
    e.preventDefault();
    if (!file) return;

    try {
      setUploading(true);
      setError('');
      const response = await importDocumentFile(file);
      onImportSuccess(response.document);
      onClose();
    } catch (err) {
      console.error('File import error:', err);
      setError(err.response?.data?.error || 'Failed to import file. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 w-screen h-screen bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-[99999] animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden relative z-10">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2">
            <UploadCloud className="w-5 h-5 text-brand-600" />
            <h3 className="font-bold text-slate-900 text-base">Import Document</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleImportSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-rose-700 text-xs font-medium">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Dropzone */}
          <div
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
              dragActive
                ? 'border-brand-500 bg-brand-50/50'
                : file
                ? 'border-emerald-400 bg-emerald-50/20'
                : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".txt,.md,.markdown"
              onChange={handleFileChange}
              className="hidden"
            />

            {file ? (
              <div className="flex flex-col items-center gap-2">
                <FileText className="w-10 h-10 text-emerald-600" />
                <p className="text-sm font-semibold text-slate-800">{file.name}</p>
                <p className="text-xs text-slate-500">{(file.size / 1024).toFixed(1)} KB</p>
                <span className="text-xs text-brand-600 font-semibold underline mt-1">
                  Change File
                </span>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <UploadCloud className="w-10 h-10 text-slate-400" />
                <p className="text-sm font-semibold text-slate-700">
                  Click to upload or drag & drop file
                </p>
                <p className="text-xs text-slate-500 font-medium bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200 mt-1">
                  Supported formats: <strong className="text-slate-700">.txt, .md</strong>
                </p>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-200 rounded-xl font-semibold text-xs text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!file || uploading}
              className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-semibold text-xs transition-colors flex items-center gap-1.5 shadow-sm disabled:opacity-50 cursor-pointer"
            >
              {uploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Importing...
                </>
              ) : (
                'Import Document'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>,
    targetContainer
  );
};
