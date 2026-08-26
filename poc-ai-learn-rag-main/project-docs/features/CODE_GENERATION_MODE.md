# Code Generation Mode (Level 2)

## Status: Shipped

## Summary

Knowledge Hub can now ingest code files and generate new code that matches your codebase's patterns, conventions, and architecture. Users upload their source files, describe a feature in plain language, and the app retrieves the most relevant code context to generate matching implementation.

## What Was Built

### Backend

**`src/ingestion/extractors/code.js`**
- Extracts and structures code files for indexing
- Detects language from extension (`.js`, `.ts`, `.py`, `.go`, `.java`, `.rs`, `.cpp`, `.cs`, and more)
- Splits files into function/class-level blocks for finer retrieval granularity
- Each block is prefixed with `[File: name.js]\n[Language: javascript]` metadata for LLM context

**`src/rag/codegen.js`**
- Code generation engine built on the same RAG pipeline as the chat
- Retrieves top-K code chunks using embedding + BM25 hybrid search
- Larger context budget (3000 tokens) and output budget (2048 tokens) vs. chat
- Specialized system prompt: instructs LLM to match naming conventions, module patterns, error handling, import style
- Supports streaming (Ollama / Claude / vLLM)
- Generates code + Integration Notes (which files to edit, what to import)
- Logs to `data/codegen_log.jsonl`

**`src/api/server.js`**
- Extended upload middleware to accept all major code extensions
- Routes code files through `extractFromCode` instead of generic text extractor
- New endpoint: `POST /api/code/generate` — streams generated code via SSE

### Frontend

**`frontend/src/components/chat/BuildPanel.tsx`**
- New "Build Mode" panel accessible from the primary nav bar
- Feature spec textarea with Ctrl+Enter shortcut
- Optional language hint dropdown
- Streaming output with auto-scroll, copy button
- Context files used with relevance scores
- Debug info: chunk count, token budget, latency, provider

**Navigation**
- "⚙️ Build" added to primary nav (alongside Chat and Intelligence)
- Upload panel hint text updated to show code file support

## Supported Code Extensions

`.js` `.jsx` `.ts` `.tsx` `.py` `.rb` `.go` `.java` `.rs` `.cpp` `.c` `.cs` `.php` `.swift` `.kt` `.sh` `.yaml` `.yml` `.json` `.sql`

## How to Use

1. Open **Upload** panel → drag your code files (e.g., `server.js`, `query.js`, entire modules)
2. Open **Build** tab from primary nav
3. Describe the feature you want to build (be specific about inputs, outputs, and where it fits)
4. Optionally select a language hint
5. Click **Generate Code** (or Ctrl+Enter)
6. Copy the generated code, review the Integration Notes for wiring instructions

## Model Recommendation

For best results, use a code-specialized model:
- Ollama: `ollama pull qwen2.5-coder:7b` or `deepseek-coder:6.7b`
- Set `OLLAMA_MODEL=qwen2.5-coder:7b` in `.env`

General models (qwen2.5:3b) work but produce lower-quality code for complex tasks.

## Architecture Alignment

This feature represents the **Engineering Automation** phase of the company vision:

```
Documentation Search
→ Knowledge Platform          ✔ shipped
→ Engineering Intelligence    ✔ shipped
→ Engineering Automation      ← THIS FEATURE
→ Engineering Operating System
→ AI Company Operating System
```

The core insight: the RAG pipeline already knows how to retrieve relevant context. Code generation is the same pattern with a different system prompt and output format. The codebase itself becomes the training data for generating codebase-consistent code.

## Known Limitations

- No multi-file generation (single-shot output only)
- No automatic file writing — user must copy and paste
- Code quality depends heavily on model capability (see Model Recommendation)
- Chunking by function boundaries is heuristic — complex files may not split cleanly
- Large files (>50 MB) not supported (upload limit)

## Next Evolution (Level 3)

- Agentic loop: plan → retrieve → generate → validate → write to file
- Multi-file generation with dependency awareness
- Code review mode: upload PR diff, get architectural feedback
- Test generation: given implementation, generate matching tests
