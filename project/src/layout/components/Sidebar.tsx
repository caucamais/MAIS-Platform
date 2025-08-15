// MAIS Political Command Center - Sidebar Component
// Swiss Precision Standards - Intuitive Navigation

import React from 'react';
import { useApp } from '../../contexts/appContextUtils';
import MAISLogo from '../../ui/components/MAISLogo';
import { Home, MessageSquare, Map, DollarSign, Users, BarChart, LogOut, X } from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onViewChange: (view: string) => void;
}

const navItems = [
  { icon: Home, label: 'Dashboard', view: 'dashboard' },
  { icon: MessageSquare, label: 'Mensajes', view: 'messages' },
  { icon: Map, label: 'Territorio', view: 'territory' },
  { icon: DollarSign, label: 'Cuentas Claras', view: 'finances' },
  { icon: Users, label: 'Gestión de Usuarios', view: 'users' },
  { icon: BarChart, label: 'Análisis y Métricas', view: 'analytics' },
];

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, onViewChange }) => {
  const { logout } = useApp();

  const handleLogout = async () => {
    await logout();
    onClose();
  };

  const sidebarClasses = `
    fixed inset-y-0 left-0 z-40
    bg-gray-800 text-white
    w-80 transform transition-transform duration-300 ease-in-out
    flex flex-col
    ${isOpen ? 'translate-x-0' : '-translate-x-full'}
    lg:relative lg:translate-x-0
  `;

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && <div className="fixed inset-0 bg-black opacity-50 z-30 lg:hidden" onClick={onClose}></div>}

      <div className={sidebarClasses}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <div className="flex items-center">
            <MAISLogo className="h-10 w-auto" />
            <span className="ml-3 text-lg font-bold">MAIS</span>
          </div>
          <button onClick={onClose} className="lg:hidden text-gray-400 hover:text-white">
            <X size={24} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-2 py-4 space-y-2">
          {navItems.map((item) => (
            <a
              key={item.label}
              href="#"
              onClick={(e) => {
                e.preventDefault();
                onViewChange(item.view);
              }}
              className="flex items-center px-4 py-3 text-gray-300 rounded-lg hover:bg-gray-700 hover:text-white transition-colors"
            >
              <item.icon className="mr-3" size={22} />
              <span>{item.label}</span>
            </a>
          ))}
        </nav>

        {/* Footer */}
        <div className="px-2 py-4 border-t border-gray-700">
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              handleLogout();
            }}
            className="flex items-center px-4 py-3 text-gray-300 rounded-lg hover:bg-gray-700 hover:text-white transition-colors"
          >
            <LogOut className="mr-3" size={22} />
            <span>Cerrar Sesión</span>
          </a>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
