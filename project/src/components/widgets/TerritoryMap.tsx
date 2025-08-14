// MAIS Political Command Center - Territory Map Widget
// Swiss Precision Standards - Interactive Political Geography

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Map, 
  Users, 
  MapPin, 
  BarChart3, 
  Filter,
  Search,
  Eye,
  Target,
  Layers
} from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { TERRITORY_CONFIG } from '../../types';
import type { TerritoryZone, Municipality } from '../../types';

export const TerritoryMap: React.FC = () => {
  const { user, users, territories, getUsersByTerritory } = useApp();
  const [selectedZone, setSelectedZone] = useState<TerritoryZone | null>(null);
  const [selectedMunicipality, setSelectedMunicipality] = useState<Municipality | null>(null);
  const [viewMode, setViewMode] = useState<'zones' | 'municipalities' | 'users'>('zones');
  const [searchTerm, setSearchTerm] = useState('');

  if (!user) return null;

  // Calculate statistics for each zone
  const zoneStats = useMemo(() => {
    const stats: Record<TerritoryZone, {
      totalUsers: number;
      totalPopulation: number;
      totalVoters: number;
      municipalities: number;
      coverage: number;
    }> = {} as any;

    territories.forEach(territory => {
      const zoneUsers = getUsersByTerritory(territory.zone);
      const totalPopulation = territory.municipalities.reduce((sum, m) => sum + m.population, 0);
      const totalVoters = territory.municipalities.reduce((sum, m) => sum + m.registered_voters, 0);
      
      stats[territory.zone] = {
        totalUsers: zoneUsers.length,
        totalPopulation,
        totalVoters,
        municipalities: territory.municipalities.length,
        coverage: totalVoters > 0 ? Math.round((zoneUsers.length / totalVoters) * 100 * 1000) / 10 : 0
      };
    });

    return stats;
  }, [territories, users]);

  // Filter municipalities based on search
  const filteredMunicipalities = useMemo(() => {
    if (!searchTerm) return [];
    
    const allMunicipalities = territories.flatMap(t => t.municipalities);
    return allMunicipalities.filter(m => 
      m.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [territories, searchTerm]);

  const handleZoneClick = (zone: TerritoryZone) => {
    setSelectedZone(selectedZone === zone ? null : zone);
    setSelectedMunicipality(null);
  };

  const handleMunicipalityClick = (municipality: Municipality) => {
    setSelectedMunicipality(selectedMunicipality?.id === municipality.id ? null : municipality);
  };

  const getZoneUsers = (zone: TerritoryZone) => {
    return getUsersByTerritory(zone);
  };

  const canViewZone = (zone: TerritoryZone) => {
    if (user.role === 'comite_ejecutivo_nacional') return true;
    return user.territory_zone === zone;
  };

  const visibleTerritories = territories.filter(t => canViewZone(t.zone));

  return (
    <div className="bg-white rounded-xl shadow-lg h-full flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-blue-600 rounded-lg flex items-center justify-center">
              <Map className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Mapa Territorial</h2>
              <p className="text-sm text-gray-500">
                {visibleTerritories.length} zonas • {visibleTerritories.reduce((sum, t) => sum + t.municipalities.length, 0)} municipios
              </p>
            </div>
          </div>

          {/* View Mode Selector */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            {[
              { id: 'zones', label: 'Zonas', icon: Layers },
              { id: 'municipalities', label: 'Municipios', icon: MapPin },
              { id: 'users', label: 'Usuarios', icon: Users }
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setViewMode(id as any)}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 flex items-center space-x-2 ${
                  viewMode === id
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar municipios..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full flex">
          {/* Map/Grid View */}
          <div className="flex-1 p-6 overflow-y-auto">
            {viewMode === 'zones' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {visibleTerritories.map((territory) => {
                  const stats = zoneStats[territory.zone];
                  const config = TERRITORY_CONFIG[territory.zone];
                  const isSelected = selectedZone === territory.zone;
                  
                  return (
                    <motion.div
                      key={territory.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleZoneClick(territory.zone)}
                      className={`p-6 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                        isSelected
                          ? 'border-blue-500 bg-blue-50 shadow-lg'
                          : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                      }`}
                    >
                      {/* Zone Header */}
                      <div className="flex items-center space-x-3 mb-4">
                        <div 
                          className="w-12 h-12 rounded-lg flex items-center justify-center text-white"
                          style={{ backgroundColor: config.color }}
                        >
                          <Target className="h-6 w-6" />
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900">{config.name}</h3>
                          <p className="text-sm text-gray-500">{stats.municipalities} municipios</p>
                        </div>
                      </div>

                      {/* Zone Stats */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center">
                          <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
                          <p className="text-xs text-gray-500">Usuarios</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-gray-900">{stats.coverage}%</p>
                          <p className="text-xs text-gray-500">Cobertura</p>
                        </div>
                        <div className="text-center">
                          <p className="text-lg font-semibold text-gray-700">
                            {(stats.totalPopulation / 1000).toFixed(0)}K
                          </p>
                          <p className="text-xs text-gray-500">Población</p>
                        </div>
                        <div className="text-center">
                          <p className="text-lg font-semibold text-gray-700">
                            {(stats.totalVoters / 1000).toFixed(0)}K
                          </p>
                          <p className="text-xs text-gray-500">Votantes</p>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="mt-4">
                        <div className="flex justify-between text-xs text-gray-500 mb-1">
                          <span>Cobertura Electoral</span>
                          <span>{stats.coverage}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="h-2 rounded-full transition-all duration-500"
                            style={{ 
                              width: `${Math.min(stats.coverage, 100)}%`,
                              backgroundColor: config.color 
                            }}
                          />
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}

            {viewMode === 'municipalities' && (
              <div className="space-y-4">
                {(searchTerm ? filteredMunicipalities : visibleTerritories.flatMap(t => t.municipalities))
                  .map((municipality) => {
                    const config = TERRITORY_CONFIG[municipality.zone];
                    const zoneUsers = getZoneUsers(municipality.zone);
                    const isSelected = selectedMunicipality?.id === municipality.id;
                    
                    return (
                      <motion.div
                        key={municipality.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        onClick={() => handleMunicipalityClick(municipality)}
                        className={`p-4 rounded-lg border cursor-pointer transition-all duration-200 ${
                          isSelected
                            ? 'border-blue-500 bg-blue-50 shadow-md'
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div 
                              className="w-8 h-8 rounded-full flex items-center justify-center text-white"
                              style={{ backgroundColor: config.color }}
                            >
                              <MapPin className="h-4 w-4" />
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-900">{municipality.name}</h4>
                              <p className="text-sm text-gray-500">{config.name}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-6 text-sm text-gray-600">
                            <div className="text-center">
                              <p className="font-semibold">{(municipality.population / 1000).toFixed(0)}K</p>
                              <p className="text-xs text-gray-500">Población</p>
                            </div>
                            <div className="text-center">
                              <p className="font-semibold">{(municipality.registered_voters / 1000).toFixed(0)}K</p>
                              <p className="text-xs text-gray-500">Votantes</p>
                            </div>
                            <div className="text-center">
                              <p className="font-semibold">{zoneUsers.length}</p>
                              <p className="text-xs text-gray-500">Usuarios</p>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
              </div>
            )}

            {viewMode === 'users' && (
              <div className="space-y-6">
                {visibleTerritories.map((territory) => {
                  const zoneUsers = getZoneUsers(territory.zone);
                  const config = TERRITORY_CONFIG[territory.zone];
                  
                  if (zoneUsers.length === 0) return null;
                  
                  return (
                    <div key={territory.id} className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <div 
                          className="w-6 h-6 rounded-full"
                          style={{ backgroundColor: config.color }}
                        />
                        <h3 className="font-semibold text-gray-900">{config.name}</h3>
                        <span className="text-sm text-gray-500">({zoneUsers.length} usuarios)</span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 ml-9">
                        {zoneUsers.map((zoneUser) => (
                          <div
                            key={zoneUser.id}
                            className="p-3 bg-gray-50 rounded-lg border border-gray-200"
                          >
                            <div className="flex items-center space-x-3">
                              <div 
                                className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium"
                                style={{ backgroundColor: config.color }}
                              >
                                {zoneUser.full_name.charAt(0).toUpperCase()}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-gray-900 truncate">{zoneUser.full_name}</p>
                                <p className="text-xs text-gray-500 truncate">{zoneUser.email}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Details Panel */}
          <AnimatePresence>
            {(selectedZone || selectedMunicipality) && (
              <motion.div
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 320, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                className="border-l border-gray-200 bg-gray-50 overflow-hidden"
              >
                <div className="p-6 h-full overflow-y-auto">
                  {selectedZone && (
                    <div className="space-y-6">
                      <div className="flex items-center space-x-3">
                        <div 
                          className="w-10 h-10 rounded-lg flex items-center justify-center text-white"
                          style={{ backgroundColor: TERRITORY_CONFIG[selectedZone].color }}
                        >
                          <Target className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900">
                            {TERRITORY_CONFIG[selectedZone].name}
                          </h3>
                          <p className="text-sm text-gray-500">Información detallada</p>
                        </div>
                      </div>

                      {/* Zone Statistics */}
                      <div className="space-y-4">
                        <div className="bg-white rounded-lg p-4">
                          <h4 className="font-medium text-gray-900 mb-3">Estadísticas Generales</h4>
                          <div className="space-y-3">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Total Usuarios:</span>
                              <span className="font-semibold">{zoneStats[selectedZone].totalUsers}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Municipios:</span>
                              <span className="font-semibold">{zoneStats[selectedZone].municipalities}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Población Total:</span>
                              <span className="font-semibold">{zoneStats[selectedZone].totalPopulation.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Votantes Registrados:</span>
                              <span className="font-semibold">{zoneStats[selectedZone].totalVoters.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Cobertura:</span>
                              <span className="font-semibold">{zoneStats[selectedZone].coverage}%</span>
                            </div>
                          </div>
                        </div>

                        {/* Municipalities List */}
                        <div className="bg-white rounded-lg p-4">
                          <h4 className="font-medium text-gray-900 mb-3">Municipios</h4>
                          <div className="space-y-2">
                            {territories.find(t => t.zone === selectedZone)?.municipalities.map((municipality) => (
                              <div
                                key={municipality.id}
                                className="flex items-center justify-between p-2 bg-gray-50 rounded"
                              >
                                <span className="text-sm font-medium">{municipality.name}</span>
                                <span className="text-xs text-gray-500">
                                  {(municipality.population / 1000).toFixed(0)}K hab.
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {selectedMunicipality && (
                    <div className="space-y-6">
                      <div className="flex items-center space-x-3">
                        <div 
                          className="w-10 h-10 rounded-lg flex items-center justify-center text-white"
                          style={{ backgroundColor: TERRITORY_CONFIG[selectedMunicipality.zone].color }}
                        >
                          <MapPin className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900">{selectedMunicipality.name}</h3>
                          <p className="text-sm text-gray-500">
                            {TERRITORY_CONFIG[selectedMunicipality.zone].name}
                          </p>
                        </div>
                      </div>

                      {/* Municipality Details */}
                      <div className="bg-white rounded-lg p-4">
                        <h4 className="font-medium text-gray-900 mb-3">Información Demográfica</h4>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Población:</span>
                            <span className="font-semibold">{selectedMunicipality.population.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Votantes Registrados:</span>
                            <span className="font-semibold">{selectedMunicipality.registered_voters.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">% Electoral:</span>
                            <span className="font-semibold">
                              {Math.round((selectedMunicipality.registered_voters / selectedMunicipality.population) * 100)}%
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Coordenadas:</span>
                            <span className="font-semibold text-xs">
                              {selectedMunicipality.coordinates.lat.toFixed(3)}, {selectedMunicipality.coordinates.lng.toFixed(3)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default TerritoryMap;