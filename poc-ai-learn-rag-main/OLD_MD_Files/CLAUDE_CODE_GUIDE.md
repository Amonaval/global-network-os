# How to Continue This Work Using Claude Code
# Complete guide — read this once, keep it handy.

## Why switch to Claude Code

This conversation is now ~200,000+ tokens. Every message re-sends the entire history.
A simple "fix this one line" question costs as much as 50 pages of context.

Claude Code (CLI) works differently:
- Reads only the files relevant to your question
- CLAUDE.md gives it project context without re-sending chat history
- It can run actual commands (npm run ingest, node --check) and see real output
- /compact collapses long sessions when they get heavy
- You pay per actual token, not per "entire conversation history"

---

## Step 1: Install Claude Code

```bash
npm install -g @anthropic-ai/claude-code
```

Requires Node.js 18+. Verify:
```bash
claude --version
```

You'll need an Anthropic API key (separate from Claude.ai subscription):
- Go to: https://console.anthropic.com
- Create an API key
- Set it: export ANTHROPIC_API_KEY=sk-ant-...
  Or add to your shell profile (~/.bashrc, ~/.zshrc, ~/.profile)

---

## Step 2: Place the CLAUDE.md files



Claude Code automatically reads CLAUDE.md when you start a session in that directory.
CONVERSATION_HISTORY.md is there if Claude ever needs deeper context (you can ask it
to read the file manually).

---

## Step 3: Start a Claude Code session

```bash
cd D:\AI\XYZ_ORG AI\docportal\knowledge-docs-rag

claude
```

First thing Claude Code does: reads CLAUDE.md. It now knows:
- What the project is
- The full architecture
- All decisions made
- Known issues
- What's done and what's not

You don't need to explain anything. Just ask:
```
Fix the chunk size warning in ingest.js
```
or
```
The diagnose command isn't showing BM25 scores. What's wrong?
```

---

## Step 4: Essential Claude Code commands

### During a session:

`/context` — shows current token usage
```
Context: 12,400 tokens (of 200,000 max)
```
Check this before long tasks. If it's above 80k, use /compact.

`/compact` — summarizes the session, clears old context, keeps decisions
```
> /compact
Compacted 45,000 tokens → 3,200 tokens summary
```
Use this when a session has been going for a while and you're switching tasks.

`/clear` — wipes the session entirely, fresh start
Use when you want to start a completely new topic.

`/doctor` — checks your setup (API key, node version, permissions)

### File operations Claude Code does automatically:
- Reads any file you reference: "look at src/ingestion/ingest.js"
- Runs commands and shows output: "run npm run ingest and show me the errors"
- Makes targeted edits (not rewriting entire files)
- Checks its own edits work: "node --check src/rag/query.js"

---

## Step 5: Recommended workflow for changes

### For a bug fix:
```
I'm getting this error when running npm run ingest:
[paste error]

The relevant file is src/ingestion/ingest.js. Fix it.
```
Claude Code reads the file, makes a targeted fix, shows you the diff before applying.

### For a new feature:
```
Add a --dry-run flag to the ingest command that shows how many chunks would be
created per page without actually embedding or storing anything.
```
Claude Code reads the relevant files, implements the change, can run tests.

### For debugging retrieval quality:
```
Run: node src/rag/diagnose.js "Standard Offerings Personalization Options" --section document-management-system
Show me the output and explain what's wrong.
```
Claude Code runs it, reads the output, diagnoses the problem.

### For understanding something:
```
Explain how the confidence gate works and what value I should set it to.
```
Claude Code reads CLAUDE.md + query.js, gives you a precise answer.

---

## Step 6: Specific tasks for each project

### Doc Portal RAG (XYZ_ORG-rag) — what to tackle next

**Priority 1: Verify table extraction is working**
```bash
cd XYZ_ORG-rag
claude
# In session:
Run: node src/rag/inspect docs/document-management-system/003_standard-offerings-personalization-options.html
Tell me if the table is being extracted correctly. The table has columns:
"Use Case | Standard OOTB Offerings | Personalization Options"
```

**Priority 2: Test the full pipeline**
```bash
# In session:
Run: npm run diagnose "List Standard Offerings and Personalization Options" --section document-management-system
Explain what the output shows and whether retrieval is working correctly.
```

**Priority 3: Switch to qwen2.5:3b if not already done**
```bash
# In session:
Update .env to use OLLAMA_MODEL=qwen2.5:3b and test a sample question.
```

### Confluence RAG v2 (cr2) — what to tackle next

**Priority 1: Complete the setup**
```bash
cd cr2
# First do these manually:
npm install
node scripts/setup.js
# Edit .env — add CONFLUENCE_API_TOKEN

claude
# In session:
I need to crawl the EQ and RSRA spaces. My .env has the token set.
Run: npm run crawl -- --space EQ
Show me the output and tell me if it worked.
```

**Priority 2: Ingest and verify**
```bash
# After crawl completes:
Run: npm run ingest -- --space EQ
Then: npm run status
Show me the output.
```

**Priority 3: Test the hallucination fix**
```bash
# After server is running:
Test these two questions and verify the confidence gate works:
1. "What is NextGen Visualization?" (should say NOT in EQ, suggest RSRA)
2. "What is the Agentic AI flow?" (should answer from EQ)
```

---

## Step 7: Managing context efficiently

### Use specific file references
Instead of: "fix the memory issue"
Say: "in src/api/server.js, the session history isn't being saved correctly after restart"

### Paste errors exactly
```
Getting this error:
Error: ENOENT: no such file or directory, open 'data/sessions.json'
    at Object.openSync (node:fs:...)
    at src/api/server.js:12
```
Claude Code can read the line directly.

### Batch related changes
Instead of separate sessions for each small change, describe them together:
"Make these three changes to ingest.js:
1. Add progress bar showing % complete
2. Log chunk count per page to console
3. Write a summary line at the end with total time"

### Use /compact between major tasks
After fixing a bug, before starting a new feature:
```
/compact
Now let's work on adding streaming responses to the server.
```

---

## Step 8: When you need to reference old decisions

If Claude Code asks "why is this done this way?", you can say:
```
Read CONVERSATION_HISTORY.md in this directory and look for the decision
about [topic]. Explain the reasoning.
```

Or quote directly:
```
From the conversation history: "TF-IDF scores are in range 0.03-0.15.
Nomic scores are 0.20-0.60+. MIN_CHUNK_SCORE and CONFIDENCE_GATE must
be tuned per provider."
Can you verify our current .env settings are correctly calibrated for nomic?
```

---

## Quick reference card (keep this open)

```
Start session:       cd <project> && claude
Check tokens:        /context
Compact session:     /compact
Clear session:       /clear
Check setup:         /doctor

Read a file:         "look at src/rag/query.js"
Run a command:       "run npm run ingest and show output"
Fix a bug:           "in [file], fix: [paste error]"
Add feature:         "add [feature] to [file]"
Understand code:     "explain how [thing] works in [file]"

Reference history:   "read CONVERSATION_HISTORY.md and tell me why X was done"
Reference spec:      "read CLAUDE.md section on [topic]"
```

---

## If Claude Code doesn't know something

It won't have memory of this conversation. If it's confused about a decision:
1. Point it to CLAUDE.md: "Read the CLAUDE.md section on [topic]"
2. Point it to CONVERSATION_HISTORY.md for deeper context
3. The code itself is the best documentation — ask it to read the relevant files

---

## Keeping CLAUDE.md up to date

After significant changes, update CLAUDE.md. In Claude Code:
```
We just made these changes:
1. Added streaming responses to server.js
2. Changed CONFIDENCE_GATE default to 0.25
3. Added --dry-run flag to ingest

Update CLAUDE.md to reflect the current state.
```
Claude Code will make targeted updates to the file.

---

## File structure summary

After following this guide, your projects should look like:

```
XYZ_ORG-rag/
├── CLAUDE.md                 ← Claude Code reads this automatically
├── CONVERSATION_HISTORY.md   ← Reference if Claude needs context
├── src/
├── public/
├── docs/                     ← git-ignored
├── data/                     ← git-ignored
└── .env                      ← git-ignored, NEVER commit

cr2/
├── CLAUDE.md                 ← Claude Code reads this automatically
├── CONVERSATION_HISTORY.md   ← Reference if Claude needs context
├── src/
├── public/
├── spaces/                   ← git-ignored
├── data/                     ← git-ignored
└── .env                      ← git-ignored, NEVER commit
```

You can now delete this chat conversation. Everything needed to continue is in those files.
