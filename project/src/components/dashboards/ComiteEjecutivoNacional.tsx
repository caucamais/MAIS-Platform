// MAIS Political Command Center - Comité Ejecutivo Nacional Dashboard
// Swiss Precision Standards - National Executive Committee Interface

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Shield, 
  Users, 
  MapPin, 
  TrendingUp, 
  AlertTriangle, 
  BarChart3,
  MessageSquare,
  DollarSign,
  Target,
  Globe,
  Activity,
  Calendar
} from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { TERRITORY_CONFIG } from '../../types';
import type { DashboardProps } from '../../types';

export const ComiteEjecutivoNacional: React.FC<DashboardProps> = ({ user }) => {
  const { users, messages, finances, territories } = useApp();
  const [selectedMetric, setSelectedMetric] = useState<'users' | 'messages' | 'finances'>('users');

  // Calculate national metrics
  const nationalMetrics = {
    totalUsers: users.length,
    activeZones: territories.length,
    totalMunicipalities: territories.reduce((sum, t) => sum + t.municipalities.length, 0),
    unreadMessages: messages.filter(m => !m.read_by?.includes(user.id) && m.sender_id !== user.id).length,
    urgentMessages: messages.filter(m => m.is_urgent && !m.read_by?.includes(user.id) && m.sender_id !== user.id).length,
    totalBudget: finances.reduce((sum, f) => sum + f.budget_allocated, 0),
    totalSpent: finances.reduce((sum, f) => sum + f.budget_used, 0),
    totalIncome: finances.reduce((sum, f) => sum + f.income, 0),
    totalExpenses: finances.reduce((sum, f) => sum + f.expenses, 0)
  };

  // Zone-specific metrics
  const zoneMetrics = Object.entries(TERRITORY_CONFIG).map(([zone, config]) => {
    const zoneUsers = users.filter(u => u.territory_zone === zone);
    const zoneFinances = finances.filter(f => f.territory_zone === zone);
    const zoneMessages = messages.filter(m => m.territory_zone === zone);
    
    return {
      zone,
      name: config.name,
      color: config.color,
      users: zoneUsers.length,
      budget: zoneFinances.reduce((sum, f) => sum + f.budget_allocated, 0),
      spent: zoneFinances.reduce((sum, f) => sum + f.budget_used, 0),
      messages: zoneMessages.length,
      urgentMessages: zoneMessages.filter(m => m.is_urgent).length,
      municipalities: config.municipalities.length
    };
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const budgetUtilization = nationalMetrics.totalBudget > 0 
    ? (nationalMetrics.totalSpent / nationalMetrics.totalBudget) * 100 
    : 0;

  const financialBalance = nationalMetrics.totalIncome - nationalMetrics.totalExpenses;

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-red-600 via-yellow-600 to-green-600 rounded-xl p-6 text-white"
      >
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
            <Shield className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Comité Ejecutivo Nacional</h1>
            <p className="text-white/90">Panel de Control Estratégico Nacional</p>
            <p className="text-sm text-white/80 mt-1">
              Supervisión completa de {nationalMetrics.activeZones} zonas territoriales
            </p>
          </div>
        </div>
      </motion.div>

      {/* Key Performance Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Usuarios</p>
              <p className="text-3xl font-bold text-gray-900">{nationalMetrics.totalUsers}</p>
              <p className="text-sm text-blue-600 mt-1">
                {nationalMetrics.totalMunicipalities} municipios
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Mensajes</p>
              <p className="text-3xl font-bold text-gray-900">{nationalMetrics.unreadMessages}</p>
              <p className="text-sm text-purple-600 mt-1">
                {nationalMetrics.urgentMessages} urgentes
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <MessageSquare className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Presupuesto</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(nationalMetrics.totalBudget)}
              </p>
              <p className="text-sm text-green-600 mt-1">
                {budgetUtilization.toFixed(1)}% utilizado
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-orange-500"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Balance</p>
              <p className={`text-2xl font-bold ${
                financialBalance >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {formatCurrency(financialBalance)}
              </p>
              <p className="text-sm text-orange-600 mt-1">
                Nacional
              </p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Zone Performance Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-white rounded-xl shadow-lg p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Rendimiento por Zona Territorial</h2>
          <div className="flex space-x-2">
            {['users', 'messages', 'finances'].map((metric) => (
              <button
                key={metric}
                onClick={() => setSelectedMetric(metric as any)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedMetric === metric
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {metric === 'users' ? 'Usuarios' : 
                 metric === 'messages' ? 'Mensajes' : 'Finanzas'}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {zoneMetrics.map((zone, index) => (
            <motion.div
              key={zone.zone}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * index }}
              className="bg-gray-50 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center space-x-3 mb-3">
                <div 
                  className="w-10 h-10 rounded-lg flex items-center justify-center text-white"
                  style={{ backgroundColor: zone.color }}
                >
                  <MapPin className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{zone.name}</h3>
                  <p className="text-sm text-gray-500">{zone.municipalities} municipios</p>
                </div>
              </div>

              {selectedMetric === 'users' && (
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Usuarios Activos</span>
                    <span className="font-semibold text-gray-900">{zone.users}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="h-2 rounded-full transition-all duration-500"
                      style={{ 
                        width: `${(zone.users / Math.max(...zoneMetrics.map(z => z.users))) * 100}%`,
                        backgroundColor: zone.color 
                      }}
                    />
                  </div>
                </div>
              )}

              {selectedMetric === 'messages' && (
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Mensajes</span>
                    <span className="font-semibold text-gray-900">{zone.messages}</span>
                  </div>
                  {zone.urgentMessages > 0 && (
                    <div className="flex items-center space-x-2 text-red-600">
                      <AlertTriangle className="h-4 w-4" />
                      <span className="text-sm">{zone.urgentMessages} urgentes</span>
                    </div>
                  )}
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="h-2 rounded-full transition-all duration-500"
                      style={{ 
                        width: `${(zone.messages / Math.max(...zoneMetrics.map(z => z.messages), 1)) * 100}%`,
                        backgroundColor: zone.color 
                      }}
                    />
                  </div>
                </div>
              )}

              {selectedMetric === 'finances' && (
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Presupuesto</span>
                    <span className="font-semibold text-gray-900">
                      {formatCurrency(zone.budget)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Utilizado</span>
                    <span className="font-semibold text-blue-600">
                      {zone.budget > 0 ? ((zone.spent / zone.budget) * 100).toFixed(1) : 0}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="h-2 rounded-full transition-all duration-500"
                      style={{ 
                        width: `${zone.budget > 0 ? (zone.spent / zone.budget) * 100 : 0}%`,
                        backgroundColor: zone.color 
                      }}
                    />
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Critical Alerts */}
      {(nationalMetrics.urgentMessages > 0 || budgetUtilization > 80) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-red-50 border border-red-200 rounded-xl p-6"
        >
          <div className="flex items-center space-x-3 mb-4">
            <AlertTriangle className="h-6 w-6 text-red-600" />
            <h2 className="text-lg font-semibold text-red-800">Alertas Críticas</h2>
          </div>
          
          <div className="space-y-3">
            {nationalMetrics.urgentMessages > 0 && (
              <div className="flex items-center space-x-3 text-red-700">
                <MessageSquare className="h-5 w-5" />
                <span>
                  {nationalMetrics.urgentMessages} mensaje{nationalMetrics.urgentMessages !== 1 ? 's' : ''} urgente{nationalMetrics.urgentMessages !== 1 ? 's' : ''} sin leer
                </span>
              </div>
            )}
            
            {budgetUtilization > 80 && (
              <div className="flex items-center space-x-3 text-red-700">
                <DollarSign className="h-5 w-5" />
                <span>
                  Utilización de presupuesto nacional: {budgetUtilization.toFixed(1)}% - Requiere atención
                </span>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="bg-white rounded-xl shadow-lg p-6"
      >
        <h2 className="text-xl font-bold text-gray-900 mb-4">Acciones Rápidas</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors text-left">
            <div className="flex items-center space-x-3">
              <Users className="h-6 w-6 text-blue-600" />
              <div>
                <p className="font-medium text-blue-900">Gestionar Usuarios</p>
                <p className="text-sm text-blue-600">Administrar accesos y roles</p>
              </div>
            </div>
          </button>
          
          <button className="p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors text-left">
            <div className="flex items-center space-x-3">
              <BarChart3 className="h-6 w-6 text-green-600" />
              <div>
                <p className="font-medium text-green-900">Reportes Financieros</p>
                <p className="text-sm text-green-600">Generar informes detallados</p>
              </div>
            </div>
          </button>
          
          <button className="p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors text-left">
            <div className="flex items-center space-x-3">
              <Globe className="h-6 w-6 text-purple-600" />
              <div>
                <p className="font-medium text-purple-900">Vista Nacional</p>
                <p className="text-sm text-purple-600">Análisis territorial completo</p>
              </div>
            </div>
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default ComiteEjecutivoNacional;