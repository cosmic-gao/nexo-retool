import type {
  AppManifest,
  AppManifestConfig,
  RouteConfig,
  MenuItemConfig,
  RegisteredApp,
  PageConfig,
} from "../types/app";
import { getRegistry } from "./app-registry";
import type { ComponentType } from "react";
import { createElement } from "react";

type IconResolver = (iconName: string) => React.ReactNode;

let iconResolver: IconResolver | null = null;

export function setIconResolver(resolver: IconResolver) {
  iconResolver = resolver;
}

function resolveIcon(iconName?: string): React.ReactNode {
  if (!iconName) return undefined;
  if (iconResolver) {
    return iconResolver(iconName);
  }
  return undefined;
}

/**
 * Load a script dynamically
 */
function loadScript(src: string): Promise<HTMLScriptElement> {
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.onload = () => resolve(script);
    script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
    document.head.appendChild(script);
  });
}

/**
 * Load a stylesheet dynamically
 */
function loadStylesheet(href: string): Promise<HTMLLinkElement> {
  return new Promise((resolve, reject) => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = href;
    link.onload = () => resolve(link);
    link.onerror = () => reject(new Error(`Failed to load stylesheet: ${href}`));
    document.head.appendChild(link);
  });
}

/**
 * Unload assets (scripts and stylesheets)
 */
export function unloadAssets(app: RegisteredApp): void {
  if (app.loadedAssets) {
    app.loadedAssets.scripts.forEach((script) => script.remove());
    app.loadedAssets.styles.forEach((link) => link.remove());
    app.loadedAssets = undefined;
  }
}

/**
 * Load app assets (JS and CSS files)
 */
export async function loadAppAssets(
  config: AppManifestConfig,
  appBasePath: string
): Promise<{
  scripts: HTMLScriptElement[];
  styles: HTMLLinkElement[];
  module?: any;
}> {
  const scripts: HTMLScriptElement[] = [];
  const styles: HTMLLinkElement[] = [];

  // Load CSS files first
  if (config.assets?.css) {
    for (const cssPath of config.assets.css) {
      const fullPath = `${appBasePath}/${cssPath}`.replace(/\/+/g, "/");
      try {
        const link = await loadStylesheet(fullPath);
        styles.push(link);
      } catch (error) {
        console.warn(`Failed to load CSS: ${fullPath}`, error);
      }
    }
  }

  // Load JS files
  let module: any = undefined;
  if (config.assets?.js) {
    for (const jsPath of config.assets.js) {
      const fullPath = `${appBasePath}/${jsPath}`.replace(/\/+/g, "/");
      try {
        const script = await loadScript(fullPath);
        scripts.push(script);
      } catch (error) {
        console.error(`Failed to load JS: ${fullPath}`, error);
        throw error;
      }
    }

    // Try to get the module from window if library name is specified
    if (config.library && (window as any)[config.library]) {
      module = (window as any)[config.library];
    }
  }

  return { scripts, styles, module };
}

/**
 * Extract menus from pages config
 */
function extractMenusFromPages(pages: PageConfig[]): MenuItemConfig[] {
  return pages
    .filter((page) => !page.hidden)
    .map((page) => ({
      id: page.id,
      label: page.label,
      icon: resolveIcon(page.icon) as any,
      path: page.path,
      order: page.order,
      badge: page.badge,
      permissions: page.permissions,
      external: page.external,
      target: page.target,
      children: page.children ? extractMenusFromPages(page.children) : undefined,
    }));
}

/**
 * Extract routes from pages config
 */
function extractRoutesFromPages(
  pages: PageConfig[],
  appId: string
): RouteConfig[] {
  const routes: RouteConfig[] = [];

  for (const page of pages) {
    // Only create route if component is specified
    if (page.component || page.children) {
      routes.push({
        path: page.path,
        component: createPlaceholderComponent(appId, page.path),
        meta: {
          title: page.title || page.label,
          description: page.description,
          permissions: page.permissions,
        },
        children: page.children
          ? extractRoutesFromPages(page.children, appId)
          : undefined,
      });
    }

    // Also extract routes from children
    if (page.children) {
      routes.push(...extractRoutesFromPages(page.children, appId));
    }
  }

  return routes;
}

/**
 * Create a placeholder component for routes
 * The actual rendering will be handled by the app's mount function
 */
function createPlaceholderComponent(
  appId: string,
  routePath: string
): ComponentType<any> {
  return function AppRouteComponent() {
    const registry = getRegistry();
    const app = registry.getApp(appId);

    if (!app || app.status !== "loaded") {
      return null;
    }

    // Return a container div that the app can mount into
    return createElement("div", {
      "data-app-id": appId,
      "data-route": routePath,
      style: { width: "100%", height: "100%" },
    });
  };
}

/**
 * Transform manifest config to runtime manifest
 */
export function transformManifest(
  config: AppManifestConfig,
  appModule?: any
): AppManifest {
  // Extract menus and routes from pages
  const pages = config.pages || [];
  const menus = extractMenusFromPages(pages);
  const routes = extractRoutesFromPages(pages, config.id);

  // Extract lifecycle functions from module
  let bootstrap: (() => Promise<void> | void) | undefined;
  let mount: ((container: HTMLElement) => Promise<void> | void) | undefined;
  let unmount: ((container: HTMLElement) => Promise<void> | void) | undefined;

  if (appModule) {
    if (config.lifecycle?.bootstrap && appModule[config.lifecycle.bootstrap]) {
      bootstrap = appModule[config.lifecycle.bootstrap];
    }
    if (config.lifecycle?.mount && appModule[config.lifecycle.mount]) {
      mount = appModule[config.lifecycle.mount];
    }
    if (config.lifecycle?.unmount && appModule[config.lifecycle.unmount]) {
      unmount = appModule[config.lifecycle.unmount];
    }
  }

  return {
    id: config.id,
    name: config.name,
    version: config.version,
    description: config.description,
    icon: resolveIcon(config.icon),
    author: config.author,
    basePath: config.basePath,
    menus,
    routes,
    permissions: config.permissions,
    tags: config.tags,
    priority: config.priority,
    framework: config.framework,
    bootstrap,
    mount,
    unmount,
    module: appModule,
    _raw: config,
  };
}

export interface AppLoaderConfig {
  /** Base URL for user apps */
  appsBasePath: string;
  /** Manifest file name */
  manifestFileName?: string;
  /** Auto load all apps */
  autoLoad?: boolean;
}

/**
 * Create an app loader for loading compiled apps from a directory
 */
export function createDistAppLoader(config: AppLoaderConfig) {
  const registry = getRegistry();
  const { appsBasePath, manifestFileName = "manifest.json" } = config;

  return {
    /**
     * Load a single app by its directory name
     */
    async loadApp(appDirName: string): Promise<void> {
      const appPath = `${appsBasePath}/${appDirName}`.replace(/\/+/g, "/");
      const manifestUrl = `${appPath}/${manifestFileName}`;

      try {
        // Fetch manifest
        const response = await fetch(manifestUrl);
        if (!response.ok) {
          throw new Error(`Failed to fetch manifest: ${response.statusText}`);
        }
        const manifestConfig: AppManifestConfig = await response.json();

        // Load assets
        const { scripts, styles, module } = await loadAppAssets(
          manifestConfig,
          appPath
        );

        // Transform and register
        const manifest = transformManifest(manifestConfig, module);

        await registry.register(manifest, appPath);

        // Store loaded assets reference
        const app = registry.getApp(manifest.id);
        if (app) {
          app.loadedAssets = { scripts, styles };
          app.appPath = appPath;
        }

        console.log(`✅ Loaded app: ${manifest.name} (${manifest.id})`);
      } catch (error) {
        console.error(`❌ Failed to load app from ${appPath}:`, error);
        throw error;
      }
    },

    /**
     * Load multiple apps
     */
    async loadApps(appDirNames: string[]): Promise<void> {
      for (const dirName of appDirNames) {
        try {
          await this.loadApp(dirName);
        } catch (error) {
          // Continue loading other apps
        }
      }
    },

    /**
     * Unload an app
     */
    async unloadApp(appId: string): Promise<void> {
      const app = registry.getApp(appId);
      if (app) {
        // Call unmount if available
        if (app.manifest.unmount && app.container) {
          await app.manifest.unmount(app.container);
        }
        // Unload assets
        unloadAssets(app);
        // Unregister
        await registry.unregister(appId);
      }
    },
  };
}

/**
 * Create app loader for development (loading from source)
 */
export function createViteAppLoader(
  manifests: Record<string, () => Promise<AppManifestConfig>>,
  options?: {
    components?: Record<string, () => Promise<{ default: ComponentType<any> }>>;
    autoLoad?: boolean;
  }
) {
  const registry = getRegistry();
  const { components, autoLoad = true } = options || {};

  const loaders: Record<string, () => Promise<AppManifest>> = {};

  Object.entries(manifests).forEach(([path, loader]) => {
    const appId = extractAppId(path);
    loaders[appId] = async () => {
      const manifestConfig = await loader();
      return transformManifestWithComponents(manifestConfig, components, appId);
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

function extractAppId(path: string): string {
  // Try to match modules/xxx/ or user-apps/xxx/ pattern
  const match = path.match(/(?:modules|user-apps)\/([^/]+)\//);
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

function transformManifestWithComponents(
  config: AppManifestConfig,
  componentLoaders?: Record<
    string,
    () => Promise<{ default: ComponentType<any> }>
  >,
  appId?: string
): AppManifest {
  /**
   * Create a lazy component from the component loaders
   * Matches component name (e.g., "Home") to file path (e.g., "modules/todo-app/src/pages/Home.tsx")
   */
  const createLazyComponent = (
    componentName?: string,
    targetAppId?: string
  ): ComponentType<any> => {
    if (!componentName || !componentLoaders) {
      return () => null;
    }

    // Find loader that matches: modules/{appId}/src/pages/{componentName}.tsx
    // or modules/{appId}/src/{componentName}.tsx
    const loaderKey = Object.keys(componentLoaders).find((key) => {
      // Check if the path belongs to this app
      if (targetAppId && !key.includes(`/${targetAppId}/`)) {
        return false;
      }
      // Match pages/{ComponentName}.tsx or {ComponentName}.tsx
      const patterns = [
        `/pages/${componentName}.tsx`,
        `/pages/${componentName}/index.tsx`,
        `/${componentName}.tsx`,
      ];
      return patterns.some((pattern) => key.endsWith(pattern));
    });

    if (loaderKey && componentLoaders[loaderKey]) {
      const { lazy } = require("react");
      return lazy(componentLoaders[loaderKey]);
    }

    console.warn(
      `Component "${componentName}" not found for app "${targetAppId || config.id}"`
    );
    return () => null;
  };

  // Extract from pages
  const pages = config.pages || [];
  const menus = extractMenusFromPages(pages);

  // Create routes with lazy components
  const createRoutesFromPages = (pages: PageConfig[]): RouteConfig[] => {
    const routes: RouteConfig[] = [];
    for (const page of pages) {
      if (page.component) {
        routes.push({
          path: page.path,
          component: createLazyComponent(page.component, appId || config.id),
          meta: {
            title: page.title || page.label,
            description: page.description,
            permissions: page.permissions,
          },
        });
      }
      if (page.children) {
        routes.push(...createRoutesFromPages(page.children));
      }
    }
    return routes;
  };

  const routes = createRoutesFromPages(pages);

  return {
    id: config.id,
    name: config.name,
    version: config.version,
    description: config.description,
    icon: resolveIcon(config.icon),
    author: config.author,
    basePath: config.basePath,
    menus,
    routes,
    permissions: config.permissions,
    tags: config.tags,
    priority: config.priority,
    framework: config.framework,
    _raw: config,
  };
}

export async function registerApp(manifest: AppManifest): Promise<void> {
  const registry = getRegistry();
  await registry.register(manifest);
}

export async function registerAppFromConfig(
  config: AppManifestConfig,
  appModule?: any
): Promise<void> {
  const manifest = transformManifest(config, appModule);
  await registerApp(manifest);
}
