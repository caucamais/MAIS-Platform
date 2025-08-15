// MAIS Political Command Center - Territory Map
// Swiss Precision Standards - Geospatial Intelligence

import React from 'react';
import { useApp } from '../../contexts/appContextUtils';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/components/Card';
import { Map } from 'lucide-react';
import { TERRITORY_CONFIG } from '../../types';

const TerritoryMap: React.FC = () => {
  const { users, user } = useApp();

  const getZoneColor = (zone: keyof typeof TERRITORY_CONFIG) => {
    const userCount = users.filter(u => u.territory_zone === zone).length;
    const maxUsers = Math.max(...Object.keys(TERRITORY_CONFIG).map(z => users.filter(u => u.territory_zone === z).length));
    const opacity = maxUsers > 0 ? 0.2 + (userCount / maxUsers) * 0.8 : 0.2;
    return TERRITORY_CONFIG[zone].color.replace(')', `, ${opacity})`).replace('rgb', 'rgba');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Map className="mr-2" />
          Mapa del Territorio
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="aspect-video bg-gray-200 rounded-lg flex items-center justify-center">
          {/* This is a placeholder for a real map implementation */}
          <div className="grid grid-cols-3 gap-2 w-full h-full p-2">
            {Object.keys(TERRITORY_CONFIG).map(zone => (
              <div 
                key={zone}
                className={`rounded-lg flex items-center justify-center text-white font-bold text-xs p-1
                  ${user?.territory_zone === zone ? 'ring-4 ring-yellow-400' : ''}
                `}
                style={{ backgroundColor: getZoneColor(zone as keyof typeof TERRITORY_CONFIG) }}
              >
                {TERRITORY_CONFIG[zone as keyof typeof TERRITORY_CONFIG].name}
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TerritoryMap;
