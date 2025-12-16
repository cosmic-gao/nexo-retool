import {
  getRegistry,
  getPermissionManager,
  setIconResolver,
  type MenuItemConfig,
} from "@nexo/core";
import * as LucideIcons from "lucide-react";
import { createElement } from "react";
import { setupApp } from "wujie";

window.__NEXO_PLATFORM__ = true;

// Configure wujie default settings
setupApp({
  name: "default",
  // Allow all origins for development
  // In production, restrict to specific origins
});

// API base URL
const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:3001";

/**
 * Convert icon name to React element
 */
function createIconElement(iconName: string) {
  const pascalCase = iconName
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");

  const IconComponent = (LucideIcons as any)[pascalCase];
  if (IconComponent) {
    return createElement(IconComponent, { className: "h-4 w-4" });
  }
  return undefined;
}

function setupIconResolver() {
  setIconResolver((iconName: string) => createIconElement(iconName));
}

interface ModuleInfo {
  id: string;
  name: string;
  version: string;
  basePath: string;
  hasDistFiles: boolean;
}

interface ServerMenuConfig {
  id: string;
  label: string;
  icon?: string;
  path: string;
  order?: number;
  badge?: string | number;
  permissions?: string[];
  external?: boolean;
  target?: "_blank" | "_self";
  children?: ServerMenuConfig[];
}

interface PlatformConfig {
  modules: ModuleInfo[];
  menus: ServerMenuConfig[];
}

/**
 * Fetch platform configuration from server
 */
async function fetchPlatformConfig(): Promise<PlatformConfig> {
  const response = await fetch(`${API_BASE}/api/platform/config`);
  if (!response.ok) {
    throw new Error(`Failed to fetch platform config: ${response.statusText}`);
  }
  const result = await response.json();
  return result.data;
}

/**
 * Transform server menus to client menus with icon elements
 */
function transformMenus(menus: ServerMenuConfig[]): MenuItemConfig[] {
  return menus.map((menu) => ({
    id: menu.id,
    label: menu.label,
    path: menu.path,
    icon: menu.icon ? createIconElement(menu.icon) : undefined,
    order: menu.order,
    badge: menu.badge,
    permissions: menu.permissions,
    external: menu.external,
    target: menu.target,
    children: menu.children ? transformMenus(menu.children) : undefined,
  }));
}

export async function bootstrap() {
  console.log("🚀 Nexo Platform starting...");

  setupIconResolver();

  const registry = getRegistry();
  registry.configure({
    name: "Nexo Platform",
    version: "1.0.0",
    basePath: "/",
    userAppsPath: "/modules",
  });

  const permissionManager = getPermissionManager();
  permissionManager.setUser({
    id: "1",
    name: "Admin User",
    avatar: "https://github.com/shadcn.png",
    permissions: [
      "todo:read",
      "todo:write",
      "todo:admin",
      "analytics:view",
      "analytics:export",
      "analytics:realtime",
      "settings:profile",
      "settings:security",
    ],
    roles: ["admin"],
  });

  try {
    // Fetch platform configuration from server
    console.log("📡 Fetching platform config from server...");
    const config = await fetchPlatformConfig();

    console.log(`📦 Found ${config.modules.length} modules`);

    // Register each module (menus only, views are loaded via wujie)
    for (const module of config.modules) {
      // Get menus for this module
      const moduleMenus = config.menus.filter((m) =>
        m.path.startsWith(module.basePath)
      );

      // Register the module with menus (no routes needed, wujie handles views)
      await registry.register({
        id: module.id,
        name: module.name,
        version: module.version,
        basePath: module.basePath,
        menus: transformMenus(moduleMenus),
        routes: [], // Routes handled by wujie
      });

      console.log(`  ✅ ${module.name} (${module.id}) - ${moduleMenus.length} menus`);
    }

    const loadedApps = registry.getLoadedApps();
    console.log(`\n✅ Registered ${loadedApps.length} modules`);
  } catch (error) {
    console.error("❌ Failed to load platform config:", error);
  }

  return {
    registry,
    permissionManager,
  };
}

declare global {
  interface Window {
    __NEXO_PLATFORM__?: boolean;
  }
}
