// src/main.jsx - CORRECT ORDER
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "stream-chat-react/dist/css/v2/index.css";
import "./index.css";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom"; // ✅ FIXED
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();
 
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>   {/* ✅ Router FIRST, then everything else */}
        <App />
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>
);