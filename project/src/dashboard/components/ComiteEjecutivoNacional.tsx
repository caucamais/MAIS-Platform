// MAIS Political Command Center - Comite Ejecutivo Nacional Dashboard
// Swiss Precision Standards - National Strategic Overview

import React from 'react';
import { useApp } from '../../../contexts/appContextUtils';
import type { DashboardProps } from '../../../types';
import MessageCenter from '../../../messages/components/MessageCenter';
import TerritoryMap from '../../../territory/components/TerritoryMap';
import CuentasClaras from '../../../finances/components/CuentasClaras';
import { Card, CardContent, CardHeader, CardTitle } from '../../../ui/components/Card';
import { Users, Map, DollarSign, BarChart } from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TERRITORY_CONFIG } from '../../../types';

const ComiteEjecutivoNacionalDashboard: React.FC<DashboardProps> = ({ user }) => {
  const { users, finances } = useApp();

  const totalUsers = users.length;
  const totalTerritories = Object.keys(TERRITORY_CONFIG).length;
  const totalBudget = finances.reduce((acc, f) => acc + f.budget_allocated, 0);
  const totalExpenses = finances.reduce((acc, f) => acc + f.expenses, 0);

  const usersByTerritory = Object.keys(TERRITORY_CONFIG).map(zone => ({
    name: TERRITORY_CONFIG[zone as keyof typeof TERRITORY_CONFIG].name,
    value: users.filter(u => u.territory_zone === zone).length,
    fill: TERRITORY_CONFIG[zone as keyof typeof TERRITORY_CONFIG].color,
  }));

  return (
    <div className="space-y-6">
      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total de Miembros</CardTitle>
            <Users className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsers}</div>
            <p className="text-xs text-gray-500">en todas las zonas</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Territorios Activos</CardTitle>
            <Map className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTerritories}</div>
            <p className="text-xs text-gray-500">zonas geográficas</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Presupuesto Total</CardTitle>
            <DollarSign className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${(totalBudget / 1e9).toFixed(2)}B</div>
            <p className="text-xs text-gray-500">presupuesto consolidado</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Ejecución Nacional</CardTitle>
            <BarChart className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{((totalExpenses / totalBudget) * 100 || 0).toFixed(2)}%</div>
            <p className="text-xs text-gray-500">del presupuesto ejecutado</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <TerritoryMap />
        </div>
        <div className="space-y-6">
          <CuentasClaras />
          <Card>
            <CardHeader>
              <CardTitle>Distribución de Miembros</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={usersByTerritory} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                    {usersByTerritory.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <MessageCenter />
    </div>
  );
};

export default ComiteEjecutivoNacionalDashboard;
