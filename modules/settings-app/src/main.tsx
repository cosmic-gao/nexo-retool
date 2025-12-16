import { StrictMode } from "react";
import { createRoot, Root } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Home, Profile, Security } from "./pages";
import "./styles/globals.css";

let root: Root | null = null;

function App() {
  const baseroute = window.__MICRO_APP_BASE_ROUTE__ || "/app/settings";

  return (
    <BrowserRouter basename={baseroute}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/security" element={<Security />} />
      </Routes>
    </BrowserRouter>
  );
}

export function mount(container?: HTMLElement) {
  const targetContainer =
    container ||
    document.getElementById("micro-app-root") ||
    document.getElementById("root");

  if (!targetContainer) {
    console.error("Settings App: Mount container not found");
    return;
  }

  root = createRoot(targetContainer);
  root.render(
    <StrictMode>
      <App />
    </StrictMode>
  );

  console.log("⚙️ Settings App mounted");
}

export function unmount() {
  if (root) {
    root.unmount();
    root = null;
    console.log("⚙️ Settings App unmounted");
  }
}

// micro-app lifecycle hooks
// @ts-ignore
window.mount = mount;
// @ts-ignore
window.unmount = unmount;

// Auto mount
mount();

declare global {
  interface Window {
    __MICRO_APP_BASE_ROUTE__?: string;
    __MICRO_APP_NAME__?: string;
    mount?: () => void;
    unmount?: () => void;
  }
}

