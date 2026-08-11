import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const homeRoutes = {
  admin: "/admin",
  staff: "/staff",
  user: "/dashboard",
};

function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <main className="loading-page">
        <p>Loading TREKMATE...</p>
      </main>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (
    allowedRoles &&
    !allowedRoles.includes(user.role)
  ) {
    return (
      <Navigate
        to={homeRoutes[user.role] || "/login"}
        replace
      />
    );
  }

  return children;
}

export default ProtectedRoute;