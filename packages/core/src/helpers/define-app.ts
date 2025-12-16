import type { AppManifest } from "../types/app";

export function defineApp(manifest: AppManifest): AppManifest {
  return {
    ...manifest,
    menus: manifest.menus ?? [],
    routes: manifest.routes ?? [],
  };
}

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
    bootstrap(fn: AppManifest["bootstrap"]) {
      manifest.bootstrap = fn;
      return builder;
    },
    mount(fn: AppManifest["mount"]) {
      manifest.mount = fn;
      return builder;
    },
    unmount(fn: AppManifest["unmount"]) {
      manifest.unmount = fn;
      return builder;
    },
    tags(tags: string[]) {
      manifest.tags = tags;
      return builder;
    },
    build(): AppManifest {
      if (!manifest.name) {
        throw new Error("App name is required");
      }
      return manifest as AppManifest;
    },
  };

  return builder;
}
