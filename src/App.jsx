import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import ProtectedRoute from "./routes/ProtectedRoute";

// Splash & Onboarding
import Splash from "./pages/Splash";
import Onboarding from "./pages/Onboarding";
import Login from "./pages/auth/Login";
import ResetPassword from "./pages/auth/ResetPassword"; 

// Operator
import OperatorLayout from "./routes/OperatorLayout";
import OperatorDashboard from "./pages/operator/Dashboard";
import Schedules from "./pages/operator/Schedules";
import Scanner from "./pages/operator/Scanner";
import Buses from "./pages/operator/Buses";
import Announcements from "./pages/operator/Announcements";

// Passenger
import PassengerLayout from "./routes/PassengerLayout";
import Home from "./pages/passenger/Home";
import SeatSelection from "./pages/passenger/SeatSelection";
import Ticket from "./pages/passenger/Ticket";
import MyBookings from "./pages/passenger/MyBookings";
import MyTickets from "./pages/passenger/MyTickets";
import Profile from "./pages/passenger/Profile";
import Notifications from "./pages/passenger/Notifications";
import Payment from "./pages/passenger/Payment";

function AppRoutes() {
  const { user, loading } = useAuth();
  
  // Samtang nag-check pa sa session, pagpakita og loading (dili splash)
  if (loading) {
    return <div style={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#F1F5F9", color: "#64748B" }}>Loading...</div>;
  }

  return (
    <Routes>
      {/* SPLASH & ONBOARDING - Makita ra kung WALAY user */}
      <Route path="/splash" element={!user ? <Splash /> : <Navigate to="/" replace />} />
      <Route path="/onboarding" element={!user ? <Onboarding /> : <Navigate to="/" replace />} />
      
      {/* LOGIN - Makita ra kung WALAY user */}
      <Route path="/login" element={!user ? <Login /> : <Navigate to="/" replace />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      {/* PASSENGER ROUTES */}
      <Route element={<ProtectedRoute allowedRoles={["passenger"]} />}>
        <Route element={<PassengerLayout />}>
          <Route path="/passenger/home" element={<Home />} />
          <Route path="/passenger/bookings" element={<MyBookings />} />
          <Route path="/passenger/tickets" element={<MyTickets />} />
          <Route path="/passenger/notifications" element={<Notifications />} />
          <Route path="/passenger/profile" element={<Profile />} />
          <Route path="/passenger/book/:tripId" element={<SeatSelection />} />
          <Route path="/passenger/ticket/:bookingId" element={<Ticket />} />
          <Route path="/passenger/payment/:bookingId" element={<Payment />} />
        </Route>
      </Route>

      {/* OPERATOR ROUTES */}
      <Route element={<ProtectedRoute allowedRoles={["operator"]} />}>
        <Route element={<OperatorLayout />}>
          <Route path="/operator/dashboard" element={<OperatorDashboard />} />
          <Route path="/operator/schedules" element={<Schedules />} />
          <Route path="/operator/buses" element={<Buses />} />
          <Route path="/operator/scanner" element={<Scanner />} />
          <Route path="/operator/announcements" element={<Announcements />} />
        </Route>
      </Route>

      {/* DEFAULT REDIRECT - Inig-adto sa / (root) */}
      <Route
        path="/"
        element={
          !user ? (
            <Navigate to="/splash" replace />
          ) : user.role === "operator" ? (
            <Navigate to="/operator/dashboard" replace />
          ) : (
            <Navigate to="/passenger/home" replace />
          )
        }
      />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}