import { supabase } from "../lib/supabaseClient";

export const operatorApi = {
  // ─────────────────────────────────────────────
  // DASHBOARD STATS
  // ─────────────────────────────────────────────
  getRevenueReportData: async () => {
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        reference, 
        created_at, 
        seats, 
        passenger_types, 
        total_amount, 
        status,
        trips ( bus_name, origin, destination, date, departure_time )
      `)
      .in('status', ['confirmed', 'boarded']) // Kadtong mga na-verify na
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  getDashboardStats: async () => {
    const today = new Date().toISOString().split("T")[0];
    
    const { data: trips } = await supabase.from('trips').select('*');
    const { data: bookings } = await supabase.from('bookings').select('total_amount, seats').eq('status', 'confirmed');
    
    let revenue = 0;
    let passengers = 0;
    
    if (bookings) {
      revenue = bookings.reduce((sum, b) => sum + Number(b.total_amount), 0);
      passengers = bookings.reduce((sum, b) => sum + b.seats.length, 0);
    }

    // ✅ Kini ra ang mga upcoming trips (published ug wala pa nahuman)
    const upcomingTrips = trips?.filter(t => t.status === 'published' && t.date >= today).length || 0;

    return {
      totalRevenue: revenue,
      totalBookings: bookings?.length || 0,
      totalPassengers: passengers,
      upcomingTrips: upcomingTrips,
    };
  },

  // ─────────────────────────────────────────────
  // REVENUE CHART DATA
  // ─────────────────────────────────────────────
  getRevenueData: async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return [];

    // Kuhaon ang tanang confirmed bookings kauban ang trip date
    const { data, error } = await supabase
      .from('bookings')
      .select('total_amount, created_at, trips(date)')
      .eq('status', 'confirmed');

    if (error) throw error;

    // I-group base sa petsa
    const revenueByDate = {};
    data.forEach(booking => {
      const date = booking.trips?.date || booking.created_at.split('T')[0];
      if (!revenueByDate[date]) revenueByDate[date] = 0;
      revenueByDate[date] += Number(booking.total_amount);
    });

    // I-format para sa chart
    return Object.keys(revenueByDate).sort().map(date => ({
      date,
      revenue: revenueByDate[date]
    }));
  },

  // ─────────────────────────────────────────────
  // TRIPS
  // ─────────────────────────────────────────────
  getTrips: async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return [];

    const { data, error } = await supabase
      .from('trips')
      .select('*')
      .eq('operator_id', session.user.id)
      .order('date', { ascending: true });
      
    if (error) throw error;
    return data;
  },

  createTrip: async (tripData) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error("Not authenticated");

    const { data, error } = await supabase.from('trips').insert([{
      ...tripData,
      operator_id: session.user.id,
      status: 'published'
    }]).select().single();
    
    if (error) throw error;
    return data;
  },

  updateTrip: async (tripId, updates) => {
    const { data, error } = await supabase
      .from('trips')
      .update(updates)
      .eq('id', tripId)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  deleteTrip: async (tripId) => {
    const { error } = await supabase
      .from('trips')
      .delete()
      .eq('id', tripId);
      
    if (error) {
      console.error("Supabase Delete Error:", error);
      throw error;
    }
  },

  // ─────────────────────────────────────────────
  // BUSES
  // ─────────────────────────────────────────────
  getBuses: async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return [];
    const { data, error } = await supabase
      .from('buses')
      .select('*')
      .eq('operator_id', session.user.id);
    if (error) throw error;
    return data;
  },

  createBus: async (busData) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error("Not authenticated");
    
    const { data, error } = await supabase.from('buses').insert([{
      ...busData,
      operator_id: session.user.id
    }]).select().single();
    
    if (error) throw error;
    return data;
  },

  updateBus: async (busId, updates) => {
    const { data, error } = await supabase
      .from('buses')
      .update(updates)
      .eq('id', busId)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  deleteBus: async (busId) => {
    const { error } = await supabase
      .from('buses')
      .delete()
      .eq('id', busId);
    if (error) throw error;
  },
};