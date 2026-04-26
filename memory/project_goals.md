---
name: Ez.Ord Project Goals and Architecture
description: Project purpose, database status, game targets, and why key decisions were made
type: project
---

**Purpose:** Support Icelandic words for custom board games, enabling kids learning Icelandic to play games with translations

**Database Status:**
- Icelandic dictionary database is populated with nearly all words in the Icelandic dictionary
- Words are accessible for game implementations

**Architecture Decisions:**
- Monorepo (app + api) kept together for ease of deploying SPA to Azure
- Clean architecture approach
- GitHub Actions pipeline (managed by Azure) → Azure Static Web Apps deployment

**Current Implementation Status:**
- API endpoints exist but full API integration may not be fully implemented yet
- Frontend can call backend endpoints, but some game logic may still be client-side only

**Game Targets (not yet implemented):**
Multiple game types to enable Icelandic learning for kids:
1. Drawing games (Pictionary-style)
2. Scrabble-like word game
3. Word explanation games
4. Acting/charades games

All should fetch Icelandic words from the API/database for gameplay.
