import type { ComponentType, ReactNode } from "react";

/**
 * Page config - combines menu and route into one
 * Each page defines both its menu entry and route
 */
export interface PageConfig {
  /** Unique page identifier */
  id: string;
  /** Display label in menu */
  label: string;
  /** Route path */
  path: string;
  /** Icon name from lucide-react */
  icon?: string;
  /** Component name exported from the app bundle */
  component?: string;
  /** Child pages (for nested menus and routes) */
  children?: PageConfig[];
  /** Sort order (lower = higher) */
  order?: number;
  /** Hide from menu but keep route accessible */
  hidden?: boolean;
  /** Badge text or number */
  badge?: string | number;
  /** Required permissions */
  permissions?: string[];
  /** Page title (for document title) */
  title?: string;
  /** Page description */
  description?: string;
  /** External link */
  external?: boolean;
  /** Link target */
  target?: "_blank" | "_self";
}

/**
 * Menu item config - derived from PageConfig for internal use
 */
export interface MenuItemConfig {
  id: string;
  label: string;
  icon?: string | ReactNode;
  path: string;
  children?: MenuItemConfig[];
  order?: number;
  hidden?: boolean;
  badge?: string | number;
  permissions?: string[];
  external?: boolean;
  target?: "_blank" | "_self";
}

/**
 * Route config - runtime route with component
 */
export interface RouteConfig {
  path: string;
  component: ComponentType<any>;
  layout?: ComponentType<{ children: ReactNode }>;
  meta?: {
    title?: string;
    description?: string;
    permissions?: string[];
  };
  children?: RouteConfig[];
}

export interface PermissionConfig {
  id: string;
  name: string;
  description?: string;
}

/**
 * New permission format for manifest.json
 */
export interface AppPermissions {
  /** Key-value storage access */
  kv?: boolean;
  /** MSPBots API access */
  mspbots?: string[];
  /** HTTP endpoints access */
  http?: string[];
}

/**
 * Standalone mode configuration
 * When enabled, the app can run independently with full admin-like features
 */
export interface StandaloneOptions {
  /** Enable standalone mode */
  enabled: boolean;
  /** Platform name shown in sidebar header */
  platformName?: string;
  /** Default sidebar state */
  defaultSidebarOpen?: boolean;
  /** Show breadcrumb navigation */
  showBreadcrumb?: boolean;
  /** Custom theme (reserved for future use) */
  theme?: "light" | "dark" | "system";
}

export interface AppAssets {
  /** JS files to load (relative to app directory) */
  js: string[];
  /** CSS files to load (relative to app directory) */
  css?: string[];
}

/**
 * App Manifest Config - JSON format stored in manifest.json
 * This is what user apps provide after compilation
 */
export interface AppManifestConfig {
  id: string;
  name: string;
  version?: string;
  description?: string;
  icon?: string;
  author?: string;
  homepage?: string;

  /** Entry HTML file (new format) */
  entry?: string;

  /** Base path for all app routes */
  basePath?: string;

  /** Whether the app has backend services */
  hasBackend?: boolean;

  /** Compiled assets to load (legacy format) */
  assets?: AppAssets;

  /** Pages - combines menus and routes into one unified structure */
  pages?: PageConfig[];

  /** Permissions (new format: { kv, mspbots, http }) */
  permissions?: AppPermissions | PermissionConfig[];

  tags?: string[];
  priority?: number;

  /** Framework used (for potential sandboxing) */
  framework?: "react" | "vue" | "vanilla";

  /** Whether to run in sandbox/iframe */
  sandbox?: boolean;

  /** Global variable name that app exports to */
  library?: string;

  /** Lifecycle hooks (function names exported by the app) */
  lifecycle?: {
    bootstrap?: string;
    mount?: string;
    unmount?: string;
  };

  /**
   * Standalone mode configuration
   * When enabled, the app can run independently with full admin-like features
   * including sidebar, layout, routing, and menu system
   */
  standalone?: StandaloneOptions;
}

/**
 * Runtime App Manifest - After loading and processing
 */
export interface AppManifest {
  id: string;
  name: string;
  version?: string;
  description?: string;
  icon?: ReactNode;
  author?: string;
  basePath?: string;
  entry?: string;
  hasBackend?: boolean;
  menus: MenuItemConfig[];
  routes: RouteConfig[];
  permissions?: AppPermissions | PermissionConfig[];
  tags?: string[];
  priority?: number;
  framework?: "react" | "vue" | "vanilla";

  /** Lifecycle functions */
  bootstrap?: () => Promise<void> | void;
  mount?: (container: HTMLElement) => Promise<void> | void;
  unmount?: (container: HTMLElement) => Promise<void> | void;

  /** Reference to loaded module */
  module?: any;

  /** Original config */
  _raw?: AppManifestConfig;
}

export type AppStatus = "pending" | "loading" | "loaded" | "error" | "disabled";

export interface RegisteredApp {
  manifest: AppManifest;
  registeredAt: Date;
  active: boolean;
  status: AppStatus;
  error?: Error;
  /** Path to the app directory */
  appPath?: string;
  /** Container element for mounted app */
  container?: HTMLElement;
  /** Loaded assets */
  loadedAssets?: {
    scripts: HTMLScriptElement[];
    styles: HTMLLinkElement[];
  };
}

export type AppLoader = () => Promise<
  { default: AppManifest | AppManifestConfig } | AppManifest | AppManifestConfig
>;

export interface AppModule {
  default: AppManifest | AppManifestConfig;
}

export interface PlatformConfig {
  name: string;
  version: string;
  basePath?: string;
  /** Base URL for user apps (e.g., "/user-apps" or "https://cdn.example.com/apps") */
  userAppsPath?: string;
  remoteRegistry?: string;
  defaultLayout?: ComponentType<{ children: ReactNode }>;
  errorBoundary?: ComponentType<{ error: Error; children?: ReactNode }>;
}

export interface UserInfo {
  id: string;
  name: string;
  avatar?: string;
  permissions: string[];
  roles: string[];
}

export interface PermissionContext {
  user: UserInfo | null;
  checkPermission: (permission: string) => boolean;
  checkPermissions: (permissions: string[]) => boolean;
}
