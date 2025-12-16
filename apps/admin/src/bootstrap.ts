import { getRegistry, getPermissionManager, setIconResolver, type MenuItemConfig } from "@nexo/core";
import * as LucideIcons from "lucide-react";
import { createElement } from "react";
import { setupApp } from "wujie";

window.__NEXO_PLATFORM__ = true;

setupApp({ name: "default" });

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:3001";

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
  version?: string;
  icon?: string;
  description?: string;
  basePath: string;
  framework?: string;
  hasBackend?: boolean;
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

async function fetchPlatformConfig(): Promise<PlatformConfig> {
  const response = await fetch(`${API_BASE}/api/platform/config`);
  if (!response.ok) {
    throw new Error(`Failed to fetch platform config: ${response.statusText}`);
  }
  const result = await response.json();
  return result.data;
}

function isEmoji(str: string): boolean {
  return /\p{Emoji}/u.test(str) && str.length <= 4;
}

function transformMenus(menus: ServerMenuConfig[]): MenuItemConfig[] {
  return menus.map((menu) => ({
    id: menu.id,
    label: menu.label,
    path: menu.path,
    icon: menu.icon ? (isEmoji(menu.icon) ? menu.icon : createIconElement(menu.icon)) : undefined,
    order: menu.order,
    badge: menu.badge,
    permissions: menu.permissions,
    external: menu.external,
    target: menu.target,
    children: menu.children ? transformMenus(menu.children) : undefined,
  }));
}

export async function bootstrap() {
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
    const config = await fetchPlatformConfig();

    for (const module of config.modules) {
      const moduleMenu = config.menus.find((m) => m.id === module.id);
      await registry.register({
        id: module.id,
        name: module.name,
        version: module.version,
        description: module.description,
        icon: module.icon,
        basePath: module.basePath,
        menus: moduleMenu ? transformMenus([moduleMenu]) : [],
        routes: [],
      });
    }
  } catch (error) {
    console.error("Failed to load platform config:", error);
  }

  return { registry, permissionManager };
}

declare global {
  interface Window {
    __NEXO_PLATFORM__?: boolean;
  }
}
