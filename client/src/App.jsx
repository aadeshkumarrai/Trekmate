import {
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Chat from "./pages/Chat";

import AdminDashboard from "./pages/AdminDashboard";
import AdminStaffRequests from "./pages/AdminStaffRequests";
import AdminTreks from "./pages/AdminTreks";
import AdminTrekForm from "./pages/AdminTrekForm";
import AdminBookings from "./pages/AdminBookings";
import AdminAccounts from "./pages/AdminAccounts";

import StaffDashboard from "./pages/StaffDashboard";

import UserDashboard from "./pages/UserDashboard";
import UserTreks from "./pages/UserTreks";
import UserBookings from "./pages/UserBookings";
import UserHistory from "./pages/UserHistory";

import ProtectedRoute from "./components/ProtectedRoute";

const adminRoute = (component) => (
  <ProtectedRoute allowedRoles={["admin"]}>
    {component}
  </ProtectedRoute>
);

const userRoute = (component) => (
  <ProtectedRoute allowedRoles={["user"]}>
    {component}
  </ProtectedRoute>
);

function App() {
  return (
    <Routes>
      <Route
        path="/"
        element={<Navigate to="/login" replace />}
      />

      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Admin routes */}
      <Route
        path="/admin"
        element={adminRoute(<AdminDashboard />)}
      />

      <Route
        path="/admin/staff"
        element={adminRoute(<AdminStaffRequests />)}
      />

      <Route
        path="/admin/treks"
        element={adminRoute(<AdminTreks />)}
      />

      <Route
        path="/admin/treks/new"
        element={adminRoute(<AdminTrekForm />)}
      />

      <Route
        path="/admin/treks/:id/edit"
        element={adminRoute(<AdminTrekForm />)}
      />

      <Route
        path="/admin/bookings"
        element={adminRoute(<AdminBookings />)}
      />

      <Route
        path="/admin/users"
        element={adminRoute(
          <AdminAccounts accountRole="user" />
        )}
      />

      <Route
        path="/admin/team"
        element={adminRoute(
          <AdminAccounts accountRole="staff" />
        )}
      />

      {/* Staff routes */}
      <Route
        path="/staff/*"
        element={
          <ProtectedRoute allowedRoles={["staff"]}>
            <StaffDashboard />
          </ProtectedRoute>
        }
      />

      {/* User routes */}
      <Route
        path="/dashboard"
        element={userRoute(<UserDashboard />)}
      />

      <Route
        path="/treks"
        element={userRoute(<UserTreks />)}
      />

      <Route
        path="/bookings"
        element={userRoute(<UserBookings />)}
      />

      <Route
        path="/history"
        element={userRoute(<UserHistory />)}
      />

      {/* AI assistant */}
      <Route
        path="/chat"
        element={
          <ProtectedRoute>
            <Chat />
          </ProtectedRoute>
        }
      />

      <Route
        path="*"
        element={<Navigate to="/login" replace />}
      />
    </Routes>
  );
}

export default App;