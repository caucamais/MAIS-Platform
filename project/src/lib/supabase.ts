// MAIS Political Command Center - Supabase Configuration
// Swiss Precision Standards - Secure Database Integration

import { createClient } from '@supabase/supabase-js';
import type { User, Message, CampaignFinance, PoliticalRole, TerritoryZone } from '../types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Authentication Functions
export const signIn = async (email: string, password: string) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) throw error;
    return { user: data.user, error: null };
  } catch (error) {
    console.error('Sign in error:', error);
    return { user: null, error: error as Error };
  }
};

export const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error('Sign out error:', error);
    return { error: error as Error };
  }
};

export const updateUserPassword = async (newPassword: string) => {
  try {
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });
    
    if (error) throw error;
    
    // Mark password as changed in user profile
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase
        .from('user_profiles')
        .update({ is_password_changed: true })
        .eq('id', user.id);
    }
    
    return { error: null };
  } catch (error) {
    console.error('Update password error:', error);
    return { error: error as Error };
  }
};

// User Profile Functions
export const getUserProfile = async (userId: string): Promise<User | null> => {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) throw error;
    return data as User;
  } catch (error) {
    console.error('Get user profile error:', error);
    return null;
  }
};

export const updateUserProfile = async (userId: string, updates: Partial<User>) => {
  try {
    const { error } = await supabase
      .from('user_profiles')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);
    
    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error('Update user profile error:', error);
    return { error: error as Error };
  }
};

export const getAllUsers = async (): Promise<User[]> => {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data as User[];
  } catch (error) {
    console.error('Get all users error:', error);
    return [];
  }
};

// Message Functions
export const sendMessage = async (message: Omit<Message, 'id' | 'created_at' | 'read_by'>) => {
  try {
    const { error } = await supabase
      .from('messages')
      .insert({
        ...message,
        created_at: new Date().toISOString(),
        read_by: []
      });
    
    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error('Send message error:', error);
    return { error: error as Error };
  }
};

export const getMessages = async (userRole: PoliticalRole, userZone?: TerritoryZone): Promise<Message[]> => {
  try {
    let query = supabase
      .from('messages')
      .select('*')
      .order('created_at', { ascending: false });
    
    // Filter messages based on user role and territory
    if (userRole !== 'comite_ejecutivo_nacional' && userZone) {
      query = query.or(`territory_zone.is.null,territory_zone.eq.${userZone}`);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    return data as Message[];
  } catch (error) {
    console.error('Get messages error:', error);
    return [];
  }
};

export const markMessageAsRead = async (messageId: string, userId: string) => {
  try {
    // Get current message
    const { data: message, error: fetchError } = await supabase
      .from('messages')
      .select('read_by')
      .eq('id', messageId)
      .single();
    
    if (fetchError) throw fetchError;
    
    const readBy = message.read_by || [];
    if (!readBy.includes(userId)) {
      readBy.push(userId);
      
      const { error } = await supabase
        .from('messages')
        .update({ read_by: readBy })
        .eq('id', messageId);
      
      if (error) throw error;
    }
    
    return { error: null };
  } catch (error) {
    console.error('Mark message as read error:', error);
    return { error: error as Error };
  }
};

// Finance Functions
export const getCampaignFinances = async (userRole: PoliticalRole, userZone?: TerritoryZone): Promise<CampaignFinance[]> => {
  try {
    let query = supabase
      .from('campaign_finances')
      .select('*')
      .order('last_updated', { ascending: false });
    
    // Filter finances based on user role and territory
    if (userRole !== 'comite_ejecutivo_nacional' && userZone) {
      query = query.eq('territory_zone', userZone);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    return data as CampaignFinance[];
  } catch (error) {
    console.error('Get campaign finances error:', error);
    return [];
  }
};

// Real-time Subscriptions
export const subscribeToMessages = (callback: (message: Message) => void) => {
  return supabase
    .channel('messages')
    .on('postgres_changes', 
      { event: 'INSERT', schema: 'public', table: 'messages' },
      (payload) => callback(payload.new as Message)
    )
    .subscribe();
};

export const subscribeToUserUpdates = (callback: (user: User) => void) => {
  return supabase
    .channel('user_profiles')
    .on('postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'user_profiles' },
      (payload) => callback(payload.new as User)
    )
    .subscribe();
};

// Permission Helper
export const hasPermissionForTerritory = (userRole: PoliticalRole, userZone: TerritoryZone, targetZone: TerritoryZone): boolean => {
  // National committee has access to all territories
  if (userRole === 'comite_ejecutivo_nacional') return true;
  
  // Regional leaders and below can only access their own territory
  return userZone === targetZone;
};