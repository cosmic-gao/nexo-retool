import React, { type ComponentType, type ReactNode } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { StandaloneProvider, type StandaloneConfig } from "./StandaloneProvider";
import { StandaloneLayout, type StandaloneLayoutProps } from "./StandaloneLayout";
import type { PageConfig, AppManifestConfig } from "../types/app";

export interface StandaloneAppOptions {
  /** App manifest config (from manifest.json) */
  manifest: AppManifestConfig;
  /** Page components map: { [componentName]: Component } */
  components: Record<string, ComponentType<any>>;
  /** Custom layout props */
  layoutProps?: StandaloneLayoutProps;
  /** User info for sidebar */
  user?: {
    name: string;
    email?: string;
    avatar?: string;
  };
  /** Custom icon resolver */
  iconResolver?: (iconName: string) => ReactNode;
  /** Fallback component for 404 */
  notFoundComponent?: ComponentType;
  /** Loading component */
  loadingComponent?: ComponentType;
  /** Error boundary component */
  errorComponent?: ComponentType<{ error: Error }>;
}

/**
 * Generate routes from page config
 */
function generateRoutes(
  pages: PageConfig[],
  components: Record<string, ComponentType<any>>,
  notFoundComponent?: ComponentType
): ReactNode[] {
  const routes: ReactNode[] = [];

  const processPages = (pageList: PageConfig[], parentPath = "") => {
    for (const page of pageList) {
      const fullPath = parentPath
        ? `${parentPath}${page.path}`.replace(/\/+/g, "/")
        : page.path;

      if (page.component && components[page.component]) {
        const Component = components[page.component];
        routes.push(
          <Route key={page.id} path={fullPath} element={<Component />} />
        );
      }

      if (page.children) {
        processPages(page.children, fullPath);
      }
    }
  };

  processPages(pages);

  // Add catch-all route
  if (notFoundComponent) {
    routes.push(
      <Route key="not-found" path="*" element={React.createElement(notFoundComponent)} />
    );
  } else if (pages.length > 0) {
    // Redirect to first page
    const firstPage = pages[0];
    routes.push(
      <Route
        key="redirect"
        path="*"
        element={<Navigate to={firstPage.path} replace />}
      />
    );
  }

  return routes;
}

/**
 * Create a standalone app with full admin-like experience
 * 
 * @example
 * ```tsx
 * import manifest from '../manifest.json';
 * import { Home, List } from './pages';
 * 
 * const App = createStandaloneApp({
 *   manifest,
 *   components: { Home, List },
 *   user: { name: 'User', email: 'user@example.com' }
 * });
 * 
 * // In main.tsx
 * createRoot(document.getElementById('root')!).render(<App />);
 * ```
 */
export function createStandaloneApp(options: StandaloneAppOptions): ComponentType {
  const {
    manifest,
    components,
    layoutProps,
    user,
    iconResolver,
    notFoundComponent,
  } = options;

  const config: StandaloneConfig = {
    appId: manifest.id,
    appName: manifest.name,
    appIcon: manifest.icon,
    pages: manifest.pages,
    iconResolver,
    user,
  };

  const routes = generateRoutes(manifest.pages || [], components, notFoundComponent);

  function StandaloneApp() {
    return (
      <StandaloneProvider config={config}>
        <Routes>
          <Route element={<StandaloneLayout {...layoutProps} sidebarProps={{ user }} />}>
            {routes}
          </Route>
        </Routes>
      </StandaloneProvider>
    );
  }

  StandaloneApp.displayName = `StandaloneApp(${manifest.name})`;

  return StandaloneApp;
}

/**
 * Higher-order component to wrap existing app with standalone functionality
 */
export function withStandalone<P extends object>(
  WrappedComponent: ComponentType<P>,
  options: Omit<StandaloneAppOptions, "components">
): ComponentType<P> {
  const config: StandaloneConfig = {
    appId: options.manifest.id,
    appName: options.manifest.name,
    appIcon: options.manifest.icon,
    pages: options.manifest.pages,
    iconResolver: options.iconResolver,
    user: options.user,
  };

  function WithStandalone(props: P) {
    return (
      <StandaloneProvider config={config} withRouter={false}>
        <StandaloneLayout {...options.layoutProps} sidebarProps={{ user: options.user }}>
          <WrappedComponent {...props} />
        </StandaloneLayout>
      </StandaloneProvider>
    );
  }

  WithStandalone.displayName = `withStandalone(${
    WrappedComponent.displayName || WrappedComponent.name || "Component"
  })`;

  return WithStandalone;
}

