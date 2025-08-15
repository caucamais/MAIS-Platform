// MAIS Political Command Center - Application Context
// Swiss Precision Standards - Centralized State Management

import React, { useEffect, useState, useCallback } from 'react';
import { supabase } from '../core/lib/supabase';
import { authService } from '../auth/services/authService';
import { userService } from '../users/services/userService';
import { messageService } from '../messages/services/messageService';
import { financeService } from '../finances/services/financeService';
import { TERRITORY_CONFIG, ROLE_HIERARCHY } from '../types';
import type { AppContextType, User, Message, CampaignFinance, Territory, PoliticalRole, TerritoryZone } from '../types';
import toast from 'react-hot-toast';

import { AppContext } from './appContextUtils';

interface AppProviderProps {
  children: React.ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [territories] = useState<Territory[]>(() => {
    // Generate territories from configuration
    return Object.entries(TERRITORY_CONFIG).map(([zone, config]) => ({
      id: zone,
      zone: zone as TerritoryZone,
      name: config.name,
      municipalities: config.municipalities.map((name, index) => ({
        id: `${zone}_${index}`,
        name,
        zone: zone as TerritoryZone,
        population: Math.floor(Math.random() * 50000) + 10000,
        registered_voters: Math.floor(Math.random() * 30000) + 5000,
        coordinates: {
          lat: 2.4 + Math.random() * 0.5,
          lng: -76.6 + Math.random() * 0.5
        }
      }))
    }));
  });
  const [messages, setMessages] = useState<Message[]>([]);
  const [finances, setFinances] = useState<CampaignFinance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const hasPermission = useCallback((currentUser: User, requiredRole: PoliticalRole, targetZone?: TerritoryZone): boolean => {
    const userLevel = ROLE_HIERARCHY[currentUser.role];
    const requiredLevel = ROLE_HIERARCHY[requiredRole];
    
    if (userLevel < requiredLevel) return false;

    if (targetZone) {
        if (currentUser.role === 'comite_ejecutivo_nacional') return true;
        return currentUser.territory_zone === targetZone;
    }
    
    return true;
  }, []);

  const loadAppData = useCallback(async (currentUser: User) => {
    try {
      setLoading(true);
      
      const allUsers = await userService.getAllUsers();
      setUsers(allUsers);
      
      const userMessages = await messageService.getMessages(currentUser.role, currentUser.territory_zone);
      setMessages(userMessages);
      
      const userFinances = await financeService.getCampaignFinances(currentUser.role, currentUser.territory_zone);
      setFinances(userFinances);
      
      const messageSubscription = messageService.subscribeToMessages((newMessage) => {
        if (hasPermission(currentUser, 'votante_simpatizante', newMessage.territory_zone)) {
          setMessages(prev => [newMessage, ...prev]);
          if (newMessage.is_urgent && newMessage.sender_id !== currentUser.id) {
            toast.error(`Mensaje urgente de ${newMessage.sender_name}`, {
              duration: 5000,
            });
          }
        }
      });
      
      const userSubscription = userService.subscribeToUserUpdates((updatedUser) => {
        setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
        if (updatedUser.id === currentUser.id) {
          setUser(updatedUser);
        }
      });
      
      return () => {
        messageSubscription.unsubscribe();
        userSubscription.unsubscribe();
      };
      
    } catch (err) {
      console.error('Load app data error:', err);
      setError('Error loading application data');
    } finally {
      setLoading(false);
    }
  }, [setUsers, setMessages, setFinances, hasPermission]);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        const session = await authService.getSession();
        if (session?.user) {
          const profile = await userService.getUserProfile(session.user.id);
          if (profile) {
            setUser(profile);
            await loadAppData(profile);
          }
        }
      } catch (err) {
        console.error('App initialization error:', err);
        setError('Error initializing application');
      } finally {
        setLoading(false);
      }
    };

    initializeApp();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        const profile = await userService.getUserProfile(session.user.id);
        if (profile) {
          setUser(profile);
          await loadAppData(profile);
        }
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setUsers([]);
        setMessages([]);
        setFinances([]);
      }
    });

    return () => subscription.unsubscribe();
  }, [loadAppData]);

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      
      const { user: authUser } = await authService.signIn(email, password);
      if (!authUser) {
        setError('Credenciales inválidas');
        return false;
      }
      
      const profile = await userService.getUserProfile(authUser.id);
      if (!profile) {
        setError('Perfil de usuario no encontrado');
        return false;
      }
      
      setUser(profile);
      await loadAppData(profile);
      
      await userService.updateUserProfile(authUser.id, { last_login: new Date().toISOString() });
      
      toast.success(`Bienvenido, ${profile.full_name}`);
      return true;
      
    } catch (err) {
      console.error('Login error:', err);
      setError('Error durante el inicio de sesión');
      return false;
    } finally {
      setLoading(false);
    }
  }, [loadAppData]);

  const logout = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      await authService.signOut();
      setUser(null);
      setUsers([]);
      setMessages([]);
      setFinances([]);
      toast.success('Sesión cerrada correctamente');
    } catch (err) {
      console.error('Logout error:', err);
      setError('Error al cerrar sesión');
    } finally {
      setLoading(false);
    }
  }, []);

  const updatePassword = useCallback(async (newPassword: string): Promise<boolean> => {
    try {
      setLoading(true);
      await authService.updateUserPassword(newPassword);
      toast.success('Contraseña actualizada correctamente');
      return true;
    } catch (err) {
      console.error('Update password error:', err);
      setError('Error al actualizar contraseña');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateProfile = useCallback(async (data: Partial<User>): Promise<boolean> => {
    if (!user) return false;
    
    try {
      setLoading(true);
      await userService.updateUserProfile(user.id, data);
      setUser(prev => prev ? { ...prev, ...data } : null);
      toast.success('Perfil actualizado correctamente');
      return true;
    } catch (err) {
      console.error('Update profile error:', err);
      setError('Error al actualizar perfil');
      return false;
    } finally {
      setLoading(false);
    }
  }, [user]);

  const sendMessage = useCallback(async (messageData: Omit<Message, 'id' | 'created_at' | 'read_by'>): Promise<boolean> => {
    try {
      await messageService.sendMessage(messageData);
      toast.success('Mensaje enviado correctamente');
      return true;
    } catch (err) {
      console.error('Send message error:', err);
      setError('Error al enviar mensaje');
      return false;
    }
  }, []);

  const markMessageAsRead = useCallback(async (messageId: string): Promise<void> => {
    if (!user) return;
    
    try {
      await messageService.markMessageAsRead(messageId, user.id);
      setMessages(prev => 
        prev.map(msg => 
          msg.id === messageId 
            ? { ...msg, read_by: [...(msg.read_by || []), user.id] }
            : msg
        )
      );
    } catch (err) {
      console.error('Mark message as read error:', err);
    }
  }, [user]);

  const getUsersByTerritory = useCallback((zone: TerritoryZone): User[] => {
    return users.filter(u => u.territory_zone === zone);
  }, [users]);

  const getFinancesByTerritory = useCallback((zone: TerritoryZone): CampaignFinance[] => {
    return finances.filter(f => f.territory_zone === zone);
  }, [finances]);

  const permissionCallback = useCallback((requiredRole: PoliticalRole, targetZone?: TerritoryZone): boolean => {
      if (!user) return false;
      return hasPermission(user, requiredRole, targetZone);
  }, [user, hasPermission]);

  const contextValue: AppContextType = {
    user,
    users,
    territories,
    messages,
    finances,
    loading,
    error,
    login,
    logout,
    updatePassword,
    updateProfile,
    sendMessage,
    markMessageAsRead,
    getUsersByTerritory,
    getFinancesByTerritory,
    hasPermission: permissionCallback,
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};
