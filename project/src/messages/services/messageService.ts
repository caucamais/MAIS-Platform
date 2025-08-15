import { supabase } from '../../core/lib/supabase';
import type { Message, PoliticalRole, TerritoryZone } from '../../types';

export const messageService = {
  sendMessage: async (message: Omit<Message, 'id' | 'created_at' | 'read_by'>) => {
    const { error } = await supabase
      .from('messages')
      .insert({
        ...message,
        created_at: new Date().toISOString(),
        read_by: []
      });
    
    if (error) throw error;
  },

  getMessages: async (userRole: PoliticalRole, userZone?: TerritoryZone): Promise<Message[]> => {
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
  },

  markMessageAsRead: async (messageId: string, userId: string) => {
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
  },

  subscribeToMessages: (callback: (message: Message) => void) => {
    return supabase
      .channel('messages')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'messages' },
        (payload) => callback(payload.new as Message)
      )
      .subscribe();
  }
};
