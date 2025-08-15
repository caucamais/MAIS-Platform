// MAIS Political Command Center - Lider Regional Dashboard
// Swiss Precision Standards - Regional Leadership View

import React from 'react';
import { useApp } from '../../../contexts/appContextUtils';
import type { DashboardProps } from '../../../types';
import MessageCenter from '../../../messages/components/MessageCenter';
import TerritoryMap from '../../../territory/components/TerritoryMap';
import CuentasClaras from '../../../finances/components/CuentasClaras';
import { Card, CardContent, CardHeader, CardTitle } from '../../../ui/components/Card';
import { Users, UserCheck, MapPin } from 'lucide-react';

const LiderRegionalDashboard: React.FC<DashboardProps> = ({ user }) => {
  const { users, finances, territories } = useApp();

  const regionalUsers = users.filter(u => u.territory_zone === user.territory_zone);
  const regionalCandidates = regionalUsers.filter(u => u.role === 'candidato');
  const regionalFinances = finances.filter(f => f.territory_zone === user.territory_zone);
  const regionalTerritory = territories.find(t => t.zone === user.territory_zone);
  
  const totalRegionalBudget = regionalFinances.reduce((acc, f) => acc + f.budget_allocated, 0);
  const totalRegionalExpenses = regionalFinances.reduce((acc, f) => acc + f.expenses, 0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Equipo Regional</CardTitle>
            <Users className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{regionalUsers.length}</div>
            <p className="text-xs text-gray-500">miembros en tu zona</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Candidatos en la Región</CardTitle>
            <UserCheck className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{regionalCandidates.length}</div>
            <p className="text-xs text-gray-500">candidatos activos</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Municipios Cubiertos</CardTitle>
            <MapPin className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{regionalTerritory?.municipalities.length || 0}</div>
            <p className="text-xs text-gray-500">en tu zona de influencia</p>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3">
          <MessageCenter />
        </div>
        <div className="lg:col-span-2">
          <CuentasClaras />
        </div>
      </div>
      
      <TerritoryMap />
    </div>
  );
};

export default LiderRegionalDashboard;
