import { supabase } from '../../core/lib/supabase';

export const authService = {
  signIn: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data;
  },

  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  updateUserPassword: async (newPassword: string) => {
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
  },

  getSession: async () => {
      const { data, error } = await supabase.auth.getSession();
      if (error) throw error;
      return data.session;
  }
};
