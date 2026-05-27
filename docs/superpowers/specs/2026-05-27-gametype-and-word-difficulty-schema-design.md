# GameType lookup + per-game-type word difficulty schema

**Issue:** [#16](https://github.com/kromby/Ez.Ord/issues/16) (sub-task of [#15](https://github.com/kromby/Ez.Ord/issues/15))
**Date:** 2026-05-27
**Status:** Spec for review

## Goal

Introduce a normalized data model so each word can carry a separate difficulty rating per game type, on a 1–10 integer scale. This is a schema-only change. The AI rating process, feedback adjustment, and admin UI are explicit follow-ups.

## Decisions captured in brainstorming

- **Code convention.** Game-type identifiers are English codes (`drawing`, `explanation`, `acting`); display names are Icelandic. The frontend's existing Icelandic codes (`teikna` / `utskyra` / `leika`) are migrated to the English codes as part of this change.
- **Lookup table consolidation.** Game-type rows live in a shared `Lookups` table with `PartitionKey = "gameType"` rather than a dedicated `GameTypes` table. Folding `Categories` / `WordTypes` into the same `Lookups` table is deferred to a separate follow-up issue.
- **Word-difficulty partition strategy.** `WordDifficulties` is partitioned by game-type code (`PartitionKey = GameTypeCode`, `RowKey = WordId`). This optimizes for the eventual access pattern "find words for game type X within difficulty range Y..Z."
- **Frontend scope.** The frontend `GameType` union and route filenames change in the same PR as the API schema, so no period exists where the API expects codes the frontend doesn't send.
- **Validation.** `StartGameAsync` rejects unknown game-type codes by looking up the `Lookups` row at game start. Downstream services (`RateWordAsync`, `SkipWordAsync`) read `GameType` from the already-validated `GameEntity` and do not re-validate.

## New tables

### `Lookups`

Shared reference-data table. This change introduces it with one partition (`gameType`); other partitions may follow in later issues.

| Field        | Type           | Notes                                                            |
|--------------|----------------|------------------------------------------------------------------|
| PartitionKey | string         | Lookup-set name. For game types: `"gameType"`.                   |
| RowKey       | string         | Code. For game types: `drawing` / `explanation` / `acting`.      |
| Name         | string         | Display name (Icelandic).                                        |
| Description  | string         | Longer description (Icelandic); defaults to empty.               |
| Enabled      | bool           | `false` hides the row from client-facing lists.                  |
| CreatedAt    | DateTime (UTC) | Set on insert; never modified.                                   |
| UpdatedAt    | DateTime (UTC) | Set on insert; refreshed on every update.                        |

Entity class: `LookupEntity` in `api/Models/LookupEntity.cs` (one public type per file, file-scoped namespace, matching existing conventions).

Seed rows inserted on API startup:

| RowKey       | Name      | Description                                                        | Enabled |
|--------------|-----------|--------------------------------------------------------------------|---------|
| drawing      | Teikna    | "Teiknaðu orðið og láttu hina giska."                              | true    |
| explanation  | Útskýra   | "Útskýrðu orðið með orðum án þess að segja það."                   | true    |
| acting       | Leika     | "Leikið orðið og láttu hina giska."                                | true    |

(Descriptions are placeholders; refine before merge if a better Icelandic copy is preferred.)

### `WordDifficulties`

Data table holding per-game-type difficulty for each word. Expected scale: `(# words) × (# game types)` rows.

| Field        | Type           | Notes                                                            |
|--------------|----------------|------------------------------------------------------------------|
| PartitionKey | string         | Game-type code (e.g. `drawing`).                                 |
| RowKey       | string         | Word ID (matches `WordEntity.RowKey` — the BIN-id).              |
| Difficulty   | int            | 1..10, inclusive. Required.                                      |
| UpdatedAt    | DateTime (UTC) | Set on insert; refreshed on every update.                        |

Entity class: `WordDifficultyEntity` in `api/Models/WordDifficultyEntity.cs`.

Missing row = "not yet rated." No default difficulty is stored; consumers must handle absence.

## Changes to existing entities

### `WordEntity` (`api/Models/WordEntity.cs`)

- Remove `public double? Rating { get; set; }`.
- Table Storage is schema-tolerant, so existing Azurite/prod rows that still carry a `Rating` column will not break — the column becomes orphaned. No data-migration job required.

### `WordRatingEntity` (`api/Models/WordRatingEntity.cs`)

- No structural change. The `GameType` field stays `string`, but its semantics tighten: it must equal a `Lookups` row's `RowKey` where `PartitionKey == "gameType"`.
- Constraint enforced at write time via `GameService.StartGameAsync` validation (rating rows inherit a known-good code from their parent game).
- Existing Azurite rows that hold legacy values (`teikna` etc.) are left in place; they reference dead codes but cause no runtime errors. Wipe Azurite locally if a clean baseline is desired.

### `GameEntity` (`api/Models/GameEntity.cs`)

- No structural change.
- Update the inline `// drawing, scrabble, word_explanation, acting` comment on `GameType` to the new code set: `// drawing, explanation, acting`.

### `GameStartRequest` (`api/Models/GameStartRequest.cs`)

- No structural change.
- Update the same inline comment as `GameEntity`.

## Service-layer changes

### `IStorageService` / `StorageService` (`api/Services/`)

Add two `TableClient` fields — `_lookupsTable` ("Lookups") and `_wordDifficultiesTable` ("WordDifficulties") — and `CreateIfNotExistsAsync` them in `InitializeAsync`.

New interface methods:

```csharp
// Lookups
Task<LookupEntity?> GetLookupAsync(string partitionKey, string rowKey);
Task<List<LookupEntity>> GetLookupsAsync(string partitionKey);
Task<List<LookupEntity>> GetEnabledLookupsAsync(string partitionKey);
Task UpsertLookupAsync(LookupEntity lookup);

// Word difficulties
Task<WordDifficultyEntity?> GetWordDifficultyAsync(string gameTypeCode, string wordId);
Task UpsertWordDifficultyAsync(WordDifficultyEntity entity);
```

`UpsertLookupAsync` sets `CreatedAt` on insert and `UpdatedAt` on every write. `UpsertWordDifficultyAsync` sets `UpdatedAt` on every write.

Read paths for "select a word by difficulty range" are intentionally not added — those belong to the AI-rating follow-up.

### `StorageInitializerService` (`api/Services/StorageInitializerService.cs`)

Auto-seed the three `gameType` lookups on API startup, idempotently (only insert rows that don't already exist, so manual edits to `Name`/`Description`/`Enabled` survive restarts). Mirrors the existing `WordTypes` auto-seed pattern.

### `GameService` (`api/Services/GameService.cs`)

- `StartGameAsync` validates `request.GameType` by calling `GetLookupAsync("gameType", request.GameType)`. Throw `InvalidOperationException("Unknown game type")` if the lookup is missing or `Enabled == false`.
- `RateWordAsync` / `SkipWordAsync` — no new validation; they read `GameType` from the already-validated `GameEntity`.

## Frontend changes

Switch the frontend's `GameType` codes to match the new English `RowKey` values. Display strings stay Icelandic (driven by `Name` on the lookup row or by existing in-component copy).

- **`app/contexts/GameContext.tsx`**: change `export type GameType = 'teikna' | 'utskyra' | 'leika';` to `'drawing' | 'explanation' | 'acting'`. Update all literal uses in this file.
- **`app/app/types/game.ts`**, **`app/app/services/api.ts`**, and any other call sites: update type unions and string literals.
- **Route files under `app/app/games/`**: any route segments named `teikna` / `utskyra` / `leika` are renamed to `drawing` / `explanation` / `acting`. The execution plan will enumerate exact files; an initial grep shows the codes in `contexts/`, `types/`, and `services/`, but route-filename changes need verification during implementation.
- **`app/__tests__/...`**: update fixtures/literals that reference the old codes.

In-app Icelandic UI copy is unaffected — the new codes are internal identifiers only.

## Test changes

### Backend (`api.Tests/GameServiceTests.cs`)

- Existing fixtures already use `"drawing"` for `GameEntity.GameType`, so most assertions stay valid.
- Tests of `StartGameAsync` must now mock `GetLookupAsync("gameType", "drawing")` to return an enabled `LookupEntity`.
- Add a new test: `StartGameAsync` throws when the supplied `GameType` is unknown or disabled.
- Add round-trip tests for the new repository methods (`Get`/`Upsert` for lookups and word difficulties) sufficient to confirm key shapes and `CreatedAt`/`UpdatedAt` behavior.

### Frontend (`app/__tests__/...`)

- Update fixtures and assertions that referenced the old Icelandic codes.

## Out of scope

- AI process that populates `WordDifficulties` (separate sub-task under #15).
- Feedback-driven difficulty adjustment (separate sub-task under #15).
- Admin UI for editing lookup rows or difficulties.
- Difficulty-aware word selection in `GameService.GetNextWordAsync` — depends on the AI process producing data first.
- Folding `Categories` and `WordTypes` into the `Lookups` table — to be opened as a separate follow-up issue.
