import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import App from "./App.tsx";
import { AuthProvider } from "@/components/auth/AuthContext";
import AuthGuard from "@/components/auth/AuthGuard";
import ReactQueryProvider from "@/components/provider/react-query-provider";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <AuthGuard>
          <ReactQueryProvider>
            <App />
          </ReactQueryProvider>
        </AuthGuard>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
);
