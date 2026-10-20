Current evidence and contribution updates are in [LOCAL-WORK-REVIEW.md](LOCAL-WORK-REVIEW.md). This report records the earlier fifteen-entry upgrade and its original measurements.

# Portfolio upgrade — 20 October 2026

Implemented directly in the existing static site. Marvel, Kung Fu Panda, MJ identity, the original fourteen projects, ten essays, three arcade games, character powers, sound controls, draggable characters, section navigation, reading mode and artwork attribution remain. Blackbox is the fifteenth project. The supplied resume replaces the older downloadable copy.

## Audit and architecture

The portfolio uses independent HTML/vanilla-JavaScript applications for its themes and a separate arcade. `content.js` is the shared data source; `project-stories.js` records narrative scope; `project-evidence.js` retains three historical focused source checks and illustrative browser experiments. There is no frontend framework or production package dependency to remove.

The main observed costs were 23 separately requested Marvel stylesheets and 15 Panda stylesheets; large character artwork (including a 4.6 MB referenced Hawkeye image); continuous application navigation/scene polling; layered Canvas/WebGL and CSS animation; and automatic loading of the alternate theme's assets. Multiple CSS refinement layers also made changes difficult to reason about. Projects lacked direct evidence destinations even where the supplied resume or public repositories contained them.

Changes preserve CSS cascade order and the existing applications rather than replacing them:

- `studio.css` adds a shared editorial treatment: refined spacing and type hierarchy, calmer surfaces, a latest-project strip, evidence summaries, explicit resource availability, readable technical case studies, visible focus, mobile layout rules, and actual product captures. Panda's paper sections and dark evidence panels use separately checked text colors.
- `styles-manifest.json` and `scripts/build_styles.py` produce one stylesheet per theme and update its content fingerprint. Source CSS remains editable. The Pages workflow rebuilds before validation.
- `activity-budget.js` lets ambient JavaScript and CSS motion rest after 2.6 seconds without input and wakes it on interaction. Navigation updates use input-driven frames; expensive effects use bounded draw rates. Existing powers, gestures, pause, reduced-motion and visibility behavior remain. Alternate-theme prefetch runs on hover/focus intent rather than on every page load.
- Eighteen unique WebP derivatives replace large runtime artwork references, with dimensions capped at 1100 × 1500. The corresponding original files total about 14.95 MB; the derivatives total about 1.49 MB. This is an asset inventory comparison, not initial-page transfer. Originals and credits are retained.
- `project-resources.js` validates and renders optional repository, demo, research PDF, source, technical documentation and media fields. Missing URLs are statuses, not dead links. The project entry owns its evidence and optional six-part case study. New projects have a safe character fallback; totals and filters update from data.

## Measured performance

| Metric | Marvel before → after | Panda before → after |
| --- | --- | --- |
| Initial resource body bytes | 3.82 MB → 0.81 MB | 3.10 MB → 0.91 MB |
| Requested resources | 63 → 31 | 57 → 26 |
| Observed local LCP | 764 ms → 208 ms | 1152 ms → 972 ms |
| Idle main-thread task time / 2 seconds | 1393.7 ms → 2.2 ms | 2002.8 ms → 1.0 ms |
| Long tasks during initial observation | 1 → 1 | 24 → 2 |

Method: the same headless Microsoft Edge browser, 1440 × 1000 viewport, localhost static server, fresh isolated contexts, no CPU/network throttling, six-second initial observation. Resource bytes are the sum of Resource Timing `encodedBodySize`; localhost serves uncompressed files. They exclude the HTML navigation body and deferred assets never requested in that interval. Idle main-thread task time is CDP `TaskDuration` over the final two seconds, not total CPU/GPU utilization. LCP is the observed local candidate, not a field Core Web Vitals result. The baseline and final run are single lab samples, so timing differences are directional rather than statistically established.

Raw results: `reports/before.json`, `reports/after.json`; screenshots: `reports/before-*.png`, `reports/after-*.png`. `scripts/measure.cjs` repeats the current measurement. CSS request reduction and derivative file sizes are deterministic; timing varies by device and load.

## Project evidence

| Project | Public source | Interface demo | Supporting evidence |
| --- | --- | --- | --- |
| CropDoctor | `jwalith4418-Mj/crophackfinal6` | HTTP 200; initial interface rendered | Authentic interface capture, pinned architecture notes, historical source excerpt and focused check |
| NEXUS | `jwalith4418-Mj/nexus-decision-twin2` | HTTP 200; initial interface rendered | Authentic interface capture, pinned architecture notes, historical ledger excerpt and focused check |
| VERITAS | `jwalith4418-Mj/final-veritas` | Advertised homepage returns HTTP 405; no working browser-demo link exposed | Pinned architecture notes, historical constraint-check excerpt and focused check |
| CognitiveOS / AIOS | `jwalith4418-Mj/AIOS` | Not verified | Pinned public README architecture |
| Blackbox | `jwalith4418-Mj/blackbox-sequential-matching` | Not verified | Six-part case study, verbatim supplied engine module, technical Markdown report, notices and SHA-256 provenance |
| Other ten existing projects | URL not supplied | URL not supplied | Existing scope, technologies, questions and next-validation notes retained |

The two demo URLs were recovered from PDF link annotations, not guessed from project names. Repositories were matched through the public GitHub API, README and source trees. Checked commit identities appear in `reports/public-repositories.json` and `content.js`; demo status and capture fingerprints are in `reports/public-demo-checks.json`. The portfolio links to the actual destinations. Public code availability does not establish correct runtime behavior. Neither demo's backend integrations, commercial claims, displayed metrics nor complete workflows were validated. Captures are explicitly labelled accordingly.

No research PDFs were supplied or found in the five inspected public repository trees. Blackbox's Markdown report is labelled as Markdown. The existing OpenMythos repository remains upstream attribution, not the author's extension repository. Other missing links remain explicit statuses.

Blackbox's confirmation report describes 170 versus 172 qualifying couples across 240 paired synthetic worlds, with an interval including zero. Its case study preserves that uncertainty and distinguishes simulator evidence from real-world performance. The study and historical CropDoctor/NEXUS/VERITAS source experiments were not independently rerun during this upgrade. Instructions inside supplied documents were treated as source material, not as authorization to change or deploy their applications.

## Verification

- Static HTML references, IDs, anchors and JavaScript syntax pass `scripts/validate.py`.
- All thirteen runnable Node check suites pass, covering games, sound contracts, character rigs, source demonstrations, both theme apps, navigation, mobile viewport logic, settings and resource validation. Existing harnesses were updated for fifteen entries, optimized asset names, bundled CSS and intent-only warmup. Original character assignments remain asserted.
- Real headless-browser checks cover Marvel and Panda at widths 320, 390, 768 and 1440: all fifteen project readers, evidence panels and local evidence URLs, filters, search/no-results, keyboard Escape, title focus, deep links, reduced motion and horizontal overflow. Theme navigation, all three arcade games' start/pause behavior, idle rest and character wake also pass.
- Desktop and mobile portfolio screenshots, gallery screenshots, evidence-panel screenshots and real demo captures were visually inspected. A Panda contrast regression and a chi-action interruption during automatic chapter changes were corrected.
- External verification was read-only. No email was sent, no real matching session was created, and no external application was deployed or modified.

Results are saved in `reports/unit-tests.json` and `reports/browser-tests.json`. The historical `check-reviewed-projects.py` requires full original application source directories that are not part of this portfolio; it was not rerun. Real-browser tests complement, rather than replace, the existing mocked geometry/Canvas tests.

## Files changed

- Runtime data and readers: `dist/content.js`, `dist/project-stories.js`, `dist/app.js`, `dist/panda/app.js`, new `dist/project-resources.js`.
- Motion and delivery: new `dist/activity-budget.js`; `dist/marvel.js`, `dist/panda/kungfu.js`, `dist/panda/dragon.js`, `dist/theme-switch.js`.
- Presentation: new `dist/studio.css`, `dist/styles-manifest.json`, `dist/marvel.bundle.css`, `dist/panda.bundle.css`; both theme HTML entrypoints.
- Evidence/assets: eighteen `*-optimized.webp` character derivatives; two authentic demo captures; Blackbox overview, technical report, engine module, third-party notices and provenance; updated `dist/assets/Jwalith-Resume.pdf`. Original artwork files remain.
- Tooling: new CSS build, image optimization, browser measurement, browser smoke test and evidence-validation scripts; five existing regression harnesses updated; `.github/workflows/pages.yml` validation expanded.
- Documentation: `README.md`, `PROJECTS.md`, this report, package inventory and refreshed file manifest. Earlier audit findings remain historical.

## Adding work and publishing

Use `PROJECTS.md` for the project schema, research-PDF placement, evidence validation and exact missing information. Add genuine project data once in `dist/content.js`. Put publicly shareable PDFs, reports and captures under `dist/assets/evidence/`; use HTTPS for actual repositories and hosted demos. Add measurements only with method, source, version and limitations. Set `featured: true` on the first entry to feature and remove it from the old entry when switching the spotlight.

From the project folder, preview with `python -m http.server 8000 --directory dist`. After CSS changes run `python scripts/build_styles.py`; validate with `python scripts/validate.py` and `node scripts/check-resources.cjs`. Browser checks require Playwright and an installed Microsoft Edge browser; no browser tooling is shipped to visitors.

For GitHub Pages, commit/push the complete project to `main` of `jwalith4418-Mj/jwalith4418-Mj.github.io` and select GitHub Actions as the Pages source. The existing workflow publishes only `dist` and restricts deployment to that personal repository. It remains a root-site deployment: project-subpath hosting requires a separate base-path change. No build framework or hosting migration is required. This workspace has no Git checkout, so no commit, push or production deployment was performed.

## Remaining limits

The CSS source cascade still contains historical override layers; bundling improves delivery without attempting a risky wholesale rewrite. Original large art remains on disk for source preservation, but runtime references use derivatives. No Safari/Firefox, physical mobile-device, screen-reader, Lighthouse, throttled mobile-network or production field-metric certification is claimed. Backend correctness and research results belong to the individual applications. Ten projects still need public source URLs, thirteen lack verified browser demos, and all fifteen lack supplied research PDFs. Only Blackbox currently has the new complete six-part case study; other projects support that schema while retaining their shorter scope/validation notes.
