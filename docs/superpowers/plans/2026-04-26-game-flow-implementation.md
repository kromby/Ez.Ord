# Game Flow Implementation Plan (API Integration)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement backend API and integrate with existing design screens. The game screens (setup, play, review, summary) are already built with Stone components and design tokens. This plan adds the ASP.NET Core backend and wires the frontend screens to use the API instead of local state.

**Architecture:** 
- **Backend:** ASP.NET Core 8 API using Azure Table Storage for persistence. Controllers expose RESTful endpoints; services encapsulate game logic; storage layer handles all database operations.
- **Frontend:** Existing Expo/React Native screens with TypeScript and design system. Update useGameState hook to call API instead of managing local state; add API client to abstract HTTP calls.

**Tech Stack:** 
- Backend: C# / ASP.NET Core 8 / Azure.Data.Tables
- Frontend: TypeScript / React Native / Expo 51 / Axios (or similar HTTP client)
- Storage: Azure Table Storage (Games, GameWords, WordRatings, Words tables)

---

## File Structure

### Backend (api/)
- **api/Program.cs** — DI setup, middleware, CORS, Table Storage client registration
- **api/Models/GameModels.cs** — Request/response DTOs (GameStartRequest, WordResponse, RatingRequest, etc.)
- **api/Models/StorageModels.cs** — Azure Table Storage entity models (GameEntity, GameWordEntity, WordRatingEntity)
- **api/Services/StorageService.cs** — Initialization and access to Table Storage clients (Games, GameWords, Words, WordRatings tables)
- **api/Services/GameService.cs** — Game business logic (create game, get next word, end game, persist ratings)
- **api/Services/WordService.cs** — Word queries (get random word by categories, get word details)
- **api/Controllers/GamesController.cs** — API endpoints (/games/start, /games/{id}/next-word, /games/{id}/rate-word, etc.)
- **api/Controllers/CategoriesController.cs** — GET /api/categories endpoint
- **api/Tests/GameServiceTests.cs** — Unit tests for GameService
- **api/Tests/GamesControllerTests.cs** — Integration tests for API endpoints

### Frontend (app/)
**Existing Design Screens (using API integration):**
- **app/app/games/setup.tsx** — Game type selector, category multi-select, "Start Game" button (Stone components, design tokens)
- **app/app/games/play.tsx** — Display current word + category, buttons for Review/Skip (Stone components, design tokens)
- **app/app/games/review.tsx** — Show word with difficulty rating chips (Easy/Medium/Hard) (Stone components, design tokens)
- **app/app/games/summary.tsx** — List words played + ratings with stats (Stone components, design tokens)

**New API Integration Files:**
- **app/app/types/game.ts** — TypeScript interfaces (Game, Word, GameSetupParams, RatingPayload, etc.)
- **app/app/services/api.ts** — HTTP client wrapper; functions for each API call (startGame, getNextWord, rateWord, skipWord, endGame, getCategories)
- **app/app/hooks/useGameState.ts** (modify) — Update to use API instead of local state management
- **app/app/Tests/api.test.ts** — API client tests

---

## Backend Implementation

### Task 1: Set Up ASP.NET Core Project and Dependencies

**Files:**
- Modify: `api/api.csproj`
- Modify: `api/Program.cs`

- [ ] **Step 1: Update api.csproj with required NuGet packages**

Open `api/api.csproj` and ensure it includes:

```xml
<Project Sdk="Microsoft.NET.Sdk.Web">
  <PropertyGroup>
    <TargetFramework>net8.0</TargetFramework>
    <Nullable>enable</Nullable>
    <ImplicitUsings>enable</ImplicitUsings>
  </PropertyGroup>

  <ItemGroup>
    <PackageReference Include="Azure.Data.Tables" Version="12.8.0" />
    <PackageReference Include="Microsoft.AspNetCore.OpenApi" Version="8.0.0" />
    <PackageReference Include="Swashbuckle.AspNetCore" Version="6.4.0" />
  </ItemGroup>
</Project>
```

- [ ] **Step 2: Update Program.cs for dependency injection and Table Storage**

Replace `api/Program.cs` with:

```csharp
using Azure.Data.Tables;

var builder = WebApplicationBuilder.CreateBuilder(args);

// Add services
builder.Services.AddControllers();
builder.Services.AddOpenApi();
builder.Services.AddSwaggerGen();
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", b => b.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader());
});

// Register Azure Table Storage client
var connectionString = builder.Configuration.GetConnectionString("AzureTableStorage") 
    ?? "UseDevelopmentStorage=true"; // Local Azure Storage Emulator for dev
builder.Services.AddSingleton(new TableServiceClient(connectionString));

var app = builder.Build();

// Configure middleware
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("AllowAll");
app.UseRouting();
app.MapControllers();

app.Run();
```

- [ ] **Step 3: Run restore to verify dependencies**

```bash
cd api
dotnet restore
```

Expected: All packages restore without errors.

- [ ] **Step 4: Commit**

```bash
cd api
git add api.csproj Program.cs
git commit -m "setup: configure ASP.NET Core with Azure Table Storage"
```

---

### Task 2: Define Storage Models and Game Models

**Files:**
- Create: `api/Models/StorageModels.cs`
- Create: `api/Models/GameModels.cs`

- [ ] **Step 1: Create StorageModels.cs with Azure Table Storage entities**

Create `api/Models/StorageModels.cs`:

```csharp
using Azure;
using Azure.Data.Tables;

namespace EzOrd.Models
{
    public class GameEntity : ITableEntity
    {
        public string PartitionKey { get; set; } = string.Empty;
        public string RowKey { get; set; } = string.Empty;
        public DateTimeOffset? Timestamp { get; set; }
        public ETag ETag { get; set; }

        public DateTime StartedAt { get; set; }
        public DateTime? EndedAt { get; set; }
        public string Categories { get; set; } = string.Empty; // JSON array of category IDs
        public string? UserId { get; set; }
        public string GameType { get; set; } = string.Empty; // drawing, scrabble, word_explanation, acting
    }

    public class GameWordEntity : ITableEntity
    {
        public string PartitionKey { get; set; } = string.Empty; // Game ID
        public string RowKey { get; set; } = string.Empty; // Sequence number (0, 1, 2, ...)
        public DateTimeOffset? Timestamp { get; set; }
        public ETag ETag { get; set; }

        public string WordId { get; set; } = string.Empty;
        public string Word { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
        public DateTime DrawnAt { get; set; }
    }

    public class WordRatingEntity : ITableEntity
    {
        public string PartitionKey { get; set; } = string.Empty; // Word ID
        public string RowKey { get; set; } = string.Empty; // Game ID
        public DateTimeOffset? Timestamp { get; set; }
        public ETag ETag { get; set; }

        public string Difficulty { get; set; } = string.Empty; // easy, medium, hard, skipped
        public string GameType { get; set; } = string.Empty;
        public DateTime RatedAt { get; set; }
    }

    public class WordEntity : ITableEntity
    {
        public string PartitionKey { get; set; } = string.Empty; // Category (noun, verb, etc.)
        public string RowKey { get; set; } = string.Empty; // Word ID
        public DateTimeOffset? Timestamp { get; set; }
        public ETag ETag { get; set; }

        public string Word { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
        public int UsageCount { get; set; } = 0;
        public double? Rating { get; set; }
    }

    public class CategoryEntity
    {
        public string Id { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
    }
}
```

- [ ] **Step 2: Create GameModels.cs with DTOs**

Create `api/Models/GameModels.cs`:

```csharp
namespace EzOrd.Models
{
    // Requests
    public class GameStartRequest
    {
        public string GameType { get; set; } = string.Empty; // drawing, scrabble, word_explanation, acting
        public List<string> Categories { get; set; } = new();
    }

    public class RateWordRequest
    {
        public string WordId { get; set; } = string.Empty;
        public string DifficultyRating { get; set; } = string.Empty; // easy, medium, hard
    }

    public class SkipWordRequest
    {
        public string WordId { get; set; } = string.Empty;
    }

    // Responses
    public class GameStartResponse
    {
        public string GameId { get; set; } = string.Empty;
        public string GameType { get; set; } = string.Empty;
        public List<string> Categories { get; set; } = new();
        public DateTime StartedAt { get; set; }
    }

    public class WordResponse
    {
        public string Word { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
        public string WordId { get; set; } = string.Empty;
    }

    public class GameEndResponse
    {
        public string GameId { get; set; } = string.Empty;
        public DateTime EndedAt { get; set; }
        public int WordCount { get; set; }
    }

    public class GameDetailsResponse
    {
        public string GameId { get; set; } = string.Empty;
        public string GameType { get; set; } = string.Empty;
        public List<string> Categories { get; set; } = new();
        public DateTime StartedAt { get; set; }
        public DateTime? EndedAt { get; set; }
        public List<GameWordDetailsDto> Words { get; set; } = new();
    }

    public class GameWordDetailsDto
    {
        public int Sequence { get; set; }
        public string Word { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
        public DateTime DrawnAt { get; set; }
        public string? Rating { get; set; } // easy, medium, hard, skipped, or null if not rated
    }

    public class CategoriesResponse
    {
        public List<CategoryDto> Categories { get; set; } = new();
    }

    public class CategoryDto
    {
        public string Id { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
    }

    public class ApiResponse<T>
    {
        public bool Success { get; set; }
        public T? Data { get; set; }
        public string? Message { get; set; }
    }
}
```

- [ ] **Step 3: Commit**

```bash
cd api
git add Models/StorageModels.cs Models/GameModels.cs
git commit -m "models: add Azure Table Storage entities and API DTOs"
```

---

### Task 3: Implement Storage Service

**Files:**
- Create: `api/Services/StorageService.cs`

- [ ] **Step 1: Create StorageService.cs**

Create `api/Services/StorageService.cs`:

```csharp
using Azure.Data.Tables;
using EzOrd.Models;

namespace EzOrd.Services
{
    public class StorageService
    {
        private readonly TableServiceClient _tableServiceClient;
        private TableClient _gamesTable = null!;
        private TableClient _gameWordsTable = null!;
        private TableClient _wordRatingsTable = null!;
        private TableClient _wordsTable = null!;

        public StorageService(TableServiceClient tableServiceClient)
        {
            _tableServiceClient = tableServiceClient;
        }

        public async Task InitializeAsync()
        {
            _gamesTable = _tableServiceClient.GetTableClient("Games");
            _gameWordsTable = _tableServiceClient.GetTableClient("GameWords");
            _wordRatingsTable = _tableServiceClient.GetTableClient("WordRatings");
            _wordsTable = _tableServiceClient.GetTableClient("Words");

            // Create tables if they don't exist
            await _gamesTable.CreateIfNotExistsAsync();
            await _gameWordsTable.CreateIfNotExistsAsync();
            await _wordRatingsTable.CreateIfNotExistsAsync();
        }

        // Games
        public async Task<GameEntity?> GetGameAsync(string gameId)
        {
            try
            {
                return await _gamesTable.GetEntityAsync<GameEntity>($"game_drawing", gameId); // Simplified for now
            }
            catch
            {
                return null;
            }
        }

        public async Task InsertGameAsync(GameEntity game)
        {
            game.PartitionKey = $"game_{game.GameType}";
            game.RowKey = game.RowKey; // Game ID already set
            await _gamesTable.AddEntityAsync(game);
        }

        public async Task UpdateGameAsync(GameEntity game)
        {
            await _gamesTable.UpdateEntityAsync(game, Azure.ETag.All);
        }

        // GameWords
        public async Task InsertGameWordAsync(GameWordEntity gameWord)
        {
            await _gameWordsTable.AddEntityAsync(gameWord);
        }

        public async Task<List<GameWordEntity>> GetGameWordsAsync(string gameId)
        {
            var query = _gameWordsTable.QueryAsync<GameWordEntity>(w => w.PartitionKey == gameId);
            var results = new List<GameWordEntity>();
            await foreach (var item in query)
            {
                results.Add(item);
            }
            return results.OrderBy(w => int.Parse(w.RowKey)).ToList();
        }

        public async Task<int> GetGameWordCountAsync(string gameId)
        {
            var words = await GetGameWordsAsync(gameId);
            return words.Count;
        }

        // WordRatings
        public async Task InsertRatingAsync(WordRatingEntity rating)
        {
            await _wordRatingsTable.AddEntityAsync(rating);
        }

        public async Task<WordRatingEntity?> GetRatingAsync(string wordId, string gameId)
        {
            try
            {
                return await _wordRatingsTable.GetEntityAsync<WordRatingEntity>(wordId, gameId);
            }
            catch
            {
                return null;
            }
        }

        // Words
        public async Task<WordEntity?> GetWordAsync(string wordId, string category)
        {
            try
            {
                return await _wordsTable.GetEntityAsync<WordEntity>(category, wordId);
            }
            catch
            {
                return null;
            }
        }

        public async Task<List<WordEntity>> GetWordsByCategoriesAsync(List<string> categories)
        {
            var results = new List<WordEntity>();
            foreach (var category in categories)
            {
                var query = _wordsTable.QueryAsync<WordEntity>(w => w.PartitionKey == category);
                await foreach (var item in query)
                {
                    results.Add(item);
                }
            }
            return results;
        }

        public async Task UpdateWordUsageAsync(WordEntity word)
        {
            word.UsageCount++;
            await _wordsTable.UpdateEntityAsync(word, Azure.ETag.All);
        }

        public async Task<List<string>> GetCategoriesAsync()
        {
            var query = _wordsTable.QueryAsync<WordEntity>();
            var categories = new HashSet<string>();
            await foreach (var item in query)
            {
                categories.Add(item.Category);
            }
            return categories.OrderBy(c => c).ToList();
        }
    }
}
```

- [ ] **Step 2: Register StorageService in Program.cs**

Update `api/Program.cs` to add the storage service:

```csharp
// Add after Table Storage client registration
builder.Services.AddSingleton<StorageService>();

// Add hosted service to initialize tables
builder.Services.AddHostedService<StorageInitializerService>();
```

- [ ] **Step 3: Create StorageInitializerService to initialize tables on startup**

Create `api/Services/StorageInitializerService.cs`:

```csharp
namespace EzOrd.Services
{
    public class StorageInitializerService : IHostedService
    {
        private readonly StorageService _storageService;

        public StorageInitializerService(StorageService storageService)
        {
            _storageService = storageService;
        }

        public async Task StartAsync(CancellationToken cancellationToken)
        {
            await _storageService.InitializeAsync();
        }

        public Task StopAsync(CancellationToken cancellationToken) => Task.CompletedTask;
    }
}
```

- [ ] **Step 4: Commit**

```bash
cd api
git add Services/StorageService.cs Services/StorageInitializerService.cs Program.cs
git commit -m "services: implement Azure Table Storage service layer"
```

---

### Task 4: Implement Game Service (Business Logic)

**Files:**
- Create: `api/Services/GameService.cs`

- [ ] **Step 1: Create GameService.cs**

Create `api/Services/GameService.cs`:

```csharp
using EzOrd.Models;
using System.Text.Json;

namespace EzOrd.Services
{
    public class GameService
    {
        private readonly StorageService _storage;

        public GameService(StorageService storage)
        {
            _storage = storage;
        }

        // Create a new game session
        public async Task<GameStartResponse> StartGameAsync(GameStartRequest request)
        {
            var gameId = Guid.NewGuid().ToString();
            var now = DateTime.UtcNow;

            var game = new GameEntity
            {
                RowKey = gameId,
                GameType = request.GameType,
                Categories = JsonSerializer.Serialize(request.Categories),
                StartedAt = now,
                UserId = null
            };

            await _storage.InsertGameAsync(game);

            return new GameStartResponse
            {
                GameId = gameId,
                GameType = request.GameType,
                Categories = request.Categories,
                StartedAt = now
            };
        }

        // Get next random word for a game
        public async Task<WordResponse> GetNextWordAsync(string gameId)
        {
            var game = await _storage.GetGameAsync(gameId);
            if (game == null)
                throw new InvalidOperationException("Game not found");

            if (game.EndedAt.HasValue)
                throw new InvalidOperationException("Game has already ended");

            var categories = JsonSerializer.Deserialize<List<string>>(game.Categories) ?? new();
            var words = await _storage.GetWordsByCategoriesAsync(categories);

            if (words.Count == 0)
                throw new InvalidOperationException("No words available in selected categories");

            // Random selection
            var random = new Random();
            var selectedWord = words[random.Next(words.Count)];

            // Create GameWord entry
            var sequence = await _storage.GetGameWordCountAsync(gameId);
            var gameWord = new GameWordEntity
            {
                PartitionKey = gameId,
                RowKey = sequence.ToString(),
                WordId = selectedWord.RowKey,
                Word = selectedWord.Word,
                Category = selectedWord.Category,
                DrawnAt = DateTime.UtcNow
            };

            await _storage.InsertGameWordAsync(gameWord);

            // Increment usage count
            await _storage.UpdateWordUsageAsync(selectedWord);

            return new WordResponse
            {
                Word = selectedWord.Word,
                Category = selectedWord.Category,
                WordId = selectedWord.RowKey
            };
        }

        // Rate a word
        public async Task RateWordAsync(string gameId, RateWordRequest request)
        {
            var game = await _storage.GetGameAsync(gameId);
            if (game == null)
                throw new InvalidOperationException("Game not found");

            var rating = new WordRatingEntity
            {
                PartitionKey = request.WordId,
                RowKey = gameId,
                Difficulty = request.DifficultyRating,
                GameType = game.GameType,
                RatedAt = DateTime.UtcNow
            };

            await _storage.InsertRatingAsync(rating);
        }

        // Skip a word
        public async Task SkipWordAsync(string gameId, SkipWordRequest request)
        {
            var game = await _storage.GetGameAsync(gameId);
            if (game == null)
                throw new InvalidOperationException("Game not found");

            var rating = new WordRatingEntity
            {
                PartitionKey = request.WordId,
                RowKey = gameId,
                Difficulty = "skipped",
                GameType = game.GameType,
                RatedAt = DateTime.UtcNow
            };

            await _storage.InsertRatingAsync(rating);
        }

        // End a game
        public async Task<GameEndResponse> EndGameAsync(string gameId)
        {
            var game = await _storage.GetGameAsync(gameId);
            if (game == null)
                throw new InvalidOperationException("Game not found");

            game.EndedAt = DateTime.UtcNow;
            await _storage.UpdateGameAsync(game);

            var wordCount = await _storage.GetGameWordCountAsync(gameId);

            return new GameEndResponse
            {
                GameId = gameId,
                EndedAt = game.EndedAt.Value,
                WordCount = wordCount
            };
        }

        // Get game details
        public async Task<GameDetailsResponse> GetGameDetailsAsync(string gameId)
        {
            var game = await _storage.GetGameAsync(gameId);
            if (game == null)
                throw new InvalidOperationException("Game not found");

            var gameWords = await _storage.GetGameWordsAsync(gameId);
            var categories = JsonSerializer.Deserialize<List<string>>(game.Categories) ?? new();

            var wordDetails = new List<GameWordDetailsDto>();
            foreach (var gw in gameWords)
            {
                var rating = await _storage.GetRatingAsync(gw.WordId, gameId);
                wordDetails.Add(new GameWordDetailsDto
                {
                    Sequence = int.Parse(gw.RowKey),
                    Word = gw.Word,
                    Category = gw.Category,
                    DrawnAt = gw.DrawnAt,
                    Rating = rating?.Difficulty
                });
            }

            return new GameDetailsResponse
            {
                GameId = gameId,
                GameType = game.GameType,
                Categories = categories,
                StartedAt = game.StartedAt,
                EndedAt = game.EndedAt,
                Words = wordDetails
            };
        }
    }
}
```

- [ ] **Step 2: Register GameService in Program.cs**

Update `api/Program.cs`:

```csharp
builder.Services.AddScoped<GameService>();
```

- [ ] **Step 3: Commit**

```bash
cd api
git add Services/GameService.cs Program.cs
git commit -m "services: implement game business logic"
```

---

### Task 5: Implement API Controllers

**Files:**
- Create: `api/Controllers/GamesController.cs`
- Create: `api/Controllers/CategoriesController.cs`

- [ ] **Step 1: Create GamesController.cs**

Create `api/Controllers/GamesController.cs`:

```csharp
using Microsoft.AspNetCore.Mvc;
using EzOrd.Models;
using EzOrd.Services;

namespace EzOrd.Controllers
{
    [ApiController]
    [Route("api/games")]
    public class GamesController : ControllerBase
    {
        private readonly GameService _gameService;

        public GamesController(GameService gameService)
        {
            _gameService = gameService;
        }

        [HttpPost("start")]
        public async Task<ActionResult<GameStartResponse>> StartGame([FromBody] GameStartRequest request)
        {
            try
            {
                var response = await _gameService.StartGameAsync(request);
                return Ok(new ApiResponse<GameStartResponse> { Success = true, Data = response });
            }
            catch (Exception ex)
            {
                return BadRequest(new ApiResponse<object> { Success = false, Message = ex.Message });
            }
        }

        [HttpGet("{gameId}/next-word")]
        public async Task<ActionResult<WordResponse>> GetNextWord(string gameId)
        {
            try
            {
                var response = await _gameService.GetNextWordAsync(gameId);
                return Ok(new ApiResponse<WordResponse> { Success = true, Data = response });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new ApiResponse<object> { Success = false, Message = ex.Message });
            }
        }

        [HttpPost("{gameId}/rate-word")]
        public async Task<ActionResult> RateWord(string gameId, [FromBody] RateWordRequest request)
        {
            try
            {
                await _gameService.RateWordAsync(gameId, request);
                return Ok(new ApiResponse<object> { Success = true });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new ApiResponse<object> { Success = false, Message = ex.Message });
            }
        }

        [HttpPost("{gameId}/skip-word")]
        public async Task<ActionResult> SkipWord(string gameId, [FromBody] SkipWordRequest request)
        {
            try
            {
                await _gameService.SkipWordAsync(gameId, request);
                return Ok(new ApiResponse<object> { Success = true });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new ApiResponse<object> { Success = false, Message = ex.Message });
            }
        }

        [HttpPost("{gameId}/end")]
        public async Task<ActionResult<GameEndResponse>> EndGame(string gameId)
        {
            try
            {
                var response = await _gameService.EndGameAsync(gameId);
                return Ok(new ApiResponse<GameEndResponse> { Success = true, Data = response });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new ApiResponse<object> { Success = false, Message = ex.Message });
            }
        }

        [HttpGet("{gameId}")]
        public async Task<ActionResult<GameDetailsResponse>> GetGameDetails(string gameId)
        {
            try
            {
                var response = await _gameService.GetGameDetailsAsync(gameId);
                return Ok(new ApiResponse<GameDetailsResponse> { Success = true, Data = response });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new ApiResponse<object> { Success = false, Message = ex.Message });
            }
        }
    }
}
```

- [ ] **Step 2: Create CategoriesController.cs**

Create `api/Controllers/CategoriesController.cs`:

```csharp
using Microsoft.AspNetCore.Mvc;
using EzOrd.Models;
using EzOrd.Services;

namespace EzOrd.Controllers
{
    [ApiController]
    [Route("api/categories")]
    public class CategoriesController : ControllerBase
    {
        private readonly StorageService _storageService;

        public CategoriesController(StorageService storageService)
        {
            _storageService = storageService;
        }

        [HttpGet]
        public async Task<ActionResult<CategoriesResponse>> GetCategories()
        {
            try
            {
                var categoryNames = await _storageService.GetCategoriesAsync();
                var categories = categoryNames.Select((name, index) => new CategoryDto 
                { 
                    Id = name, // For now, use name as ID
                    Name = name 
                }).ToList();

                return Ok(new ApiResponse<CategoriesResponse> 
                { 
                    Success = true, 
                    Data = new CategoriesResponse { Categories = categories } 
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ApiResponse<object> { Success = false, Message = ex.Message });
            }
        }
    }
}
```

- [ ] **Step 3: Test API endpoints locally**

Build and run the API:

```bash
cd api
dotnet build
dotnet run
```

Expected: API starts on `https://localhost:5001` (or similar). Swagger UI available at `/swagger`.

- [ ] **Step 4: Commit**

```bash
cd api
git add Controllers/GamesController.cs Controllers/CategoriesController.cs
git commit -m "controllers: implement game and category API endpoints"
```

---

## Frontend Implementation

### Task 6: Create TypeScript Types and API Client

**Files:**
- Create: `app/app/types/game.ts`
- Create: `app/app/services/api.ts`

- [ ] **Step 1: Create game.ts with TypeScript interfaces**

Create `app/app/types/game.ts`:

```typescript
export interface Game {
  gameId: string;
  gameType: 'drawing' | 'scrabble' | 'word_explanation' | 'acting';
  categories: string[];
  startedAt: string;
  endedAt?: string;
}

export interface Word {
  word: string;
  category: string;
  wordId: string;
}

export interface Category {
  id: string;
  name: string;
}

export interface GameSetupParams {
  gameType: 'drawing' | 'scrabble' | 'word_explanation' | 'acting';
  categories: string[];
}

export interface RatingPayload {
  wordId: string;
  difficultyRating: 'easy' | 'medium' | 'hard';
}

export interface SkipPayload {
  wordId: string;
}

export interface GameWordDetails {
  sequence: number;
  word: string;
  category: string;
  drawnAt: string;
  rating?: 'easy' | 'medium' | 'hard' | 'skipped';
}

export interface GameSummary {
  gameId: string;
  gameType: 'drawing' | 'scrabble' | 'word_explanation' | 'acting';
  categories: string[];
  startedAt: string;
  endedAt?: string;
  words: GameWordDetails[];
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}
```

- [ ] **Step 2: Create api.ts HTTP client wrapper**

Create `app/app/services/api.ts`:

```typescript
import axios, { AxiosInstance } from 'axios';
import { 
  Game, 
  Word, 
  Category, 
  GameSetupParams, 
  RatingPayload, 
  SkipPayload, 
  GameSummary,
  ApiResponse 
} from '../types/game';

class GameAPI {
  private client: AxiosInstance;

  constructor(baseURL: string = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:5001') {
    this.client = axios.create({
      baseURL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  // Start a new game
  async startGame(params: GameSetupParams): Promise<Game> {
    const response = await this.client.post<ApiResponse<Game>>('/api/games/start', {
      gameType: params.gameType,
      categories: params.categories,
    });
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || 'Failed to start game');
    }
    return response.data.data;
  }

  // Get next word
  async getNextWord(gameId: string): Promise<Word> {
    const response = await this.client.get<ApiResponse<Word>>(`/api/games/${gameId}/next-word`);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || 'Failed to get word');
    }
    return response.data.data;
  }

  // Rate a word
  async rateWord(gameId: string, payload: RatingPayload): Promise<void> {
    const response = await this.client.post<ApiResponse<void>>(`/api/games/${gameId}/rate-word`, {
      wordId: payload.wordId,
      difficultyRating: payload.difficultyRating,
    });
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to rate word');
    }
  }

  // Skip a word
  async skipWord(gameId: string, payload: SkipPayload): Promise<void> {
    const response = await this.client.post<ApiResponse<void>>(`/api/games/${gameId}/skip-word`, {
      wordId: payload.wordId,
    });
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to skip word');
    }
  }

  // End a game
  async endGame(gameId: string): Promise<void> {
    const response = await this.client.post<ApiResponse<void>>(`/api/games/${gameId}/end`);
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to end game');
    }
  }

  // Get game summary
  async getGameSummary(gameId: string): Promise<GameSummary> {
    const response = await this.client.get<ApiResponse<GameSummary>>(`/api/games/${gameId}`);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || 'Failed to get game summary');
    }
    return response.data.data;
  }

  // Get categories
  async getCategories(): Promise<Category[]> {
    const response = await this.client.get<ApiResponse<{ categories: Category[] }>>('/api/categories');
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || 'Failed to get categories');
    }
    return response.data.data.categories;
  }
}

export const gameAPI = new GameAPI();
export default gameAPI;
```

- [ ] **Step 3: Install axios in app directory**

```bash
cd app
npm install axios
```

Expected: axios added to package.json.

- [ ] **Step 4: Commit**

```bash
cd app
git add app/types/game.ts app/services/api.ts package.json package-lock.json
git commit -m "types: add game types and API client"
```

---

### Task 7: Modify useGameState Hook to Use API

**Files:**
- Modify: `app/hooks/useGameState.ts`

**Note:** The game screens (setup, play, review, summary) already exist in `app/app/games/` with full Stone component and design token integration. This task updates the state management hook to call the API instead of managing local state, allowing the existing beautiful screens to work with the backend.

- [ ] **Step 1: Update useGameState to integrate with API**

Read `app/hooks/useGameState.ts` to understand the current local state structure, then modify it to:
1. Store `gameId` and `gameState` (setup, playing, reviewing, complete)
2. Call `gameAPI.startGame()` when starting a game
3. Call `gameAPI.getNextWord()` to fetch the current word
4. Call `gameAPI.rateWord()` or `gameAPI.skipWord()` when rating/skipping
5. Call `gameAPI.endGame()` when ending the game
6. Fetch categories from API instead of hardcoded values

The hook should maintain a similar dispatch-based interface so the existing screens (`setup.tsx`, `play.tsx`, `review.tsx`, `summary.tsx`) can continue to use it without major changes. Actions should include: `START_GAME`, `NEXT_WORD`, `SET_RATING`, `SKIP_WORD`, `END_GAME`, `GO_TO_MENU`, `PLAY_AGAIN`.

Example pattern:
```typescript
import { useReducer, useCallback } from 'react';
import { gameAPI } from '@/services/api';
import type { Game, Word, Category } from '@/types/game';

interface GameState {
  gameId: string | null;
  currentWord: Word | null;
  rating: 'easy' | 'medium' | 'hard' | null;
  playedWords: Array<{ word: string; category: string; rating?: string }>;
  categories: Category[];
  // ... other state as needed
}

type GameAction = 
  | { type: 'START_GAME'; payload: { gameId: string; categories: string[] } }
  | { type: 'SET_WORD'; payload: Word }
  | { type: 'SET_RATING'; payload: 'easy' | 'medium' | 'hard' | null }
  // ... other actions

export const useGameState = () => {
  const [state, dispatch] = useReducer(gameReducer, initialState);
  
  const startGame = useCallback(async (gameType: string, selectedCategories: string[]) => {
    const game = await gameAPI.startGame({ gameType, categories: selectedCategories });
    dispatch({ type: 'START_GAME', payload: { gameId: game.gameId, categories: game.categories } });
    const word = await gameAPI.getNextWord(game.gameId);
    dispatch({ type: 'SET_WORD', payload: word });
  }, []);
  
  // ... other methods
  
  return { state, dispatch, startGame };
};
```

- [ ] **Step 2: Verify existing screens continue to work**

Ensure the modified hook maintains API compatibility with existing screens by:
1. Keeping the same reducer action types
2. Maintaining the same state shape
3. Testing that dispatch calls from screens still work

- [ ] **Step 3: Commit**

```bash
cd app
git add hooks/useGameState.ts
git commit -m "hooks: integrate useGameState with API instead of local state"
```

---

## Configuration & Testing

### Task 8: Add Configuration for API Base URL

**Files:**
- Create/Modify: `.env.local`
- Modify: `app/.env.example` and `app/.env`

- [ ] **Step 1: Create .env files for app**

Create `app/.env`:
```
EXPO_PUBLIC_API_BASE_URL=http://localhost:5001
```

Create `app/.env.production`:
```
EXPO_PUBLIC_API_BASE_URL=https://ez-ord-api.azurewebsites.net
```

(Replace with your actual Azure deployment URL when ready)

- [ ] **Step 2: Update api/appsettings.json for Table Storage**

Ensure `api/appsettings.json` has:
```json
{
  "ConnectionStrings": {
    "AzureTableStorage": "UseDevelopmentStorage=true"
  }
}
```

For production, set via Azure Key Vault or environment variables.

- [ ] **Step 3: Commit**

```bash
git add app/.env app/.env.production api/appsettings.json
git commit -m "config: add environment configuration for API and storage"
```

---

### Task 9: Write Unit Tests for Backend

**Files:**
- Create: `api/Tests/GameServiceTests.cs`

- [ ] **Step 1: Create test project and basic tests**

Create `api/Tests/GameServiceTests.cs`:

```csharp
using Xunit;
using Moq;
using EzOrd.Services;
using EzOrd.Models;
using System.Text.Json;

namespace EzOrd.Tests
{
    public class GameServiceTests
    {
        private readonly Mock<StorageService> _mockStorage;
        private readonly GameService _gameService;

        public GameServiceTests()
        {
            _mockStorage = new Mock<StorageService>(new Mock<Azure.Data.Tables.TableServiceClient>().Object);
            _gameService = new GameService(_mockStorage.Object);
        }

        [Fact]
        public async Task StartGame_CreatesGameWithValidParams()
        {
            // Arrange
            var request = new GameStartRequest
            {
                GameType = "drawing",
                Categories = new List<string> { "noun", "verb" }
            };

            // Act
            var response = await _gameService.StartGameAsync(request);

            // Assert
            Assert.NotNull(response);
            Assert.Equal("drawing", response.GameType);
            Assert.Equal(2, response.Categories.Count);
            _mockStorage.Verify(s => s.InsertGameAsync(It.IsAny<GameEntity>()), Times.Once);
        }
    }
}
```

Create `api/Tests/Tests.csproj`:

```xml
<Project Sdk="Microsoft.NET.Sdk">
  <PropertyGroup>
    <TargetFramework>net8.0</TargetFramework>
  </PropertyGroup>

  <ItemGroup>
    <PackageReference Include="Microsoft.NET.Test.Sdk" Version="17.8.0" />
    <PackageReference Include="xunit" Version="2.6.3" />
    <PackageReference Include="xunit.runner.visualstudio" Version="2.5.3" />
    <PackageReference Include="Moq" Version="4.20.70" />
  </ItemGroup>

  <ItemGroup>
    <ProjectReference Include="../api.csproj" />
  </ItemGroup>
</Project>
```

- [ ] **Step 2: Run tests**

```bash
cd api
dotnet test
```

Expected: Tests pass.

- [ ] **Step 3: Commit**

```bash
cd api
git add Tests/GameServiceTests.cs Tests/Tests.csproj
git commit -m "tests: add unit tests for game service"
```

---

### Task 10: Write Component Tests for Frontend

**Files:**
- Create: `app/app/__tests__/api.test.ts`

- [ ] **Step 1: Create API client tests**

Create `app/app/__tests__/api.test.ts`:

```typescript
import { gameAPI } from '../services/api';
import axios from 'axios';

jest.mock('axios');

describe('gameAPI', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('startGame should call POST /api/games/start', async () => {
    const mockResponse = {
      data: {
        success: true,
        data: {
          gameId: 'test-id',
          gameType: 'drawing',
          categories: ['noun'],
          startedAt: '2024-01-01T00:00:00Z',
        },
      },
    };

    (axios.post as jest.Mock).mockResolvedValue(mockResponse);

    const result = await gameAPI.startGame({
      gameType: 'drawing',
      categories: ['noun'],
    });

    expect(result.gameId).toBe('test-id');
  });

  it('getNextWord should call GET /api/games/{gameId}/next-word', async () => {
    const mockResponse = {
      data: {
        success: true,
        data: {
          word: 'hús',
          category: 'noun',
          wordId: 'word-id',
        },
      },
    };

    (axios.get as jest.Mock).mockResolvedValue(mockResponse);

    const result = await gameAPI.getNextWord('game-id');

    expect(result.word).toBe('hús');
  });
});
```

- [ ] **Step 2: Run frontend tests**

```bash
cd app
npm test
```

Expected: Tests pass.

- [ ] **Step 3: Commit**

```bash
cd app
git add app/__tests__/api.test.ts
git commit -m "tests: add API client tests"
```

---

### Task 11: Build and Test Locally

- [ ] **Step 1: Build ASP.NET Core API**

```bash
cd api
dotnet build
dotnet run
```

Expected: API runs on `https://localhost:5001`, Swagger UI available.

- [ ] **Step 2: Start Expo development server**

```bash
cd app
npm install
npm start
```

Expected: Expo dev menu appears, press `w` for web version or `i`/`a` for iOS/Android.

- [ ] **Step 3: Manual testing flow**

1. Navigate to game setup screen
2. Select a game type and at least one category
3. Click "Start Game"
4. Verify word appears from API
5. Click "Review" and rate a word
6. Click next and repeat
7. Click "End Game" and confirm
8. Verify summary screen shows played words

- [ ] **Step 4: Verify API calls in browser console**

Check for successful network requests to `/api/games/start`, `/api/games/{id}/next-word`, etc.

---

### Task 12: Final Cleanup and Documentation

- [ ] **Step 1: Update README with setup instructions**

Add to `README.md`:

```markdown
## Development Setup

### Backend (API)
```bash
cd api
dotnet restore
dotnet run
```

### Frontend (App)
```bash
cd app
npm install
npm start
```

Press `w` for web, `i` for iOS, `a` for Android.

### Environment Configuration
- Backend: `api/appsettings.json` (local Azure Storage Emulator)
- Frontend: `app/.env` (API base URL)
```

- [ ] **Step 2: Update .gitignore**

Ensure `api/bin`, `api/obj`, `app/node_modules`, `app/dist` are ignored.

- [ ] **Step 3: Final commit**

```bash
git add README.md .gitignore
git commit -m "docs: add development setup instructions"
```

---

## Summary

This plan implements the complete game flow:

1. **Backend (C# / ASP.NET Core):** API endpoints, storage layer, business logic for games/words/ratings
2. **Frontend (Expo / React Native):** Uses existing beautifully designed screens (setup, play, review, summary) with design tokens and Stone components. Integrates API via useGameState hook and API client.
3. **Testing:** Unit tests for services, API client tests
4. **Configuration:** Environment setup for local development and production

The implementation preserves the existing design work and follows clean architecture: thin client with API integration, stateful backend, persistent storage. Ready for future features (adaptive difficulty, player stats, multiplayer).
