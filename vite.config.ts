import path from "path";
import { fileURLToPath } from "url";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { viteSingleFile } from "vite-plugin-singlefile";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const githubRepositoryName = process.env.GITHUB_REPOSITORY?.split("/")[1];

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  base:
    mode === "production" && githubRepositoryName
      ? `/${githubRepositoryName}/`
      : "/",
  plugins: [react(), tailwindcss(), viteSingleFile()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
}));
