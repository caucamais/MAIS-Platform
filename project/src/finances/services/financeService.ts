import { supabase } from '../../core/lib/supabase';
import type { CampaignFinance, PoliticalRole, TerritoryZone } from '../../types';

export const financeService = {
  getCampaignFinances: async (userRole: PoliticalRole, userZone?: TerritoryZone): Promise<CampaignFinance[]> => {
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
  }
};
