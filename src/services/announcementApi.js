import { supabase } from "../lib/supabaseClient";

export const announcementApi = {
  getAll: async () => {
    const { data, error } = await supabase
      .from('announcements')
      .select('*, profiles(company)')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  create: async (announcementData) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error("Not authenticated");

    const { data, error } = await supabase.from('announcements').insert([{
      ...announcementData,
      operator_id: session.user.id
    }]).select().single();
    
    if (error) throw error;
    return data;
  },

  delete: async (id) => {
    const { error } = await supabase.from('announcements').delete().eq('id', id);
    if (error) throw error;
  }
};