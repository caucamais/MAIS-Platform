// MAIS Political Command Center - Cuentas Claras
// Swiss Precision Standards - Financial Transparency

import React from 'react';
import { useApp } from '../../contexts/appContextUtils';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/components/Card';
import { Progress } from '../../ui/components/Progress';
import { DollarSign } from 'lucide-react';

const CuentasClaras: React.FC = () => {
  const { finances, user } = useApp();

  const data = user?.role === 'comite_ejecutivo_nacional' 
    ? finances 
    : finances.filter(f => f.territory_zone === user?.territory_zone);

  const totalBudget = data.reduce((acc, item) => acc + item.budget_allocated, 0);
  const totalExpenses = data.reduce((acc, item) => acc + item.expenses, 0);
  const executionPercentage = totalBudget > 0 ? (totalExpenses / totalBudget) * 100 : 0;

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center">
          <DollarSign className="mr-2" />
          Cuentas Claras
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between items-end mb-1">
              <span className="text-sm font-medium text-gray-600">Ejecutado</span>
              <span className="text-lg font-bold text-gray-800">
                ${totalExpenses.toLocaleString('es-CO')}
              </span>
            </div>
            <div className="flex justify-between items-end">
              <span className="text-sm font-medium text-gray-500">Presupuesto</span>
              <span className="text-sm text-gray-500">
                ${totalBudget.toLocaleString('es-CO')}
              </span>
            </div>
          </div>
          <Progress value={executionPercentage} />
          <p className="text-center text-sm text-gray-600">
            {executionPercentage.toFixed(2)}% del presupuesto ejecutado
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default CuentasClaras;
