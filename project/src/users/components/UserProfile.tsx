// MAIS Political Command Center - User Profile
// Swiss Precision Standards - User-Centric Design

import React, { useState } from 'react';
import { useApp } from '../../contexts/appContextUtils';
import type { User } from '../../types';
import { LogOut, User as UserIcon, ChevronDown, ChevronUp } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

interface UserProfileProps {
  user: User;
}

const UserProfile: React.FC<UserProfileProps> = ({ user }) => {
  const { logout } = useApp();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
  };

  const getInitials = (name: string) => {
    const names = name.split(' ');
    return names.length > 1
      ? `${names[0][0]}${names[names.length - 1][0]}`
      : names[0].substring(0, 2);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 transition-colors"
      >
        <div className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold">
          {user.avatar_url ? (
            <img src={user.avatar_url} alt={user.full_name} className="w-full h-full rounded-full" />
          ) : (
            getInitials(user.full_name)
          )}
        </div>
        <div className="hidden md:block text-left">
          <p className="font-semibold text-sm text-gray-800">{user.full_name}</p>
          <p className="text-xs text-gray-500">{user.role.replace(/_/g, ' ')}</p>
        </div>
        {isOpen ? <ChevronUp size={18} className="text-gray-500" /> : <ChevronDown size={18} className="text-gray-500" />}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg ring-1 ring-black ring-opacity-5 z-50"
          >
            <div className="py-1">
              <div className="px-4 py-3 border-b">
                <p className="text-sm font-semibold text-gray-800">{user.full_name}</p>
                <p className="text-xs text-gray-500 truncate">{user.email}</p>
              </div>
              <a
                href="#"
                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                <UserIcon size={16} className="mr-2" />
                Mi Perfil
              </a>
              <a
                href="#"
                onClick={handleLogout}
                className="flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50"
              >
                <LogOut size={16} className="mr-2" />
                Cerrar Sesión
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UserProfile;
