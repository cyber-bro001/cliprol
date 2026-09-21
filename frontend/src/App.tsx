import { Routes, Route, useLocation } from "react-router-dom";

import Header from "./components/Header";
import ProtectedRoute from "./components/ProtectedRoute";
import PublicRoute from "./components/PublicRoute";

import LandingPage from "./pages/LandingPage";
import ProcessingPage from "./pages/ProcessingPage";
import ResultsPage from "./pages/ResultsPage";
import LoginPage from "./pages/authpage/LoginPage";
import SignupPage from "./pages/authpage/SignupPage";
import NotFound from "./pages/NotFound";

import DashboardLayout from "./layouts/DashboardLayout";
import DashboardHome from "./pages/dashboard/DashboardHome";
import DashboardProjects from "./pages/dashboard/DashboardProjects";
import DashboardSettings from "./pages/dashboard/DashboardSettings";
import NewProject from "./pages/dashboard/NewProject";

const App = () => {
  const location = useLocation();

  const hideNavbar =
    location.pathname.startsWith("/login") ||
    location.pathname.startsWith("/signup") ||
    location.pathname.startsWith("/dashboard"); //||
  //location.pathname.startsWith("*");

  return (
    <>
      {!hideNavbar && <Header />}
      <div>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<LandingPage />} />

          {/* Auth routes — redirect to dashboard if logged in */}
          <Route
            path="/login"
            element={
              <PublicRoute>
                <LoginPage />
              </PublicRoute>
            }
          />
          <Route
            path="/signup"
            element={
              <PublicRoute>
                <SignupPage />
              </PublicRoute>
            }
          />

          {/* Protected routes — redirect to login if not logged in */}

          {/* Dashboard — protected, added soon */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<DashboardHome />} />
            <Route path="projects" element={<DashboardProjects />} />
            <Route path="projects/:projectId" element={<ResultsPage />} />
            <Route path="settings" element={<DashboardSettings />} />
            <Route path="new-project" element={<NewProject />} />
            <Route path="process/:projectId" element={<ProcessingPage />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </>
  );
};

export default App;
