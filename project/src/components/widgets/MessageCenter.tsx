// MAIS Political Command Center - Message Center Widget
// Swiss Precision Standards - Real-time Political Communication

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, 
  AlertTriangle, 
  Lock, 
  Users, 
  Clock, 
  Filter,
  Search,
  MessageSquare,
  Eye,
  EyeOff
} from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { TERRITORY_CONFIG, ROLE_HIERARCHY } from '../../types';
import type { Message, PoliticalRole, TerritoryZone } from '../../types';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

export const MessageCenter: React.FC = () => {
  const { user, messages, sendMessage, markMessageAsRead, users, hasPermission } = useApp();
  const [newMessage, setNewMessage] = useState('');
  const [isUrgent, setIsUrgent] = useState(false);
  const [isConfidential, setIsConfidential] = useState(false);
  const [targetZone, setTargetZone] = useState<TerritoryZone | 'all'>('all');
  const [filterRole, setFilterRole] = useState<PoliticalRole | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  if (!user) return null;

  // Filter messages based on search and filters
  const filteredMessages = messages.filter(message => {
    const matchesSearch = message.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         message.sender_name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = filterRole === 'all' || message.sender_role === filterRole;
    
    const matchesZone = targetZone === 'all' || 
                       !message.territory_zone || 
                       message.territory_zone === targetZone;
    
    return matchesSearch && matchesRole && matchesZone;
  });

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim()) return;
    
    const messageData = {
      sender_id: user.id,
      sender_name: user.full_name,
      sender_role: user.role,
      content: newMessage.trim(),
      territory_zone: targetZone === 'all' ? undefined : targetZone,
      is_urgent: isUrgent,
      is_confidential: isConfidential
    };
    
    const success = await sendMessage(messageData);
    
    if (success) {
      setNewMessage('');
      setIsUrgent(false);
      setIsConfidential(false);
      setTargetZone('all');
    }
  };

  const handleMessageClick = async (message: Message) => {
    if (!message.read_by?.includes(user.id)) {
      await markMessageAsRead(message.id);
    }
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

  const getRoleColor = (role: PoliticalRole) => {
    const colors: Record<PoliticalRole, string> = {
      comite_ejecutivo_nacional: '#dc2626',
      lider_regional: '#ea580c',
      comite_departamental: '#d97706',
      candidato: '#ca8a04',
      influenciador_digital: '#65a30d',
      lider_comunitario: '#16a34a',
      votante_simpatizante: '#059669'
    };
    return colors[role];
  };

  const canSendToZone = (zone: TerritoryZone) => {
    if (user.role === 'comite_ejecutivo_nacional') return true;
    return user.territory_zone === zone;
  };

  const availableZones = Object.entries(TERRITORY_CONFIG).filter(([zone]) => 
    canSendToZone(zone as TerritoryZone)
  );

  const availableRoles = Object.keys(ROLE_HIERARCHY).filter(role => 
    hasPermission(role as PoliticalRole)
  ) as PoliticalRole[];

  return (
    <div className="bg-white rounded-xl shadow-lg h-full flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <MessageSquare className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Centro de Mensajes</h2>
              <p className="text-sm text-gray-500">
                {filteredMessages.length} mensajes • {messages.filter(m => !m.read_by?.includes(user.id) && m.sender_id !== user.id).length} sin leer
              </p>
            </div>
          </div>
          
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`p-2 rounded-lg transition-colors ${
              showFilters ? 'bg-blue-100 text-blue-600' : 'text-gray-500 hover:bg-gray-100'
            }`}
          >
            <Filter className="h-5 w-5" />
          </button>
        </div>

        {/* Filters */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 space-y-4"
            >
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar mensajes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Filter Controls */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Filtrar por Rol
                  </label>
                  <select
                    value={filterRole}
                    onChange={(e) => setFilterRole(e.target.value as PoliticalRole | 'all')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="all">Todos los roles</option>
                    {availableRoles.map(role => (
                      <option key={role} value={role}>
                        {getRoleDisplayName(role)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Filtrar por Zona
                  </label>
                  <select
                    value={targetZone}
                    onChange={(e) => setTargetZone(e.target.value as TerritoryZone | 'all')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="all">Todas las zonas</option>
                    {availableZones.map(([zone, config]) => (
                      <option key={zone} value={zone}>
                        {config.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Messages List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence>
          {filteredMessages.map((message) => {
            const isUnread = !message.read_by?.includes(user.id) && message.sender_id !== user.id;
            const isOwnMessage = message.sender_id === user.id;
            
            return (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                onClick={() => handleMessageClick(message)}
                className={`p-4 rounded-lg border cursor-pointer transition-all duration-200 ${
                  isUnread
                    ? 'bg-blue-50 border-blue-200 shadow-md'
                    : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                } ${
                  message.is_urgent ? 'ring-2 ring-red-500 ring-opacity-50' : ''
                }`}
              >
                {/* Message Header */}
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium"
                      style={{ backgroundColor: getRoleColor(message.sender_role) }}
                    >
                      {message.sender_name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{message.sender_name}</p>
                      <p className="text-xs text-gray-500">{getRoleDisplayName(message.sender_role)}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {message.is_urgent && (
                      <div className="flex items-center space-x-1 text-red-600">
                        <AlertTriangle className="h-4 w-4" />
                        <span className="text-xs font-medium">URGENTE</span>
                      </div>
                    )}
                    {message.is_confidential && (
                      <div className="flex items-center space-x-1 text-purple-600">
                        <Lock className="h-4 w-4" />
                        <span className="text-xs font-medium">CONFIDENCIAL</span>
                      </div>
                    )}
                    <div className="flex items-center space-x-1 text-gray-500">
                      <Clock className="h-3 w-3" />
                      <span className="text-xs">
                        {formatDistanceToNow(new Date(message.created_at), { 
                          addSuffix: true, 
                          locale: es 
                        })}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Message Content */}
                <div className="mb-2">
                  <p className="text-gray-800 whitespace-pre-wrap">{message.content}</p>
                </div>

                {/* Message Footer */}
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center space-x-4">
                    {message.territory_zone && (
                      <div className="flex items-center space-x-1">
                        <div 
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: TERRITORY_CONFIG[message.territory_zone]?.color }}
                        />
                        <span>{TERRITORY_CONFIG[message.territory_zone]?.name}</span>
                      </div>
                    )}
                    <div className="flex items-center space-x-1">
                      <Users className="h-3 w-3" />
                      <span>{message.read_by?.length || 0} leído{(message.read_by?.length || 0) !== 1 ? 's' : ''}</span>
                    </div>
                  </div>
                  
                  {isUnread && (
                    <div className="w-2 h-2 bg-blue-500 rounded-full" />
                  )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
        
        {filteredMessages.length === 0 && (
          <div className="text-center py-12">
            <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No hay mensajes que mostrar</p>
            {searchTerm && (
              <p className="text-sm text-gray-400 mt-2">
                Intenta con otros términos de búsqueda
              </p>
            )}
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Message Composer */}
      <div className="p-4 border-t border-gray-200">
        <form onSubmit={handleSendMessage} className="space-y-4">
          {/* Message Options */}
          <div className="flex items-center space-x-4">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={isUrgent}
                onChange={(e) => setIsUrgent(e.target.checked)}
                className="rounded border-gray-300 text-red-600 focus:ring-red-500"
              />
              <span className="text-sm text-gray-700 flex items-center space-x-1">
                <AlertTriangle className="h-4 w-4 text-red-500" />
                <span>Urgente</span>
              </span>
            </label>
            
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={isConfidential}
                onChange={(e) => setIsConfidential(e.target.checked)}
                className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
              />
              <span className="text-sm text-gray-700 flex items-center space-x-1">
                <Lock className="h-4 w-4 text-purple-500" />
                <span>Confidencial</span>
              </span>
            </label>

            {/* Zone Selector */}
            <select
              value={targetZone}
              onChange={(e) => setTargetZone(e.target.value as TerritoryZone | 'all')}
              className="text-sm border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Todas las zonas</option>
              {availableZones.map(([zone, config]) => (
                <option key={zone} value={zone}>
                  {config.name}
                </option>
              ))}
            </select>
          </div>

          {/* Message Input */}
          <div className="flex space-x-3">
            <div className="flex-1">
              <textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Escribe tu mensaje..."
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              />
            </div>
            <motion.button
              type="submit"
              disabled={!newMessage.trim()}
              whileHover={{ scale: newMessage.trim() ? 1.05 : 1 }}
              whileTap={{ scale: newMessage.trim() ? 0.95 : 1 }}
              className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                newMessage.trim()
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg hover:shadow-xl'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              <Send className="h-5 w-5" />
            </motion.button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MessageCenter;