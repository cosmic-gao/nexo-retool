/**
 * 平台引导程序
 * 
 * 负责初始化平台配置、发现并加载用户 APP
 */

import {
  getRegistry,
  getPermissionManager,
  createViteAppLoader,
  setIconResolver,
  type AppManifestConfig,
} from "@nexo/core";
import type { ComponentType } from "react";
import * as LucideIcons from "lucide-react";
import { createElement } from "react";

// 标记平台环境
window.__NEXO_PLATFORM__ = true;

/**
 * 设置图标解析器
 * 将图标名称（如 "list-todo"）转换为 lucide-react 组件
 */
function setupIconResolver() {
  setIconResolver((iconName: string) => {
    // 将 kebab-case 转换为 PascalCase
    const pascalCase = iconName
      .split("-")
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join("");

    const IconComponent = (LucideIcons as any)[pascalCase];
    if (IconComponent) {
      return createElement(IconComponent, {
        className: "h-4 w-4",
      });
    }
    return null;
  });
}

/**
 * 使用 Vite 的 glob 导入自动发现 user-apps 目录下的所有 APP Manifest (JSON 格式)
 */
const appManifests = import.meta.glob<AppManifestConfig>(
  "../../../user-apps/*/nexo.manifest.json"
);

/**
 * 导入所有 APP 的页面组件（用于懒加载）
 */
const appComponents = import.meta.glob<{ default: ComponentType<any> }>(
  "../../../user-apps/*/src/**/*.tsx"
);

/**
 * 初始化平台
 */
export async function bootstrap() {
  console.log("🚀 Nexo Platform 启动中...");

  // 1. 设置图标解析器
  setupIconResolver();

  // 2. 配置平台
  const registry = getRegistry();
  registry.configure({
    name: "Nexo Platform",
    version: "1.0.0",
    basePath: "/",
    userAppsPath: "/user-apps",
  });

  // 3. 设置默认用户
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

  // 4. 创建 APP 加载器
  console.log(`📦 发现 ${Object.keys(appManifests).length} 个用户 APP`);

  const appLoader = createViteAppLoader(appManifests, {
    components: appComponents,
    autoLoad: false,
  });

  // 5. 加载所有 APP
  try {
    await appLoader.loadAll();
    console.log("✅ 所有用户 APP 加载完成");
  } catch (error) {
    console.error("❌ APP 加载失败:", error);
  }

  // 6. 输出加载结果
  const loadedApps = registry.getLoadedApps();
  console.log(`📊 已加载 ${loadedApps.length} 个 APP:`);
  loadedApps.forEach((app) => {
    console.log(
      `   - ${app.manifest.name} (${app.manifest.id}) v${app.manifest.version}`
    );
  });

  return {
    registry,
    permissionManager,
    appLoader,
  };
}

// 声明全局变量类型
declare global {
  interface Window {
    __NEXO_PLATFORM__?: boolean;
  }
}
