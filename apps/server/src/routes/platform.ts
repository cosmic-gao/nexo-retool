import { Hono } from "hono";
import type { ModuleLoader } from "../services/module-loader";

export function createPlatformRouter(moduleLoader: ModuleLoader) {
  const router = new Hono();

  /**
   * GET /api/platform/menus
   * Get all menus from all modules
   */
  router.get("/menus", (c) => {
    const menus = moduleLoader.getAllMenus();

    return c.json({
      success: true,
      data: menus,
    });
  });

  /**
   * GET /api/platform/routes
   * Get all routes from all modules
   */
  router.get("/routes", (c) => {
    const routes = moduleLoader.getAllRoutes();

    return c.json({
      success: true,
      data: routes,
    });
  });

  /**
   * GET /api/platform/config
   * Get platform configuration including menus, routes, and module info
   */
  router.get("/config", (c) => {
    const modules = moduleLoader.getModules();
    const menus = moduleLoader.getAllMenus();
    const routes = moduleLoader.getAllRoutes();

    return c.json({
      success: true,
      data: {
        modules: modules.map((m) => ({
          id: m.id,
          name: m.manifest.name,
          version: m.manifest.version,
          icon: m.manifest.icon,
          description: m.manifest.description,
          basePath: m.manifest.basePath,
          framework: m.manifest.framework,
          hasBackend: m.manifest.hasBackend,
          hasDistFiles: m.hasDistFiles,
        })),
        menus,
        routes,
      },
    });
  });

  return router;
}

