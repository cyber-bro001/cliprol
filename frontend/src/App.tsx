import { Routes, Route, useLocation } from "react-router-dom";

import Header from "./components/Header";
import LandingPage from "./pages/LandingPage";
import ProcessingPage from "./pages/ProcessingPage";
import ResultsPage from "./pages/ResultsPage";

import LoginPage from "./pages/authpage/LoginPage";
import SignupPage from "./pages/authpage/SignupPage";

const App = () => {
  const location = useLocation();

  const hideNavbar =
    location.pathname.startsWith("/login") ||
    location.pathname.startsWith("/signup");

  return (
    <>
      {!hideNavbar && <Header />}

      <div>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/processes" element={<ProcessingPage />} />
          <Route path="/results" element={<ResultsPage />} />

          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
        </Routes>
      </div>
    </>
  );
};

export default App;
