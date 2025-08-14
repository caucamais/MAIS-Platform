// MAIS Political Command Center - Líder Regional Dashboard
// Swiss Precision Standards - Regional Leadership Interface

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Target, 
  Users, 
  MapPin, 
  MessageSquare, 
  DollarSign,
  TrendingUp,
  AlertTriangle,
  Calendar,
  Activity,
  BarChart3,
  CheckCircle
} from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { TERRITORY_CONFIG } from '../../types';
import type { DashboardProps } from '../../types';

export const LiderRegional: React.FC<DashboardProps> = ({ user }) => {
  const { users, messages, finances, territories, getUsersByTerritory, getFinancesByTerritory } = useApp();
  const [activeTab, setActiveTab] = useState<'overview' | 'team' | 'finances'>('overview');

  // Regional metrics for user's territory
  const regionalUsers = getUsersByTerritory(user.territory_zone);
  const regionalFinances = getFinancesByTerritory(user.territory_zone);
  const regionalMessages = messages.filter(m => 
    m.territory_zone === user.territory_zone || !m.territory_zone
  );
  
  const territory = territories.find(t => t.zone === user.territory_zone);
  const territoryConfig = TERRITORY_CONFIG[user.territory_zone];

  const regionalMetrics = {
    totalUsers: regionalUsers.length,
    municipalities: territory?.municipalities.length || 0,
    unreadMessages: regionalMessages.filter(m => !m.read_by?.includes(user.id) && m.sender_id !== user.id).length,
    urgentMessages: regionalMessages.filter(m => m.is_urgent && !m.read_by?.includes(user.id) && m.sender_id !== user.id).length,
    totalBudget: regionalFinances.reduce((sum, f) => sum + f.budget_allocated, 0),
    totalSpent: regionalFinances.reduce((sum, f) => sum + f.budget_used, 0),
    totalIncome: regionalFinances.reduce((sum, f) => sum + f.income, 0),
    totalExpenses: regionalFinances.reduce((sum, f) => sum + f.expenses, 0),
    totalPopulation: territory?.municipalities.reduce((sum, m) => sum + m.population, 0) || 0,
    totalVoters: territory?.municipalities.reduce((sum, m) => sum + m.registered_voters, 0) || 0
  };

  const budgetUtilization = regionalMetrics.totalBudget > 0 
    ? (regionalMetrics.totalSpent / regionalMetrics.totalBudget) * 100 
    : 0;

  const coverage = regionalMetrics.totalVoters > 0 
    ? (regionalMetrics.totalUsers / regionalMetrics.totalVoters) * 100 * 1000 // Adjusted for realistic coverage
    : 0;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Team performance by role
  const teamByRole = regionalUsers.reduce((acc, user) => {
    acc[user.role] = (acc[user.role] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const getRoleDisplayName = (role: string) => {
    const roleNames: Record<string, string> = {
      comite_departamental: 'Comité Departamental',
      candidato: 'Candidatos',
      influenciador_digital: 'Influenciadores Digitales',
      lider_comunitario: 'Líderes Comunitarios',
      votante_simpatizante: 'Votantes/Simpatizantes'
    };
    return roleNames[role] || role;
  };

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-orange-600 to-red-600 rounded-xl p-6 text-white"
        style={{ background: `linear-gradient(135deg, ${territoryConfig.color}, ${territoryConfig.color}dd)` }}
      >
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
            <Target className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Líder Regional - {territoryConfig.name}</h1>
            <p className="text-white/90">Panel de Control Regional</p>
            <p className="text-sm text-white/80 mt-1">
              Supervisión de {regionalMetrics.municipalities} municipios y {regionalMetrics.totalUsers} usuarios
            </p>
          </div>
        </div>
      </motion.div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-xl shadow-lg">
        <div className="border-b border-gray-200">
          <nav className="flex">
            {[
              { id: 'overview', label: 'Resumen General', icon: Activity },
              { id: 'team', label: 'Equipo Regional', icon: Users },
              { id: 'finances', label: 'Finanzas', icon: DollarSign }
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id as any)}
                className={`flex items-center space-x-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === id
                    ? 'border-orange-500 text-orange-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-blue-50 rounded-lg p-4"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-blue-800">Usuarios Activos</p>
                      <p className="text-2xl font-bold text-blue-900">{regionalMetrics.totalUsers}</p>
                      <p className="text-sm text-blue-600">
                        {coverage.toFixed(1)}% cobertura
                      </p>
                    </div>
                    <Users className="h-8 w-8 text-blue-600" />
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 }}
                  className="bg-purple-50 rounded-lg p-4"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-purple-800">Mensajes</p>
                      <p className="text-2xl font-bold text-purple-900">{regionalMetrics.unreadMessages}</p>
                      <p className="text-sm text-purple-600">
                        {regionalMetrics.urgentMessages} urgentes
                      </p>
                    </div>
                    <MessageSquare className="h-8 w-8 text-purple-600" />
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                  className="bg-green-50 rounded-lg p-4"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-green-800">Presupuesto</p>
                      <p className="text-xl font-bold text-green-900">
                        {formatCurrency(regionalMetrics.totalBudget)}
                      </p>
                      <p className="text-sm text-green-600">
                        {budgetUtilization.toFixed(1)}% usado
                      </p>
                    </div>
                    <DollarSign className="h-8 w-8 text-green-600" />
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 }}
                  className="bg-orange-50 rounded-lg p-4"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-orange-800">Municipios</p>
                      <p className="text-2xl font-bold text-orange-900">{regionalMetrics.municipalities}</p>
                      <p className="text-sm text-orange-600">
                        {(regionalMetrics.totalPopulation / 1000).toFixed(0)}K habitantes
                      </p>
                    </div>
                    <MapPin className="h-8 w-8 text-orange-600" />
                  </div>
                </motion.div>
              </div>

              {/* Territory Overview */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Municipios de {territoryConfig.name}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {territory?.municipalities.map((municipality, index) => (
                    <motion.div
                      key={municipality.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-white rounded-lg p-4 border border-gray-200"
                    >
                      <div className="flex items-center space-x-3">
                        <div 
                          className="w-8 h-8 rounded-full flex items-center justify-center text-white"
                          style={{ backgroundColor: territoryConfig.color }}
                        >
                          <MapPin className="h-4 w-4" />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">{municipality.name}</h4>
                          <p className="text-sm text-gray-500">
                            {(municipality.population / 1000).toFixed(0)}K hab. • {(municipality.registered_voters / 1000).toFixed(0)}K votantes
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Alerts */}
              {(regionalMetrics.urgentMessages > 0 || budgetUtilization > 80) && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center space-x-3 mb-3">
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                    <h3 className="font-medium text-red-800">Alertas Regionales</h3>
                  </div>
                  <div className="space-y-2">
                    {regionalMetrics.urgentMessages > 0 && (
                      <p className="text-sm text-red-700">
                        • {regionalMetrics.urgentMessages} mensaje{regionalMetrics.urgentMessages !== 1 ? 's' : ''} urgente{regionalMetrics.urgentMessages !== 1 ? 's' : ''} pendiente{regionalMetrics.urgentMessages !== 1 ? 's' : ''}
                      </p>
                    )}
                    {budgetUtilization > 80 && (
                      <p className="text-sm text-red-700">
                        • Utilización de presupuesto: {budgetUtilization.toFixed(1)}% - Requiere atención
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'team' && (
            <div className="space-y-6">
              {/* Team Composition */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Composición del Equipo</h3>
                  <div className="space-y-3">
                    {Object.entries(teamByRole).map(([role, count]) => (
                      <div key={role} className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">{getRoleDisplayName(role)}</span>
                        <span className="font-semibold text-gray-900">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Métricas de Equipo</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Total Miembros</span>
                      <span className="font-semibold text-gray-900">{regionalMetrics.totalUsers}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Cobertura Electoral</span>
                      <span className="font-semibold text-blue-600">{coverage.toFixed(1)}%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Municipios Cubiertos</span>
                      <span className="font-semibold text-green-600">{regionalMetrics.municipalities}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Team Members List */}
              <div className="bg-white border border-gray-200 rounded-lg">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">Miembros del Equipo Regional</h3>
                </div>
                <div className="divide-y divide-gray-200">
                  {regionalUsers.slice(0, 10).map((member) => (
                    <div key={member.id} className="px-6 py-4 flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div 
                          className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium"
                          style={{ backgroundColor: territoryConfig.color }}
                        >
                          {member.full_name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{member.full_name}</p>
                          <p className="text-sm text-gray-500">{getRoleDisplayName(member.role)}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500">{member.email}</p>
                        {member.last_login && (
                          <p className="text-xs text-gray-400">
                            Último acceso: {new Date(member.last_login).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                {regionalUsers.length > 10 && (
                  <div className="px-6 py-4 bg-gray-50 text-center">
                    <p className="text-sm text-gray-500">
                      Y {regionalUsers.length - 10} miembros más...
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'finances' && (
            <div className="space-y-6">
              {/* Financial Overview */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-green-50 rounded-lg p-6">
                  <div className="flex items-center space-x-3 mb-3">
                    <TrendingUp className="h-6 w-6 text-green-600" />
                    <h3 className="font-medium text-green-800">Ingresos</h3>
                  </div>
                  <p className="text-2xl font-bold text-green-900">
                    {formatCurrency(regionalMetrics.totalIncome)}
                  </p>
                </div>

                <div className="bg-red-50 rounded-lg p-6">
                  <div className="flex items-center space-x-3 mb-3">
                    <TrendingUp className="h-6 w-6 text-red-600 transform rotate-180" />
                    <h3 className="font-medium text-red-800">Gastos</h3>
                  </div>
                  <p className="text-2xl font-bold text-red-900">
                    {formatCurrency(regionalMetrics.totalExpenses)}
                  </p>
                </div>

                <div className="bg-blue-50 rounded-lg p-6">
                  <div className="flex items-center space-x-3 mb-3">
                    <BarChart3 className="h-6 w-6 text-blue-600" />
                    <h3 className="font-medium text-blue-800">Balance</h3>
                  </div>
                  <p className={`text-2xl font-bold ${
                    regionalMetrics.totalIncome - regionalMetrics.totalExpenses >= 0 
                      ? 'text-blue-900' 
                      : 'text-red-900'
                  }`}>
                    {formatCurrency(regionalMetrics.totalIncome - regionalMetrics.totalExpenses)}
                  </p>
                </div>
              </div>

              {/* Budget Utilization */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Utilización de Presupuesto</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Presupuesto Asignado</span>
                    <span className="font-semibold">{formatCurrency(regionalMetrics.totalBudget)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Presupuesto Utilizado</span>
                    <span className="font-semibold">{formatCurrency(regionalMetrics.totalSpent)}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-4">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(budgetUtilization, 100)}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      className="h-4 rounded-full"
                      style={{ backgroundColor: territoryConfig.color }}
                    />
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Porcentaje Utilizado</span>
                    <span className={`font-semibold ${
                      budgetUtilization > 80 ? 'text-red-600' : 'text-green-600'
                    }`}>
                      {budgetUtilization.toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Financial Status */}
              <div className={`rounded-lg p-4 ${
                budgetUtilization > 80 ? 'bg-red-50 border border-red-200' : 'bg-green-50 border border-green-200'
              }`}>
                <div className="flex items-center space-x-3">
                  {budgetUtilization > 80 ? (
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                  ) : (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  )}
                  <div>
                    <p className={`font-medium ${
                      budgetUtilization > 80 ? 'text-red-800' : 'text-green-800'
                    }`}>
                      {budgetUtilization > 80 ? 'Atención Requerida' : 'Estado Financiero Saludable'}
                    </p>
                    <p className={`text-sm ${
                      budgetUtilization > 80 ? 'text-red-600' : 'text-green-600'
                    }`}>
                      {budgetUtilization > 80 
                        ? 'El presupuesto regional está cerca del límite'
                        : 'El presupuesto regional está bajo control'
                      }
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LiderRegional;