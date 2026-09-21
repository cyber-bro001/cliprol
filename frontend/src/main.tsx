//import { StrictMode } from "react";
import ErrorBoundary from "./components/ErrorBoundary";
import { createRoot } from "react-dom/client";
import { BrowserRouter as Router } from "react-router-dom";
import "./index.css";
import App from "./App.tsx";
import { CliprolProvider } from "./context/CliprolContext.tsx";
//</StrictMode>,
//<StrictMode>

createRoot(document.getElementById("root")!).render(
  <Router>
    <CliprolProvider>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </CliprolProvider>
  </Router>,
);
