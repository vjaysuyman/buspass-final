import { supabase } from "../lib/supabaseClient";
import { notificationApi } from "./notificationApi";

export const passengerApi = {
  searchTrips: async (date) => {
    const { data, error } = await supabase
      .from("trips")
      .select("*")
      .eq("date", date)
      .eq("status", "published")
      .gte("date", new Date().toISOString().split("T")[0]); // ✅ Dili na mugawas ang nilabay nga petsa
    
    if (error) throw error;
    return data;
  },

  getTripById: async (tripId) => {
    const { data, error } = await supabase
      .from("trips")
      .select("*")
      .eq("id", tripId)
      .single();
      
    if (error) throw error;
    return data;
  },

  // ✅ BAG-O: Pagkuha sa mga booked seats para sa usa ka trip
  getBookedSeats: async (tripId) => {
    const { data, error } = await supabase
      .from("bookings")
      .select("seats")
      .eq("trip_id", tripId)
      .in("status", ["pending", "confirmed", "boarded"]);

    if (error) throw error;
    // I-flatten ang array of arrays into a single array of seats
    return data.flatMap(booking => booking.seats);
  },

  // ✅ BAG-O: Check kung available pa ba ang mga seats
  checkSeatsAvailable: async (tripId, seats) => {
    const { data, error } = await supabase.rpc('check_seat_availability', {
      p_trip_id: tripId,
      p_seats: seats
    });
    if (error) throw error;
    return data; // true kung available, false kung naay conflict
  },

  createBooking: async (bookingData) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error("Not authenticated");

    const reference = `BP-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    const { data, error } = await supabase.from("bookings").insert([{
      ...bookingData,
      user_id: session.user.id,
      reference: reference,
      status: "pending",
      payment_status: "unpaid"
    }]).select().single();
    
    if (error) throw error;

    await notificationApi.create(
      session.user.id,
      "Booking Created",
      `Your booking for seats ${bookingData.seats.join(", ")} is awaiting payment. Ref: ${reference}`,
      "booking"
    );

    return data;
  },

  createPaymentIntent: async (bookingId) => {
    const { data, error } = await supabase.functions.invoke('create-payment-intent', {
      body: { booking_id: bookingId }
    });
    if (error) throw error;
    return data;
  },

  getMyBookings: async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return [];

    const { data, error } = await supabase
      .from("bookings")
      .select("*, trips(*)")
      .eq("user_id", session.user.id)
      .order("created_at", { ascending: false });
      
    if (error) throw error;
    return data;
  },

  getBookingById: async (bookingId) => {
    const { data, error } = await supabase
      .from("bookings")
      .select("*, trips(*)")
      .eq("id", bookingId)
      .single();
      
    if (error) throw error;
    return data;
  }
};