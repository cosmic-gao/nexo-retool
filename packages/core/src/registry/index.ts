export { AppRegistry, getRegistry } from "./app-registry";
export { PermissionManager, getPermissionManager } from "./permission-manager";
export {
  // Dist app loader (for production)
  createDistAppLoader,
  loadAppAssets,
  unloadAssets,
  // Vite app loader (for development)
  createViteAppLoader,
  // Common functions
  registerApp,
  registerAppFromConfig,
  setIconResolver,
  transformManifest,
} from "./app-loader";
