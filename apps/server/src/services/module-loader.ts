import { readdir, readFile, stat } from "fs/promises";
import { join } from "path";

export interface PageConfig {
  id: string;
  label: string;
  path: string;
  icon?: string;
  component?: string;
  title?: string;
  description?: string;
  order?: number;
  hidden?: boolean;
  badge?: string | number;
  permissions?: string[];
  external?: boolean;
  target?: "_blank" | "_self";
  children?: PageConfig[];
}

export interface PermissionConfig {
  id: string;
  name: string;
  description?: string;
}

/**
 * New permission format for manifest.json
 */
export interface AppPermissions {
  /** Key-value storage access */
  kv?: boolean;
  /** MSPBots API access */
  mspbots?: string[];
  /** HTTP endpoints access */
  http?: string[];
}

export interface AppAssets {
  js: string[];
  css?: string[];
}

export interface ModuleManifest {
  id: string;
  name: string;
  version?: string;
  description?: string;
  icon?: string;
  author?: string;
  homepage?: string;
  tags?: string[];
  priority?: number;
  /** Entry HTML file (new format) */
  entry?: string;
  /** Base path for all app routes */
  basePath?: string;
  /** Whether the app has backend services */
  hasBackend?: boolean;
  framework?: "react" | "vue" | "vanilla";
  sandbox?: boolean;
  /** Compiled assets to load (legacy format) */
  assets?: AppAssets;
  library?: string;
  /** Permissions (new format: { kv, mspbots, http }) */
  permissions?: AppPermissions | PermissionConfig[];
  pages?: PageConfig[];
  lifecycle?: {
    bootstrap?: string;
    mount?: string;
    unmount?: string;
  };
}

export interface LoadedModule {
  id: string;
  manifest: ModuleManifest;
  path: string;
  hasDistFiles: boolean;
}

export interface MenuItemConfig {
  id: string;
  label: string;
  icon?: string;
  path: string;
  order?: number;
  badge?: string | number;
  permissions?: string[];
  external?: boolean;
  target?: "_blank" | "_self";
  children?: MenuItemConfig[];
}

export interface RouteConfig {
  path: string;
  component: string;
  meta?: {
    title?: string;
    description?: string;
    permissions?: string[];
  };
}

/**
 * Module Loader Service
 * Scans modules directory and loads manifest.json files
 */
export class ModuleLoader {
  private modulesPath: string;
  private modules: Map<string, LoadedModule> = new Map();

  constructor(modulesPath: string) {
    this.modulesPath = modulesPath;
  }

  /**
   * Scan modules directory and load all manifests
   */
  async scanModules(): Promise<void> {
    this.modules.clear();

    try {
      const entries = await readdir(this.modulesPath, { withFileTypes: true });

      for (const entry of entries) {
        if (entry.isDirectory()) {
          await this.loadModule(entry.name);
        }
      }

      console.log(`📦 Loaded ${this.modules.size} modules`);
    } catch (error) {
      console.error("Failed to scan modules directory:", error);
    }
  }

  /**
   * Load a single module by directory name
   */
  async loadModule(dirName: string): Promise<LoadedModule | null> {
    const modulePath = join(this.modulesPath, dirName);
    const manifestPath = join(modulePath, "manifest.json");

    try {
      const manifestContent = await readFile(manifestPath, "utf-8");
      const manifest: ModuleManifest = JSON.parse(manifestContent);

      // Check if dist files exist
      const hasDistFiles = await this.checkDistFiles(modulePath, manifest);

      const loadedModule: LoadedModule = {
        id: manifest.id,
        manifest,
        path: modulePath,
        hasDistFiles,
      };

      this.modules.set(manifest.id, loadedModule);
      const versionStr = manifest.version ? ` v${manifest.version}` : "";
      console.log(
        `  ✅ ${manifest.name} (${manifest.id})${versionStr}${hasDistFiles ? "" : " [no dist]"}`
      );

      return loadedModule;
    } catch (error) {
      console.warn(`  ⚠️ Failed to load module from ${dirName}:`, error);
      return null;
    }
  }

  /**
   * Check if dist files exist for a module
   */
  private async checkDistFiles(
    modulePath: string,
    manifest: ModuleManifest
  ): Promise<boolean> {
    // New format: check entry file
    if (manifest.entry) {
      try {
        const entryPath = join(modulePath, manifest.entry);
        await stat(entryPath);
        return true;
      } catch {
        return false;
      }
    }

    // Legacy format: check assets.js
    if (!manifest.assets?.js?.length) {
      return false;
    }

    try {
      for (const jsFile of manifest.assets.js) {
        const filePath = join(modulePath, jsFile);
        await stat(filePath);
      }
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get all loaded modules
   */
  getModules(): LoadedModule[] {
    return Array.from(this.modules.values()).sort(
      (a, b) => (a.manifest.priority ?? 100) - (b.manifest.priority ?? 100)
    );
  }

  /**
   * Get a specific module by ID
   */
  getModule(id: string): LoadedModule | undefined {
    return this.modules.get(id);
  }

  /**
   * Extract menus from all modules
   * Each module's pages are prefixed with its basePath
   */
  getAllMenus(): MenuItemConfig[] {
    const menus: MenuItemConfig[] = [];

    for (const module of this.getModules()) {
      if (module.manifest.pages && module.manifest.basePath) {
        const moduleMenu = this.createModuleMenu(module);
        if (moduleMenu) {
          menus.push(moduleMenu);
        }
      }
    }

    return menus.sort((a, b) => (a.order ?? 100) - (b.order ?? 100));
  }

  /**
   * Create a menu entry for a module
   * The module itself becomes a menu item with its pages as children
   */
  private createModuleMenu(module: LoadedModule): MenuItemConfig | null {
    const { manifest } = module;
    if (!manifest.pages || !manifest.basePath) return null;

    const basePath = manifest.basePath;

    // If module has only one page at root, return it directly
    if (manifest.pages.length === 1 && manifest.pages[0].path === "/") {
      const page = manifest.pages[0];
      return {
        id: manifest.id,
        label: page.label || manifest.name,
        icon: manifest.icon || page.icon,
        path: basePath,
        order: manifest.priority,
      };
    }

    // Create menu with children
    return {
      id: manifest.id,
      label: manifest.name,
      icon: manifest.icon,
      path: basePath,
      order: manifest.priority,
      children: this.extractMenusFromPages(manifest.pages, basePath),
    };
  }

  /**
   * Extract routes from all modules
   */
  getAllRoutes(): RouteConfig[] {
    const routes: RouteConfig[] = [];

    for (const module of this.getModules()) {
      if (module.manifest.pages && module.manifest.basePath) {
        routes.push(
          ...this.extractRoutesFromPages(
            module.manifest.pages,
            module.id,
            module.manifest.basePath
          )
        );
      }
    }

    return routes;
  }

  /**
   * Extract menus from pages config with basePath prefix
   */
  private extractMenusFromPages(
    pages: PageConfig[],
    basePath: string
  ): MenuItemConfig[] {
    return pages
      .filter((page) => !page.hidden)
      .map((page) => {
        // Combine basePath with page path
        const fullPath = this.joinPaths(basePath, page.path);
        return {
          id: page.id,
          label: page.label,
          icon: page.icon,
          path: fullPath,
          order: page.order,
          badge: page.badge,
          permissions: page.permissions,
          external: page.external,
          target: page.target,
          children: page.children
            ? this.extractMenusFromPages(page.children, fullPath)
            : undefined,
        };
      });
  }

  /**
   * Extract routes from pages config with basePath prefix
   */
  private extractRoutesFromPages(
    pages: PageConfig[],
    moduleId: string,
    basePath: string
  ): RouteConfig[] {
    const routes: RouteConfig[] = [];

    for (const page of pages) {
      const fullPath = this.joinPaths(basePath, page.path);

      if (page.component) {
        routes.push({
          path: fullPath,
          component: `${moduleId}:${page.component}`,
          meta: {
            title: page.title || page.label,
            description: page.description,
            permissions: page.permissions,
          },
        });
      }

      if (page.children) {
        routes.push(
          ...this.extractRoutesFromPages(page.children, moduleId, fullPath)
        );
      }
    }

    return routes;
  }

  /**
   * Join two paths, handling slashes correctly
   */
  private joinPaths(base: string, path: string): string {
    if (path === "/" || path === "") return base;
    const normalizedBase = base.endsWith("/") ? base.slice(0, -1) : base;
    const normalizedPath = path.startsWith("/") ? path : `/${path}`;
    return `${normalizedBase}${normalizedPath}`;
  }

  /**
   * Get module path for serving static files
   */
  getModulePath(moduleId: string): string | null {
    const module = this.modules.get(moduleId);
    return module ? module.path : null;
  }
}

