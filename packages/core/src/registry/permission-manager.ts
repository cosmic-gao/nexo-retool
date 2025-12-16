import type { UserInfo, PermissionContext, MenuItemConfig, RouteConfig } from "../types/app";

/**
 * 权限管理器
 */
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

  /**
   * 设置当前用户
   */
  setUser(user: UserInfo | null): void {
    this.currentUser = user;
    this.notifyListeners();
  }

  /**
   * 获取当前用户
   */
  getUser(): UserInfo | null {
    return this.currentUser;
  }

  /**
   * 检查单个权限
   */
  checkPermission(permission: string): boolean {
    if (!this.currentUser) return false;
    
    // 超级管理员拥有所有权限
    if (this.currentUser.roles.includes("admin")) return true;
    
    return this.currentUser.permissions.includes(permission);
  }

  /**
   * 检查多个权限（全部满足）
   */
  checkPermissions(permissions: string[]): boolean {
    if (permissions.length === 0) return true;
    return permissions.every((p) => this.checkPermission(p));
  }

  /**
   * 检查多个权限（满足其一）
   */
  checkAnyPermission(permissions: string[]): boolean {
    if (permissions.length === 0) return true;
    return permissions.some((p) => this.checkPermission(p));
  }

  /**
   * 过滤有权限的菜单
   */
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
        // 如果有子菜单但全部被过滤掉了，也隐藏父菜单
        if (menu.children && menu.children.length === 0) {
          return false;
        }
        return true;
      });
  }

  /**
   * 过滤有权限的路由
   */
  filterRoutes(routes: RouteConfig[]): RouteConfig[] {
    return routes.filter((route) => {
      if (!route.meta?.permissions || route.meta.permissions.length === 0) {
        return true;
      }
      return this.checkPermissions(route.meta.permissions);
    });
  }

  /**
   * 获取权限上下文
   */
  getContext(): PermissionContext {
    return {
      user: this.currentUser,
      checkPermission: this.checkPermission.bind(this),
      checkPermissions: this.checkPermissions.bind(this),
    };
  }

  /**
   * 订阅用户变化
   */
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
        console.error("权限监听器错误:", error);
      }
    });
  }
}

export const getPermissionManager = (): PermissionManager =>
  PermissionManager.getInstance();

