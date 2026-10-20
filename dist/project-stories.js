/* Editorial questions are inferred from the reviewed project scope; evidence limits are preserved. */
(() => {
 'use strict';
 const stories={
  "cropdoctor": {
    "question": "How can crop-health analysis, voice access, and irrigation reasoning work together?",
    "evidence": "Supplied source reviewed; focused local Python examples were rerun on 20 October 2026. The check and its limits are shown below. Full application and field outcomes remain unverified.",
    "validation": [
      "Validate live telephony and deployed model accuracy.",
      "Measure latency and farm outcomes with real data; simulated dashboard values are not field results."
    ],
    "source_basis": "supplied_nonconfidential_design_pdf_and_project_scope_review_2026_10_20"
  },
  "nexus": {
    "question": "How can a decision keep its assumptions, possible futures, and predictions traceable?",
    "evidence": "Supplied source reviewed; focused local Python examples were rerun on 20 October 2026. The check and its limits are shown below. Full application and field outcomes remain unverified.",
    "validation": [
      "Demo modes and multiple architectural releases are present.",
      "Live AWS deployment, external anchoring, and customer outcomes were not verified."
    ],
    "source_basis": "documentation_and_representative_code_reviewed"
  },
  "cdis": {
    "question": "How can career planning use explicit evidence and decisions that can be replayed?",
    "evidence": "Supplied prototype source and documentation inspected on 20 October 2026. A focused synthetic component check passed; its limited scope is recorded with the source link.",
    "validation": [
      "Alignment scores are product rules, not hiring probabilities.",
      "Canonical release and live deployment remain to be established."
    ],
    "source_basis": "documentation_and_representative_code_reviewed"
  },
  "aletheia": {
    "question": "How can an offline tutor answer from evidence and know when to withhold an answer?",
    "evidence": "Supplied prototype source and documentation inspected on 20 October 2026. Full application behavior and real-world outcomes were not validated.",
    "validation": [
      "Offline defaults use extractive generation and lexical verification.",
      "Bundled corpora are small and synthetic; learner-effect results are simulations."
    ],
    "source_basis": "documentation_and_representative_code_reviewed"
  },
  "veritas": {
    "question": "How can engineering requirements be checked independently of an AI proposal?",
    "evidence": "Supplied source reviewed; focused local Python examples were rerun on 20 October 2026. The check and its limits are shown below. Full application and field outcomes remain unverified.",
    "validation": [
      "Published test totals were not rerun during the inventory review.",
      "Standards export features do not establish regulatory certification."
    ],
    "source_basis": "documentation_and_representative_code_reviewed"
  },
  "adaptive-learning": {
    "question": "How can teaching respond to prerequisite gaps while keeping learner memory controlled?",
    "evidence": "Supplied prototype source and documentation inspected on 20 October 2026. Full application behavior and real-world outcomes were not validated.",
    "validation": [
      "Evaluate AURA and OVAEL as their distinct implementations.",
      "Test production adapters and learning outcomes with real learners."
    ],
    "source_basis": "documentation_and_representative_code_reviewed_with_separate_ovael_v001_snapshot_syntax_and_manifest_checks"
  },
  "climaverse": {
    "question": "How can a climate scenario connect predictions to a traceable model state?",
    "evidence": "Supplied prototype source and documentation inspected on 20 October 2026. A focused synthetic component check passed; its limited scope is recorded with the source link.",
    "validation": [
      "Bundled fields are synthetic, and scenario impacts are first-order proxies.",
      "The inspected frontend is a specification; real national deployment was not established."
    ],
    "source_basis": "documentation_and_representative_code_reviewed"
  },
  "agtech-intelligence-concept": {
    "question": "What would earlier cotton-disease warnings need to be useful to farmers?",
    "evidence": "Concept documents reviewed. A working prototype and measured results have not been established by that review.",
    "validation": [
      "Discovery summary is not raw interview transcripts or independently validated field-pilot evidence.",
      "Audit readiness scores are author opinions, not YC evaluations, investment decisions, or funding evidence."
    ],
    "source_basis": "supplied_nonconfidential_design_pdf_and_project_scope_review_2026_10_20"
  },
  "attendance-tracker-pro": {
    "question": "How can teachers record attendance and students understand their subject-wise position?",
    "evidence": "Supplied prototype source and documentation inspected on 20 October 2026. Full application behavior and real-world outcomes were not validated.",
    "validation": [
      "Build and test on Android with live Firebase.",
      "Resolve authentication/session behaviour and attendance-calculation edge cases identified in the reviewed source."
    ],
    "source_basis": "documentation_and_representative_code_reviewed"
  },
  "aquagen-systems": {
    "question": "What would a modular coastal atmospheric-water system need to demonstrate?",
    "evidence": "Concept documents reviewed. A working prototype and measured results have not been established by that review.",
    "validation": [
      "Build an instrumented prototype and measure water yield and energy use.",
      "Verify water quality independently; report estimates are not measured outcomes."
    ],
    "source_basis": "supplied_nonconfidential_design_pdf_and_project_scope_review_2026_10_20"
  },
  "cognitiveos-aios": {
    "question": "How can agent memory, orchestration, and governance fit into one infrastructure layer?",
    "evidence": "Documentation and representative implementation reviewed. Runtime and field outcomes have not been established by that review.",
    "validation": [
      "Test model, storage, event-bus, and tool-service integrations end to end.",
      "Run reproducible benchmarks; supplied assessment scores are not independent performance evidence."
    ],
    "source_basis": "supplied_nonconfidential_design_pdf_and_project_scope_review_2026_10_20"
  },
  "aquacore-hydraulic-desalination": {
    "question": "Can hydraulic pressure amplification support a practical desalination design?",
    "evidence": "Concept documents reviewed. A working prototype and measured results have not been established by that review.",
    "validation": [
      "Obtain mechanical review and instrument a pressure-system prototype.",
      "Measure membrane performance and water quality; report equations are not experimental results."
    ],
    "source_basis": "supplied_nonconfidential_design_pdf_and_project_scope_review_2026_10_20"
  },
  "openmythos-extension": {
    "question": "How can an upstream recurrent Transformer be extended with training, evaluation, and serving tools?",
    "evidence": "Supplied prototype source and documentation inspected on 20 October 2026. Full application behavior and real-world outcomes were not validated.",
    "validation": [
      "No trained checkpoint files or raw benchmark/measurement logs were identified in the archive inventory.",
      "Model-size configurations and benchmark runners are code capabilities, not proof of trained models or achieved scores."
    ],
    "source_basis": "archive_inventory_and_representative_v4_source_review_with_python_syntax_check"
  },
  "timeless-animation-language": {
    "question": "How can scrolling and pointer movement carry a cinematic illustrated story?",
    "evidence": "Documentation and representative implementation reviewed. Runtime and field outcomes have not been established by that review.",
    "validation": [
      "JavaScript syntax validation does not establish correct DC runtime mounting, DOM template behavior, or functioning transitions.",
      "No browser rendering, scroll/pointer interaction, mobile testing, frame-rate measurement, or end-to-end validation was performed."
    ],
    "source_basis": "archive_inventory_and_representative_html_javascript_review_with_local_asset_checks_and_two_scene_images_visually_inspected"
  },
  "blackbox": {
    "question": "How should a reciprocal matching service ask questions and allocate introductions under incomplete information?",
    "evidence": "Conservative JavaScript engine and supplied research report inspected. The documented confirmation compares 240 paired synthetic worlds; the reported interval includes zero. Experiments were not rerun here.",
    "validation": [
      "Verify a public deployment, durable storage and browser-level application behavior.",
      "Evaluate fresh worlds before promoting the coordinated controller; simulator results do not establish real-world outcomes."
    ],
    "source_basis": "supplied_archive_engine_and_technical_report_review_2026_10_20"
  },
  "tes-website": {
    "question": "Improve discovery and navigation on an existing student community website.",
    "evidence": "Contributed to the existing TES community website; not sole authorship. GitHub confirms PR #32 and #35 were merged. Their reported test results were not independently rerun here.",
    "validation": [
      "Inspect the linked source and the stated contribution boundaries.",
      "Do not infer performance outcomes or sole authorship from repository availability."
    ],
    "source_basis": "public_repository_and_author_role_review_2026_10_20"
  },
  "gstack-elite": {
    "question": "Organize AI-assisted coding and ICPC-style practice.",
    "evidence": "Adapted from Garry Tan’s gstack, as described by the author. The inspected repository contains workflow documents and templates; no standalone runtime or measured contest improvement is established.",
    "validation": [
      "Inspect the linked source and the stated contribution boundaries.",
      "Do not infer performance outcomes or sole authorship from repository availability."
    ],
    "source_basis": "public_repository_and_author_role_review_2026_10_20"
  }
};
 function render(project,escape){
  const s=stories[project.id];if(!s)return '';
  return '<div class="case-story"><section class="case-question"><p class="eyebrow">THE QUESTION</p><h3>'+escape(s.question)+'</h3></section><section class="case-evidence"><h3>What is established</h3><p>'+escape(s.evidence)+'</p></section><section class="case-validation"><h3>Next validation</h3><ul>'+s.validation.map(x=>'<li>'+escape(x)+'</li>').join('')+'</ul></section></div>'+(window.ProjectEvidence?.render(project,escape)||'');
 }
 window.ProjectStories=Object.freeze({stories,render});
})();
