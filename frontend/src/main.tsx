import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { CliprolProvider } from "./context/CliprolContext.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <CliprolProvider>
      <App />
    </CliprolProvider>
  </StrictMode>,
);
