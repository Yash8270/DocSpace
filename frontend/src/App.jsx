import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { CurrentUserProvider } from './hooks/useCurrentUser';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { EditorPage } from './pages/EditorPage';

export default function App() {
  return (
    <BrowserRouter>
      <CurrentUserProvider>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/documents/:id" element={<EditorPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Layout>
      </CurrentUserProvider>
    </BrowserRouter>
  );
}
