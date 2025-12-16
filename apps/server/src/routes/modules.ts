import { Hono } from "hono";
import type { ModuleLoader } from "../services/module-loader";

export function createModulesRouter(moduleLoader: ModuleLoader) {
  const router = new Hono();

  /**
   * GET /api/modules
   * Get list of all loaded modules
   */
  router.get("/", (c) => {
    const modules = moduleLoader.getModules();

    return c.json({
      success: true,
      data: modules.map((m) => ({
        id: m.id,
        name: m.manifest.name,
        version: m.manifest.version,
        description: m.manifest.description,
        icon: m.manifest.icon,
        author: m.manifest.author,
        basePath: m.manifest.basePath,
        tags: m.manifest.tags,
        priority: m.manifest.priority,
        hasDistFiles: m.hasDistFiles,
        assets: m.manifest.assets,
        library: m.manifest.library,
      })),
    });
  });

  /**
   * GET /api/modules/:id
   * Get a specific module by ID
   */
  router.get("/:id", (c) => {
    const id = c.req.param("id");
    const module = moduleLoader.getModule(id);

    if (!module) {
      return c.json({ success: false, error: "Module not found" }, 404);
    }

    return c.json({
      success: true,
      data: {
        id: module.id,
        manifest: module.manifest,
        hasDistFiles: module.hasDistFiles,
      },
    });
  });

  /**
   * GET /api/modules/:id/manifest
   * Get the full manifest of a module
   */
  router.get("/:id/manifest", (c) => {
    const id = c.req.param("id");
    const module = moduleLoader.getModule(id);

    if (!module) {
      return c.json({ success: false, error: "Module not found" }, 404);
    }

    return c.json(module.manifest);
  });

  /**
   * POST /api/modules/reload
   * Reload all modules (rescan directory)
   */
  router.post("/reload", async (c) => {
    await moduleLoader.scanModules();

    return c.json({
      success: true,
      message: "Modules reloaded",
      count: moduleLoader.getModules().length,
    });
  });

  return router;
}

