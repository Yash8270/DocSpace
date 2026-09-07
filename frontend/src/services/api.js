import axios from 'axios';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || '';
const API_BASE_URL = BACKEND_URL ? `${BACKEND_URL}/api` : '/api';

// Retrieve current demo user ID from localStorage
export const getCurrentUserId = () => {
  return localStorage.getItem('docspace_user_id') || 'usr_alice_1001';
};

export const setCurrentUserIdInStorage = (userId) => {
  localStorage.setItem('docspace_user_id', userId);
};

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request Interceptor: Attach X-User-Id header to every outgoing request
api.interceptors.request.use((config) => {
  const userId = getCurrentUserId();
  if (userId) {
    config.headers['X-User-Id'] = userId;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// User APIs
export const fetchUsers = async () => {
  const response = await api.get('/users');
  return response.data;
};

// Document APIs
export const fetchDocuments = async () => {
  const response = await api.get('/documents');
  return response.data;
};

export const createDocument = async (docData = {}) => {
  const response = await api.post('/documents', docData);
  return response.data;
};

export const fetchDocumentById = async (id) => {
  const response = await api.get(`/documents/${id}`);
  return response.data;
};

export const updateDocument = async (id, docData) => {
  const response = await api.patch(`/documents/${id}`, docData);
  return response.data;
};

export const deleteDocument = async (id) => {
  const response = await api.delete(`/documents/${id}`);
  return response.data;
};

// Sharing APIs
export const fetchDocumentShares = async (documentId) => {
  const response = await api.get(`/documents/${documentId}/shares`);
  return response.data;
};

export const addDocumentShare = async (documentId, { userId, permission }) => {
  const response = await api.post(`/documents/${documentId}/shares`, { userId, permission });
  return response.data;
};

export const removeDocumentShare = async (documentId, userId) => {
  const response = await api.delete(`/documents/${documentId}/shares/${userId}`);
  return response.data;
};

// Import API
export const importDocumentFile = async (file) => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await api.post('/import', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return response.data;
};

export default api;
