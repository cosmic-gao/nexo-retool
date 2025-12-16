import { useState, useEffect, useCallback } from "react";
import { getRegistry } from "../registry/app-registry";
import { getPermissionManager } from "../registry/permission-manager";
import type {
  RegisteredApp,
  MenuItemConfig,
  RouteConfig,
  UserInfo,
} from "../types/app";

export function useRegistry() {
  const registry = getRegistry();
  const permissionManager = getPermissionManager();

  const [apps, setApps] = useState<RegisteredApp[]>(() =>
    registry.getAllApps()
  );
  const [menus, setMenus] = useState<MenuItemConfig[]>(() =>
    permissionManager.filterMenus(registry.getAllMenus())
  );
  const [routes, setRoutes] = useState<RouteConfig[]>(() =>
    permissionManager.filterRoutes(registry.getAllRoutes())
  );

  useEffect(() => {
    const updateMenusAndRoutes = () => {
      setMenus(permissionManager.filterMenus(registry.getAllMenus()));
      setRoutes(permissionManager.filterRoutes(registry.getAllRoutes()));
    };

    const unsubscribeApp = registry.on("app:registered", () => {
      setApps(registry.getAllApps());
    });

    const unsubscribeUnregister = registry.on("app:unregistered", () => {
      setApps(registry.getAllApps());
    });

    const unsubscribeStatus = registry.on("app:status-changed", () => {
      setApps(registry.getAllApps());
    });

    const unsubscribeMenu = registry.on("menu:updated", () => {
      updateMenusAndRoutes();
    });

    const unsubscribeRoute = registry.on("route:updated", () => {
      updateMenusAndRoutes();
    });

    const unsubscribeUser = permissionManager.subscribe(() => {
      updateMenusAndRoutes();
    });

    return () => {
      unsubscribeApp();
      unsubscribeUnregister();
      unsubscribeStatus();
      unsubscribeMenu();
      unsubscribeRoute();
      unsubscribeUser();
    };
  }, [registry, permissionManager]);

  const registerApp = useCallback(
    async (manifest: Parameters<typeof registry.register>[0]) => {
      await registry.register(manifest);
    },
    [registry]
  );

  const unregisterApp = useCallback(
    async (appId: string) => {
      await registry.unregister(appId);
    },
    [registry]
  );

  const toggleApp = useCallback(
    (appId: string, active: boolean) => {
      registry.setAppActive(appId, active);
      setApps(registry.getAllApps());
    },
    [registry]
  );

  const loadApp = useCallback(
    async (appId: string) => {
      await registry.loadAndRegister(appId);
    },
    [registry]
  );

  return {
    apps,
    menus,
    routes,
    registerApp,
    unregisterApp,
    toggleApp,
    loadApp,
    config: registry.getConfig(),
  };
}

export function useMenus(): MenuItemConfig[] {
  const { menus } = useRegistry();
  return menus;
}

export function useRoutes(): RouteConfig[] {
  const { routes } = useRegistry();
  return routes;
}

export function usePermission() {
  const permissionManager = getPermissionManager();
  const [user, setUser] = useState<UserInfo | null>(permissionManager.getUser());

  useEffect(() => {
    const unsubscribe = permissionManager.subscribe((newUser) => {
      setUser(newUser);
    });
    return unsubscribe;
  }, [permissionManager]);

  const checkPermission = useCallback(
    (permission: string) => permissionManager.checkPermission(permission),
    [permissionManager]
  );

  const checkPermissions = useCallback(
    (permissions: string[]) => permissionManager.checkPermissions(permissions),
    [permissionManager]
  );

  const setCurrentUser = useCallback(
    (newUser: UserInfo | null) => permissionManager.setUser(newUser),
    [permissionManager]
  );

  return {
    user,
    checkPermission,
    checkPermissions,
    setUser: setCurrentUser,
    isAuthenticated: !!user,
    isAdmin: user?.roles.includes("admin") ?? false,
  };
}
