# Knowledge Hub — VS Code Extension

Ask questions about your team's documentation without leaving the editor.

## Features

- **Sidebar chat panel** — type a question, get an answer from your Knowledge Hub instance
- **Ask about selection** — right-click any selected code or text to ask about it
- **Intelligence store integration** — every query enriches your org's Intelligence Density Score

## Requirements

A running [Knowledge Hub](https://github.com/knowledge-hub) server instance (local or hosted).

## Extension Settings

| Setting | Default | Description |
|---|---|---|
| `knowledgehub.serverUrl` | `http://localhost:3000` | URL of your Knowledge Hub server |
| `knowledgehub.defaultSection` | _(empty)_ | Filter responses to a specific documentation section |

## Getting Started

1. Install the extension from the VS Code Marketplace
2. Open the Knowledge Hub panel from the Activity Bar (book icon)
3. Set your server URL in VS Code Settings → Knowledge Hub → Server URL
4. Ask a question

## Using Ask about Selection

Select any text in the editor, right-click, and choose **Knowledge Hub: Ask about selection**. The selected text is sent to your Knowledge Hub instance as a question.
