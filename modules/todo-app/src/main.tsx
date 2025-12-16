import { StrictMode, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  BrowserRouter,
  Routes,
  Route,
  useNavigate,
  useLocation,
} from "react-router-dom";
import { Home, List, Stats, Calendar, Settings } from "./pages";
import "./styles/globals.css";

// Get the base path from Vite config or default
const BASE_PATH = "/modules/todo-app";

// Check if running in wujie
const isInWujie = !!(window as any).__POWERED_BY_WUJIE__;

// Router wrapper that listens for route changes from parent app
function RouterWrapper({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (isInWujie) {
      // Listen for route changes from parent app via wujie bus
      const wujie = (window as any).$wujie;
      if (wujie?.bus) {
        const handleRouteChange = (data: { path: string; fullPath: string }) => {
          console.log("📝 Todo App received route change:", data);
          if (data.path && data.path !== location.pathname) {
            navigate(data.path);
          }
        };

        wujie.bus.$on("todo-app-route-change", handleRouteChange);
        console.log("📝 Todo App: listening for route changes");

        return () => {
          wujie.bus.$off("todo-app-route-change", handleRouteChange);
        };
      }
    }
  }, [navigate, location.pathname]);

  return <>{children}</>;
}

function App() {
  return (
    <BrowserRouter basename={isInWujie ? "" : BASE_PATH}>
      <RouterWrapper>
        <div className="min-h-screen p-6">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/list" element={<List />} />
            <Route path="/stats" element={<Stats />} />
            <Route path="/calendar" element={<Calendar />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </div>
      </RouterWrapper>
    </BrowserRouter>
  );
}

// Mount the app
function mount() {
  const container = document.getElementById("root");
  if (container) {
    const root = createRoot(container);
    root.render(
      <StrictMode>
        <App />
      </StrictMode>
    );
    console.log("📝 Todo App mounted, isInWujie:", isInWujie);
  }
}

// For wujie, export lifecycle hooks
if (isInWujie) {
  // @ts-ignore
  window.__WUJIE_MOUNT = mount;
  // @ts-ignore
  window.__WUJIE_UNMOUNT = () => {
    console.log("📝 Todo App unmounted");
  };
}

// Auto mount
mount();
