import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";

const repoRoot = path.resolve(import.meta.dirname, "../..");

export default defineConfig(async ({ mode }) => {
  const env = loadEnv(mode, repoRoot, "");

  const rawPort = env.PORT ?? env.WEB_PORT ?? env.VITE_PORT ?? "5173";
  const port = Number(rawPort);

  if (Number.isNaN(port) || port <= 0) {
    throw new Error(`Invalid PORT value: "${rawPort}"`);
  }

  const basePath = env.BASE_PATH ?? "/";
  const apiPort = env.API_PORT ?? "5000";

  const noCacheInDev: never[] = [];

  return {
    envDir: repoRoot,
    base: basePath,
    plugins: [
      ...noCacheInDev,
      react(),
      tailwindcss({ optimize: false }),
      runtimeErrorOverlay(),
      ...(env.NODE_ENV !== "production" && env.REPL_ID !== undefined
        ? [
            await import("@replit/vite-plugin-cartographer").then((m) =>
              m.cartographer({
                root: path.resolve(import.meta.dirname, ".."),
              }),
            ),
            await import("@replit/vite-plugin-dev-banner").then((m) =>
              m.devBanner(),
            ),
          ]
        : []),
    ],
    resolve: {
      alias: {
        "@": path.resolve(import.meta.dirname, "src"),
        "@assets": path.resolve(import.meta.dirname, "..", "..", "attached_assets"),
      },
      dedupe: ["react", "react-dom"],
    },
    root: path.resolve(import.meta.dirname),
    build: {
      outDir: path.resolve(import.meta.dirname, "dist/public"),
      emptyOutDir: true,
      rollupOptions: {
        output: {
          manualChunks(id) {
            // Vendor chunk — core React ecosystem
            if (id.includes("node_modules/react") || id.includes("node_modules/react-dom")) {
              return "vendor-react";
            }
            // Clerk auth
            if (id.includes("node_modules/@clerk")) {
              return "vendor-clerk";
            }
            // TanStack Query
            if (id.includes("node_modules/@tanstack")) {
              return "vendor-query";
            }
            // Radix UI components
            if (id.includes("node_modules/@radix-ui")) {
              return "vendor-radix";
            }
            // Heavy educational games data — its own chunk
            if (id.includes("educational-games")) {
              return "games-content";
            }
            // Games page components
            if (id.includes("src/components/games") || id.includes("src/pages/games") || id.includes("src/pages/lab-")) {
              return "games-ui";
            }
          },
        },
      },
    },
    server: {
      port,
      strictPort: true,
      host: "0.0.0.0",
      allowedHosts: true,
      proxy: {
        "/api": {
          target: `http://localhost:${apiPort}`,
          changeOrigin: false,
          secure: false,
        },
      },
      fs: {
        strict: true,
      },
    },
    preview: {
      port,
      host: "0.0.0.0",
      allowedHosts: true,
    },
  };
});
