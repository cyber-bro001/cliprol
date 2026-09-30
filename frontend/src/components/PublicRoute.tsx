import { Navigate, useLocation } from "react-router-dom";
import { useCliprolContext } from "../context/CliprolContext";
import { loginDestination } from "../lib/authHelpers/destination";

type PublicRouteProps = {
  children: React.ReactNode;
};

const PublicRoute = ({ children }: PublicRouteProps) => {
  const { session, authLoading } = useCliprolContext();
  const location = useLocation();

  if (authLoading) return <p role="status" className="p-6 text-center">Loading session…</p>;

  if (session) {
    return <Navigate to={loginDestination(location.state, sessionStorage.getItem("cliprol.pendingVideoUrl"))} replace />;
  }

  return <>{children}</>;
};

export default PublicRoute;
