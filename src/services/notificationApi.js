import { supabase } from "../lib/supabaseClient";

export const notificationApi = {
  getMine: async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return [];

    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    return data;
  },

  markAsRead: async (id) => {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', id);
    if (error) throw error;
  },

  create: async (userId, title, message, type = 'system') => {
    const { error } = await supabase
      .from('notifications')
      .insert([{ user_id: userId, title, message, type }]);
    if (error) throw error;
  }
};