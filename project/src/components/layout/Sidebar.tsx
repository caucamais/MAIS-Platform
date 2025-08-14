// MAIS Political Command Center - Sidebar Navigation
// Swiss Precision Standards - Role-Based Navigation

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Home, 
  Users, 
  MessageSquare, 
  DollarSign, 
  Map, 
  BarChart3, 
  Settings,
  Shield,
  Target,
  Megaphone,
  Heart,
  Vote
} from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { TERRITORY_CONFIG } from '../../types';
import type { PoliticalRole } from '../../types';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  activeView: string;
  onViewChange: (view: string) => void;
}

interface NavigationItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  roles: PoliticalRole[];
  badge?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  isOpen, 
  onClose, 
  activeView, 
  onViewChange 
}) => {
  const { user, messages } = useApp();

  if (!user) return null;

  const unreadMessages = messages.filter(msg => 
    !msg.read_by?.includes(user.id) && msg.sender_id !== user.id
  ).length;

  // Navigation items based on political roles
  const navigationItems: NavigationItem[] = [
    {
      id: 'dashboard',
      label: 'Panel Principal',
      icon: Home,
      roles: [
        'comite_ejecutivo_nacional',
        'lider_regional',
        'comite_departamental',
        'candidato',
        'influenciador_digital',
        'lider_comunitario',
        'votante_simpatizante'
      ]
    },
    {
      id: 'messages',
      label: 'Centro de Mensajes',
      icon: MessageSquare,
      roles: [
        'comite_ejecutivo_nacional',
        'lider_regional',
        'comite_departamental',
        'candidato',
        'influenciador_digital',
        'lider_comunitario'
      ],
      badge: unreadMessages
    },
    {
      id: 'users',
      label: 'Gestión de Usuarios',
      icon: Users,
      roles: [
        'comite_ejecutivo_nacional',
        'lider_regional',
        'comite_departamental'
      ]
    },
    {
      id: 'territory',
      label: 'Mapa Territorial',
      icon: Map,
      roles: [
        'comite_ejecutivo_nacional',
        'lider_regional',
        'comite_departamental',
        'candidato'
      ]
    },
    {
      id: 'finances',
      label: 'Cuentas Claras',
      icon: DollarSign,
      roles: [
        'comite_ejecutivo_nacional',
        'lider_regional',
        'comite_departamental',
        'candidato'
      ]
    },
    {
      id: 'analytics',
      label: 'Análisis y Métricas',
      icon: BarChart3,
      roles: [
        'comite_ejecutivo_nacional',
        'lider_regional',
        'comite_departamental',
        'candidato',
        'influenciador_digital'
      ]
    }
  ];

  // Filter navigation items based on user role
  const availableItems = navigationItems.filter(item => 
    item.roles.includes(user.role)
  );

  const handleItemClick = (itemId: string) => {
    onViewChange(itemId);
    onClose(); // Close mobile sidebar
  };

  const getRoleIcon = (role: PoliticalRole) => {
    const roleIcons: Record<PoliticalRole, React.ComponentType<{ className?: string }>> = {
      comite_ejecutivo_nacional: Shield,
      lider_regional: Target,
      comite_departamental: Settings,
      candidato: Vote,
      influenciador_digital: Megaphone,
      lider_comunitario: Heart,
      votante_simpatizante: Users
    };
    return roleIcons[role];
  };

  const getRoleDisplayName = (role: PoliticalRole) => {
    const roleNames: Record<PoliticalRole, string> = {
      comite_ejecutivo_nacional: 'Comité Ejecutivo Nacional',
      lider_regional: 'Líder Regional',
      comite_departamental: 'Comité Departamental',
      candidato: 'Candidato',
      influenciador_digital: 'Influenciador Digital',
      lider_comunitario: 'Líder Comunitario',
      votante_simpatizante: 'Votante/Simpatizante'
    };
    return roleNames[role];
  };

  const getTerritoryColor = (zone: string) => {
    return TERRITORY_CONFIG[zone as keyof typeof TERRITORY_CONFIG]?.color || '#6b7280';
  };

  const sidebarVariants = {
    open: {
      x: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30
      }
    },
    closed: {
      x: "-100%",
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30
      }
    }
  };

  const itemVariants = {
    open: {
      opacity: 1,
      x: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30
      }
    },
    closed: {
      opacity: 0,
      x: -20
    }
  };

  const RoleIcon = getRoleIcon(user.role);

  return (
    <>
      {/* Mobile Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        variants={sidebarVariants}
        initial="closed"
        animate={isOpen ? "open" : "closed"}
        className="fixed left-0 top-0 h-full w-80 bg-white shadow-2xl z-50 lg:relative lg:translate-x-0 lg:shadow-lg"
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div 
                className="w-12 h-12 rounded-full flex items-center justify-center text-white"
                style={{ backgroundColor: getTerritoryColor(user.territory_zone) }}
              >
                <RoleIcon className="h-6 w-6" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 truncate">{user.full_name}</p>
                <p className="text-sm text-gray-500 truncate">{getRoleDisplayName(user.role)}</p>
                <p className="text-xs text-gray-400 truncate">
                  {TERRITORY_CONFIG[user.territory_zone]?.name}
                </p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            <AnimatePresence>
              {availableItems.map((item, index) => {
                const Icon = item.icon;
                const isActive = activeView === item.id;
                
                return (
                  <motion.button
                    key={item.id}
                    variants={itemVariants}
                    initial="closed"
                    animate="open"
                    transition={{ delay: index * 0.1 }}
                    onClick={() => handleItemClick(item.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-all duration-200 ${
                      isActive
                        ? 'bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 text-white shadow-lg'
                        : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                  >
                    <Icon className={`h-5 w-5 ${isActive ? 'text-white' : 'text-gray-500'}`} />
                    <span className="font-medium flex-1">{item.label}</span>
                    {item.badge && item.badge > 0 && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className={`px-2 py-1 rounded-full text-xs font-bold ${
                          isActive 
                            ? 'bg-white/20 text-white' 
                            : 'bg-red-500 text-white'
                        }`}
                      >
                        {item.badge > 99 ? '99+' : item.badge}
                      </motion.div>
                    )}
                  </motion.button>
                );
              })}
            </AnimatePresence>
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200">
            <div className="bg-gradient-to-r from-red-50 via-yellow-50 to-green-50 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-red-500 via-yellow-500 to-green-500 rounded-full flex items-center justify-center">
                  <Shield className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">MAIS 2025</p>
                  <p className="text-xs text-gray-500">Centro de Mando Político</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.aside>
    </>
  );
};

export default Sidebar;