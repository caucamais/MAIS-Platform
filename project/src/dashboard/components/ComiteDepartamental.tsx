// MAIS Political Command Center - Comite Departamental Dashboard
// Swiss Precision Standards - Department-Level Oversight

import React from 'react';
import { useApp } from '../../../contexts/appContextUtils';
import type { DashboardProps } from '../../../types';
import MessageCenter from '../../../messages/components/MessageCenter';
import TerritoryMap from '../../../territory/components/TerritoryMap';
import CuentasClaras from '../../../finances/components/CuentasClaras';
import { Card, CardContent, CardHeader, CardTitle } from '../../../ui/components/Card';
import { Users, UserCheck, DollarSign } from 'lucide-react';

const ComiteDepartamentalDashboard: React.FC<DashboardProps> = ({ user }) => {
  const { users, finances } = useApp();

  const departmentUsers = users.filter(u => u.territory_zone === user.territory_zone);
  const departmentCandidates = departmentUsers.filter(u => u.role === 'candidato');
  const departmentFinances = finances.filter(f => f.territory_zone === user.territory_zone);
  
  const totalBudget = departmentFinances.reduce((acc, f) => acc + f.budget_allocated, 0);
  const totalExpenses = departmentFinances.reduce((acc, f) => acc + f.expenses, 0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Miembros del Equipo</CardTitle>
            <Users className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{departmentUsers.length}</div>
            <p className="text-xs text-gray-500">en tu departamento</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Candidatos</CardTitle>
            <UserCheck className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{departmentCandidates.length}</div>
            <p className="text-xs text-gray-500">inscritos en la zona</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Ejecución Financiera</CardTitle>
            <DollarSign className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{((totalExpenses / totalBudget) * 100 || 0).toFixed(2)}%</div>
            <p className="text-xs text-gray-500">del presupuesto ejecutado</p>
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

export default ComiteDepartamentalDashboard;
