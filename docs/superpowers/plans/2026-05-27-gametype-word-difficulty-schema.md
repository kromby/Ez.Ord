# GameType lookup + per-game-type word difficulty schema Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Introduce a `Lookups` table (seeded with three game-type rows) and a `WordDifficulties` table, validate game-type codes on game start, and migrate the frontend `GameType` union from Icelandic codes (`teikna`/`utskyra`/`leika`) to English codes (`drawing`/`explanation`/`acting`).

**Architecture:** The `Lookups` Azure Table is a shared reference-data table partitioned by lookup-set name (`"gameType"`). `WordDifficulties` is partitioned by game-type code. `StorageService` owns both clients and seeds the three game-type rows idempotently on startup. `GameService.StartGameAsync` validates the incoming game type against the `Lookups` table before creating a game session.

**Tech Stack:** .NET 8, Azure Functions isolated worker, Azure Table Storage (`Azure.Data.Tables`), xUnit + Moq (unit tests), Azurite (integration tests), React Native / Expo (frontend), TypeScript.

---

## File Map

**New files:**
- `api/Models/LookupEntity.cs` — `LookupEntity` ITableEntity (one public type, file-scoped namespace)
- `api/Models/WordDifficultyEntity.cs` — `WordDifficultyEntity` ITableEntity
- `api.Tests/StorageServiceTests.cs` — integration tests for the new storage methods (requires Azurite)

**Modified files:**
- `api/Models/WordEntity.cs` — remove `public double? Rating { get; set; }`
- `api/Models/GameEntity.cs` — update comment on `GameType` property
- `api/Models/GameStartRequest.cs` — update comment on `GameType` property
- `api/Services/IStorageService.cs` — add 6 new method signatures
- `api/Services/StorageService.cs` — add 2 `TableClient` fields, stub then full implementations, seeding
- `api/Services/GameService.cs` — validate game type in `StartGameAsync`
- `api.Tests/GameServiceTests.cs` — mock `GetLookupAsync` in existing tests + new validation test
- `app/contexts/GameContext.tsx` — change `GameType` union from Icelandic to English codes
- `app/constants/games.ts` — change GAMES `id` values to English codes
- `app/app/types/game.ts` — update game type unions
- `app/app/games/setup.tsx` — update two type casts

---

## Task 1: Create `LookupEntity` and `WordDifficultyEntity` models

**Files:**
- Create: `api/Models/LookupEntity.cs`
- Create: `api/Models/WordDifficultyEntity.cs`

- [ ] **Step 1: Create `LookupEntity.cs`**

```csharp
using Azure;
using Azure.Data.Tables;

namespace EzOrd.Models;

public class LookupEntity : ITableEntity
{
    public string PartitionKey { get; set; } = string.Empty; // Lookup-set name (e.g. "gameType")
    public string RowKey { get; set; } = string.Empty; // Code (e.g. "drawing")
    public DateTimeOffset? Timestamp { get; set; }
    public ETag ETag { get; set; }

    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public bool Enabled { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}
```

- [ ] **Step 2: Create `WordDifficultyEntity.cs`**

```csharp
using Azure;
using Azure.Data.Tables;

namespace EzOrd.Models;

public class WordDifficultyEntity : ITableEntity
{
    public string PartitionKey { get; set; } = string.Empty; // Game-type code (e.g. "drawing")
    public string RowKey { get; set; } = string.Empty; // Word ID (BIN-id)
    public DateTimeOffset? Timestamp { get; set; }
    public ETag ETag { get; set; }

    public int Difficulty { get; set; } // 1..10
    public DateTime UpdatedAt { get; set; }
}
```

- [ ] **Step 3: Verify the project builds**

Run from repo root:
```bash
cd api && dotnet build
```
Expected: Build succeeded, 0 errors.

- [ ] **Step 4: Commit**

```bash
git add api/Models/LookupEntity.cs api/Models/WordDifficultyEntity.cs
git commit -m "feat: add LookupEntity and WordDifficultyEntity models"
```

---

## Task 2: Extend `IStorageService` and add stub implementations in `StorageService`

**Files:**
- Modify: `api/Services/IStorageService.cs`
- Modify: `api/Services/StorageService.cs`

- [ ] **Step 1: Add 6 new method signatures to `IStorageService`**

Append these lines inside the interface body in `api/Services/IStorageService.cs`, after the existing `SeedWordTypesAsync` line:

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

The updated interface body should end:

```csharp
    Task<List<WordTypeEntity>> GetEnabledWordTypesAsync();
    Task<WordTypeEntity?> GetWordTypeAsync(string wordClass, string typeCode);
    Task<string?> GetCategoryNameByWordClassAsync(string wordClass);
    Task SeedWordTypesAsync(IReadOnlyDictionary<string, string> knownNames);

    // Lookups
    Task<LookupEntity?> GetLookupAsync(string partitionKey, string rowKey);
    Task<List<LookupEntity>> GetLookupsAsync(string partitionKey);
    Task<List<LookupEntity>> GetEnabledLookupsAsync(string partitionKey);
    Task UpsertLookupAsync(LookupEntity lookup);

    // Word difficulties
    Task<WordDifficultyEntity?> GetWordDifficultyAsync(string gameTypeCode, string wordId);
    Task UpsertWordDifficultyAsync(WordDifficultyEntity entity);
```

- [ ] **Step 2: Add two `TableClient` fields to `StorageService`**

Inside `StorageService.cs`, add two new fields after the existing `_wordTypesTable` field:

```csharp
private TableClient _lookupsTable = null!;
private TableClient _wordDifficultiesTable = null!;
```

- [ ] **Step 3: Add stub implementations to `StorageService`**

Append these stub methods to `StorageService.cs`, before the closing `}` of the class:

```csharp
// Lookups (stubs — full implementation in Task 4)
public Task<LookupEntity?> GetLookupAsync(string partitionKey, string rowKey) =>
    throw new NotImplementedException();
public Task<List<LookupEntity>> GetLookupsAsync(string partitionKey) =>
    throw new NotImplementedException();
public Task<List<LookupEntity>> GetEnabledLookupsAsync(string partitionKey) =>
    throw new NotImplementedException();
public Task UpsertLookupAsync(LookupEntity lookup) =>
    throw new NotImplementedException();

// Word difficulties (stubs — full implementation in Task 4)
public Task<WordDifficultyEntity?> GetWordDifficultyAsync(string gameTypeCode, string wordId) =>
    throw new NotImplementedException();
public Task UpsertWordDifficultyAsync(WordDifficultyEntity entity) =>
    throw new NotImplementedException();
```

- [ ] **Step 4: Build to confirm the interface is satisfied**

```bash
cd api && dotnet build
```
Expected: Build succeeded, 0 errors. (Stubs satisfy the interface; tests still pass because they mock `IStorageService`, not `StorageService`.)

- [ ] **Step 5: Run existing tests to confirm nothing is broken**

```bash
dotnet test api.sln
```
Expected: All existing tests pass.

- [ ] **Step 6: Commit**

```bash
git add api/Services/IStorageService.cs api/Services/StorageService.cs
git commit -m "feat: add Lookup and WordDifficulty method stubs to IStorageService and StorageService"
```

---

## Task 3: Write failing test for game-type validation and update existing tests

**Files:**
- Modify: `api.Tests/GameServiceTests.cs`

The existing `StartGameAsync` tests will break once `GameService` calls `GetLookupAsync` (because the mock won't be set up). Add the mock setup now and add the new validation test so both the happy-path and error-path are covered before implementation.

- [ ] **Step 1: Add a helper method to `GameServiceTests`**

Add this method to the `GameServiceTests` class, after `SetupEnabledCategories`:

```csharp
private void SetupGameTypeLookup(string gameType, bool enabled = true)
{
    _mockStorageService
        .Setup(s => s.GetLookupAsync("gameType", gameType))
        .ReturnsAsync(new LookupEntity
        {
            PartitionKey = "gameType",
            RowKey = gameType,
            Name = gameType,
            Enabled = enabled
        });
}
```

- [ ] **Step 2: Add `SetupGameTypeLookup` call to every existing `StartGameAsync_*` test**

In each test that calls `_gameService.StartGameAsync`, add a call to `SetupGameTypeLookup` with the game type used in that test. The four tests to update are:

- `StartGameAsync_ShouldCreateGameAndReturnGameId` — uses `"drawing"` → add `SetupGameTypeLookup("drawing");` in the Arrange block
- `StartGameAsync_ShouldCallInsertGameAsync` — uses `"drawing"` → add `SetupGameTypeLookup("drawing");`
- `StartGameAsync_ShouldResolveWordClassesFromEnabledCategories` — uses `"drawing"` → add `SetupGameTypeLookup("drawing");`
- `StartGameAsync_ShouldThrowWhenNoEnabledWordClassesMatch` — uses `"drawing"` → add `SetupGameTypeLookup("drawing");`

Example of how `StartGameAsync_ShouldCreateGameAndReturnGameId` should look after the update:

```csharp
[Fact]
public async Task StartGameAsync_ShouldCreateGameAndReturnGameId()
{
    // Arrange
    SetupEnabledCategories(("nafnord", "hk"), ("sagnord", "so"));
    SetupGameTypeLookup("drawing");
    var request = new GameStartRequest
    {
        GameType = "drawing",
        Categories = new List<string> { "nafnord", "sagnord" }
    };

    // Act
    var result = await _gameService.StartGameAsync(request);

    // Assert
    Assert.NotNull(result);
    Assert.NotEmpty(result.GameId);
    Assert.Equal(request.GameType, result.GameType);
    Assert.Equal(request.Categories, result.Categories);
    Assert.True(result.StartedAt <= DateTime.UtcNow);
}
```

Apply the same `SetupGameTypeLookup("drawing");` line in the Arrange blocks of the other three tests.

- [ ] **Step 3: Add two new validation tests**

Add these two tests to `GameServiceTests`:

```csharp
[Fact]
public async Task StartGameAsync_ShouldThrowWhenGameTypeIsUnknown()
{
    // Arrange
    SetupEnabledCategories(("nafnord", "hk"));
    _mockStorageService
        .Setup(s => s.GetLookupAsync("gameType", "unknown"))
        .ReturnsAsync((LookupEntity?)null);
    var request = new GameStartRequest
    {
        GameType = "unknown",
        Categories = new List<string> { "nafnord" }
    };

    // Act & Assert
    await Assert.ThrowsAsync<InvalidOperationException>(
        () => _gameService.StartGameAsync(request));
}

[Fact]
public async Task StartGameAsync_ShouldThrowWhenGameTypeIsDisabled()
{
    // Arrange
    SetupEnabledCategories(("nafnord", "hk"));
    SetupGameTypeLookup("drawing", enabled: false);
    var request = new GameStartRequest
    {
        GameType = "drawing",
        Categories = new List<string> { "nafnord" }
    };

    // Act & Assert
    await Assert.ThrowsAsync<InvalidOperationException>(
        () => _gameService.StartGameAsync(request));
}
```

- [ ] **Step 4: Run tests and confirm the two new tests fail**

```bash
dotnet test api.sln
```
Expected:
- `StartGameAsync_ShouldThrowWhenGameTypeIsUnknown` — FAIL (no exception thrown yet)
- `StartGameAsync_ShouldThrowWhenGameTypeIsDisabled` — FAIL (no exception thrown yet)
- All other tests — PASS

- [ ] **Step 5: Commit**

```bash
git add api.Tests/GameServiceTests.cs
git commit -m "test: add game-type validation tests for StartGameAsync (red)"
```

---

## Task 4: Implement game-type validation in `GameService.StartGameAsync`

**Files:**
- Modify: `api/Services/GameService.cs`

- [ ] **Step 1: Add validation call inside `StartGameAsync`**

In `GameService.cs`, after the existing null/whitespace check for `request.GameType` (line ~19), add the lookup validation:

```csharp
public async Task<GameStartResponse> StartGameAsync(GameStartRequest request)
{
    if (string.IsNullOrWhiteSpace(request.GameType))
        throw new ArgumentException("GameType is required.", nameof(request));

    var gameTypeLookup = await _storage.GetLookupAsync("gameType", request.GameType);
    if (gameTypeLookup == null || !gameTypeLookup.Enabled)
        throw new InvalidOperationException("Unknown game type");

    if (request.Categories is null || request.Categories.Count == 0)
        throw new ArgumentException("At least one category is required.", nameof(request));

    // ... rest of the method unchanged
```

- [ ] **Step 2: Build**

```bash
cd api && dotnet build
```
Expected: Build succeeded, 0 errors.

- [ ] **Step 3: Run tests — all should pass**

```bash
dotnet test api.sln
```
Expected: All tests pass including the two new validation tests.

- [ ] **Step 4: Commit**

```bash
git add api/Services/GameService.cs
git commit -m "feat: validate game type against Lookups table in StartGameAsync"
```

---

## Task 5: Implement full `StorageService` lookup and word-difficulty methods + seeding

**Files:**
- Modify: `api/Services/StorageService.cs`

Replace the six stub methods added in Task 2 with full implementations, add the two new table clients to `InitializeAsync`, and add a private seeder.

- [ ] **Step 1: Update `InitializeAsync` to initialize and seed the new tables**

In `StorageService.cs`, update `InitializeAsync` to add these lines after the existing six table-client assignments and `CreateIfNotExistsAsync` calls:

The full updated `InitializeAsync` method:

```csharp
public async Task InitializeAsync()
{
    _gamesTable = _tableServiceClient.GetTableClient("Games");
    _gameWordsTable = _tableServiceClient.GetTableClient("GameWords");
    _wordRatingsTable = _tableServiceClient.GetTableClient("WordRatings");
    _wordsTable = _tableServiceClient.GetTableClient("Words");
    _categoriesTable = _tableServiceClient.GetTableClient("Categories");
    _wordTypesTable = _tableServiceClient.GetTableClient("WordTypes");
    _lookupsTable = _tableServiceClient.GetTableClient("Lookups");
    _wordDifficultiesTable = _tableServiceClient.GetTableClient("WordDifficulties");

    await _gamesTable.CreateIfNotExistsAsync();
    await _gameWordsTable.CreateIfNotExistsAsync();
    await _wordRatingsTable.CreateIfNotExistsAsync();
    await _wordsTable.CreateIfNotExistsAsync();
    await _categoriesTable.CreateIfNotExistsAsync();
    await _wordTypesTable.CreateIfNotExistsAsync();
    await _lookupsTable.CreateIfNotExistsAsync();
    await _wordDifficultiesTable.CreateIfNotExistsAsync();

    await SeedWordTypesAsync(KnownTypeNames);
    await SeedGameTypesAsync();
}
```

- [ ] **Step 2: Add `SeedGameTypesAsync` private method**

Add this private method to `StorageService`, after `SeedWordTypesAsync`:

```csharp
private async Task SeedGameTypesAsync()
{
    var seeds = new[]
    {
        new LookupEntity { PartitionKey = "gameType", RowKey = "drawing",     Name = "Teikna",  Description = "Teiknaðu orðið og láttu hina giska.",                    Enabled = true },
        new LookupEntity { PartitionKey = "gameType", RowKey = "explanation", Name = "Útskýra", Description = "Útskýrðu orðið með orðum án þess að segja það.", Enabled = true },
        new LookupEntity { PartitionKey = "gameType", RowKey = "acting",      Name = "Leika",   Description = "Leikið orðið og láttu hina giska.",                      Enabled = true },
    };

    foreach (var seed in seeds)
    {
        try
        {
            await _lookupsTable.GetEntityAsync<LookupEntity>(seed.PartitionKey, seed.RowKey);
        }
        catch (RequestFailedException ex) when (ex.Status == 404)
        {
            var now = DateTime.UtcNow;
            seed.CreatedAt = now;
            seed.UpdatedAt = now;
            await _lookupsTable.AddEntityAsync(seed);
        }
    }
}
```

- [ ] **Step 3: Replace the six stub methods with full implementations**

Replace the six stub methods from Task 2 with these implementations:

```csharp
// Lookups
public async Task<LookupEntity?> GetLookupAsync(string partitionKey, string rowKey)
{
    try
    {
        return await _lookupsTable.GetEntityAsync<LookupEntity>(partitionKey, rowKey);
    }
    catch (RequestFailedException ex) when (ex.Status == 404)
    {
        return null;
    }
}

public async Task<List<LookupEntity>> GetLookupsAsync(string partitionKey)
{
    var query = _lookupsTable.QueryAsync<LookupEntity>(e => e.PartitionKey == partitionKey);
    var results = new List<LookupEntity>();
    await foreach (var item in query)
    {
        results.Add(item);
    }
    return results;
}

public async Task<List<LookupEntity>> GetEnabledLookupsAsync(string partitionKey)
{
    var query = _lookupsTable.QueryAsync<LookupEntity>(e => e.PartitionKey == partitionKey && e.Enabled);
    var results = new List<LookupEntity>();
    await foreach (var item in query)
    {
        results.Add(item);
    }
    return results;
}

public async Task UpsertLookupAsync(LookupEntity lookup)
{
    var existing = await GetLookupAsync(lookup.PartitionKey, lookup.RowKey);
    var now = DateTime.UtcNow;
    lookup.CreatedAt = existing?.CreatedAt ?? now;
    lookup.UpdatedAt = now;
    await _lookupsTable.UpsertEntityAsync(lookup);
}

// Word difficulties
public async Task<WordDifficultyEntity?> GetWordDifficultyAsync(string gameTypeCode, string wordId)
{
    try
    {
        return await _wordDifficultiesTable.GetEntityAsync<WordDifficultyEntity>(gameTypeCode, wordId);
    }
    catch (RequestFailedException ex) when (ex.Status == 404)
    {
        return null;
    }
}

public async Task UpsertWordDifficultyAsync(WordDifficultyEntity entity)
{
    entity.UpdatedAt = DateTime.UtcNow;
    await _wordDifficultiesTable.UpsertEntityAsync(entity);
}
```

- [ ] **Step 4: Build**

```bash
cd api && dotnet build
```
Expected: Build succeeded, 0 errors.

- [ ] **Step 5: Run all tests**

```bash
dotnet test api.sln
```
Expected: All tests pass.

- [ ] **Step 6: Commit**

```bash
git add api/Services/StorageService.cs
git commit -m "feat: implement Lookup and WordDifficulty storage methods with game-type seeding"
```

---

## Task 6: Add `StorageServiceTests` integration tests

**Files:**
- Create: `api.Tests/StorageServiceTests.cs`

> **Prerequisite:** Azurite must be running (`azurite` in a separate terminal). These tests connect to `UseDevelopmentStorage=true`.

- [ ] **Step 1: Create the test file**

```csharp
using Azure.Data.Tables;
using EzOrd.Models;
using EzOrd.Services;
using Xunit;

namespace EzOrd.Tests;

[Trait("Category", "Integration")]
public class StorageServiceTests : IAsyncLifetime
{
    private StorageService _service = null!;

    public async Task InitializeAsync()
    {
        var client = new TableServiceClient("UseDevelopmentStorage=true");
        _service = new StorageService(client);
        await _service.InitializeAsync();
    }

    public Task DisposeAsync() => Task.CompletedTask;

    [Fact]
    public async Task GetLookupAsync_ReturnsNullForMissingRow()
    {
        var result = await _service.GetLookupAsync("noSuchPartition", Guid.NewGuid().ToString());
        Assert.Null(result);
    }

    [Fact]
    public async Task UpsertLookupAsync_SetsCreatedAtAndUpdatedAtOnInsert()
    {
        var before = DateTime.UtcNow;
        var entity = new LookupEntity
        {
            PartitionKey = "test",
            RowKey = Guid.NewGuid().ToString(),
            Name = "Test",
            Description = "",
            Enabled = true
        };

        await _service.UpsertLookupAsync(entity);

        var result = await _service.GetLookupAsync(entity.PartitionKey, entity.RowKey);
        Assert.NotNull(result);
        Assert.True(result!.CreatedAt >= before);
        Assert.True(result.UpdatedAt >= before);
    }

    [Fact]
    public async Task UpsertLookupAsync_PreservesCreatedAtOnUpdate()
    {
        var rowKey = Guid.NewGuid().ToString();
        var entity = new LookupEntity
        {
            PartitionKey = "test",
            RowKey = rowKey,
            Name = "Initial",
            Description = "",
            Enabled = true
        };

        await _service.UpsertLookupAsync(entity);
        var first = await _service.GetLookupAsync("test", rowKey);

        await Task.Delay(10);
        entity.Name = "Updated";
        await _service.UpsertLookupAsync(entity);
        var second = await _service.GetLookupAsync("test", rowKey);

        Assert.Equal(first!.CreatedAt, second!.CreatedAt);
        Assert.True(second.UpdatedAt > first.UpdatedAt);
        Assert.Equal("Updated", second.Name);
    }

    [Fact]
    public async Task GetWordDifficultyAsync_ReturnsNullForMissingRow()
    {
        var result = await _service.GetWordDifficultyAsync("drawing", Guid.NewGuid().ToString());
        Assert.Null(result);
    }

    [Fact]
    public async Task UpsertWordDifficultyAsync_SetsUpdatedAtAndDifficulty()
    {
        var before = DateTime.UtcNow;
        var entity = new WordDifficultyEntity
        {
            PartitionKey = "drawing",
            RowKey = Guid.NewGuid().ToString(),
            Difficulty = 5
        };

        await _service.UpsertWordDifficultyAsync(entity);

        var result = await _service.GetWordDifficultyAsync(entity.PartitionKey, entity.RowKey);
        Assert.NotNull(result);
        Assert.Equal(5, result!.Difficulty);
        Assert.True(result.UpdatedAt >= before);
    }

    [Fact]
    public async Task InitializeAsync_SeedsAllThreeGameTypeRows()
    {
        var drawing = await _service.GetLookupAsync("gameType", "drawing");
        var explanation = await _service.GetLookupAsync("gameType", "explanation");
        var acting = await _service.GetLookupAsync("gameType", "acting");

        Assert.NotNull(drawing);
        Assert.NotNull(explanation);
        Assert.NotNull(acting);
        Assert.True(drawing!.Enabled);
        Assert.True(explanation!.Enabled);
        Assert.True(acting!.Enabled);
    }

    [Fact]
    public async Task InitializeAsync_DoesNotOverwriteExistingRows()
    {
        var existing = await _service.GetLookupAsync("gameType", "drawing");
        Assert.NotNull(existing);
        existing!.Enabled = false;
        await _service.UpsertLookupAsync(existing);

        // Simulate a restart
        await _service.InitializeAsync();

        var result = await _service.GetLookupAsync("gameType", "drawing");
        Assert.False(result!.Enabled);

        // Restore for other tests
        result.Enabled = true;
        await _service.UpsertLookupAsync(result);
    }
}
```

- [ ] **Step 2: Run integration tests (requires Azurite)**

Start Azurite if not running:
```bash
azurite &
```

Run only integration tests:
```bash
dotnet test api.sln --filter "Category=Integration"
```
Expected: All 7 integration tests pass.

- [ ] **Step 3: Run all tests to confirm no regressions**

```bash
dotnet test api.sln
```
Expected: All tests pass.

- [ ] **Step 4: Commit**

```bash
git add api.Tests/StorageServiceTests.cs
git commit -m "test: add StorageService integration tests for Lookup and WordDifficulty"
```

---

## Task 7: Remove `WordEntity.Rating` and update stale comments

**Files:**
- Modify: `api/Models/WordEntity.cs`
- Modify: `api/Models/GameEntity.cs`
- Modify: `api/Models/GameStartRequest.cs`

- [ ] **Step 1: Remove `Rating` from `WordEntity.cs`**

Delete this line from `api/Models/WordEntity.cs`:
```csharp
public double? Rating { get; set; }
```

The file after the change:
```csharp
using Azure;
using Azure.Data.Tables;

namespace EzOrd.Models;

public class WordEntity : ITableEntity
{
    public string PartitionKey { get; set; } = string.Empty; // BIN word-class code (hk, kk, kvk, lo, so, ...)
    public string RowKey { get; set; } = string.Empty; // Word ID (BIN-id)
    public DateTimeOffset? Timestamp { get; set; }
    public ETag ETag { get; set; }

    public string Word { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public int UsageCount { get; set; } = 0;
}
```

- [ ] **Step 2: Update the comment in `GameEntity.cs`**

Change line 18 of `api/Models/GameEntity.cs`:
```csharp
public string GameType { get; set; } = string.Empty; // drawing, scrabble, word_explanation, acting
```
to:
```csharp
public string GameType { get; set; } = string.Empty; // drawing, explanation, acting
```

- [ ] **Step 3: Update the comment in `GameStartRequest.cs`**

Change line 4 of `api/Models/GameStartRequest.cs`:
```csharp
public string GameType { get; set; } = string.Empty; // drawing, scrabble, word_explanation, acting
```
to:
```csharp
public string GameType { get; set; } = string.Empty; // drawing, explanation, acting
```

- [ ] **Step 4: Build and run all tests**

```bash
cd api && dotnet build && cd .. && dotnet test api.sln
```
Expected: Build succeeded, all tests pass. (Table Storage is schema-tolerant; existing rows that still carry a `Rating` column are silently ignored.)

- [ ] **Step 5: Commit**

```bash
git add api/Models/WordEntity.cs api/Models/GameEntity.cs api/Models/GameStartRequest.cs
git commit -m "chore: remove WordEntity.Rating and update GameType code set comments"
```

---

## Task 8: Update frontend `GameType` codes from Icelandic to English

**Files:**
- Modify: `app/contexts/GameContext.tsx`
- Modify: `app/constants/games.ts`
- Modify: `app/app/types/game.ts`
- Modify: `app/app/games/setup.tsx`

- [ ] **Step 1: Update `GameType` union in `GameContext.tsx`**

In `app/contexts/GameContext.tsx`, change line 7:
```ts
export type GameType = 'teikna' | 'utskyra' | 'leika';
```
to:
```ts
export type GameType = 'drawing' | 'explanation' | 'acting';
```

- [ ] **Step 2: Update GAMES ids in `constants/games.ts`**

Replace the full content of `app/constants/games.ts` with:

```ts
// Game definitions and metadata

const GAMES = [
  {
    id: 'drawing',
    label: 'Teikna',
    icon: '🎨',
    description: 'Teiknaðu og skissaðu myndir',
  },
  {
    id: 'explanation',
    label: 'Útskýra',
    icon: '💬',
    description: 'Útskýrðu orð án þess að nefna þau',
  },
  {
    id: 'acting',
    label: 'Leika',
    icon: '🎭',
    description: 'Leiktu orð fyrir aðra að giska á',
  },
] as const;

// Derive GameId type from GAMES array
type GameId = typeof GAMES[number]['id'];

export { GAMES, type GameId };
```

- [ ] **Step 3: Update game type unions in `app/app/types/game.ts`**

In `app/app/types/game.ts`, there are three places to update. Change each occurrence of `'drawing' | 'scrabble' | 'word_explanation' | 'acting'` to `'drawing' | 'explanation' | 'acting'`:

1. `Game.gameType` property:
```ts
export interface Game {
  gameId: string;
  gameType: 'drawing' | 'explanation' | 'acting';
  categories: string[];
  startedAt: string;
  endedAt?: string;
}
```

2. `GameSetupParams.gameType` property:
```ts
export interface GameSetupParams {
  gameType: 'drawing' | 'explanation' | 'acting';
  categories: string[];
}
```

3. `GameSummary.gameType` property:
```ts
export interface GameSummary {
  gameId: string;
  gameType: 'drawing' | 'explanation' | 'acting';
  categories: string[];
  startedAt: string;
  endedAt?: string;
  words: GameWordDetails[];
}
```

- [ ] **Step 4: Update type casts in `app/app/games/setup.tsx`**

In `app/app/games/setup.tsx`, change two type casts:

Line 30 — change:
```ts
dispatch({ type: 'SET_GAME', payload: gameParam as 'teikna' | 'utskyra' | 'leika' });
```
to:
```ts
dispatch({ type: 'SET_GAME', payload: gameParam as 'drawing' | 'explanation' | 'acting' });
```

Line 51 — change:
```ts
dispatch({ type: 'SET_GAME', payload: gameId as 'teikna' | 'utskyra' | 'leika' });
```
to:
```ts
dispatch({ type: 'SET_GAME', payload: gameId as 'drawing' | 'explanation' | 'acting' });
```

- [ ] **Step 5: Run frontend tests**

```bash
cd app && npm test -- --watchAll=false
```
Expected: All tests pass. (The `api.test.ts` fixtures already use `'drawing'`, so no updates are needed there.)

- [ ] **Step 6: Type-check the frontend**

```bash
cd app && npx tsc --noEmit
```
Expected: No type errors.

- [ ] **Step 7: Commit**

```bash
git add app/contexts/GameContext.tsx app/constants/games.ts app/app/types/game.ts app/app/games/setup.tsx
git commit -m "feat: migrate frontend GameType from Icelandic codes to English (drawing/explanation/acting)"
```

---

## Self-Review

### Spec coverage check

| Spec requirement | Task |
|---|---|
| `LookupEntity` model | Task 1 |
| `WordDifficultyEntity` model | Task 1 |
| Seed 3 game-type rows idempotently | Task 5 |
| `IStorageService` new methods (6) | Task 2 |
| `StorageService` implementation + seeding | Task 5 |
| `GameService.StartGameAsync` validates game type | Task 4 |
| `WordEntity.Rating` removed | Task 7 |
| `GameEntity`/`GameStartRequest` comment updated | Task 7 |
| Frontend `GameType` union changed | Task 8 |
| `constants/games.ts` ids updated | Task 8 |
| `app/app/types/game.ts` unions updated | Task 8 |
| `setup.tsx` type casts updated | Task 8 |
| Existing tests updated to mock `GetLookupAsync` | Task 3 |
| New test: throws on unknown game type | Task 3 |
| New test: throws on disabled game type | Task 3 |
| Round-trip tests for Lookup Get/Upsert | Task 6 |
| Round-trip tests for WordDifficulty Get/Upsert | Task 6 |
| Seeding idempotency test | Task 6 |

All spec requirements are covered. No placeholders remain. Types are consistent across tasks.
