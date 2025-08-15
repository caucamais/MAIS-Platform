import { supabase } from '../../core/lib/supabase';
import type { User } from '../../types';

export const userService = {
  getUserProfile: async (userId: string): Promise<User | null> => {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) throw error;
    return data as User;
  },

  updateUserProfile: async (userId: string, updates: Partial<User>) => {
    const { error } = await supabase
      .from('user_profiles')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);
    
    if (error) throw error;
  },

  getAllUsers: async (): Promise<User[]> => {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data as User[];
  },

  subscribeToUserUpdates: (callback: (user: User) => void) => {
    return supabase
      .channel('user_profiles')
      .on('postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'user_profiles' },
        (payload) => callback(payload.new as User)
      )
      .subscribe();
  }
};
