import type { ComponentType, ReactNode } from "react";

/**
 * 菜单项配置
 */
export interface MenuItemConfig {
  /** 菜单唯一标识 */
  id: string;
  /** 菜单显示名称 */
  label: string;
  /** 菜单图标名称 (lucide-react 图标名) */
  icon?: string;
  /** 菜单路径 */
  path: string;
  /** 子菜单 */
  children?: MenuItemConfig[];
  /** 菜单排序权重，数字越小越靠前 */
  order?: number;
  /** 是否隐藏 */
  hidden?: boolean;
  /** 菜单徽章 */
  badge?: string | number;
  /** 所需权限 */
  permissions?: string[];
  /** 外部链接 */
  external?: boolean;
  /** 在新窗口打开 */
  target?: "_blank" | "_self";
}

/**
 * 路由配置（用于 Manifest）
 */
export interface RouteManifestConfig {
  /** 路由路径 */
  path: string;
  /** 路由入口文件（相对于 APP 根目录）*/
  entry?: string;
  /** 路由元信息 */
  meta?: {
    title?: string;
    description?: string;
    permissions?: string[];
  };
  /** 子路由 */
  children?: RouteManifestConfig[];
}

/**
 * 运行时路由配置
 */
export interface RouteConfig {
  /** 路由路径 */
  path: string;
  /** 路由组件 */
  component: ComponentType<any>;
  /** 路由布局 */
  layout?: ComponentType<{ children: ReactNode }>;
  /** 路由元信息 */
  meta?: {
    title?: string;
    description?: string;
    permissions?: string[];
  };
  /** 子路由 */
  children?: RouteConfig[];
}

/**
 * 权限配置
 */
export interface PermissionConfig {
  /** 权限标识 */
  id: string;
  /** 权限名称 */
  name: string;
  /** 权限描述 */
  description?: string;
}

/**
 * APP 资源配置
 */
export interface AppAssets {
  /** 入口 JS 文件 */
  js?: string[];
  /** CSS 文件 */
  css?: string[];
}

/**
 * APP Manifest 配置文件
 * 用户 APP 通过此配置声明需要注册到平台的内容
 */
export interface AppManifestConfig {
  /** APP 唯一标识 */
  id: string;
  /** APP 名称 */
  name: string;
  /** APP 版本 */
  version: string;
  /** APP 描述 */
  description?: string;
  /** APP 图标 (lucide-react 图标名 或 URL) */
  icon?: string;
  /** APP 作者 */
  author?: string;
  /** APP 主页 */
  homepage?: string;
  /** APP 基础路径 */
  basePath: string;
  /** APP 入口文件 */
  entry?: string;
  /** APP 资源文件 */
  assets?: AppAssets;
  /** 菜单配置 */
  menus?: MenuItemConfig[];
  /** 路由配置 */
  routes?: RouteManifestConfig[];
  /** 权限声明 */
  permissions?: PermissionConfig[];
  /** APP 标签 */
  tags?: string[];
  /** APP 优先级 */
  priority?: number;
  /** 框架类型 */
  framework?: "react" | "vue" | "vanilla";
  /** 是否启用沙箱隔离 */
  sandbox?: boolean;
  /** 生命周期钩子 */
  lifecycle?: {
    mount?: string;
    unmount?: string;
    bootstrap?: string;
  };
}

/**
 * 运行时 APP 清单
 */
export interface AppManifest {
  /** APP 唯一标识 */
  id: string;
  /** APP 名称 */
  name: string;
  /** APP 版本 */
  version: string;
  /** APP 描述 */
  description?: string;
  /** APP 图标 */
  icon?: ReactNode;
  /** APP 作者 */
  author?: string;
  /** APP 基础路径 */
  basePath: string;
  /** 菜单配置 */
  menus: MenuItemConfig[];
  /** 路由配置 */
  routes: RouteConfig[];
  /** 权限声明 */
  permissions?: PermissionConfig[];
  /** APP 标签 */
  tags?: string[];
  /** APP 优先级 */
  priority?: number;
  /** 框架类型 */
  framework?: "react" | "vue" | "vanilla";
  /** APP 初始化函数 */
  setup?: () => Promise<void> | void;
  /** APP 销毁函数 */
  teardown?: () => Promise<void> | void;
  /** 原始配置 */
  _raw?: AppManifestConfig;
}

/**
 * APP 加载状态
 */
export type AppStatus = "pending" | "loading" | "loaded" | "error" | "disabled";

/**
 * 已注册的 APP 信息
 */
export interface RegisteredApp {
  /** APP 清单 */
  manifest: AppManifest;
  /** 注册时间 */
  registeredAt: Date;
  /** 是否已激活 */
  active: boolean;
  /** 加载状态 */
  status: AppStatus;
  /** 错误信息 */
  error?: Error;
  /** APP 来源路径 */
  sourcePath?: string;
  /** APP 容器元素 */
  container?: HTMLElement;
}

/**
 * APP 加载器
 */
export type AppLoader = () => Promise<{ default: AppManifest | AppManifestConfig } | AppManifest | AppManifestConfig>;

/**
 * APP 模块定义
 */
export interface AppModule {
  default: AppManifest | AppManifestConfig;
}

/**
 * 平台配置
 */
export interface PlatformConfig {
  /** 平台名称 */
  name: string;
  /** 平台版本 */
  version: string;
  /** 基础路径 */
  basePath?: string;
  /** 用户 APP 目录路径 */
  userAppsPath?: string;
  /** 远程 APP 注册表 URL */
  remoteRegistry?: string;
  /** 默认布局 */
  defaultLayout?: ComponentType<{ children: ReactNode }>;
  /** 错误边界组件 */
  errorBoundary?: ComponentType<{ error: Error; children?: ReactNode }>;
}

/**
 * 用户信息
 */
export interface UserInfo {
  id: string;
  name: string;
  avatar?: string;
  permissions: string[];
  roles: string[];
}

/**
 * 权限检查上下文
 */
export interface PermissionContext {
  user: UserInfo | null;
  checkPermission: (permission: string) => boolean;
  checkPermissions: (permissions: string[]) => boolean;
}
