# Kindle Notes to PDF

This app is ready to deploy on GitHub Pages.

## Local development

```bash
npm.cmd install
npm.cmd run dev
```

## GitHub Pages deployment

1. Create a GitHub repository and push this code to the `main` branch.
2. In GitHub, open `Settings > Pages`.
3. Set `Source` to `GitHub Actions`.
4. Push to `main` again, or run the `Deploy GitHub Pages` workflow manually.

The Vite config automatically uses the repository name as the production base path when the app is built by GitHub Actions, so the site works under `https://<your-user>.github.io/<repo-name>/`.

## Production build

```bash
npm.cmd run build
```