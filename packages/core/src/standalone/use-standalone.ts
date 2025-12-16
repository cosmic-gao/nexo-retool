import { createContext, useContext } from "react";
import type { PageConfig, MenuItemConfig } from "../types/app";

export interface StandaloneContextValue {
  /** App ID */
  appId: string;
  /** App name for display */
  appName: string;
  /** App icon (emoji or React node) */
  appIcon?: React.ReactNode;
  /** Whether standalone mode is enabled */
  isStandalone: boolean;
  /** Current menus derived from pages */
  menus: MenuItemConfig[];
  /** Original page configs */
  pages: PageConfig[];
  /** Navigate to a path */
  navigate: (path: string) => void;
  /** Current path */
  currentPath: string;
  /** Sidebar state */
  sidebarOpen: boolean;
  /** Toggle sidebar */
  toggleSidebar: () => void;
  /** Set sidebar state */
  setSidebarOpen: (open: boolean) => void;
}

export const StandaloneContext = createContext<StandaloneContextValue | null>(null);

export function useStandalone(): StandaloneContextValue {
  const context = useContext(StandaloneContext);
  if (!context) {
    throw new Error("useStandalone must be used within a StandaloneProvider");
  }
  return context;
}

/**
 * Safe version that returns null if not in standalone mode
 */
export function useStandaloneSafe(): StandaloneContextValue | null {
  return useContext(StandaloneContext);
}

