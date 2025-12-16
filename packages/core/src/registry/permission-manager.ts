import type {
  UserInfo,
  PermissionContext,
  MenuItemConfig,
  RouteConfig,
} from "../types/app";

export class PermissionManager {
  private static instance: PermissionManager;
  private currentUser: UserInfo | null = null;
  private listeners: Set<(user: UserInfo | null) => void> = new Set();

  private constructor() {}

  static getInstance(): PermissionManager {
    if (!PermissionManager.instance) {
      PermissionManager.instance = new PermissionManager();
    }
    return PermissionManager.instance;
  }

  setUser(user: UserInfo | null): void {
    this.currentUser = user;
    this.notifyListeners();
  }

  getUser(): UserInfo | null {
    return this.currentUser;
  }

  checkPermission(permission: string): boolean {
    if (!this.currentUser) return false;
    if (this.currentUser.roles.includes("admin")) return true;
    return this.currentUser.permissions.includes(permission);
  }

  checkPermissions(permissions: string[]): boolean {
    if (permissions.length === 0) return true;
    return permissions.every((p) => this.checkPermission(p));
  }

  checkAnyPermission(permissions: string[]): boolean {
    if (permissions.length === 0) return true;
    return permissions.some((p) => this.checkPermission(p));
  }

  filterMenus(menus: MenuItemConfig[]): MenuItemConfig[] {
    return menus
      .filter((menu) => {
        if (!menu.permissions || menu.permissions.length === 0) return true;
        return this.checkPermissions(menu.permissions);
      })
      .map((menu) => ({
        ...menu,
        children: menu.children ? this.filterMenus(menu.children) : undefined,
      }))
      .filter((menu) => {
        if (menu.children && menu.children.length === 0) {
          return false;
        }
        return true;
      });
  }

  filterRoutes(routes: RouteConfig[]): RouteConfig[] {
    return routes.filter((route) => {
      if (!route.meta?.permissions || route.meta.permissions.length === 0) {
        return true;
      }
      return this.checkPermissions(route.meta.permissions);
    });
  }

  getContext(): PermissionContext {
    return {
      user: this.currentUser,
      checkPermission: this.checkPermission.bind(this),
      checkPermissions: this.checkPermissions.bind(this),
    };
  }

  subscribe(callback: (user: UserInfo | null) => void): () => void {
    this.listeners.add(callback);
    return () => {
      this.listeners.delete(callback);
    };
  }

  private notifyListeners(): void {
    this.listeners.forEach((callback) => {
      try {
        callback(this.currentUser);
      } catch (error) {
        console.error("Permission listener error:", error);
      }
    });
  }
}

export const getPermissionManager = (): PermissionManager =>
  PermissionManager.getInstance();
