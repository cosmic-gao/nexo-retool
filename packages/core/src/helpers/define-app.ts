import type { AppManifest } from "../types/app";

/**
 * 定义 APP 的辅助函数
 * 提供类型提示和默认值
 */
export function defineApp(manifest: AppManifest): AppManifest {
  return {
    ...manifest,
    menus: manifest.menus ?? [],
    routes: manifest.routes ?? [],
  };
}

/**
 * 创建 APP 构建器
 * 链式调用方式定义 APP
 */
export function createAppBuilder(id: string) {
  const manifest: Partial<AppManifest> = {
    id,
    menus: [],
    routes: [],
  };

  const builder = {
    name(name: string) {
      manifest.name = name;
      return builder;
    },
    version(version: string) {
      manifest.version = version;
      return builder;
    },
    description(description: string) {
      manifest.description = description;
      return builder;
    },
    author(author: string) {
      manifest.author = author;
      return builder;
    },
    icon(icon: AppManifest["icon"]) {
      manifest.icon = icon;
      return builder;
    },
    menu(menu: AppManifest["menus"][0]) {
      manifest.menus!.push(menu);
      return builder;
    },
    menus(menus: AppManifest["menus"]) {
      manifest.menus = menus;
      return builder;
    },
    route(route: AppManifest["routes"][0]) {
      manifest.routes!.push(route);
      return builder;
    },
    routes(routes: AppManifest["routes"]) {
      manifest.routes = routes;
      return builder;
    },
    setup(fn: AppManifest["setup"]) {
      manifest.setup = fn;
      return builder;
    },
    teardown(fn: AppManifest["teardown"]) {
      manifest.teardown = fn;
      return builder;
    },
    tags(tags: string[]) {
      manifest.tags = tags;
      return builder;
    },
    build(): AppManifest {
      if (!manifest.name) {
        throw new Error("APP name is required");
      }
      if (!manifest.version) {
        throw new Error("APP version is required");
      }
      return manifest as AppManifest;
    },
  };

  return builder;
}

