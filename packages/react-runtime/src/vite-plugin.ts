import type { Plugin, ViteDevServer } from "vite";

export interface NexoPluginOptions {
  /** App title for index.html */
  title?: string;
}

/**
 * Vite plugin for Nexo React apps
 * - Provides virtual index.html
 * - Handles CSS imports from runtime
 */
export function nexoReactPlugin(options: NexoPluginOptions = {}): Plugin {
  const { title = "Nexo App" } = options;
  let base = "/";

  return {
    name: "nexo-react-plugin",
    enforce: "pre",

    configResolved(config) {
      base = config.base || "/";
    },

    configureServer(server: ViteDevServer) {
      // Return a post hook to run after Vite's built-in middlewares
      return () => {
        server.middlewares.use((req, res, next) => {
          const url = req.url || "";
          
          // Check if this is a request for the app root or index.html
          const isRoot = url === base || url === base.slice(0, -1);
          const isIndex = url === `${base}index.html` || url === `${base.slice(0, -1)}/index.html`;
          
          if (isRoot || isIndex) {
            res.setHeader("Content-Type", "text/html");
            res.statusCode = 200;
            res.end(generateIndexHtml(title, base));
            return;
          }
          next();
        });
      };
    },

    transformIndexHtml: {
      order: "pre",
      handler(html) {
        return generateIndexHtml(title, base);
      },
    },
  };
}

function generateIndexHtml(title: string, base: string): string {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${title}</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="${base}main.tsx"></script>
  </body>
</html>`;
}

export default nexoReactPlugin;
