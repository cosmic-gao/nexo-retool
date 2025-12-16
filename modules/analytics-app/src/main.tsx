import { createRoot, Root } from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Home, Overview, Reports, Realtime } from "./pages";
import "./styles/globals.css";

const isInWujie = !!(window as any).__POWERED_BY_WUJIE__;

function RouteSync() {
  const navigate = useNavigate();

  useEffect(() => {
    if (!isInWujie) return;

    const wujie = (window as any).$wujie;
    if (!wujie?.bus) return;

    const handleRouteChange = (data: { path: string }) => {
      if (data.path) {
        navigate(data.path);
      }
    };

    wujie.bus.$on("analytics-app-route-change", handleRouteChange);
    return () => wujie.bus.$off("analytics-app-route-change", handleRouteChange);
  }, [navigate]);

  return null;
}

function App() {
  return (
    <BrowserRouter>
      <RouteSync />
      <div className="min-h-screen p-6">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/overview" element={<Overview />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/realtime" element={<Realtime />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

let root: Root | null = null;

function mount() {
  const container = document.getElementById("root");
  if (container && !root) {
    root = createRoot(container);
    root.render(<App />);
  }
}

function unmount() {
  if (root) {
    root.unmount();
    root = null;
  }
}

if (isInWujie) {
  (window as any).__WUJIE_MOUNT = mount;
  (window as any).__WUJIE_UNMOUNT = unmount;
} else {
  mount();
}
