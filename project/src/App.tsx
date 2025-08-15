// MAIS Political Command Center - Main Application
// Swiss Precision Standards - Production-Ready Political Platform

import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet, useNavigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AppProvider } from './contexts/AppContext';
import { useApp } from './contexts/appContextUtils';

// Import components from their new domain-specific locations
import LoginForm from './auth/components/LoginForm';
import Header from './layout/components/Header';
import Sidebar from './layout/components/Sidebar';
import DashboardSelector from './dashboard/components/DashboardSelector';
import MessageCenter from './messages/components/MessageCenter';
import TerritoryMap from './territory/components/TerritoryMap';
import CuentasClaras from './finances/components/CuentasClaras';
import LoadingSpinner from './ui/components/LoadingSpinner';

// ProtectedRoute component to guard routes
const ProtectedRoute: React.FC = () => {
  const { user, loading } = useApp();

  if (loading) {
    return <div className="w-full h-screen flex items-center justify-center"><LoadingSpinner /></div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

// Main application layout
const AppLayout: React.FC = () => {
  const { user } = useApp();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const handleViewChange = (path: string) => {
    navigate(path);
    setIsSidebarOpen(false);
  };

  // Render login form if no user, otherwise render the main layout
  if (!user) {
    return <LoginForm />;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onViewChange={handleViewChange}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <Header
          onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)}
          isMobileMenuOpen={isSidebarOpen}
        />
        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          <div className="max-w-7xl mx-auto h-full">
            <Routes>
                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route path="dashboard" element={<DashboardSelector />} />
                <Route path="messages" element={<MessageCenter />} />
                <Route path="territory" element={<TerritoryMap />} />
                <Route path="finances" element={<CuentasClaras />} />
                <Route path="users" element={
                  <div className="bg-white rounded-xl shadow-lg p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Gestión de Usuarios</h2>
                    <p className="text-gray-600">Módulo de gestión de usuarios en desarrollo...</p>
                  </div>
                } />
                <Route path="analytics" element={
                  <div className="bg-white rounded-xl shadow-lg p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Análisis y Métricas</h2>
                    <p className="text-gray-600">Módulo de análisis y métricas en desarrollo...</p>
                  </div>
                } />
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </div>
        </main>
      </div>
    </div>
  );
};

// Root App component
function App() {
  return (
    <Router>
      <AppProvider>
        <Routes>
            <Route path="/login" element={<LoginForm />} />
            <Route path="/*" element={<ProtectedRoute><AppLayout /></ProtectedRoute>} />
        </Routes>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              duration: 3000,
              iconTheme: {
                primary: '#10b981',
                secondary: '#fff',
              },
            },
            error: {
              duration: 5000,
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />
      </AppProvider>
    </Router>
  );
}

export default App;
