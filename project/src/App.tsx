// MAIS Political Command Center - Main Application
// Swiss Precision Standards - Production-Ready Political Platform

import React, { useState } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AppProvider, useApp } from './contexts/AppContext';
import LoginForm from './components/auth/LoginForm';
import Header from './components/layout/Header';
import Sidebar from './components/layout/Sidebar';
import MessageCenter from './components/widgets/MessageCenter';
import TerritoryMap from './components/widgets/TerritoryMap';
import CuentasClaras from './components/widgets/CuentasClaras';
import ComiteEjecutivoNacional from './components/dashboards/ComiteEjecutivoNacional';
import LiderRegional from './components/dashboards/LiderRegional';

// Dashboard component selector based on user role
const DashboardSelector: React.FC = () => {
  const { user } = useApp();
  
  if (!user) return null;

  switch (user.role) {
    case 'comite_ejecutivo_nacional':
      return <ComiteEjecutivoNacional user={user} />;
    case 'lider_regional':
      return <LiderRegional user={user} />;
    case 'comite_departamental':
      return <LiderRegional user={user} />; // Reuse regional dashboard with departmental context
    case 'candidato':
      return <LiderRegional user={user} />; // Candidate-specific dashboard (simplified regional view)
    case 'influenciador_digital':
      return <MessageCenter />; // Focus on messaging for digital influencers
    case 'lider_comunitario':
      return <MessageCenter />; // Community leaders focus on local communication
    case 'votante_simpatizante':
      return <MessageCenter />; // Basic messaging interface for supporters
    default:
      return <MessageCenter />;
  }
};

// Main application layout
const AppLayout: React.FC = () => {
  const { user, loading } = useApp();
  const [activeView, setActiveView] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-yellow-50 to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Cargando Centro de Mando MAIS...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginForm />;
  }

  const renderMainContent = () => {
    switch (activeView) {
      case 'dashboard':
        return <DashboardSelector />;
      case 'messages':
        return <MessageCenter />;
      case 'territory':
        return <TerritoryMap />;
      case 'finances':
        return <CuentasClaras />;
      case 'users':
        return (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Gestión de Usuarios</h2>
            <p className="text-gray-600">Módulo de gestión de usuarios en desarrollo...</p>
          </div>
        );
      case 'analytics':
        return (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Análisis y Métricas</h2>
            <p className="text-gray-600">Módulo de análisis y métricas en desarrollo...</p>
          </div>
        );
      default:
        return <DashboardSelector />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="hidden lg:block lg:w-80 lg:flex-shrink-0">
        <Sidebar
          isOpen={true}
          onClose={() => {}}
          activeView={activeView}
          onViewChange={setActiveView}
        />
      </div>

      {/* Mobile Sidebar */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        activeView={activeView}
        onViewChange={setActiveView}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <Header
          onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)}
          isMobileMenuOpen={isSidebarOpen}
        />

        {/* Main Content Area */}
        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          <div className="max-w-7xl mx-auto h-full">
            {renderMainContent()}
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
        <AppLayout />
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