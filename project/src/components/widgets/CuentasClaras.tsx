// MAIS Political Command Center - Cuentas Claras Widget
// Swiss Precision Standards - Transparent Financial Management

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  PieChart, 
  BarChart3,
  Download,
  Filter,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Eye,
  EyeOff
} from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { TERRITORY_CONFIG } from '../../types';
import type { CampaignFinance, TerritoryZone } from '../../types';
import { format, subDays, startOfMonth, endOfMonth } from 'date-fns';
import { es } from 'date-fns/locale';

export const CuentasClaras: React.FC = () => {
  const { user, finances, getFinancesByTerritory } = useApp();
  const [selectedZone, setSelectedZone] = useState<TerritoryZone | 'all'>('all');
  const [dateRange, setDateRange] = useState<'week' | 'month' | 'quarter'>('month');
  const [showDetails, setShowDetails] = useState(false);
  const [viewMode, setViewMode] = useState<'overview' | 'detailed'>('overview');

  if (!user) return null;

  // Calculate financial metrics
  const financialMetrics = useMemo(() => {
    const relevantFinances = selectedZone === 'all' 
      ? finances 
      : getFinancesByTerritory(selectedZone);

    const totalIncome = relevantFinances.reduce((sum, f) => sum + f.income, 0);
    const totalExpenses = relevantFinances.reduce((sum, f) => sum + f.expenses, 0);
    const totalBudget = relevantFinances.reduce((sum, f) => sum + f.budget_allocated, 0);
    const totalUsed = relevantFinances.reduce((sum, f) => sum + f.budget_used, 0);
    
    const balance = totalIncome - totalExpenses;
    const budgetUtilization = totalBudget > 0 ? (totalUsed / totalBudget) * 100 : 0;
    const efficiency = totalExpenses > 0 ? (totalIncome / totalExpenses) * 100 : 0;

    return {
      totalIncome,
      totalExpenses,
      totalBudget,
      totalUsed,
      balance,
      budgetUtilization,
      efficiency,
      zones: relevantFinances.length
    };
  }, [finances, selectedZone, getFinancesByTerritory]);

  // Get zone-specific data
  const zoneFinancialData = useMemo(() => {
    const zones = Object.keys(TERRITORY_CONFIG) as TerritoryZone[];
    
    return zones.map(zone => {
      const zoneFinances = getFinancesByTerritory(zone);
      const income = zoneFinances.reduce((sum, f) => sum + f.income, 0);
      const expenses = zoneFinances.reduce((sum, f) => sum + f.expenses, 0);
      const budget = zoneFinances.reduce((sum, f) => sum + f.budget_allocated, 0);
      const used = zoneFinances.reduce((sum, f) => sum + f.budget_used, 0);
      
      return {
        zone,
        name: TERRITORY_CONFIG[zone].name,
        color: TERRITORY_CONFIG[zone].color,
        income,
        expenses,
        budget,
        used,
        balance: income - expenses,
        utilization: budget > 0 ? (used / budget) * 100 : 0
      };
    }).filter(data => data.budget > 0); // Only show zones with budget
  }, [getFinancesByTerritory]);

  const canViewZone = (zone: TerritoryZone) => {
    if (user.role === 'comite_ejecutivo_nacional') return true;
    return user.territory_zone === zone;
  };

  const availableZones = Object.entries(TERRITORY_CONFIG).filter(([zone]) => 
    canViewZone(zone as TerritoryZone)
  );

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getStatusColor = (percentage: number) => {
    if (percentage >= 90) return 'text-red-600';
    if (percentage >= 70) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getStatusIcon = (percentage: number) => {
    if (percentage >= 90) return AlertTriangle;
    if (percentage >= 70) return TrendingUp;
    return CheckCircle;
  };

  return (
    <div className="bg-white rounded-xl shadow-lg h-full flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
              <DollarSign className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Cuentas Claras</h2>
              <p className="text-sm text-gray-500">
                Transparencia financiera de campaña
              </p>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center space-x-3">
            <select
              value={selectedZone}
              onChange={(e) => setSelectedZone(e.target.value as TerritoryZone | 'all')}
              className="text-sm border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              <option value="all">Todas las zonas</option>
              {availableZones.map(([zone, config]) => (
                <option key={zone} value={zone}>
                  {config.name}
                </option>
              ))}
            </select>

            <button
              onClick={() => setViewMode(viewMode === 'overview' ? 'detailed' : 'overview')}
              className="px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              {viewMode === 'overview' ? 'Vista Detallada' : 'Vista General'}
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              <span className="text-sm font-medium text-green-800">Ingresos</span>
            </div>
            <p className="text-xl font-bold text-green-900 mt-1">
              {formatCurrency(financialMetrics.totalIncome)}
            </p>
          </div>

          <div className="bg-red-50 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <TrendingDown className="h-5 w-5 text-red-600" />
              <span className="text-sm font-medium text-red-800">Gastos</span>
            </div>
            <p className="text-xl font-bold text-red-900 mt-1">
              {formatCurrency(financialMetrics.totalExpenses)}
            </p>
          </div>

          <div className={`rounded-lg p-4 ${
            financialMetrics.balance >= 0 ? 'bg-blue-50' : 'bg-orange-50'
          }`}>
            <div className="flex items-center space-x-2">
              <BarChart3 className={`h-5 w-5 ${
                financialMetrics.balance >= 0 ? 'text-blue-600' : 'text-orange-600'
              }`} />
              <span className={`text-sm font-medium ${
                financialMetrics.balance >= 0 ? 'text-blue-800' : 'text-orange-800'
              }`}>
                Balance
              </span>
            </div>
            <p className={`text-xl font-bold mt-1 ${
              financialMetrics.balance >= 0 ? 'text-blue-900' : 'text-orange-900'
            }`}>
              {formatCurrency(financialMetrics.balance)}
            </p>
          </div>

          <div className="bg-purple-50 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <PieChart className="h-5 w-5 text-purple-600" />
              <span className="text-sm font-medium text-purple-800">Uso Presupuesto</span>
            </div>
            <p className="text-xl font-bold text-purple-900 mt-1">
              {financialMetrics.budgetUtilization.toFixed(1)}%
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {viewMode === 'overview' ? (
          <div className="space-y-6">
            {/* Budget Utilization Chart */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Utilización de Presupuesto por Zona
              </h3>
              <div className="space-y-4">
                {zoneFinancialData.map((zoneData) => {
                  const StatusIcon = getStatusIcon(zoneData.utilization);
                  
                  return (
                    <div key={zoneData.zone} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div 
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: zoneData.color }}
                          />
                          <span className="font-medium text-gray-900">{zoneData.name}</span>
                          <StatusIcon className={`h-4 w-4 ${getStatusColor(zoneData.utilization)}`} />
                        </div>
                        <div className="text-right">
                          <span className={`font-semibold ${getStatusColor(zoneData.utilization)}`}>
                            {zoneData.utilization.toFixed(1)}%
                          </span>
                          <p className="text-xs text-gray-500">
                            {formatCurrency(zoneData.used)} / {formatCurrency(zoneData.budget)}
                          </p>
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min(zoneData.utilization, 100)}%` }}
                          transition={{ duration: 1, ease: "easeOut" }}
                          className="h-3 rounded-full transition-all duration-500"
                          style={{ backgroundColor: zoneData.color }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Financial Balance by Zone */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Balance Financiero por Zona
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {zoneFinancialData.map((zoneData) => (
                  <motion.div
                    key={zoneData.zone}
                    whileHover={{ scale: 1.02 }}
                    className="bg-white rounded-lg p-4 border border-gray-200 hover:shadow-md transition-all duration-200"
                  >
                    <div className="flex items-center space-x-3 mb-3">
                      <div 
                        className="w-8 h-8 rounded-full flex items-center justify-center text-white"
                        style={{ backgroundColor: zoneData.color }}
                      >
                        <DollarSign className="h-4 w-4" />
                      </div>
                      <h4 className="font-medium text-gray-900">{zoneData.name}</h4>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Ingresos:</span>
                        <span className="font-semibold text-green-600">
                          {formatCurrency(zoneData.income)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Gastos:</span>
                        <span className="font-semibold text-red-600">
                          {formatCurrency(zoneData.expenses)}
                        </span>
                      </div>
                      <div className="flex justify-between border-t pt-2">
                        <span className="text-gray-900 font-medium">Balance:</span>
                        <span className={`font-bold ${
                          zoneData.balance >= 0 ? 'text-blue-600' : 'text-orange-600'
                        }`}>
                          {formatCurrency(zoneData.balance)}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Alerts and Recommendations */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-yellow-800 mb-4 flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5" />
                <span>Alertas y Recomendaciones</span>
              </h3>
              <div className="space-y-3">
                {zoneFinancialData
                  .filter(zone => zone.utilization >= 80)
                  .map(zone => (
                    <div key={zone.zone} className="flex items-center space-x-3 text-yellow-800">
                      <AlertTriangle className="h-4 w-4" />
                      <span className="text-sm">
                        <strong>{zone.name}</strong> ha utilizado {zone.utilization.toFixed(1)}% de su presupuesto
                      </span>
                    </div>
                  ))}
                
                {zoneFinancialData.filter(zone => zone.balance < 0).length > 0 && (
                  <div className="flex items-center space-x-3 text-red-600">
                    <TrendingDown className="h-4 w-4" />
                    <span className="text-sm">
                      {zoneFinancialData.filter(zone => zone.balance < 0).length} zona(s) con balance negativo
                    </span>
                  </div>
                )}
                
                {financialMetrics.efficiency < 100 && (
                  <div className="flex items-center space-x-3 text-orange-600">
                    <BarChart3 className="h-4 w-4" />
                    <span className="text-sm">
                      Eficiencia financiera: {financialMetrics.efficiency.toFixed(1)}% - Se recomienda optimizar gastos
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* Detailed View */
          <div className="space-y-6">
            {/* Detailed Financial Table */}
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Detalle Financiero Completo</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Zona
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Presupuesto
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Utilizado
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ingresos
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Gastos
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Balance
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Estado
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {zoneFinancialData.map((zoneData) => {
                      const StatusIcon = getStatusIcon(zoneData.utilization);
                      
                      return (
                        <tr key={zoneData.zone} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center space-x-3">
                              <div 
                                className="w-4 h-4 rounded-full"
                                style={{ backgroundColor: zoneData.color }}
                              />
                              <span className="font-medium text-gray-900">{zoneData.name}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatCurrency(zoneData.budget)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatCurrency(zoneData.used)}
                            <div className="text-xs text-gray-500">
                              {zoneData.utilization.toFixed(1)}%
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                            {formatCurrency(zoneData.income)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-red-600">
                            {formatCurrency(zoneData.expenses)}
                          </td>
                          <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                            zoneData.balance >= 0 ? 'text-blue-600' : 'text-orange-600'
                          }`}>
                            {formatCurrency(zoneData.balance)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className={`flex items-center space-x-2 ${getStatusColor(zoneData.utilization)}`}>
                              <StatusIcon className="h-4 w-4" />
                              <span className="text-sm font-medium">
                                {zoneData.utilization >= 90 ? 'Crítico' : 
                                 zoneData.utilization >= 70 ? 'Alerta' : 'Normal'}
                              </span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Export and Actions */}
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-500">
                Última actualización: {format(new Date(), 'dd/MM/yyyy HH:mm', { locale: es })}
              </div>
              <div className="flex space-x-3">
                <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2">
                  <Download className="h-4 w-4" />
                  <span>Exportar PDF</span>
                </button>
                <button className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2">
                  <BarChart3 className="h-4 w-4" />
                  <span>Generar Reporte</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CuentasClaras;