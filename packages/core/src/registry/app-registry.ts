import type {
  AppManifest,
  AppLoader,
  RegisteredApp,
  MenuItemConfig,
  RouteConfig,
  PlatformConfig,
  AppStatus,
  PermissionConfig,
} from "../types/app";

type RegistryEventType =
  | "app:registered"
  | "app:unregistered"
  | "app:loaded"
  | "app:error"
  | "app:status-changed"
  | "menu:updated"
  | "route:updated"
  | "permission:updated";

type RegistryEventCallback = (data: any) => void;

/**
 * App Registry - Manages all registered apps
 */
export class AppRegistry {
  private static instance: AppRegistry;
  private apps: Map<string, RegisteredApp> = new Map();
  private loaders: Map<string, AppLoader> = new Map();
  private listeners: Map<RegistryEventType, Set<RegistryEventCallback>> =
    new Map();
  private platformConfig: PlatformConfig = {
    name: "Nexo Platform",
    version: "1.0.0",
    userAppsPath: "/user-apps",
  };

  private constructor() {}

  static getInstance(): AppRegistry {
    if (!AppRegistry.instance) {
      AppRegistry.instance = new AppRegistry();
    }
    return AppRegistry.instance;
  }

  configure(config: Partial<PlatformConfig>): void {
    this.platformConfig = { ...this.platformConfig, ...config };
  }

  getConfig(): PlatformConfig {
    return { ...this.platformConfig };
  }

  registerLoader(appId: string, loader: AppLoader): void {
    this.loaders.set(appId, loader);

    if (!this.apps.has(appId)) {
      this.apps.set(appId, {
        manifest: {
          id: appId,
          name: appId,
          version: "0.0.0",
          menus: [],
          routes: [],
        },
        registeredAt: new Date(),
        active: false,
        status: "pending",
      });
    }
  }

  registerLoaders(loaders: Record<string, AppLoader>): void {
    Object.entries(loaders).forEach(([appId, loader]) => {
      this.registerLoader(appId, loader);
    });
  }

  async register(manifest: AppManifest, appPath?: string): Promise<void> {
    this.validateManifest(manifest);

    if (this.apps.has(manifest.id)) {
      const existing = this.apps.get(manifest.id)!;
      if (existing.status === "loaded") {
        console.warn(`App "${manifest.id}" already registered, will be overwritten`);
      }
    }

    const registeredApp: RegisteredApp = {
      manifest,
      registeredAt: new Date(),
      active: true,
      status: "loaded",
      appPath,
    };

    this.apps.set(manifest.id, registeredApp);

    if (manifest.bootstrap) {
      try {
        await manifest.bootstrap();
      } catch (error) {
        registeredApp.status = "error";
        registeredApp.error = error as Error;
        this.emit("app:error", { appId: manifest.id, error });
        throw error;
      }
    }

    this.emit("app:registered", { appId: manifest.id, manifest });
    this.emit("app:status-changed", { appId: manifest.id, status: "loaded" });
    this.emit("menu:updated", { menus: this.getAllMenus() });
    this.emit("route:updated", { routes: this.getAllRoutes() });
    this.emit("permission:updated", { permissions: this.getAllPermissions() });
  }

  async loadAndRegister(appId: string): Promise<void> {
    const loader = this.loaders.get(appId);
    if (!loader) {
      throw new Error(`Loader not found for app "${appId}"`);
    }

    const existingApp = this.apps.get(appId);
    if (existingApp) {
      existingApp.status = "loading";
      this.emit("app:status-changed", { appId, status: "loading" });
    }

    try {
      const module = await loader();
      const manifest = "default" in module ? module.default : module;
      await this.register(manifest);
      this.emit("app:loaded", { appId });
    } catch (error) {
      if (existingApp) {
        existingApp.status = "error";
        existingApp.error = error as Error;
        this.emit("app:status-changed", { appId, status: "error", error });
      }
      this.emit("app:error", { appId, error });
      throw error;
    }
  }

  async loadAllPending(): Promise<void> {
    const pendingApps = Array.from(this.apps.entries())
      .filter(([_, app]) => app.status === "pending")
      .sort(
        ([_, a], [__, b]) =>
          (a.manifest.priority ?? 100) - (b.manifest.priority ?? 100)
      );

    for (const [appId] of pendingApps) {
      try {
        await this.loadAndRegister(appId);
      } catch (error) {
        console.error(`Failed to load app "${appId}":`, error);
      }
    }
  }

  async unregister(appId: string): Promise<void> {
    const app = this.apps.get(appId);
    if (!app) {
      console.warn(`App "${appId}" not registered`);
      return;
    }

    if (app.manifest.unmount && app.container) {
      await app.manifest.unmount(app.container);
    }

    this.apps.delete(appId);
    this.loaders.delete(appId);

    this.emit("app:unregistered", { appId });
    this.emit("menu:updated", { menus: this.getAllMenus() });
    this.emit("route:updated", { routes: this.getAllRoutes() });
    this.emit("permission:updated", { permissions: this.getAllPermissions() });
  }

  getApp(appId: string): RegisteredApp | undefined {
    return this.apps.get(appId);
  }

  getAllApps(): RegisteredApp[] {
    return Array.from(this.apps.values());
  }

  getLoadedApps(): RegisteredApp[] {
    return Array.from(this.apps.values()).filter(
      (app) => app.status === "loaded"
    );
  }

  getAllMenus(): MenuItemConfig[] {
    const allMenus: MenuItemConfig[] = [];

    for (const app of this.apps.values()) {
      if (app.active && app.status === "loaded") {
        allMenus.push(...app.manifest.menus);
      }
    }

    return this.sortMenus(allMenus);
  }

  getAllRoutes(): RouteConfig[] {
    const allRoutes: RouteConfig[] = [];

    for (const app of this.apps.values()) {
      if (app.active && app.status === "loaded") {
        allRoutes.push(...app.manifest.routes);
      }
    }

    return allRoutes;
  }

  getAllPermissions(): PermissionConfig[] {
    const allPermissions: PermissionConfig[] = [];

    for (const app of this.apps.values()) {
      if (app.status === "loaded" && app.manifest.permissions) {
        allPermissions.push(...app.manifest.permissions);
      }
    }

    return allPermissions;
  }

  setAppStatus(appId: string, status: AppStatus): void {
    const app = this.apps.get(appId);
    if (app) {
      app.status = status;
      app.active = status === "loaded";
      this.emit("app:status-changed", { appId, status });
      this.emit("menu:updated", { menus: this.getAllMenus() });
      this.emit("route:updated", { routes: this.getAllRoutes() });
    }
  }

  setAppActive(appId: string, active: boolean): void {
    const app = this.apps.get(appId);
    if (app && app.status === "loaded") {
      app.active = active;
      this.emit("app:status-changed", { appId, active });
      this.emit("menu:updated", { menus: this.getAllMenus() });
      this.emit("route:updated", { routes: this.getAllRoutes() });
    }
  }

  on(event: RegistryEventType, callback: RegistryEventCallback): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);

    return () => {
      this.listeners.get(event)?.delete(callback);
    };
  }

  private emit(event: RegistryEventType, data: any): void {
    this.listeners.get(event)?.forEach((callback) => {
      try {
        callback(data);
      } catch (error) {
        console.error(`Event handler error [${event}]:`, error);
      }
    });
  }

  private validateManifest(manifest: AppManifest): void {
    if (!manifest.id) {
      throw new Error("App manifest missing id");
    }
    if (!manifest.name) {
      throw new Error("App manifest missing name");
    }
    if (!manifest.version) {
      throw new Error("App manifest missing version");
    }
    if (!Array.isArray(manifest.menus)) {
      throw new Error("App manifest missing menus array");
    }
    if (!Array.isArray(manifest.routes)) {
      throw new Error("App manifest missing routes array");
    }

    const menuIds = new Set<string>();
    const validateMenuIds = (menus: MenuItemConfig[]) => {
      for (const menu of menus) {
        if (menuIds.has(menu.id)) {
          throw new Error(`Duplicate menu ID "${menu.id}"`);
        }
        menuIds.add(menu.id);
        if (menu.children) {
          validateMenuIds(menu.children);
        }
      }
    };
    validateMenuIds(manifest.menus);
  }

  private sortMenus(menus: MenuItemConfig[]): MenuItemConfig[] {
    return menus
      .map((menu) => ({
        ...menu,
        children: menu.children ? this.sortMenus(menu.children) : undefined,
      }))
      .sort((a, b) => (a.order ?? 100) - (b.order ?? 100));
  }

  reset(): void {
    this.apps.clear();
    this.loaders.clear();
    this.listeners.clear();
  }
}

export const getRegistry = (): AppRegistry => AppRegistry.getInstance();
