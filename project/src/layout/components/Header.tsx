// MAIS Political Command Center - Header Component
// Swiss Precision Standards - Clean and Responsive Layout

import React from 'react';
import { useApp } from '../../contexts/appContextUtils';
import UserProfile from '../../users/components/UserProfile';
import { Menu, X } from 'lucide-react';

interface HeaderProps {
  onMenuToggle: () => void;
  isMobileMenuOpen: boolean;
}

const Header: React.FC<HeaderProps> = ({ onMenuToggle, isMobileMenuOpen }) => {
  const { user } = useApp();

  return (
    <header className="bg-white shadow-sm sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Mobile Menu Button */}
          <div className="lg:hidden">
            <button
              onClick={onMenuToggle}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {/* Title (visible on larger screens) */}
          <div className="hidden lg:flex items-center">
            <h1 className="text-xl font-semibold text-gray-900">Centro de Mando MAIS</h1>
          </div>

          {/* User Profile Section */}
          <div className="flex items-center">
            {user && <UserProfile user={user} />}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
