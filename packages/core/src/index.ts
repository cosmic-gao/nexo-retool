// Types
export type {
  AppManifest,
  AppManifestConfig,
  PageConfig,
  MenuItemConfig,
  RouteConfig,
  RegisteredApp,
  AppLoader,
  AppModule,
  AppStatus,
  AppAssets,
  PlatformConfig,
  PermissionConfig,
  UserInfo,
  PermissionContext,
  StandaloneOptions,
} from "./types/app";

// Registry
export {
  AppRegistry,
  getRegistry,
  PermissionManager,
  getPermissionManager,
  // Dist app loader (for production - loading compiled apps)
  createDistAppLoader,
  loadAppAssets,
  unloadAssets,
  // Vite app loader (for development - loading source files)
  createViteAppLoader,
  // Common functions
  registerApp,
  registerAppFromConfig,
  setIconResolver,
  transformManifest,
} from "./registry";

// Hooks
export {
  useRegistry,
  useMenus,
  useRoutes,
  usePermission,
} from "./hooks/use-registry";

// Helpers
export { defineApp, createAppBuilder } from "./helpers/define-app";

// Standalone - Full admin-like experience for user apps
export {
  StandaloneProvider,
  StandaloneSidebar,
  StandaloneLayout,
  createStandaloneApp,
  withStandalone,
  useStandalone,
  useStandaloneSafe,
  type StandaloneConfig,
  type StandaloneAppOptions,
} from "./standalone";
