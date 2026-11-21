import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { ThreatDataProvider } from "./lib/data";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <ThreatDataProvider>
        <App />
      </ThreatDataProvider>
    </BrowserRouter>
  </StrictMode>,
);
