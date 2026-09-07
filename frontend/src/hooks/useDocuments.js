import { useState, useEffect, useCallback } from 'react';
import { fetchDocuments, createDocument, deleteDocument } from '../services/api';
import { useCurrentUser } from './useCurrentUser';

export const useDocuments = () => {
  const { currentUser } = useCurrentUser();
  const [ownedDocuments, setOwnedDocuments] = useState([]);
  const [sharedDocuments, setSharedDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadDocuments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!currentUser) {
        setOwnedDocuments([]);
        setSharedDocuments([]);
        return;
      }

      const data = await fetchDocuments();
      setOwnedDocuments(data?.ownedDocuments || []);
      setSharedDocuments(data?.sharedDocuments || []);
    } catch (err) {
      console.error('Error fetching documents:', err);
      setError(err.response?.data?.error || 'Could not connect to backend server. Make sure your Express backend is running on port 5000.');
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    loadDocuments();

    const handleUserChange = () => {
      loadDocuments();
    };

    window.addEventListener('docspace_user_changed', handleUserChange);
    return () => {
      window.removeEventListener('docspace_user_changed', handleUserChange);
    };
  }, [loadDocuments]);

  const handleCreateDocument = async (title, content) => {
    try {
      const newDoc = await createDocument({ title, content });
      await loadDocuments();
      return newDoc;
    } catch (err) {
      console.error('Error creating document:', err);
      throw err;
    }
  };

  const handleDeleteDocument = async (id) => {
    try {
      await deleteDocument(id);
      await loadDocuments();
    } catch (err) {
      console.error('Error deleting document:', err);
      throw err;
    }
  };

  return {
    ownedDocuments,
    sharedDocuments,
    loading,
    error,
    refreshDocuments: loadDocuments,
    createDocument: handleCreateDocument,
    deleteDocument: handleDeleteDocument
  };
};
