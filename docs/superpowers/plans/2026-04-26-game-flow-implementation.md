# Game Flow Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the core game flow: API endpoints for game sessions, word drawing, rating/skipping words; Expo frontend screens for game setup, play, and review.

**Architecture:** 
- **Backend:** ASP.NET Core 8 API using Azure Table Storage for persistence. Controllers expose RESTful endpoints; services encapsulate game logic; storage layer handles all database operations.
- **Frontend:** Expo/React Native with TypeScript. Screens are functional components connected via Expo Router; API client abstracts HTTP calls; custom hooks manage game state.

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
- **app/app/types/game.ts** — TypeScript interfaces (Game, Word, GameSetupParams, RatingPayload, etc.)
- **app/app/services/api.ts** — HTTP client wrapper; functions for each API call (startGame, getNextWord, rateWord, skipWord, endGame, getCategories)
- **app/app/screens/GameSetupScreen.tsx** — Game type selector, category multi-select, "Start Game" button
- **app/app/screens/GamePlayScreen.tsx** — Display current word + category, buttons for Review/Skip/End Game
- **app/app/screens/GameReviewScreen.tsx** — Show word + category larger, difficulty rating selector (Easy/Medium/Hard), "Next Word" button
- **app/app/screens/GameSummaryScreen.tsx** — (Post-game) List words played + ratings, "Play Again" / "Main Menu" buttons
- **app/app/components/CategorySelector.tsx** — Reusable multi-select category picker
- **app/app/hooks/useGame.ts** — Custom hook managing game state (gameId, currentWord, gameType, categories, flow control)
- **app/app/Tests/api.test.ts** — API client tests
- **app/app/Tests/GamePlayScreen.test.tsx** — Component tests

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

### Task 7: Build GameSetupScreen

**Files:**
- Create: `app/app/components/CategorySelector.tsx`
- Create: `app/app/screens/GameSetupScreen.tsx`

- [ ] **Step 1: Create CategorySelector component**

Create `app/app/components/CategorySelector.tsx`:

```typescript
import React from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { Category } from '../types/game';

interface CategorySelectorProps {
  categories: Category[];
  selectedCategories: string[];
  onCategoryToggle: (categoryId: string) => void;
}

export const CategorySelector: React.FC<CategorySelectorProps> = ({
  categories,
  selectedCategories,
  onCategoryToggle,
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Select Word Categories:</Text>
      <ScrollView style={styles.scrollView}>
        {categories.map((category) => {
          const isSelected = selectedCategories.includes(category.id);
          return (
            <Pressable
              key={category.id}
              onPress={() => onCategoryToggle(category.id)}
              style={[styles.categoryButton, isSelected && styles.categoryButtonSelected]}
            >
              <Text style={[styles.categoryButtonText, isSelected && styles.categoryButtonTextSelected]}>
                {category.name}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  label: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  scrollView: {
    flex: 1,
    marginBottom: 16,
  },
  categoryButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginVertical: 8,
    borderRadius: 8,
    backgroundColor: '#e0e0e0',
  },
  categoryButtonSelected: {
    backgroundColor: '#4CAF50',
  },
  categoryButtonText: {
    fontSize: 16,
    color: '#000',
  },
  categoryButtonTextSelected: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
```

- [ ] **Step 2: Create GameSetupScreen**

Create `app/app/screens/GameSetupScreen.tsx`:

```typescript
import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Pressable, ActivityIndicator, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import gameAPI from '../services/api';
import { Category } from '../types/game';
import { CategorySelector } from '../components/CategorySelector';

type GameType = 'drawing' | 'scrabble' | 'word_explanation' | 'acting';

export default function GameSetupScreen() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [gameType, setGameType] = useState<GameType>('drawing');
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const cats = await gameAPI.getCategories();
      setCategories(cats);
      setLoading(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to load categories');
      setLoading(false);
    }
  };

  const toggleCategory = (categoryId: string) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleStartGame = async () => {
    if (selectedCategories.length === 0) {
      Alert.alert('Error', 'Please select at least one category');
      return;
    }

    setStarting(true);
    try {
      const game = await gameAPI.startGame({
        gameType,
        categories: selectedCategories,
      });
      // Navigate to play screen with game ID
      router.push({
        pathname: '/screens/GamePlayScreen',
        params: { gameId: game.gameId },
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to start game');
      setStarting(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Select Game Type</Text>
      <View style={styles.gameTypeContainer}>
        {(['drawing', 'scrabble', 'word_explanation', 'acting'] as GameType[]).map((type) => (
          <Pressable
            key={type}
            onPress={() => setGameType(type)}
            style={[styles.gameTypeButton, gameType === type && styles.gameTypeButtonSelected]}
          >
            <Text style={[styles.gameTypeText, gameType === type && styles.gameTypeTextSelected]}>
              {type.charAt(0).toUpperCase() + type.slice(1).replace('_', ' ')}
            </Text>
          </Pressable>
        ))}
      </View>

      <CategorySelector
        categories={categories}
        selectedCategories={selectedCategories}
        onCategoryToggle={toggleCategory}
      />

      <Pressable
        onPress={handleStartGame}
        disabled={starting}
        style={[styles.startButton, starting && styles.startButtonDisabled]}
      >
        {starting ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.startButtonText}>Start Game</Text>
        )}
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  gameTypeContainer: {
    flexDirection: 'column',
    marginBottom: 24,
  },
  gameTypeButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginVertical: 8,
    borderRadius: 8,
    backgroundColor: '#e0e0e0',
  },
  gameTypeButtonSelected: {
    backgroundColor: '#4CAF50',
  },
  gameTypeText: {
    fontSize: 16,
    color: '#000',
  },
  gameTypeTextSelected: {
    color: '#fff',
    fontWeight: 'bold',
  },
  startButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 32,
  },
  startButtonDisabled: {
    opacity: 0.5,
  },
  startButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
```

- [ ] **Step 3: Commit**

```bash
cd app
git add app/components/CategorySelector.tsx app/screens/GameSetupScreen.tsx
git commit -m "screens: implement game setup screen with category selection"
```

---

### Task 8: Build GamePlayScreen and GameReviewScreen

**Files:**
- Create: `app/app/screens/GamePlayScreen.tsx`
- Create: `app/app/screens/GameReviewScreen.tsx`
- Create: `app/app/hooks/useGame.ts`

- [ ] **Step 1: Create useGame hook**

Create `app/app/hooks/useGame.ts`:

```typescript
import { useState, useCallback } from 'react';
import gameAPI from '../services/api';
import { Word } from '../types/game';

export const useGame = (gameId: string) => {
  const [currentWord, setCurrentWord] = useState<Word | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchNextWord = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const word = await gameAPI.getNextWord(gameId);
      setCurrentWord(word);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch word');
    } finally {
      setLoading(false);
    }
  }, [gameId]);

  const rateWord = useCallback(
    async (difficulty: 'easy' | 'medium' | 'hard') => {
      if (!currentWord) return;
      try {
        await gameAPI.rateWord(gameId, {
          wordId: currentWord.wordId,
          difficultyRating: difficulty,
        });
        await fetchNextWord();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to rate word');
      }
    },
    [gameId, currentWord, fetchNextWord]
  );

  const skipWord = useCallback(async () => {
    if (!currentWord) return;
    try {
      await gameAPI.skipWord(gameId, { wordId: currentWord.wordId });
      await fetchNextWord();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to skip word');
    }
  }, [gameId, currentWord, fetchNextWord]);

  const endGame = useCallback(async () => {
    try {
      await gameAPI.endGame(gameId);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to end game');
      return false;
    }
  }, [gameId]);

  return {
    currentWord,
    loading,
    error,
    fetchNextWord,
    rateWord,
    skipWord,
    endGame,
  };
};
```

- [ ] **Step 2: Create GamePlayScreen**

Create `app/app/screens/GamePlayScreen.tsx`:

```typescript
import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, ActivityIndicator, StyleSheet, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useGame } from '../hooks/useGame';

export default function GamePlayScreen() {
  const router = useRouter();
  const { gameId } = useLocalSearchParams<{ gameId: string }>();
  const [showReview, setShowReview] = useState(false);
  const [endingGame, setEndingGame] = useState(false);

  const { currentWord, loading, error, fetchNextWord, endGame } = useGame(gameId || '');

  useEffect(() => {
    fetchNextWord();
  }, []);

  if (!gameId) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Invalid game ID</Text>
      </View>
    );
  }

  if (loading && !currentWord) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <Pressable onPress={() => fetchNextWord()} style={styles.retryButton}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </Pressable>
      </View>
    );
  }

  if (!currentWord) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>No word loaded</Text>
      </View>
    );
  }

  const handleEndGame = async () => {
    Alert.alert('End Game?', 'Are you sure you want to end this game?', [
      { text: 'Cancel', onPress: () => {} },
      {
        text: 'End',
        onPress: async () => {
          setEndingGame(true);
          const success = await endGame();
          if (success) {
            router.push({
              pathname: '/screens/GameSummaryScreen',
              params: { gameId },
            });
          } else {
            setEndingGame(false);
          }
        },
      },
    ]);
  };

  if (showReview) {
    return (
      <View style={styles.container}>
        <Text style={styles.reviewTitle}>Word</Text>
        <Text style={styles.reviewWord}>{currentWord.word}</Text>
        <Text style={styles.reviewCategory}>({currentWord.category})</Text>

        <Text style={styles.ratingLabel}>How difficult was this word?</Text>
        <View style={styles.ratingButtonContainer}>
          {(['easy', 'medium', 'hard'] as const).map((difficulty) => (
            <Pressable
              key={difficulty}
              onPress={() => setShowReview(false)} // Continue to next word via rateWord in GameReviewScreen
              style={styles.ratingButton}
            >
              <Text style={styles.ratingButtonText}>{difficulty.toUpperCase()}</Text>
            </Pressable>
          ))}
        </View>

        <Pressable
          onPress={() => setShowReview(false)}
          style={styles.reviewNextButton}
        >
          <Text style={styles.reviewNextButtonText}>Next Word</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.wordText}>{currentWord.word}</Text>
      <Text style={styles.categoryText}>{currentWord.category}</Text>

      <View style={styles.actionContainer}>
        <Pressable
          onPress={() => setShowReview(true)}
          style={styles.actionButton}
        >
          <Text style={styles.actionButtonText}>Review</Text>
        </Pressable>

        <Pressable
          onPress={() => {}} // Will be implemented in next task
          style={[styles.actionButton, styles.skipButton]}
        >
          <Text style={styles.actionButtonText}>Skip</Text>
        </Pressable>

        <Pressable
          onPress={handleEndGame}
          disabled={endingGame}
          style={[styles.actionButton, styles.endButton, endingGame && styles.buttonDisabled]}
        >
          <Text style={styles.actionButtonText}>End Game</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  wordText: {
    fontSize: 48,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  categoryText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 32,
  },
  actionContainer: {
    width: '100%',
    gap: 12,
  },
  actionButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  skipButton: {
    backgroundColor: '#FF9800',
  },
  endButton: {
    backgroundColor: '#f44336',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  reviewTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  reviewWord: {
    fontSize: 44,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  reviewCategory: {
    fontSize: 16,
    color: '#666',
    marginBottom: 32,
  },
  ratingLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  ratingButtonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 32,
  },
  ratingButton: {
    flex: 1,
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  ratingButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  reviewNextButton: {
    backgroundColor: '#2196F3',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    width: '100%',
  },
  reviewNextButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  errorText: {
    fontSize: 16,
    color: '#f44336',
  },
  retryButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginTop: 16,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
```

- [ ] **Step 3: Create GameReviewScreen**

Create `app/app/screens/GameReviewScreen.tsx`:

```typescript
import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useGame } from '../hooks/useGame';

export default function GameReviewScreen() {
  const router = useRouter();
  const { gameId, wordId } = useLocalSearchParams<{ gameId: string; wordId: string }>();
  const [selectedRating, setSelectedRating] = useState<'easy' | 'medium' | 'hard' | null>(null);
  const { currentWord, rateWord, skipWord } = useGame(gameId || '');

  if (!gameId || !currentWord) {
    return (
      <View style={styles.centerContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }

  const handleRate = async (difficulty: 'easy' | 'medium' | 'hard') => {
    setSelectedRating(difficulty);
    await rateWord(difficulty);
    // Continue to next word automatically
  };

  const handleSkip = async () => {
    await skipWord();
    // Continue to next word automatically
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Word</Text>
      <Text style={styles.word}>{currentWord.word}</Text>
      <Text style={styles.category}>({currentWord.category})</Text>

      <Text style={styles.ratingLabel}>How difficult was this word?</Text>
      <View style={styles.ratingContainer}>
        {(['easy', 'medium', 'hard'] as const).map((difficulty) => (
          <Pressable
            key={difficulty}
            onPress={() => handleRate(difficulty)}
            disabled={selectedRating !== null}
            style={[styles.ratingButton, selectedRating === difficulty && styles.ratingButtonSelected]}
          >
            <Text style={styles.ratingButtonText}>{difficulty.toUpperCase()}</Text>
          </Pressable>
        ))}
      </View>

      <Pressable
        onPress={handleSkip}
        disabled={selectedRating !== null}
        style={[styles.skipButton, selectedRating !== null && styles.buttonDisabled]}
      >
        <Text style={styles.skipButtonText}>Skip</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  word: {
    fontSize: 44,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  category: {
    fontSize: 16,
    color: '#666',
    marginBottom: 32,
  },
  ratingLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  ratingContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
    width: '100%',
  },
  ratingButton: {
    flex: 1,
    backgroundColor: '#e0e0e0',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  ratingButtonSelected: {
    backgroundColor: '#4CAF50',
  },
  ratingButtonText: {
    color: '#000',
    fontWeight: 'bold',
  },
  skipButton: {
    backgroundColor: '#FF9800',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    width: '100%',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  skipButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
```

- [ ] **Step 4: Commit**

```bash
cd app
git add app/hooks/useGame.ts app/screens/GamePlayScreen.tsx app/screens/GameReviewScreen.tsx
git commit -m "screens: implement play and review screens with game flow"
```

---

### Task 9: Build GameSummaryScreen

**Files:**
- Create: `app/app/screens/GameSummaryScreen.tsx`

- [ ] **Step 1: Create GameSummaryScreen**

Create `app/app/screens/GameSummaryScreen.tsx`:

```typescript
import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Pressable, ActivityIndicator, StyleSheet, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import gameAPI from '../services/api';
import { GameSummary } from '../types/game';

export default function GameSummaryScreen() {
  const router = useRouter();
  const { gameId } = useLocalSearchParams<{ gameId: string }>();
  const [gameSummary, setGameSummary] = useState<GameSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadGameSummary();
  }, []);

  const loadGameSummary = async () => {
    if (!gameId) {
      Alert.alert('Error', 'Invalid game ID');
      return;
    }

    try {
      const summary = await gameAPI.getGameSummary(gameId);
      setGameSummary(summary);
    } catch (error) {
      Alert.alert('Error', 'Failed to load game summary');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  if (!gameSummary) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Failed to load summary</Text>
        <Pressable onPress={() => router.back()} style={styles.retryButton}>
          <Text style={styles.retryButtonText}>Go Back</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Game Complete!</Text>
      <Text style={styles.stats}>{gameSummary.words.length} words played</Text>

      <Text style={styles.wordsTitle}>Words Played:</Text>
      <View style={styles.wordsList}>
        {gameSummary.words.map((word, index) => (
          <View key={index} style={styles.wordItem}>
            <Text style={styles.wordItemText}>{word.word}</Text>
            <Text style={styles.wordItemCategory}>({word.category})</Text>
            {word.rating && (
              <Text style={styles.wordItemRating}>Rating: {word.rating}</Text>
            )}
          </View>
        ))}
      </View>

      <View style={styles.buttonContainer}>
        <Pressable onPress={() => router.replace('/screens/GameSetupScreen')} style={styles.primaryButton}>
          <Text style={styles.primaryButtonText}>Play Again</Text>
        </Pressable>
        <Pressable onPress={() => router.replace('/')} style={styles.secondaryButton}>
          <Text style={styles.secondaryButtonText}>Main Menu</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  stats: {
    fontSize: 18,
    textAlign: 'center',
    color: '#666',
    marginBottom: 32,
  },
  wordsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  wordsList: {
    marginBottom: 32,
  },
  wordItem: {
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  wordItemText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  wordItemCategory: {
    fontSize: 14,
    color: '#666',
  },
  wordItemRating: {
    fontSize: 12,
    color: '#4CAF50',
    marginTop: 4,
  },
  buttonContainer: {
    gap: 12,
    marginBottom: 32,
  },
  primaryButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  secondaryButton: {
    backgroundColor: '#2196F3',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  errorText: {
    fontSize: 16,
    color: '#f44336',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
```

- [ ] **Step 2: Commit**

```bash
cd app
git add app/screens/GameSummaryScreen.tsx
git commit -m "screens: implement game summary screen"
```

---

### Task 10: Wire Up Navigation in App Router

**Files:**
- Modify: `app/app/_layout.tsx` (if needed)
- Ensure screens are accessible via Expo Router

- [ ] **Step 1: Verify Expo Router setup**

The `app/app/` directory uses file-based routing. Ensure this structure exists:
```
app/app/
├── _layout.tsx (root layout)
├── index.tsx (home screen)
├── screens/
│   ├── GameSetupScreen.tsx
│   ├── GamePlayScreen.tsx
│   ├── GameReviewScreen.tsx
│   └── GameSummaryScreen.tsx
├── types/
│   └── game.ts
├── services/
│   └── api.ts
├── hooks/
│   └── useGame.ts
└── components/
    └── CategorySelector.tsx
```

Update `app/app/_layout.tsx` if needed to handle navigation:

```typescript
import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: 'Ez.Ord' }} />
      <Stack.Screen name="screens/GameSetupScreen" options={{ title: 'Setup Game' }} />
      <Stack.Screen name="screens/GamePlayScreen" options={{ title: 'Play' }} />
      <Stack.Screen name="screens/GameReviewScreen" options={{ title: 'Review' }} />
      <Stack.Screen name="screens/GameSummaryScreen" options={{ title: 'Summary' }} />
    </Stack>
  );
}
```

- [ ] **Step 2: Update home screen to navigate to game setup**

Ensure `app/app/index.tsx` has a button to start a game:

```typescript
import { Pressable, Text, View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

export default function HomeScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Ez.Ord</Text>
      <Text style={styles.subtitle}>Learn Icelandic Through Games</Text>
      <Pressable
        onPress={() => router.push('/screens/GameSetupScreen')}
        style={styles.button}
      >
        <Text style={styles.buttonText}>Start Game</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 32,
  },
  button: {
    backgroundColor: '#4CAF50',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
```

- [ ] **Step 3: Commit**

```bash
cd app
git add app/_layout.tsx app/index.tsx
git commit -m "nav: wire up Expo Router for game screens"
```

---

### Task 11: Add Configuration for API Base URL

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

## Testing

### Task 12: Write Unit Tests for API

**Files:**
- Create: `api/Tests/GameServiceTests.cs`
- Create: `api/Tests/StorageServiceTests.cs`

- [ ] **Step 1: Create test base and mocks**

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

        [Fact]
        public async Task RateWord_CreatesRatingEntity()
        {
            // Arrange
            var gameId = Guid.NewGuid().ToString();
            var game = new GameEntity
            {
                RowKey = gameId,
                GameType = "drawing",
                Categories = JsonSerializer.Serialize(new[] { "noun" })
            };

            var request = new RateWordRequest
            {
                WordId = Guid.NewGuid().ToString(),
                DifficultyRating = "easy"
            };

            _mockStorage.Setup(s => s.GetGameAsync(gameId)).ReturnsAsync(game);

            // Act
            await _gameService.RateWordAsync(gameId, request);

            // Assert
            _mockStorage.Verify(s => s.InsertRatingAsync(It.IsAny<WordRatingEntity>()), Times.Once);
        }
    }
}
```

- [ ] **Step 2: Create test project**

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

- [ ] **Step 3: Run tests**

```bash
cd api
dotnet test
```

Expected: All tests pass.

- [ ] **Step 4: Commit**

```bash
cd api
git add Tests/GameServiceTests.cs Tests/Tests.csproj
git commit -m "tests: add unit tests for game service"
```

---

### Task 13: Write Component Tests for Frontend

**Files:**
- Create: `app/app/__tests__/api.test.ts`
- Create: `app/app/__tests__/GameSetupScreen.test.tsx`

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
    expect(axios.post).toHaveBeenCalledWith(
      '/api/games/start',
      expect.objectContaining({ gameType: 'drawing' })
    );
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
    expect(axios.get).toHaveBeenCalledWith('/api/games/game-id/next-word');
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

## Final Tasks

### Task 14: Build and Test Locally

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

1. Navigate to GameSetupScreen
2. Select a game type and at least one category
3. Click "Start Game"
4. Verify word appears
5. Click "Review" and rate a word
6. Click "Next Word" and repeat
7. Click "End Game" and confirm
8. Verify summary screen shows played words

- [ ] **Step 4: Verify API calls in browser console**

Check for successful network requests to `/api/games/start`, `/api/games/{id}/next-word`, etc.

---

### Task 15: Final Cleanup and Documentation

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
2. **Frontend (Expo / React Native):** Setup screen, play screen, review screen, summary screen, API client
3. **Testing:** Unit tests for services, API client tests
4. **Configuration:** Environment setup for local development and production

The implementation follows clean architecture: thin client, stateful API, persistent storage. Ready for future features (adaptive difficulty, player stats, multiplayer).
