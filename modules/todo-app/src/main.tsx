import { createRoot, Root } from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Home, List } from "./pages";
import "./styles/globals.css";

const isInWujie = !!(window as any).__POWERED_BY_WUJIE__;

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen p-6">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/list" element={<List />} />
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
