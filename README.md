# Jwalith's portfolio

Two themes, Marvel and Kung Fu Panda, share projects, writing, learning records, and contact information. The arcade contains three short games. The site uses plain HTML, CSS, and JavaScript without a build step.

## Local preview

Run from this folder:

```sh
python -m http.server 8000 --directory dist
```

Open http://localhost:8000. Serve `dist` as the root; absolute asset paths will not work by double-clicking HTML files.

## Personal GitHub deployment

The deployment workflow validates pushes to `main`. Optional Pages deployment is restricted to `jwalith4418-Mj/jwalith4418-Mj.github.io`. To enable it, set Settings > Pages > Source to GitHub Actions and create the repository Actions variable `ENABLE_GITHUB_PAGES=true`.

Only `dist` is published. No Git credentials, checkout history, or Sites hosting metadata are included. A project subdirectory URL such as `/portfolio/` needs base-path changes; this package targets the personal account's root Pages site.

## Vercel deployment

Repository: https://github.com/jwalith4418-Mj/jwalith4418-Mj.github.io

Deployment: https://jwalith-portfolio.vercel.app

The initial deployment completed on 20 October 2026 through the authenticated Vercel CLI. The project is `jwalith-portfolio` in `jwalith4418-2769s-projects`. Vercel could not connect the new GitHub repository, so automatic Git deployments are not enabled yet. To connect them, open the project's Settings > Git and grant the Vercel GitHub integration access to this repository, then connect it. No source credentials belong in this repository.

`vercel.json` publishes only `dist`, uses no framework or dependency installation, and checks project resources during each build. Generated CSS bundles and script fingerprints are committed; run the three editing checks below before pushing changes. A connected Vercel project builds Git pushes automatically; branches can provide previews and the configured production branch provides production deployments.

Until Git integration is connected, deploy updates from this linked directory with `npx vercel deploy --scope jwalith4418-2769s-projects` for a preview. Use `--prod` when intentionally updating the published site.

The `.vercel` account link and local environment files are excluded from Git. Local browser captures are also excluded; the sanitized JSON measurement reports remain available in the repository.

## Source map

- `dist/index.html`: Marvel portfolio
- `dist/panda/index.html`: Panda portfolio
- `dist/content.js`: shared projects and writing
- `dist/theme-switch.js`: theme navigation and background warmup
- `dist/arcade/`: games
- `scripts/validate.py`: static source validation

## Editing projects and evidence

See [PROJECTS.md](PROJECTS.md) for the shared project schema, evidence fields, research PDF instructions, and verification checklist. Both themes read `dist/content.js`. Adding a project automatically updates category and project totals. `featured: true` selects the latest-project strip (the first featured entry wins).

Edit the original CSS files, including `dist/studio.css`, then run:

```sh
python scripts/build_styles.py
python scripts/validate.py
node scripts/check-resources.cjs
```

The manifest in `dist/styles-manifest.json` preserves CSS order. The build writes two theme bundles and updates local CSS/JavaScript cache fingerprints in the theme documents. Commit both sources and generated bundles. GitHub Actions also rebuilds and validates them before publishing `dist`.

For real browser checks, install Playwright in your development environment and use an installed Microsoft Edge browser. With the local preview server running, execute `node scripts/check-browser.cjs` and `node scripts/measure.cjs after`. Results go into `reports/`; they are not deployed. Performance results are local lab measurements, not field/Core Web Vitals certification.

See [LOCAL-WORK-REVIEW.md](LOCAL-WORK-REVIEW.md) for the current seventeen-entry evidence inventory and contribution verification. [UPGRADE-REPORT.md](UPGRADE-REPORT.md) records the initial design/performance audit and changed-file map. `FINAL-AUDIT.md` records the earlier version.

## Credits

Character artwork and reference credits remain in each theme. This is an unofficial fan-themed personal portfolio. Project status and evidence limitations are preserved.
