import path from "path";
import { fileURLToPath } from "url";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  // Use relative URLs in production so the built HTML works from any GitHub Pages repo path.
  base: mode === "production" ? "./" : "/",
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      input: {
        index: path.resolve(__dirname, "index.html"),
        app: path.resolve(__dirname, "src/main.tsx"),
      },
      output: {
        entryFileNames: chunkInfo => {
          if (chunkInfo.facadeModuleId?.endsWith("src/main.tsx")) {
            return "assets/app.js";
          }

          return "assets/[name].js";
        },
        chunkFileNames: "assets/[name].js",
        assetFileNames: assetInfo => {
          if (assetInfo.names?.some(name => name.endsWith(".css"))) {
            return "assets/app.css";
          }

          return "assets/[name][extname]";
        },
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
}));
