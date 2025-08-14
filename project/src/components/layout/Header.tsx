// MAIS Political Command Center - Header Component
// Swiss Precision Standards - Navigation and User Controls

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Bell, User, LogOut, Settings, Menu, X } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { MAISLogoHeader } from '../ui/MAISLogo';
import UserProfile from '../profile/UserProfile';
import { TERRITORY_CONFIG } from '../../types';

interface HeaderProps {
  onMenuToggle: () => void;
  isMobileMenuOpen: boolean;
}

export const Header: React.FC<HeaderProps> = ({ onMenuToggle, isMobileMenuOpen }) => {
  const { user, logout, messages } = useApp();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  if (!user) return null;

  const unreadMessages = messages.filter(msg => 
    !msg.read_by?.includes(user.id) && msg.sender_id !== user.id
  ).length;

  const urgentMessages = messages.filter(msg => 
    msg.is_urgent && !msg.read_by?.includes(user.id) && msg.sender_id !== user.id
  ).length;

  const getRoleDisplayName = (role: string) => {
    const roleNames: Record<string, string> = {
      comite_ejecutivo_nacional: 'Comité Ejecutivo Nacional',
      lider_regional: 'Líder Regional',
      comite_departamental: 'Comité Departamental',
      candidato: 'Candidato',
      influenciador_digital: 'Influenciador Digital',
      lider_comunitario: 'Líder Comunitario',
      votante_simpatizante: 'Votante/Simpatizante'
    };
    return roleNames[role] || role;
  };

  const getTerritoryColor = (zone: string) => {
    return TERRITORY_CONFIG[zone as keyof typeof TERRITORY_CONFIG]?.color || '#6b7280';
  };

  const handleLogout = async () => {
    await logout();
    setShowUserMenu(false);
  };

  return (
    <>
      <header className="bg-white shadow-lg border-b border-gray-200 sticky top-0 z-30">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left Section - Logo and Mobile Menu */}
            <div className="flex items-center space-x-4">
              {/* Mobile Menu Button */}
              <button
                onClick={onMenuToggle}
                className="lg:hidden p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
              >
                {isMobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>

              {/* Logo */}
              <MAISLogoHeader className="hidden sm:flex" />
              
              {/* Mobile Logo */}
              <div className="sm:hidden">
                <MAISLogoHeader />
              </div>
            </div>

            {/* Center Section - User Info (Hidden on mobile) */}
            <div className="hidden md:flex items-center space-x-4">
              <div className="text-center">
                <p className="text-sm font-medium text-gray-900">{user.full_name}</p>
                <p className="text-xs text-gray-500">{getRoleDisplayName(user.role)}</p>
              </div>
              <div 
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: getTerritoryColor(user.territory_zone) }}
                title={TERRITORY_CONFIG[user.territory_zone]?.name}
              />
            </div>

            {/* Right Section - Notifications and User Menu */}
            <div className="flex items-center space-x-3">
              {/* Notifications */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="relative p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
              >
                <Bell className="h-6 w-6" />
                {unreadMessages > 0 && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className={`absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                      urgentMessages > 0 ? 'bg-red-500' : 'bg-blue-500'
                    }`}
                  >
                    {unreadMessages > 99 ? '99+' : unreadMessages}
                  </motion.div>
                )}
              </motion.button>

              {/* User Menu */}
              <div className="relative">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-2 p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-red-500 via-yellow-500 to-green-500 rounded-full flex items-center justify-center">
                    <User className="h-4 w-4 text-white" />
                  </div>
                  <div className="hidden sm:block text-left">
                    <p className="text-sm font-medium">{user.full_name}</p>
                    <p className="text-xs text-gray-500 truncate max-w-32">
                      {TERRITORY_CONFIG[user.territory_zone]?.name}
                    </p>
                  </div>
                </motion.button>

                {/* User Dropdown Menu */}
                {showUserMenu && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                    className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50"
                  >
                    {/* User Info */}
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="font-medium text-gray-900">{user.full_name}</p>
                      <p className="text-sm text-gray-500">{user.email}</p>
                      <div className="flex items-center space-x-2 mt-2">
                        <div 
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: getTerritoryColor(user.territory_zone) }}
                        />
                        <span className="text-xs text-gray-500">
                          {TERRITORY_CONFIG[user.territory_zone]?.name}
                        </span>
                      </div>
                    </div>

                    {/* Menu Items */}
                    <div className="py-2">
                      <button
                        onClick={() => {
                          setShowProfile(true);
                          setShowUserMenu(false);
                        }}
                        className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-3"
                      >
                        <Settings className="h-4 w-4" />
                        <span>Configurar Perfil</span>
                      </button>
                      
                      <button
                        onClick={handleLogout}
                        className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center space-x-3"
                      >
                        <LogOut className="h-4 w-4" />
                        <span>Cerrar Sesión</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Mobile User Info Bar */}
        <div className="md:hidden bg-gray-50 border-t border-gray-200 px-4 py-2">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">{user.full_name}</p>
              <p className="text-xs text-gray-500">{getRoleDisplayName(user.role)}</p>
            </div>
            <div className="flex items-center space-x-2">
              <div 
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: getTerritoryColor(user.territory_zone) }}
              />
              <span className="text-xs text-gray-500">
                {TERRITORY_CONFIG[user.territory_zone]?.name}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* User Profile Modal */}
      <UserProfile 
        isOpen={showProfile} 
        onClose={() => setShowProfile(false)} 
      />

      {/* Backdrop for mobile menu */}
      {showUserMenu && (
        <div 
          className="fixed inset-0 z-40 lg:hidden" 
          onClick={() => setShowUserMenu(false)}
        />
      )}
    </>
  );
};

export default Header;