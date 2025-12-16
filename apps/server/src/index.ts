import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { join, resolve } from "path";

import { ModuleLoader } from "./services/module-loader";
import { createModulesRouter } from "./routes/modules";
import { createPlatformRouter } from "./routes/platform";

// Configuration
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3001;
const MODULES_PATH = process.env.MODULES_PATH || resolve("../../modules");
const IS_DEV = process.env.NODE_ENV !== "production";

// Development mode: module dev server ports
const DEV_PORTS: Record<string, number> = {
  "todo-app": 4001,
  "analytics-app": 4002,
  "settings-app": 4003,
};

console.log("🚀 Nexo Server starting...");
console.log(`📁 Modules path: ${MODULES_PATH}`);
console.log(`🔧 Mode: ${IS_DEV ? "development" : "production"}`);

// Initialize module loader
const moduleLoader = new ModuleLoader(MODULES_PATH);
await moduleLoader.scanModules();

// Create Hono app
const app = new Hono();

// Middleware
app.use("*", logger());
app.use(
  "*",
  cors({
    origin: "*",
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
  })
);

// Health check
app.get("/health", (c) => {
  return c.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    modules: moduleLoader.getModules().length,
    mode: IS_DEV ? "development" : "production",
  });
});

// API routes
app.route("/api/modules", createModulesRouter(moduleLoader));
app.route("/api/platform", createPlatformRouter(moduleLoader));

// Helper function to serve module files
async function serveModuleFile(
  c: any,
  module: any,
  moduleId: string,
  filePath: string,
  basePath: string
) {
  // Development mode: proxy to module dev server
  if (IS_DEV && DEV_PORTS[moduleId]) {
    const devPort = DEV_PORTS[moduleId];
    // Proxy using basePath
    const proxyUrl = `http://localhost:${devPort}${basePath}/${filePath}`.replace(/\/+/g, "/");

    try {
      const response = await fetch(proxyUrl, {
        method: c.req.method,
        headers: c.req.raw.headers,
      });

      // Clone response with CORS headers
      const headers = new Headers(response.headers);
      headers.set("Access-Control-Allow-Origin", "*");

      return new Response(response.body, {
        status: response.status,
        headers,
      });
    } catch (error) {
      console.warn(`Dev server for ${moduleId} not running on port ${devPort}`);
      // Fall through to serve static files
    }
  }

  // Production mode or dev server not running: serve static files
  const fullPath = join(module.path, "dist", filePath);

  try {
    const file = Bun.file(fullPath);
    if (await file.exists()) {
      let contentType = "application/octet-stream";
      if (fullPath.endsWith(".js")) {
        contentType = "application/javascript";
      } else if (fullPath.endsWith(".css")) {
        contentType = "text/css";
      } else if (fullPath.endsWith(".json")) {
        contentType = "application/json";
      } else if (fullPath.endsWith(".html")) {
        contentType = "text/html";
      } else if (fullPath.endsWith(".map")) {
        contentType = "application/json";
      } else if (fullPath.endsWith(".svg")) {
        contentType = "image/svg+xml";
      } else if (fullPath.endsWith(".png")) {
        contentType = "image/png";
      }

      return new Response(file, {
        headers: {
          "Content-Type": contentType,
          "Access-Control-Allow-Origin": "*",
          "Cache-Control": IS_DEV ? "no-cache" : "public, max-age=31536000",
        },
      });
    }
  } catch (error) {
    console.error(`Failed to serve file: ${fullPath}`, error);
  }

  return null;
}

// Mount user apps at their basePath
// Each module is served at its configured basePath (e.g., /app/todo, /app/settings)
for (const module of moduleLoader.getModules()) {
  const basePath = module.manifest.basePath;
  if (!basePath) continue;

  // Handle all requests under basePath
  app.all(`${basePath}/*`, async (c) => {
    const filePath = c.req.path.replace(basePath, "").replace(/^\//, "") || "index.html";
    
    const result = await serveModuleFile(c, module, module.id, filePath, basePath);
    if (result) return result;

    return c.json({ error: "File not found", path: filePath }, 404);
  });

  // Handle exact basePath request (serve index.html)
  app.all(basePath, async (c) => {
    const result = await serveModuleFile(c, module, module.id, "index.html", basePath);
    if (result) return result;

    return c.json({ error: "File not found", path: "index.html" }, 404);
  });
}

// Legacy: also serve at /modules/:moduleId/* for backward compatibility
app.all("/modules/:moduleId/*", async (c) => {
  const moduleId = c.req.param("moduleId");
  const filePath = c.req.path.replace(`/modules/${moduleId}/`, "") || "index.html";

  const module = moduleLoader.getModule(moduleId);
  if (!module) {
    return c.json({ error: "Module not found" }, 404);
  }

  const basePath = module.manifest.basePath || `/modules/${moduleId}`;
  const result = await serveModuleFile(c, module, moduleId, filePath, basePath);
  if (result) return result;

  return c.json({ error: "File not found", path: filePath }, 404);
});

// Start server
console.log(`\n✅ Server ready at http://localhost:${PORT}`);
console.log(`\n📡 API Endpoints:`);
console.log(`   GET  /health              - Health check`);
console.log(`   GET  /api/modules         - List all modules`);
console.log(`   GET  /api/modules/:id     - Get module by ID`);
console.log(`   POST /api/modules/reload  - Reload modules`);
console.log(`   GET  /api/platform/menus  - Get all menus`);
console.log(`   GET  /api/platform/routes - Get all routes`);
console.log(`   GET  /api/platform/config - Get full platform config`);

console.log(`\n📦 User Apps (mounted at basePath):`);
for (const module of moduleLoader.getModules()) {
  const basePath = module.manifest.basePath;
  if (basePath) {
    console.log(`   ${module.manifest.name} -> ${basePath}`);
  }
}

if (IS_DEV) {
  console.log(`\n🔧 Development mode - Module dev servers:`);
  Object.entries(DEV_PORTS).forEach(([id, port]) => {
    console.log(`   ${id}: http://localhost:${port}`);
  });
}

export default {
  port: PORT,
  fetch: app.fetch,
};
