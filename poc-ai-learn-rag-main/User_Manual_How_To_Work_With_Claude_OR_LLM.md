##User manual for working with claude optimally


Shall i exit this session and start new mission in new session to save the tokens or just do /compact and continue or simply continue. What will give best results with optimal token usage ?

Start a new session. Here's the reasoning:

Why not /compact: It compresses conversation history into a summary, but that summary is a degraded version of what's already captured cleanly in the .md files. You'd be paying tokens for a worse version of knowledge you already have structured.

Why not continue: This session is long. Every turn now costs tokens re-reading all the prior implementation detail, intermediate steps, and back-and-forth that isn't needed for the next mission.

Why new session is best: The .md system was designed exactly for this. We just updated everything:
- SESSION_MEMORY.md — lessons and patterns
- WORK_QUEUE.md — Decision Graph under evaluation is NOW
- PROGRESS.md — honest current state
- 03_CLAUDE_RULES.md — checkpoint process is now a rule
- 04_NEXT_MISSION.md — Decision Graph evaluation

A new session loads Stage 1 + Stage 2 context from those files and starts sharp, with exactly the right knowledge and no noise from this conversation.

One thing to do before you go: The product docs for Gaps and Memory were just created but there's no index pointing to them. Let me add that quickly: