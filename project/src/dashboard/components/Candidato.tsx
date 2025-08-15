// MAIS Political Command Center - Candidato Dashboard
// Swiss Precision Standards - Focused View for Candidates

import React from 'react';
import { useApp } from '../../../contexts/appContextUtils';
import type { DashboardProps } from '../../../types';
import MessageCenter from '../../../messages/components/MessageCenter';
import TerritoryMap from '../../../territory/components/TerritoryMap';
import CuentasClaras from '../../../finances/components/CuentasClaras';
import UserProfile from '../../../users/components/UserProfile';
import { Card, CardContent, CardHeader, CardTitle } from '../../../ui/components/Card';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const CandidatoDashboard: React.FC<DashboardProps> = ({ user }) => {
  const { getFinancesByTerritory, getUsersByTerritory } = useApp();
  
  const territoryFinances = getFinancesByTerritory(user.territory_zone);
  const territoryTeam = getUsersByTerritory(user.territory_zone);

  const financeData = territoryFinances.map(f => ({
    name: f.municipality || 'General',
    gastado: f.expenses,
    presupuesto: f.budget_allocated,
  }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left Column */}
      <div className="lg:col-span-2 space-y-6">
        <MessageCenter />
        <TerritoryMap />
      </div>

      {/* Right Column */}
      <div className="space-y-6">
        <UserProfile user={user} />
        <CuentasClaras />
        
        <Card>
          <CardHeader>
            <CardTitle>Equipo en Territorio</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{territoryTeam.length}</p>
            <p className="text-sm text-gray-500">Miembros activos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Ejecución Presupuestal</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={financeData}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="gastado" stackId="a" fill="#ef4444" />
                <Bar dataKey="presupuesto" stackId="a" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CandidatoDashboard;
