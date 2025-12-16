import React, { useState, useMemo, useCallback, useEffect, type ReactNode } from "react";
import { BrowserRouter, useNavigate, useLocation } from "react-router-dom";
import { StandaloneContext, type StandaloneContextValue } from "./use-standalone";
import type { PageConfig, MenuItemConfig } from "../types/app";

export interface StandaloneConfig {
  /** App ID */
  appId: string;
  /** App name for display */
  appName: string;
  /** App icon (emoji or string) */
  appIcon?: string;
  /** Pages configuration from manifest */
  pages?: PageConfig[];
  /** Platform name shown in sidebar header */
  platformName?: string;
  /** User info for sidebar footer */
  user?: {
    name: string;
    email?: string;
    avatar?: string;
  };
  /** Initial sidebar state */
  defaultSidebarOpen?: boolean;
  /** Custom icon resolver */
  iconResolver?: (iconName: string) => ReactNode;
}

/**
 * Transform PageConfig to MenuItemConfig
 */
function transformPagesToMenus(
  pages: PageConfig[],
  iconResolver?: (iconName: string) => ReactNode
): MenuItemConfig[] {
  return pages
    .filter((page) => !page.hidden)
    .map((page) => ({
      id: page.id,
      label: page.label,
      path: page.path,
      icon: page.icon ? iconResolver?.(page.icon) ?? page.icon : undefined,
      order: page.order,
      badge: page.badge,
      permissions: page.permissions,
      external: page.external,
      target: page.target,
      children: page.children
        ? transformPagesToMenus(page.children, iconResolver)
        : undefined,
    }));
}

interface StandaloneProviderInnerProps {
  config: StandaloneConfig;
  children: ReactNode;
}

function StandaloneProviderInner({ config, children }: StandaloneProviderInnerProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(config.defaultSidebarOpen ?? true);

  const menus = useMemo(
    () => transformPagesToMenus(config.pages || [], config.iconResolver),
    [config.pages, config.iconResolver]
  );

  const handleNavigate = useCallback(
    (path: string) => {
      navigate(path);
    },
    [navigate]
  );

  const toggleSidebar = useCallback(() => {
    setSidebarOpen((prev) => !prev);
  }, []);

  const contextValue = useMemo<StandaloneContextValue>(
    () => ({
      appId: config.appId,
      appName: config.appName,
      appIcon: config.appIcon,
      isStandalone: true,
      menus,
      pages: config.pages || [],
      navigate: handleNavigate,
      currentPath: location.pathname,
      sidebarOpen,
      toggleSidebar,
      setSidebarOpen,
    }),
    [
      config.appId,
      config.appName,
      config.appIcon,
      menus,
      config.pages,
      handleNavigate,
      location.pathname,
      sidebarOpen,
      toggleSidebar,
    ]
  );

  return (
    <StandaloneContext.Provider value={contextValue}>
      {children}
    </StandaloneContext.Provider>
  );
}

interface StandaloneProviderProps {
  config: StandaloneConfig;
  children: ReactNode;
  /** If true, wraps children with BrowserRouter */
  withRouter?: boolean;
}

export function StandaloneProvider({
  config,
  children,
  withRouter = true,
}: StandaloneProviderProps) {
  if (withRouter) {
    return (
      <BrowserRouter>
        <StandaloneProviderInner config={config}>
          {children}
        </StandaloneProviderInner>
      </BrowserRouter>
    );
  }

  return (
    <StandaloneProviderInner config={config}>
      {children}
    </StandaloneProviderInner>
  );
}

