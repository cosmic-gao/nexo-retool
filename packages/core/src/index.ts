// Types
export type {
  AppManifest,
  AppManifestConfig,
  MenuItemConfig,
  RouteConfig,
  RouteManifestConfig,
  RegisteredApp,
  AppLoader,
  AppModule,
  AppStatus,
  AppAssets,
  PlatformConfig,
  PermissionConfig,
  UserInfo,
  PermissionContext,
} from "./types/app";

// Registry
export {
  AppRegistry,
  getRegistry,
  PermissionManager,
  getPermissionManager,
  createAppLoader,
  createViteAppLoader,
  registerApp,
  registerAppFromConfig,
  registerApps,
  setIconResolver,
  transformManifest,
  type AppLoaderConfig,
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
