# Projects and evidence

Both portfolio themes use `dist/content.js`. Add an object to `window.PORTFOLIO.projects`; do not edit gallery HTML or duplicate it in the Panda app. Use an immutable, unique, lowercase `id` for shared deep links such as `/?theme=marvel#project/blackbox` and `/panda/index.html?theme=panda#project/blackbox`.

```js
{
  id: "your-project-id",
  number: "18",
  name: "Your actual project name",
  displayName: "Your actual project name",
  category: "Your discipline",
  group: "ai", // ai | engineering | concept | creative
  summary: "What you built, who it serves, and its actual scope.",
  stage: "Prototype", // accurately describe its current state
  scope: "What has been tested and what is still unverified.",
  highlights: ["Implemented capability"],
  stack: ["Actual technology"],
  demo_url: null,
  repository_url: null,
  evidence: {},
  caseStudy: {
    Problem: "The problem and context.",
    Architecture: "Actual components and how data moves between them.",
    Implementation: "Your implementation and contribution.",
    Challenges: "Tradeoffs and decisions.",
    Results: "Measured results with method, source and limitations, or state unmeasured.",
    Limitations: "Known limits and next validation."
  }
}
```

This is an editing example, not a project to publish unchanged. Project/filter totals are derived from the array. Keep `number` unique and update it when deliberately reordering projects. Optional `featured: true` places the first such project in the latest-work strip; remove it from the previous featured entry to replace it. Optional `character` can select an existing Marvel character ID from `app.js`; otherwise a new project uses Iron Man. Original project character mappings remain stable. Panda generates its conceptual illustration automatically. Illustrations are never labelled product screenshots.

## Evidence fields

Each resource has an optional `url`, `label`, `note`, and `status`. Missing URLs render as plain status text. Supported keys are `repository`, `demo`, `research`, `source`, `report`, and `media`. Use `caseStudy` on the project for the inline technical case study. The existing `repository_url` and `demo_url` fields remain compatible; prefer `evidence` for new entries. An upstream repository belongs under `attribution`, not under your project's repository.

For example, after verifying your real files and destinations:

```js
evidence: {
  repository: { url: "https://github.com/YOUR-ACCOUNT/YOUR-REPO", label: "Browse source" },
  demo: { status: "Deployment URL not verified" },
  research: { url: "/assets/evidence/your-project-research.pdf", label: "Read research PDF", note: "Version and date; evaluation scope." },
  source: { status: "Full source not supplied" },
  media: { url: "/assets/evidence/your-project-walkthrough.mp4", label: "Watch product capture", note: "Record the actual application and describe the tested version." }
}
```

Do not add the example URLs until replaced with real resources. HTTPS external URLs and local `/assets/evidence/` paths are supported. Use lowercase hyphenated filenames without spaces. Links open directly; media is not downloaded or autoplayed by the portfolio.

## Adding a research PDF

1. Review the actual PDF for accuracy, author attribution, private information and whether reported numbers are measured or proposed.
2. Copy it to `dist/assets/evidence/<project-id>-research.pdf`. Keep a stable filename or version it deliberately.
3. Set that project's `evidence.research` URL, a useful label, and a scope/version note. A Markdown report belongs under `report`; never label it a PDF.
4. Run `node scripts/check-resources.cjs` and `python scripts/validate.py`. Open the resource from each theme's project reader. Verify external resources manually and note their actual availability; a URL alone does not establish working behavior.

## Current evidence and remaining needs

The portfolio now contains seventeen entries, sixteen six-part case studies, seven public repository links, three reachable interface demos, five research/design PDFs, twelve source/contribution links and three media links. See [LOCAL-WORK-REVIEW.md](LOCAL-WORK-REVIEW.md) for exact scope and provenance.

Five non-confidential source PDFs are attached: CropDoctor’s team report, early AgTech customer discovery, the CognitiveOS founding deck, a coastal AWG engineering study and an early related desalination concept. Estimates, strategy claims and proposed targets are explicitly distinguished from tested outcomes. An ISRO hackathon participation PDF is a supporting credential, not a research result.

CDIS, Aletheia, OVAEL, CLIMAVERSE, AttendanceTrackerPro and OpenMythos now expose selected prototype source. CDIS scoring and CLIMAVERSE ledger checks are documented as focused synthetic examples. Existing CropDoctor, NEXUS and VERITAS source checks were rerun against the local files. These do not establish full application correctness.

TES is a collaborative contribution entry, supported by two independently checked merged PRs. GStack Elite is an attributed workflow adaptation; Claude Code, Codex and Antigravity usage is author-reported, not a certification or measured contest achievement.

Ten projects still need public repository URLs and fourteen need verified browser demos. MEDHA and CAMPUSLY require implementation and source details before adding evidence-backed entries. Keep upstream authorship separate from your modifications; do not treat a fork as proof of sole ownership.

## Supporting resources and source provenance

Use `supportingResources: [{url, label, note}]` for additional documents, component-check records, certificates or license notices. The reader renders these below the main evidence panel. Keep participation credentials out of the research-PDF field. A report’s displayed source should accurately describe whether it is a design, pitch, experiment or measured result.

`dist/assets/evidence/local-evidence-provenance.json` records curated source paths, file sizes, scopes and SHA-256 hashes. `scripts/collect_local_evidence.py --hackathon-root PATH --research-root PATH` copies only its reviewed allowlist, retaining original files. Re-review content before changing that allowlist. Confidential audits are excluded. Do not copy whole work directories or `.env`, database and runtime files into `dist`.

The two themes continue to share `dist/content.js`; no new runtime framework or automatic PDF loading was added. Rebuild CSS after editing styling and run the static/resource checks before publishing.
