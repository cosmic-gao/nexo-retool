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

export interface AppAssets {
  js: string[];
  css?: string[];
}

export interface ModuleManifest {
  id: string;
  name: string;
  version: string;
  description?: string;
  icon?: string;
  author?: string;
  homepage?: string;
  tags?: string[];
  priority?: number;
  basePath: string;
  framework?: "react" | "vue" | "vanilla";
  sandbox?: boolean;
  assets: AppAssets;
  library?: string;
  permissions?: PermissionConfig[];
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
      console.log(
        `  ✅ ${manifest.name} (${manifest.id}) v${manifest.version}${hasDistFiles ? "" : " [no dist]"}`
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
   */
  getAllMenus(): MenuItemConfig[] {
    const menus: MenuItemConfig[] = [];

    for (const module of this.getModules()) {
      if (module.manifest.pages) {
        menus.push(...this.extractMenusFromPages(module.manifest.pages));
      }
    }

    return menus.sort((a, b) => (a.order ?? 100) - (b.order ?? 100));
  }

  /**
   * Extract routes from all modules
   */
  getAllRoutes(): RouteConfig[] {
    const routes: RouteConfig[] = [];

    for (const module of this.getModules()) {
      if (module.manifest.pages) {
        routes.push(
          ...this.extractRoutesFromPages(module.manifest.pages, module.id)
        );
      }
    }

    return routes;
  }

  /**
   * Extract menus from pages config
   */
  private extractMenusFromPages(pages: PageConfig[]): MenuItemConfig[] {
    return pages
      .filter((page) => !page.hidden)
      .map((page) => ({
        id: page.id,
        label: page.label,
        icon: page.icon,
        path: page.path,
        order: page.order,
        badge: page.badge,
        permissions: page.permissions,
        external: page.external,
        target: page.target,
        children: page.children
          ? this.extractMenusFromPages(page.children)
          : undefined,
      }));
  }

  /**
   * Extract routes from pages config
   */
  private extractRoutesFromPages(
    pages: PageConfig[],
    moduleId: string
  ): RouteConfig[] {
    const routes: RouteConfig[] = [];

    for (const page of pages) {
      if (page.component) {
        routes.push({
          path: page.path,
          component: `${moduleId}:${page.component}`,
          meta: {
            title: page.title || page.label,
            description: page.description,
            permissions: page.permissions,
          },
        });
      }

      if (page.children) {
        routes.push(...this.extractRoutesFromPages(page.children, moduleId));
      }
    }

    return routes;
  }

  /**
   * Get module path for serving static files
   */
  getModulePath(moduleId: string): string | null {
    const module = this.modules.get(moduleId);
    return module ? module.path : null;
  }
}

