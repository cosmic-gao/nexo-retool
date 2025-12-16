import { spawn } from "child_process";
import { writeFileSync, readFileSync, mkdirSync, existsSync, rmSync, readdirSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

interface Manifest {
  id: string;
  name: string;
  basePath: string;
  pages: Array<{
    id: string;
    path: string;
    label: string;
    icon?: string;
    component: string;
  }>;
  standalone?: {
    enabled?: boolean;
  };
}

function loadManifest(cwd: string): Manifest {
  const manifestPath = resolve(cwd, "manifest.json");
  if (!existsSync(manifestPath)) {
    console.error("Error: manifest.json not found in current directory");
    process.exit(1);
  }
  return JSON.parse(readFileSync(manifestPath, "utf-8"));
}

function generateIndexHtml(manifest: Manifest, cwd: string): string {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${manifest.name}</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/main.tsx"></script>
  </body>
</html>`;
}

function generateMainTsx(cwd: string): string {
  const cwdPosix = cwd.replace(/\\/g, "/");
  // Use absolute path for styles.css since we're in node_modules/.nexo-cache
  const stylesPath = `${cwdPosix}/node_modules/@nexo/react-runtime/dist/styles/globals.css`;
  return `import { bootstrap } from "@nexo/react-runtime";
import "${stylesPath}";
import { type AppManifestConfig } from "@nexo/core";
import * as pages from "${cwdPosix}/pages";
import manifestJson from "${cwdPosix}/manifest.json";

const manifest = manifestJson as AppManifestConfig;
bootstrap({ manifest, pages });
`;
}

function generateViteConfig(manifest: Manifest, cwd: string, cacheDir: string): string {
  const cwdPosix = cwd.replace(/\\/g, "/");
  const cacheDirPosix = cacheDir.replace(/\\/g, "/");
  return `import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "${manifest.basePath}/",
  root: "${cacheDirPosix}",
  publicDir: "${cwdPosix}/public",
  build: {
    outDir: "${cwdPosix}/dist",
    assetsDir: "assets",
    emptyOutDir: true,
  },
  server: {
    port: 4001,
    cors: true,
    headers: {
      "Access-Control-Allow-Origin": "*",
    },
    fs: {
      allow: ["${cwdPosix}", "${cacheDirPosix}", "${cwdPosix}/node_modules"],
    },
  },
  resolve: {
    alias: {
      "@": "${cwdPosix}",
    },
  },
});
`;
}

function generateTailwindConfig(cwd: string): string {
  const cwdPosix = cwd.replace(/\\/g, "/");
  return `/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    "${cwdPosix}/pages/**/*.{ts,tsx}",
    "${cwdPosix}/node_modules/@nexo/react-runtime/src/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
`;
}

function generatePostcssConfig(cacheDir: string): string {
  const cacheDirPosix = cacheDir.replace(/\\/g, "/");
  return `export default {
  plugins: {
    tailwindcss: { config: "${cacheDirPosix}/tailwind.config.js" },
    autoprefixer: {},
  },
};
`;
}

function cleanCacheDir(cacheDir: string) {
  if (existsSync(cacheDir)) {
    try {
      rmSync(cacheDir, { recursive: true, force: true });
    } catch (err) {
      // If we can't remove, try to just overwrite files
      console.warn("Warning: Could not clean cache directory, will overwrite files");
    }
  }
}

function setupCacheDir(cwd: string, manifest: Manifest): string {
  const cacheDir = resolve(cwd, "node_modules", ".nexo-cache");
  
  // Try to clean cache directory
  cleanCacheDir(cacheDir);
  
  // Create cache directory
  if (!existsSync(cacheDir)) {
    mkdirSync(cacheDir, { recursive: true });
  }

  // Generate files (overwrite if they exist)
  writeFileSync(resolve(cacheDir, "index.html"), generateIndexHtml(manifest, cwd));
  writeFileSync(resolve(cacheDir, "main.tsx"), generateMainTsx(cwd));
  writeFileSync(resolve(cacheDir, "vite.config.ts"), generateViteConfig(manifest, cwd, cacheDir));
  writeFileSync(resolve(cacheDir, "tailwind.config.js"), generateTailwindConfig(cwd));
  writeFileSync(resolve(cacheDir, "postcss.config.mjs"), generatePostcssConfig(cacheDir));

  console.log("✓ Generated runtime files in node_modules/.nexo-cache/");
  
  return cacheDir;
}

function runVite(command: string, cwd: string, cacheDir: string) {
  const configPath = resolve(cacheDir, "vite.config.ts");
  
  let args: string[];
  if (command === "dev") {
    args = ["vite", "--config", configPath];
  } else if (command === "build") {
    args = ["vite", "build", "--config", configPath];
  } else {
    args = ["vite", "preview", "--config", configPath];
  }

  const child = spawn("npx", args, {
    cwd: cacheDir,
    stdio: "inherit",
    shell: true,
  });

  child.on("exit", (code) => {
    process.exit(code || 0);
  });
}

// Main CLI
const args = process.argv.slice(2);
const command = args[0];
const cwd = process.cwd();

if (!command || !["dev", "build", "preview"].includes(command)) {
  console.log(`
Usage: nexo-react <command>

Commands:
  dev      Start development server
  build    Build for production
  preview  Preview production build
`);
  process.exit(1);
}

const manifest = loadManifest(cwd);
const cacheDir = setupCacheDir(cwd, manifest);
runVite(command, cwd, cacheDir);
