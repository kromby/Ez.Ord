# Ez.Ord Game Flow and API Design

**Date:** 2026-04-26  
**Status:** Design Phase

## Overview

Ez.Ord enables Icelandic word learning through multiplayer word games (drawing, Scrabble, word explanation, acting). This document specifies the game flow, API contract, and data model for the core game experience: selecting a game type, playing rounds with word cards, rating word difficulty in context, and optionally skipping words.

**Architecture Principle:** The app is a thin client; the API owns all game state and logic. This enables future features (resumable games, analytics, adaptive difficulty) and ensures consistency across platforms.

---

## Data Model

All data is stored in Azure Table Storage. The word dictionary is pre-populated via the existing wordImporter.

### Words Table
**Existing table, extended with usage tracking:**

| Field | Type | Purpose |
|-------|------|---------|
| PartitionKey | string | wordEntity.Type (category: noun, verb, adjective, etc.) |
| RowKey | string | Word ID (UUID) |
| Word | string | Icelandic word text |
| Category | string | Part of speech |
| usage_count | int | Total times this word has been drawn across all games |
| rating | float | Aggregate difficulty rating (calculated from WordRatings table) |
| Timestamp | datetime | Last updated |

### Games Table
**Tracks game sessions.**

| Field | Type | Purpose |
|-------|------|---------|
| PartitionKey | string | `game_{gameType}` (e.g., "game_drawing", "game_scrabble") |
| RowKey | string | Game ID (UUID) |
| started_at | datetime | When game was created |
| ended_at | datetime | When game was ended (null if active) |
| categories | string (JSON) | Array of selected category IDs |
| user_id | string | Nullable, reserved for future multi-user support |
| Timestamp | datetime | Last updated |

### GameWords Table
**Links games to the words drawn in them.**

| Field | Type | Purpose |
|-------|------|---------|
| PartitionKey | string | Game ID (FK to Games.RowKey) |
| RowKey | string | Sequence number (order word was drawn: 0, 1, 2, ...) |
| word_id | string | Word ID (FK to Words.RowKey) |
| word_text | string | Denormalized word (for easy retrieval) |
| category | string | Denormalized category |
| drawn_at | datetime | When word was drawn |
| Timestamp | datetime | Last updated |

### WordRatings Table
**Logs every rating and skip event for analytics and adaptive difficulty.**

| Field | Type | Purpose |
|-------|------|---------|
| PartitionKey | string | Word ID (FK to Words.RowKey) |
| RowKey | string | Game ID (FK to Games.RowKey) |
| difficulty | string | Rating value: "easy", "medium", "hard", "skipped" |
| game_type | string | Game type when rated (drawing, scrabble, word_explanation, acting) |
| rated_at | datetime | When rating was submitted |
| Timestamp | datetime | Created |

---

## API Endpoints

### Game Management

#### POST /api/games/start
**Creates a new game session.**

**Request:**
```json
{
  "game_type": "drawing|scrabble|word_explanation|acting",
  "categories": ["uuid1", "uuid2", ...]
}
```

**Response:**
```json
{
  "game_id": "uuid",
  "game_type": "drawing",
  "categories": ["uuid1", "uuid2"],
  "started_at": "2026-04-26T10:00:00Z"
}
```

**Behavior:** Creates Games table entry. Returns game_id for subsequent requests.

---

#### GET /api/games/{game_id}/next-word
**Retrieves the next random word from the game's selected categories.**

**Response:**
```json
{
  "word": "hús",
  "category": "noun",
  "word_id": "uuid"
}
```

**Behavior:**
1. Select random word from categories specified in Games table for this game_id
2. Increment word's usage_count
3. Create GameWords entry with sequence_number = current count of GameWords for this game
4. Return word + category
5. If no words available, return 404 or error

**Note:** The API does not validate game_type or enforce rules. The app displays the word; user plays according to game type.

---

#### POST /api/games/{game_id}/rate-word
**Logs a difficulty rating for a word in the context of the current game.**

**Request:**
```json
{
  "word_id": "uuid",
  "difficulty_rating": "easy|medium|hard"
}
```

**Response:**
```json
{
  "success": true
}
```

**Behavior:**
1. Create WordRatings entry: PartitionKey=word_id, RowKey=game_id
2. Store: difficulty, game_type (from Games table), rated_at
3. Recalculate Words.rating aggregate (optional, can be async/batch job)

---

#### POST /api/games/{game_id}/skip-word
**Logs that a user skipped a word without playing.**

**Request:**
```json
{
  "word_id": "uuid"
}
```

**Response:**
```json
{
  "success": true
}
```

**Behavior:**
1. Create WordRatings entry: difficulty="skipped", game_type from Games table
2. GameWord entry is still created (word was drawn, just skipped)

---

#### POST /api/games/{game_id}/end
**Closes the game session.**

**Response:**
```json
{
  "game_id": "uuid",
  "ended_at": "2026-04-26T10:15:00Z",
  "word_count": 12
}
```

**Behavior:** Set Games.ended_at timestamp. Return game summary.

---

#### GET /api/games/{game_id}
**Retrieves full game details including all words played.**

**Response:**
```json
{
  "game_id": "uuid",
  "game_type": "drawing",
  "categories": ["uuid1"],
  "started_at": "2026-04-26T10:00:00Z",
  "ended_at": "2026-04-26T10:15:00Z",
  "words": [
    {
      "sequence": 0,
      "word": "hús",
      "category": "noun",
      "drawn_at": "2026-04-26T10:01:00Z",
      "rating": "easy"
    },
    {
      "sequence": 1,
      "word": "setja",
      "category": "verb",
      "drawn_at": "2026-04-26T10:02:00Z",
      "rating": "skipped"
    }
  ]
}
```

**Behavior:** Join Games + GameWords + WordRatings to return full game history.

---

#### GET /api/categories
**Lists all available word categories.**

**Response:**
```json
{
  "categories": [
    { "id": "uuid1", "name": "nouns" },
    { "id": "uuid2", "name": "verbs" },
    { "id": "uuid3", "name": "adjectives" }
  ]
}
```

**Behavior:** Return distinct values from Words.Category (or materialized Categories table if one exists).

---

## Game Flow

### 1. Setup Phase
1. App calls `GET /api/categories` → displays category picker
2. User selects game type (drawing, scrabble, word_explanation, acting)
3. User selects one or more categories
4. App calls `POST /api/games/start` with game_type + categories → receives game_id

### 2. Play Phase (Repeats until user ends game)
1. App calls `GET /api/games/{game_id}/next-word` → displays word + category on play screen
2. User plays with the word according to game_type (e.g., draws it, explains it, acts it out)
3. User taps "Review" → app shows word + category on review screen
4. User rates difficulty: taps Easy / Medium / Hard
5. App calls `POST /api/games/{game_id}/rate-word` with difficulty_rating
   - **OR** user taps "Skip" → app calls `POST /api/games/{game_id}/skip-word`
6. App shows "Next Word" button
7. User taps "Next Word" → back to step 1
8. **OR** user taps "End Game" → confirmation dialog → proceeds to end phase

### 3. End Phase
1. App calls `POST /api/games/{game_id}/end`
2. API closes game (sets ended_at)
3. (Optional) App calls `GET /api/games/{game_id}` → shows summary of words played + ratings
4. User returns to setup screen

---

## Design Decisions

### Why API Owns All State
- Enables game resumption (if user closes browser mid-game, state persists)
- Supports future features (game history, player stats, leaderboards)
- Consistent data across platforms (web, iOS, Android)
- Clean separation of concerns: API = game logic, App = UI

### Why Rate Immediately, Not Post-Game
- Captures context: rating is tied to specific game word at draw time
- Habit loop: rate → next word, faster rhythm
- Context-aware analytics: we know which game_type a word was hard in

### Why Track Skips
- Identifies words that are misfit for certain games (hard to draw, easy to explain)
- Future: adaptive selection can deprioritize frequently-skipped words
- Distinguishes "didn't rate" from "rated as skipped"

### Game-Type-Specific Difficulty
- Same word has different difficulty across game types: "jump" is easy to draw, hard to act out
- WordRatings.game_type preserves this context
- Future: selection algorithm can bias toward easy-to-draw words when user selects drawing game

---

## Error Handling

| Scenario | API Response | App Behavior |
|----------|--------------|--------------|
| Game not found (GET /next-word with invalid game_id) | 404 | Show error, return to menu |
| Game already ended | 400 Bad Request | Show error, return to menu |
| No words in selected categories | 404 | Show error, adjust categories |
| Network failure | Connection error | Show retry button |
| Invalid category IDs in POST /start | 400 Bad Request | Show error, re-prompt categories |

---

## Future Extensions (Out of Scope for V1)

1. **Adaptive Difficulty:** Use WordRatings to adjust word selection per game_type (show "easy drawing" words more often in drawing games)
2. **Player Profiles & History:** Track user_id, calculate personal stats (words learned, difficulty preference)
3. **Multiplayer:** Extend Games table with player IDs, add turn/scoring logic
4. **Spaced Repetition:** Adjust word selection based on time since last play + difficulty
5. **Leaderboards:** Aggregate per-user or per-category stats
6. **Inflection Forms:** Leverage existing InflectionFormEntity to show word variants

---

## Implementation Priorities

1. **Phase 1:** Core game loop (start → next-word → rate/skip → end)
2. **Phase 2:** Game summary screen (GET /api/games/{game_id})
3. **Phase 3:** Category management (extend/validate GET /api/categories if needed)
4. **Phase 4:** Analytics dashboard (query WordRatings for trends)
