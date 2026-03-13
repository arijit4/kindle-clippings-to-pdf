import path from "path";
import { fileURLToPath } from "url";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoName = process.env.GITHUB_REPOSITORY?.split("/")[1];

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  // On GitHub Actions, build with the repository base path for GitHub Pages project sites.
  // Fallback to relative URLs for other production hosts.
  base: mode === "production" ? (repoName ? `/${repoName}/` : "./") : "/",
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
}));
