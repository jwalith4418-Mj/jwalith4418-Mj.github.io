# Architecture — two layers, one invariant

The central design decision, and the one the review pushed hardest on, is a hard
separation between **evidence** and **learning intelligence**. They are different
kinds of thing and are kept in different code, different data, and different
lifecycles.

```
┌────────────────────────── EVIDENCE LAYER ──────────────────────────┐
│  public · copyable · swappable · re-indexed when the corpus changes │
│                                                                     │
│  corpus.jsonl ──▶ HybridRetriever ──▶ Reranker ──▶ Verifier         │
│                     (BM25 + dense)     (lexical/     (lexical/NLI)   │
│  Calculus tool (SymPy, self-verifying)  cross-enc)                   │
│                                                                     │
│  Owns: correctness, grounding, abstention.  Code: aletheia/*.py     │
└─────────────────────────────────────────────────────────────────────┘
                                  │  grounds & verifies answers
                                  ▼
┌────────────────────── LEARNING-INTELLIGENCE LAYER ──────────────────┐
│  proprietary · compounding · SURVIVES a full corpus/model swap      │
│                                                                     │
│                InteractionLog  (append-only, source of truth)       │
│                        │  every structure below is a fold over it   │
│      ┌─────────────────┼─────────────────┬──────────────────┐       │
│      ▼                 ▼                 ▼                  ▼        │
│  LearnerState     Misconception     ExplanationBank    Retention    │
│  (BKT mastery)     statistics        bandit (Thompson)  scheduler   │
│      └─────────────────┴───────┬─────────┴──────────────────┘       │
│                                ▼                                    │
│                         TeachingPlanner                             │
│                Concept + LearnerState ──▶ TeachingPlan              │
│                                                                     │
│  Owns: pedagogy, personalisation, the moat.  Code: aletheia/pedagogy│
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
                    AletheiaTutor  (aletheia/adaptive.py)
        answers via the trust spine · plans via the learning layer
```

## The invariant that makes the separation real (not rhetorical)

> **Every structure in the learning layer is a deterministic projection of the
> append-only interaction log.** Nothing in it is keyed to a corpus chunk id as
> primary state.

Consequences, each mechanically enforced and tested:

1. **Corpus is swappable.** Replace `corpus.jsonl` with a new edition (different
   ids, reworded text); `ConceptGraph.rebind` re-anchors concepts by keyword and
   answers re-ground on the new evidence. Learner mastery, misconception counts,
   and explanation posteriors are **unchanged** — proven in `eval/evidence_swap.py`
   (the test *fails* if any learned statistic moves).

2. **Model is rented.** Generation, embedding, reranking, and verification sit
   behind ABCs (`aletheia/interfaces.py`); production adapters (BGE-M3,
   BGE-reranker-v2, Gemini, NLI) drop in without touching either layer
   (`aletheia/adapters.py`). A better model improves the evidence layer only.

3. **Intelligence is rebuildable.** Because models are projections, the log is the
   only thing that must be durable. Learner state, bandit posteriors, and
   misconception frequencies can be recomputed from scratch at any time — so the
   moat is the *data*, not any cached artifact.

## Why this is the leap the review asked for

The review's decisive question was: *"replace every PDF with a newer edition —
does the system get smarter automatically, or just re-index?"* A conventional RAG
re-indexes and forgets. Aletheia keeps its accumulated teaching intelligence and
re-grounds it on the new evidence, because the two were never entangled in the
first place. That is the architectural difference between *an educational
assistant* and *educational infrastructure that outlives its inputs*.

## Backward compatibility

The Phase-0 trust spine is untouched and still usable standalone (`Pipeline`,
`demo.py` moments 1–4, all original tests pass). The learning layer is strictly
additive: `AletheiaTutor` composes the existing `Pipeline` rather than replacing
it, and the optional calibrator is `None` by default.
