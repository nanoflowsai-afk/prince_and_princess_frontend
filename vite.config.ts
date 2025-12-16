import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
import { metaImagesPlugin } from "./vite-plugin-meta-images";

export default defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    tailwindcss(),
    metaImagesPlugin(),
    ...(process.env.NODE_ENV !== "production" &&
    process.env.REPL_ID !== undefined
      ? [
          await import("@replit/vite-plugin-cartographer").then((m) =>
            m.cartographer(),
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
      "@assets": path.resolve(import.meta.dirname, "..", "attached_assets"),
    },
  },
  css: {
    postcss: {
      plugins: [],
    },
  },
  build: {
    outDir: path.resolve(import.meta.dirname, "dist"),
    emptyOutDir: true,
  },
  server: {
    host: "0.0.0.0",
    port: 5000,
    allowedHosts: true,
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
    // Only proxy if using local backend, not production
    // When VITE_API_BASE_URL points to production, disable proxy
    proxy: (() => {
      const apiBase = process.env.VITE_API_BASE_URL || "";
      // If API_BASE is set and points to production (not localhost), don't proxy
      if (apiBase && !apiBase.includes('localhost') && !apiBase.includes('127.0.0.1')) {
        return {}; // Empty proxy config
      }
      // Otherwise, proxy to local backend
      return {
        "/api": {
          target: process.env.VITE_BACKEND_URL || "http://localhost:3000",
          changeOrigin: true,
          secure: false,
        },
      };
    })(),
  },
});
