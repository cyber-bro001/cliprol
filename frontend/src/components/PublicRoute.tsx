import { Navigate } from "react-router-dom";
import { useCliprolContext } from "../context/CliprolContext";

type PublicRouteProps = {
  children: React.ReactNode;
};

const PublicRoute = ({ children }: PublicRouteProps) => {
  const { session } = useCliprolContext();

  if (session) {
    return <Navigate to="/dashboard/new-project" replace />;
  }

  return <>{children}</>;
};

export default PublicRoute;
