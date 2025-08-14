// MAIS Political Command Center - Application Context
// Swiss Precision Standards - Centralized State Management

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase, signIn, signOut, updateUserPassword, getUserProfile, updateUserProfile, getAllUsers, sendMessage as sendMessageAPI, getMessages, markMessageAsRead as markMessageAsReadAPI, getCampaignFinances, subscribeToMessages, subscribeToUserUpdates, hasPermissionForTerritory } from '../lib/supabase';
import { TERRITORY_CONFIG, ROLE_HIERARCHY } from '../types';
import type { AppContextType, User, Message, CampaignFinance, Territory, PoliticalRole, TerritoryZone } from '../types';
import toast from 'react-hot-toast';

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

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

  // Initialize app and check authentication
  useEffect(() => {
    const initializeApp = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          const profile = await getUserProfile(session.user.id);
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

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        const profile = await getUserProfile(session.user.id);
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
  }, []);

  // Load application data based on user permissions
  const loadAppData = async (currentUser: User) => {
    try {
      setLoading(true);
      
      // Load users
      const allUsers = await getAllUsers();
      setUsers(allUsers);
      
      // Load messages based on user role and territory
      const userMessages = await getMessages(currentUser.role, currentUser.territory_zone);
      setMessages(userMessages);
      
      // Load finances based on user role and territory
      const userFinances = await getCampaignFinances(currentUser.role, currentUser.territory_zone);
      setFinances(userFinances);
      
      // Set up real-time subscriptions
      const messageSubscription = subscribeToMessages((newMessage) => {
        // Only add message if user has permission to see it
        if (hasPermission(currentUser.role, newMessage.territory_zone)) {
          setMessages(prev => [newMessage, ...prev]);
          
          // Show toast notification for urgent messages
          if (newMessage.is_urgent && newMessage.sender_id !== currentUser.id) {
            toast.error(`Mensaje urgente de ${newMessage.sender_name}`, {
              duration: 5000,
            });
          }
        }
      });
      
      const userSubscription = subscribeToUserUpdates((updatedUser) => {
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
  };

  // Authentication functions
  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      
      const { user: authUser, error: authError } = await signIn(email, password);
      
      if (authError || !authUser) {
        setError('Credenciales inválidas');
        return false;
      }
      
      const profile = await getUserProfile(authUser.id);
      if (!profile) {
        setError('Perfil de usuario no encontrado');
        return false;
      }
      
      setUser(profile);
      await loadAppData(profile);
      
      // Update last login
      await updateUserProfile(authUser.id, { last_login: new Date().toISOString() });
      
      toast.success(`Bienvenido, ${profile.full_name}`);
      return true;
      
    } catch (err) {
      console.error('Login error:', err);
      setError('Error durante el inicio de sesión');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      await signOut();
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

  // Profile management
  const updatePassword = useCallback(async (newPassword: string): Promise<boolean> => {
    try {
      setLoading(true);
      const { error } = await updateUserPassword(newPassword);
      
      if (error) {
        setError('Error al actualizar contraseña');
        return false;
      }
      
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
      const { error } = await updateUserProfile(user.id, data);
      
      if (error) {
        setError('Error al actualizar perfil');
        return false;
      }
      
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

  // Messaging functions
  const sendMessage = useCallback(async (messageData: Omit<Message, 'id' | 'created_at' | 'read_by'>): Promise<boolean> => {
    try {
      const { error } = await sendMessageAPI(messageData);
      
      if (error) {
        setError('Error al enviar mensaje');
        return false;
      }
      
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
      await markMessageAsReadAPI(messageId, user.id);
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

  // Utility functions
  const getUsersByTerritory = useCallback((zone: TerritoryZone): User[] => {
    return users.filter(u => u.territory_zone === zone);
  }, [users]);

  const getFinancesByTerritory = useCallback((zone: TerritoryZone): CampaignFinance[] => {
    return finances.filter(f => f.territory_zone === zone);
  }, [finances]);

  const hasPermission = useCallback((requiredRole: PoliticalRole, targetZone?: TerritoryZone): boolean => {
    if (!user) return false;
    
    const userLevel = ROLE_HIERARCHY[user.role];
    const requiredLevel = ROLE_HIERARCHY[requiredRole];
    
    // Check role hierarchy
    if (userLevel < requiredLevel) return false;
    
    // Check territory access
    if (targetZone && !hasPermissionForTerritory(user.role, user.territory_zone, targetZone)) {
      return false;
    }
    
    return true;
  }, [user]);

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
    hasPermission,
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};