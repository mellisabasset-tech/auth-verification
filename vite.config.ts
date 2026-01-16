import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  base: process.env.NODE_ENV === "production" ? "/ggl-app/" : "/",
  plugins: [react()],
  root: path.resolve(__dirname, "client"),
  resolve: {
    alias: [
      { find: "@", replacement: path.resolve(__dirname, "client", "src") },
      { find: "@shared", replacement: path.resolve(__dirname, "shared") },
      { find: "@assets", replacement: path.resolve(__dirname, "attached_assets") },
    ],
  },
  build: {
    outDir: path.resolve(__dirname, "server", "public"),
    emptyOutDir: true,
    target: "esnext",
    minify: "esbuild",
  },
  server: {
    host: "0.0.0.0",
    allowedHosts: true,
    middlewareMode: false,
    cors: true,
    warmup: {
      clientFiles: ["./src/main.tsx", "./src/App.tsx"],
    },
  },
  optimizeDeps: {
    include: [
      "react",
      "react-dom",
      "react-dom/client",
      "wouter",
      "@tanstack/react-query",
      "framer-motion",
      "lucide-react",
    ],
  },
  esbuild: {
    target: "esnext",
  },
});
