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
 * APP 注册中心 - 管理所有注册的 APP
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

  /**
   * 获取单例实例
   */
  static getInstance(): AppRegistry {
    if (!AppRegistry.instance) {
      AppRegistry.instance = new AppRegistry();
    }
    return AppRegistry.instance;
  }

  /**
   * 配置平台
   */
  configure(config: Partial<PlatformConfig>): void {
    this.platformConfig = { ...this.platformConfig, ...config };
  }

  /**
   * 获取平台配置
   */
  getConfig(): PlatformConfig {
    return { ...this.platformConfig };
  }

  /**
   * 注册 APP 加载器（懒加载）
   */
  registerLoader(appId: string, loader: AppLoader): void {
    this.loaders.set(appId, loader);
    
    // 创建 pending 状态的 APP 占位
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

  /**
   * 批量注册加载器
   */
  registerLoaders(loaders: Record<string, AppLoader>): void {
    Object.entries(loaders).forEach(([appId, loader]) => {
      this.registerLoader(appId, loader);
    });
  }

  /**
   * 注册 APP
   */
  async register(manifest: AppManifest, sourcePath?: string): Promise<void> {
    // 验证清单
    this.validateManifest(manifest);

    // 检查是否已注册
    if (this.apps.has(manifest.id)) {
      const existing = this.apps.get(manifest.id)!;
      if (existing.status === "loaded") {
        console.warn(`APP "${manifest.id}" 已注册，将被覆盖`);
      }
    }

    const registeredApp: RegisteredApp = {
      manifest,
      registeredAt: new Date(),
      active: true,
      status: "loaded",
      sourcePath,
    };

    this.apps.set(manifest.id, registeredApp);

    // 执行 APP 初始化
    if (manifest.setup) {
      try {
        await manifest.setup();
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

  /**
   * 通过加载器加载并注册 APP
   */
  async loadAndRegister(appId: string): Promise<void> {
    const loader = this.loaders.get(appId);
    if (!loader) {
      throw new Error(`未找到 APP "${appId}" 的加载器`);
    }

    // 更新状态为加载中
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

  /**
   * 加载所有待加载的 APP
   */
  async loadAllPending(): Promise<void> {
    const pendingApps = Array.from(this.apps.entries())
      .filter(([_, app]) => app.status === "pending")
      .sort(([_, a], [__, b]) => 
        (a.manifest.priority ?? 100) - (b.manifest.priority ?? 100)
      );

    for (const [appId] of pendingApps) {
      try {
        await this.loadAndRegister(appId);
      } catch (error) {
        console.error(`加载 APP "${appId}" 失败:`, error);
      }
    }
  }

  /**
   * 注销 APP
   */
  async unregister(appId: string): Promise<void> {
    const app = this.apps.get(appId);
    if (!app) {
      console.warn(`APP "${appId}" 未注册`);
      return;
    }

    // 执行 APP 销毁
    if (app.manifest.teardown) {
      await app.manifest.teardown();
    }

    this.apps.delete(appId);
    this.loaders.delete(appId);
    
    this.emit("app:unregistered", { appId });
    this.emit("menu:updated", { menus: this.getAllMenus() });
    this.emit("route:updated", { routes: this.getAllRoutes() });
    this.emit("permission:updated", { permissions: this.getAllPermissions() });
  }

  /**
   * 获取已注册的 APP
   */
  getApp(appId: string): RegisteredApp | undefined {
    return this.apps.get(appId);
  }

  /**
   * 获取所有已注册的 APP
   */
  getAllApps(): RegisteredApp[] {
    return Array.from(this.apps.values());
  }

  /**
   * 获取已加载的 APP
   */
  getLoadedApps(): RegisteredApp[] {
    return Array.from(this.apps.values()).filter(
      (app) => app.status === "loaded"
    );
  }

  /**
   * 获取合并后的所有菜单
   */
  getAllMenus(): MenuItemConfig[] {
    const allMenus: MenuItemConfig[] = [];

    for (const app of this.apps.values()) {
      if (app.active && app.status === "loaded") {
        allMenus.push(...app.manifest.menus);
      }
    }

    // 按 order 排序
    return this.sortMenus(allMenus);
  }

  /**
   * 获取合并后的所有路由
   */
  getAllRoutes(): RouteConfig[] {
    const allRoutes: RouteConfig[] = [];

    for (const app of this.apps.values()) {
      if (app.active && app.status === "loaded") {
        allRoutes.push(...app.manifest.routes);
      }
    }

    return allRoutes;
  }

  /**
   * 获取所有权限声明
   */
  getAllPermissions(): PermissionConfig[] {
    const allPermissions: PermissionConfig[] = [];

    for (const app of this.apps.values()) {
      if (app.status === "loaded" && app.manifest.permissions) {
        allPermissions.push(...app.manifest.permissions);
      }
    }

    return allPermissions;
  }

  /**
   * 设置 APP 状态
   */
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

  /**
   * 激活/停用 APP
   */
  setAppActive(appId: string, active: boolean): void {
    const app = this.apps.get(appId);
    if (app && app.status === "loaded") {
      app.active = active;
      this.emit("app:status-changed", { appId, active });
      this.emit("menu:updated", { menus: this.getAllMenus() });
      this.emit("route:updated", { routes: this.getAllRoutes() });
    }
  }

  /**
   * 订阅事件
   */
  on(event: RegistryEventType, callback: RegistryEventCallback): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);

    // 返回取消订阅函数
    return () => {
      this.listeners.get(event)?.delete(callback);
    };
  }

  /**
   * 触发事件
   */
  private emit(event: RegistryEventType, data: any): void {
    this.listeners.get(event)?.forEach((callback) => {
      try {
        callback(data);
      } catch (error) {
        console.error(`事件处理器错误 [${event}]:`, error);
      }
    });
  }

  /**
   * 验证 APP 清单
   */
  private validateManifest(manifest: AppManifest): void {
    if (!manifest.id) {
      throw new Error("APP 清单缺少 id");
    }
    if (!manifest.name) {
      throw new Error("APP 清单缺少 name");
    }
    if (!manifest.version) {
      throw new Error("APP 清单缺少 version");
    }
    if (!Array.isArray(manifest.menus)) {
      throw new Error("APP 清单缺少 menus 数组");
    }
    if (!Array.isArray(manifest.routes)) {
      throw new Error("APP 清单缺少 routes 数组");
    }

    // 验证菜单 ID 唯一性
    const menuIds = new Set<string>();
    const validateMenuIds = (menus: MenuItemConfig[]) => {
      for (const menu of menus) {
        if (menuIds.has(menu.id)) {
          throw new Error(`菜单 ID "${menu.id}" 重复`);
        }
        menuIds.add(menu.id);
        if (menu.children) {
          validateMenuIds(menu.children);
        }
      }
    };
    validateMenuIds(manifest.menus);
  }

  /**
   * 递归排序菜单
   */
  private sortMenus(menus: MenuItemConfig[]): MenuItemConfig[] {
    return menus
      .map((menu) => ({
        ...menu,
        children: menu.children ? this.sortMenus(menu.children) : undefined,
      }))
      .sort((a, b) => (a.order ?? 100) - (b.order ?? 100));
  }

  /**
   * 重置注册中心（主要用于测试）
   */
  reset(): void {
    this.apps.clear();
    this.loaders.clear();
    this.listeners.clear();
  }
}

/**
 * 获取全局注册中心实例
 */
export const getRegistry = (): AppRegistry => AppRegistry.getInstance();
