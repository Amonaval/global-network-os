# Engineering Knowledge

## Purpose

This folder contains implementation knowledge.

These documents exist to help AI and engineers understand **how the platform is built**, not **what the company should build**.

Product strategy belongs in `.product`.

Company principles belong in `.company`.

This folder is implementation-focused.

---

# Reading Order

Read only what is needed.

1. MODULE_INDEX.md
2. RAG_STRATEGY.md  ← read before any retrieval or indexing change
3. ARCHITECTURE.md
4. DECISIONS.md
5. SESSION_MEMORY.md
6. GLOSSARY.md

---

# Folder Contents

## MODULE_INDEX.md

Quick navigation to the codebase.

Shows where each major capability is implemented.

Read this before exploring the repository.

---

## ARCHITECTURE.md

Complete system architecture.

Contains:

- High-level architecture
- Data flow
- Storage
- Ingestion
- Retrieval
- Confidence Gate
- AI pipeline
- Electron architecture
- Security
- Performance

Read only when architecture or implementation is required.

---

## RAG_STRATEGY.md

RAG pattern relevance map for Knowledge Hub.

Contains:

- Which RAG patterns are relevant, by customer segment
- Which are explicitly out of scope and why (including code-aware RAG)
- Current implementation status vs. evolution path
- The governing question for every RAG proposal

Read before proposing any retrieval or indexing change.

---

## DECISIONS.md

Permanent architectural decisions.

Records:

- Why decisions were made
- Alternatives considered
- Trade-offs
- Permanent constraints

Read when changing architecture.

---

## SESSION_MEMORY.md

Permanent engineering learnings.

Contains:

- Lessons learned
- Engineering discoveries
- Proven patterns
- Anti-patterns

Never use it as a conversation log.

---

## GLOSSARY.md

Definitions of engineering concepts used throughout the project.

---

# Engineering Principles

- Prefer evolution over rewrites.
- Reuse existing modules.
- Keep the architecture coherent.
- Prefer platform capabilities over isolated features.
- Simplicity compounds.
- Every architectural decision should reduce future complexity.

---

# Rule

Implementation should follow product strategy.

Architecture exists to support the product.

The product should never be constrained by accidental implementation details.