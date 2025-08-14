// MAIS Political Command Center - Type Definitions
// Swiss Precision Standards - Zero Tolerance for Type Errors

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: PoliticalRole;
  territory_zone: TerritoryZone;
  municipality?: string;
  phone?: string;
  avatar_url?: string;
  is_password_changed: boolean;
  created_at: string;
  updated_at: string;
  last_login?: string;
}

export type PoliticalRole = 
  | 'comite_ejecutivo_nacional'
  | 'lider_regional'
  | 'comite_departamental'
  | 'candidato'
  | 'influenciador_digital'
  | 'lider_comunitario'
  | 'votante_simpatizante';

export type TerritoryZone = 
  | 'zona_norte'
  | 'zona_centro'
  | 'zona_sur'
  | 'zona_oriente'
  | 'zona_occidente';

export interface Territory {
  id: string;
  zone: TerritoryZone;
  name: string;
  municipalities: Municipality[];
  leader_id?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export interface Municipality {
  id: string;
  name: string;
  zone: TerritoryZone;
  population: number;
  registered_voters: number;
  coordinates: {
    lat: number;
    lng: number;
  };
}

export interface Message {
  id: string;
  sender_id: string;
  sender_name: string;
  sender_role: PoliticalRole;
  content: string;
  territory_zone?: TerritoryZone;
  is_urgent: boolean;
  is_confidential: boolean;
  created_at: string;
  read_by: string[];
}

export interface CampaignFinance {
  id: string;
  territory_zone: TerritoryZone;
  municipality?: string;
  income: number;
  expenses: number;
  budget_allocated: number;
  budget_used: number;
  last_updated: string;
  updated_by: string;
}

export interface AppContextType {
  user: User | null;
  users: User[];
  territories: Territory[];
  messages: Message[];
  finances: CampaignFinance[];
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  updatePassword: (newPassword: string) => Promise<boolean>;
  updateProfile: (data: Partial<User>) => Promise<boolean>;
  sendMessage: (message: Omit<Message, 'id' | 'created_at' | 'read_by'>) => Promise<boolean>;
  markMessageAsRead: (messageId: string) => Promise<void>;
  getUsersByTerritory: (zone: TerritoryZone) => User[];
  getFinancesByTerritory: (zone: TerritoryZone) => CampaignFinance[];
  hasPermission: (requiredRole: PoliticalRole, targetZone?: TerritoryZone) => boolean;
}

export interface DashboardProps {
  user: User;
}

// Role Hierarchy for Permission System
export const ROLE_HIERARCHY: Record<PoliticalRole, number> = {
  comite_ejecutivo_nacional: 7,
  lider_regional: 6,
  comite_departamental: 5,
  candidato: 4,
  influenciador_digital: 3,
  lider_comunitario: 2,
  votante_simpatizante: 1,
};

// Territory Configuration
export const TERRITORY_CONFIG: Record<TerritoryZone, { name: string; color: string; municipalities: string[] }> = {
  zona_norte: {
    name: 'Zona Norte',
    color: '#ef4444',
    municipalities: ['Santander de Quilichao', 'Caloto', 'Guachené', 'Villa Rica', 'Padilla']
  },
  zona_centro: {
    name: 'Zona Centro',
    color: '#f59e0b',
    municipalities: ['Popayán', 'Timbío', 'Cajibío', 'Piendamó', 'Morales']
  },
  zona_sur: {
    name: 'Zona Sur',
    color: '#10b981',
    municipalities: ['Bolívar', 'La Sierra', 'Almaguer', 'San Sebastián', 'Sucre']
  },
  zona_oriente: {
    name: 'Zona Oriente',
    color: '#3b82f6',
    municipalities: ['Inzá', 'Belalcázar', 'Páez', 'Silvia', 'Jambaló']
  },
  zona_occidente: {
    name: 'Zona Occidente',
    color: '#8b5cf6',
    municipalities: ['López de Micay', 'Timbiquí', 'Guapi', 'Argelia', 'El Tambo']
  }
};