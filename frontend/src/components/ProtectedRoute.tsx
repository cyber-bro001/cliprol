import { Navigate, useLocation } from "react-router-dom";
import { useCliprolContext } from "../context/CliprolContext";

type ProtectedRouteProps = {
  children: React.ReactNode;
};

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { session, authLoading } = useCliprolContext();
  const location = useLocation();

  if (authLoading) {
    return <p role="status" className="p-6 text-center">Loading session…</p>;
  }

  if (!session) {
    return <Navigate to="/login" state={{ from: location.pathname + location.search + location.hash }} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
