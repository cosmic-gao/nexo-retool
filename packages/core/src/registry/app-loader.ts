import type {
  AppManifest,
  AppManifestConfig,
  AppLoader,
  AppModule,
  RouteConfig,
  MenuItemConfig,
} from "../types/app";
import { getRegistry } from "./app-registry";
import type { ComponentType } from "react";

/**
 * APP 加载器配置
 */
export interface AppLoaderConfig {
  /** 用户 APP Manifest JSON 模块映射 */
  manifests: Record<string, () => Promise<AppManifestConfig>>;
  /** 用户 APP 组件模块映射 */
  components?: Record<string, () => Promise<{ default: ComponentType<any> }>>;
  /** 自动加载所有 APP */
  autoLoad?: boolean;
}

/**
 * 图标名称到组件的映射函数
 */
type IconResolver = (iconName: string) => React.ReactNode;

let iconResolver: IconResolver | null = null;

/**
 * 设置图标解析器
 */
export function setIconResolver(resolver: IconResolver) {
  iconResolver = resolver;
}

/**
 * 解析图标
 */
function resolveIcon(iconName?: string): React.ReactNode {
  if (!iconName) return undefined;
  if (iconResolver) {
    return iconResolver(iconName);
  }
  return undefined;
}

/**
 * 将 Manifest 配置转换为运行时 Manifest
 */
export function transformManifest(
  config: AppManifestConfig,
  componentLoaders?: Record<string, () => Promise<{ default: ComponentType<any> }>>
): AppManifest {
  // 转换菜单图标
  const transformMenus = (menus: MenuItemConfig[]): MenuItemConfig[] => {
    return menus.map((menu) => ({
      ...menu,
      icon: resolveIcon(menu.icon as string) as any,
      children: menu.children ? transformMenus(menu.children) : undefined,
    }));
  };

  // 创建懒加载组件
  const createLazyComponent = (entry?: string): ComponentType<any> => {
    if (!entry || !componentLoaders) {
      // 返回占位组件
      return () => null;
    }

    // 查找匹配的组件加载器
    const loaderKey = Object.keys(componentLoaders).find((key) =>
      key.includes(entry.replace("./", ""))
    );

    if (loaderKey && componentLoaders[loaderKey]) {
      const { lazy } = require("react");
      return lazy(componentLoaders[loaderKey]);
    }

    return () => null;
  };

  // 转换路由
  const routes: RouteConfig[] = (config.routes || []).map((route) => ({
    path: route.path,
    component: createLazyComponent(route.entry),
    meta: route.meta,
    children: route.children?.map((child) => ({
      path: child.path,
      component: createLazyComponent(child.entry),
      meta: child.meta,
    })),
  }));

  return {
    id: config.id,
    name: config.name,
    version: config.version,
    description: config.description,
    icon: resolveIcon(config.icon),
    author: config.author,
    basePath: config.basePath,
    menus: transformMenus(config.menus || []),
    routes,
    permissions: config.permissions,
    tags: config.tags,
    priority: config.priority,
    framework: config.framework,
    _raw: config,
  };
}

/**
 * 创建 APP 加载器
 */
export function createAppLoader(config: AppLoaderConfig) {
  const registry = getRegistry();
  const { manifests, components, autoLoad = true } = config;

  // 注册所有加载器
  const loaders: Record<string, AppLoader> = {};

  Object.entries(manifests).forEach(([path, loader]) => {
    const appId = extractAppId(path);
    loaders[appId] = async () => {
      // JSON 文件直接返回配置对象
      const manifestConfig = await loader();
      return transformManifest(manifestConfig, components);
    };
  });

  registry.registerLoaders(loaders);

  return {
    async loadAll(): Promise<void> {
      await registry.loadAllPending();
    },

    async load(appId: string): Promise<void> {
      await registry.loadAndRegister(appId);
    },

    getAppIds(): string[] {
      return Object.keys(loaders);
    },

    async init(): Promise<void> {
      if (autoLoad) {
        await this.loadAll();
      }
    },
  };
}

/**
 * 从模块路径提取 APP ID
 */
function extractAppId(path: string): string {
  // 处理 nexo.manifest.json 路径
  // "../../../user-apps/todo-app/nexo.manifest.json" -> "todo-app"
  const match = path.match(/user-apps\/([^/]+)\//);
  if (match) {
    return match[1];
  }

  const parts = path.split("/");
  for (let i = parts.length - 2; i >= 0; i--) {
    const part = parts[i];
    if (part && part !== "." && part !== "..") {
      return part;
    }
  }

  return path.replace(/[^a-zA-Z0-9-_]/g, "-");
}

/**
 * 使用 Vite 的 import.meta.glob 创建加载器
 * 支持 JSON 格式的 manifest 文件
 */
export function createViteAppLoader(
  manifests: Record<string, () => Promise<AppManifestConfig>>,
  options?: {
    components?: Record<string, () => Promise<{ default: ComponentType<any> }>>;
    autoLoad?: boolean;
  }
) {
  return createAppLoader({
    manifests,
    components: options?.components,
    autoLoad: options?.autoLoad ?? true,
  });
}

/**
 * 手动注册 APP（直接使用运行时 Manifest）
 */
export async function registerApp(manifest: AppManifest): Promise<void> {
  const registry = getRegistry();
  await registry.register(manifest);
}

/**
 * 从配置注册 APP
 */
export async function registerAppFromConfig(
  config: AppManifestConfig,
  componentLoaders?: Record<string, () => Promise<{ default: ComponentType<any> }>>
): Promise<void> {
  const manifest = transformManifest(config, componentLoaders);
  await registerApp(manifest);
}

/**
 * 批量注册 APP
 */
export async function registerApps(manifests: AppManifest[]): Promise<void> {
  const registry = getRegistry();

  const sorted = [...manifests].sort(
    (a, b) => (a.priority ?? 100) - (b.priority ?? 100)
  );

  for (const manifest of sorted) {
    try {
      await registry.register(manifest);
    } catch (error) {
      console.error(`注册 APP "${manifest.id}" 失败:`, error);
    }
  }
}
