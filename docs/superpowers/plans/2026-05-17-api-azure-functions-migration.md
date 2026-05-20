# API Azure Functions Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Convert `api/` from an ASP.NET Core 10 web app to an Azure Functions v4 isolated-worker app targeting net8.0, deployable to Azure Static Web Apps' managed API.

**Architecture:** Replace `Microsoft.NET.Sdk.Web` with `Microsoft.Azure.Functions.Worker.Extensions.Http.AspNetCore` so existing `[ApiController]` controllers work unchanged. Move tests to a sibling `api.Tests/` project to keep test code outside SWA's `api_location` boundary. Wire the SWA GitHub Actions workflow to let Oryx compile the Functions app instead of pre-building Go.

**Tech Stack:** .NET 8 (net8.0), Azure Functions v4 isolated worker, `Microsoft.Azure.Functions.Worker.Extensions.Http.AspNetCore`, Azure Table Storage, xunit, Moq

---

## File Map

| File | Action | Reason |
|---|---|---|
| `api/api.csproj` | **Rewrite** | Switch SDK, target net8.0, swap packages |
| `api/Program.cs` | **Rewrite** | Add `ConfigureFunctionsWebApplication()`, drop Swagger |
| `api/host.json` | **Rewrite** | Remove Go `customHandler`/`extensionBundle`, add http routePrefix |
| `api/local.settings.json` | **Create** | Local dev config; already gitignored by root `.gitignore` |
| `api.Tests/api.Tests.csproj` | **Create** | Separate test project outside SWA deploy boundary |
| `api.Tests/GameServiceTests.cs` | **Create (move)** | Move from `api/Tests/GameServiceTests.cs` |
| `api/Tests/GameServiceTests.cs` | **Delete** | Replaced by `api.Tests/` project |
| `api.sln` | **Create** | Ties both projects so `dotnet test` runs from repo root |
| `staticwebapp.config.json` | **Create** | Pins dotnet-isolated:8.0 runtime for SWA |
| `.github/workflows/azure-static-web-apps-nice-field-0de1ce703.yml` | **Modify** | Remove Go steps, add .NET 8 setup, set `skip_api_build: false` |
| `api/handler.go` | **Delete** | Go custom handler, replaced by .NET Functions |
| `api/go.mod` | **Delete** | Go module file, no longer needed |
| `api/go.sum` | **Delete** | Go checksums, no longer needed |
| `api/.funcignore` | **Modify** | Exclude .NET build artifacts |
| `CLAUDE.md` | **Modify** | Reflect new stack and dev commands |

Controllers (`api/Controllers/`), services (`api/Services/`), and models (`api/Models/`) are **unchanged**.

---

## Task 1: Rewrite project configuration for Azure Functions isolated worker

**Files:**
- Modify: `api/api.csproj`
- Modify: `api/Program.cs`
- Modify: `api/host.json`

- [ ] **Step 1: Replace `api/api.csproj`**

  Write the following content to `api/api.csproj` (replaces the entire file):

  ```xml
  <Project Sdk="Microsoft.NET.Sdk">
    <PropertyGroup>
      <TargetFramework>net8.0</TargetFramework>
      <AzureFunctionsVersion>v4</AzureFunctionsVersion>
      <OutputType>Exe</OutputType>
      <Nullable>enable</Nullable>
      <ImplicitUsings>enable</ImplicitUsings>
      <RootNamespace>EzOrd</RootNamespace>
    </PropertyGroup>

    <ItemGroup>
      <FrameworkReference Include="Microsoft.AspNetCore.App" />
      <PackageReference Include="Azure.Data.Tables" Version="12.8.0" />
      <PackageReference Include="Microsoft.Azure.Functions.Worker" Version="2.0.0" />
      <PackageReference Include="Microsoft.Azure.Functions.Worker.Sdk" Version="2.0.0" />
      <PackageReference Include="Microsoft.Azure.Functions.Worker.Extensions.Http.AspNetCore" Version="2.0.0" />
      <PackageReference Include="Microsoft.ApplicationInsights.WorkerService" Version="2.22.0" />
      <PackageReference Include="Microsoft.Azure.Functions.Worker.ApplicationInsights" Version="2.0.0" />
    </ItemGroup>

    <ItemGroup>
      <None Update="host.json" CopyToOutputDirectory="PreserveNewest" />
      <None Update="local.settings.json" CopyToOutputDirectory="PreserveNewest" CopyToPublishDirectory="Never" />
    </ItemGroup>
  </Project>
  ```

  Removed: `Microsoft.NET.Sdk.Web` → `Microsoft.NET.Sdk`, `net10.0` → `net8.0`, dropped Swashbuckle/OpenApi/xunit/Moq/TestSdk (those move to `api.Tests/`).

- [ ] **Step 2: Replace `api/Program.cs`**

  Write the following content to `api/Program.cs` (replaces the entire file):

  ```csharp
  using Azure.Data.Tables;
  using EzOrd.Services;

  var builder = WebApplication.CreateBuilder(args);

  builder.ConfigureFunctionsWebApplication();

  builder.Services.AddControllers();
  builder.Services.AddCors(options =>
  {
      options.AddPolicy("AllowAll", b => b.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader());
  });

  var connectionString = builder.Configuration.GetConnectionString("AzureTableStorage")
      ?? "UseDevelopmentStorage=true";
  builder.Services.AddSingleton(new TableServiceClient(connectionString));
  builder.Services.AddSingleton<IStorageService, StorageService>();
  builder.Services.AddScoped<GameService>();
  builder.Services.AddHostedService<StorageInitializerService>();

  var app = builder.Build();
  app.UseCors("AllowAll");
  app.MapControllers();
  app.Run();
  ```

  Removed: Swagger setup, `app.UseSwagger()`, `app.UseSwaggerUI()`, `app.UseRouting()`, dev-only block.
  Added: `builder.ConfigureFunctionsWebApplication()` (required for isolated worker + ASP.NET Core integration).

- [ ] **Step 3: Replace `api/host.json`**

  Write the following content to `api/host.json` (replaces the entire file):

  ```json
  {
    "version": "2.0",
    "logging": {
      "applicationInsights": {
        "samplingSettings": { "isEnabled": true, "excludedTypes": "Request" }
      }
    },
    "extensions": {
      "http": { "routePrefix": "api" }
    }
  }
  ```

  Removed: `extensionBundle` block (not used in isolated worker), `customHandler` block (Go). Added: `extensions.http.routePrefix` so routes remain at `/api/*`.

- [ ] **Step 4: Restore NuGet packages**

  Run from the `api/` directory:

  ```bash
  cd /Users/kromby/Source/Personal/Ez.Ord/api && dotnet restore
  ```

  Expected: packages download without error. If NuGet can't find `Microsoft.Azure.Functions.Worker 2.0.0`, try the latest stable version from nuget.org and update the csproj accordingly (the version matching rule: Functions Worker ≥ 1.22, Extensions.Http.AspNetCore ≥ 1.3).

- [ ] **Step 5: Build the project**

  ```bash
  cd /Users/kromby/Source/Personal/Ez.Ord/api && dotnet build
  ```

  Expected output (last lines):
  ```
  Build succeeded.
      0 Warning(s)
      0 Error(s)
  ```

  If you see `CS0234` or `CS0246` referencing `Microsoft.AspNetCore.Builder` or `WebApplication`, the `FrameworkReference` to `Microsoft.AspNetCore.App` is not resolving — verify the SDK is `Microsoft.NET.Sdk` (not `.Web`) and the framework reference is present in `api.csproj`.

  If you see errors about `ConfigureFunctionsWebApplication` not found, the `Microsoft.Azure.Functions.Worker.Extensions.Http.AspNetCore` package is missing or wrong version.

- [ ] **Step 6: Commit**

  ```bash
  cd /Users/kromby/Source/Personal/Ez.Ord
  git add api/api.csproj api/Program.cs api/host.json
  git commit -m "feat: migrate api to Azure Functions v4 isolated worker on net8.0"
  ```

---

## Task 2: Add local development settings file

**Files:**
- Create: `api/local.settings.json`

`local.settings.json` is already covered by the root `.gitignore` (`local.settings.json` entry in the Azure Functions artifacts section). Nothing to commit here.

- [ ] **Step 1: Create `api/local.settings.json`**

  Create `api/local.settings.json` with this content:

  ```json
  {
    "IsEncrypted": false,
    "Values": {
      "FUNCTIONS_WORKER_RUNTIME": "dotnet-isolated",
      "AzureWebJobsStorage": "UseDevelopmentStorage=true",
      "ConnectionStrings__AzureTableStorage": "UseDevelopmentStorage=true"
    }
  }
  ```

  Verify it's gitignored:
  ```bash
  cd /Users/kromby/Source/Personal/Ez.Ord && git status api/local.settings.json
  ```
  Expected: the file does NOT appear (it's untracked but ignored). If it shows as untracked, add it to `api/.gitignore` or verify the root `.gitignore` has `local.settings.json`.

- [ ] **Step 2: Verify local dev startup (manual)**

  This step requires Azure Functions Core Tools and Azurite. Install if needed:
  ```bash
  brew install azure/functions/azure-functions-core-tools@4
  npm install -g azurite
  ```

  In one terminal, start Azurite:
  ```bash
  azurite
  ```

  In another terminal, start the Functions host:
  ```bash
  cd /Users/kromby/Source/Personal/Ez.Ord/api && func start
  ```

  Expected: Functions host starts on port 7071. Look for output containing:
  ```
  Functions:
      GamesController: [GET,POST] http://localhost:7071/api/games/{*route}
  ```
  (Exact function names vary based on how ASP.NET Core integration registers them.)

- [ ] **Step 3: Smoke-test routes via curl**

  ```bash
  curl -s -o /dev/null -w "%{http_code}" http://localhost:7071/api/games/nonexistent
  ```
  Expected: `400` (game not found → `InvalidOperationException` → BadRequest)

  ```bash
  curl -s -X POST http://localhost:7071/api/games/start \
    -H "Content-Type: application/json" \
    -d '{"gameType":"drawing","categories":["nafn"]}'
  ```
  Expected: JSON response with `"success":true` and a `gameId` field.

  No commit for this task — `local.settings.json` is gitignored.

---

## Task 3: Create `api.Tests/` project, move tests, and create solution

**Files:**
- Create: `api.Tests/api.Tests.csproj`
- Create: `api.Tests/GameServiceTests.cs`
- Create: `api.sln`
- Delete: `api/Tests/GameServiceTests.cs`

- [ ] **Step 1: Create the `api.Tests` project file**

  Create `api.Tests/api.Tests.csproj`:

  ```xml
  <Project Sdk="Microsoft.NET.Sdk">
    <PropertyGroup>
      <TargetFramework>net8.0</TargetFramework>
      <Nullable>enable</Nullable>
      <IsPackable>false</IsPackable>
    </PropertyGroup>

    <ItemGroup>
      <PackageReference Include="xunit" Version="2.7.0" />
      <PackageReference Include="xunit.runner.visualstudio" Version="2.5.8" />
      <PackageReference Include="Moq" Version="4.20.70" />
      <PackageReference Include="Microsoft.NET.Test.Sdk" Version="17.9.1" />
    </ItemGroup>

    <ItemGroup>
      <ProjectReference Include="..\api\api.csproj" />
    </ItemGroup>
  </Project>
  ```

- [ ] **Step 2: Copy `GameServiceTests.cs` to `api.Tests/`**

  Create `api.Tests/GameServiceTests.cs` with this content (identical to the existing `api/Tests/GameServiceTests.cs`):

  ```csharp
  using Xunit;
  using Moq;
  using EzOrd.Models;
  using EzOrd.Services;
  using System.Text.Json;

  namespace EzOrd.Tests
  {
      public class GameServiceTests
      {
          private readonly Mock<IStorageService> _mockStorageService;
          private readonly GameService _gameService;

          public GameServiceTests()
          {
              _mockStorageService = new Mock<IStorageService>();
              _gameService = new GameService(_mockStorageService.Object);
          }

          [Fact]
          public async Task StartGameAsync_ShouldCreateGameAndReturnGameId()
          {
              var request = new GameStartRequest
              {
                  GameType = "drawing",
                  Categories = new List<string> { "nafn", "sagn" }
              };

              var result = await _gameService.StartGameAsync(request);

              Assert.NotNull(result);
              Assert.NotEmpty(result.GameId);
              Assert.Equal(request.GameType, result.GameType);
              Assert.Equal(request.Categories, result.Categories);
              Assert.True(result.StartedAt <= DateTime.UtcNow);
          }

          [Fact]
          public async Task StartGameAsync_ShouldCallInsertGameAsync()
          {
              var request = new GameStartRequest
              {
                  GameType = "drawing",
                  Categories = new List<string> { "nafn" }
              };

              await _gameService.StartGameAsync(request);

              _mockStorageService.Verify(
                  s => s.InsertGameAsync(It.IsAny<GameEntity>()),
                  Times.Once);
          }

          [Fact]
          public async Task GetNextWordAsync_ShouldThrowWhenGameNotFound()
          {
              var gameId = "nonexistent";
              _mockStorageService
                  .Setup(s => s.GetGameAsync(gameId))
                  .ReturnsAsync((GameEntity?)null);

              await Assert.ThrowsAsync<InvalidOperationException>(
                  () => _gameService.GetNextWordAsync(gameId));
          }

          [Fact]
          public async Task GetNextWordAsync_ShouldThrowWhenGameEnded()
          {
              var gameId = "game123";
              var endedGame = new GameEntity
              {
                  PartitionKey = "game_drawing",
                  RowKey = gameId,
                  GameType = "drawing",
                  Categories = "[]",
                  StartedAt = DateTime.UtcNow,
                  EndedAt = DateTime.UtcNow.AddHours(-1)
              };

              _mockStorageService
                  .Setup(s => s.GetGameAsync(gameId))
                  .ReturnsAsync(endedGame);

              await Assert.ThrowsAsync<InvalidOperationException>(
                  () => _gameService.GetNextWordAsync(gameId));
          }

          [Fact]
          public async Task GetNextWordAsync_ShouldReturnWordFromSelectedCategories()
          {
              var gameId = "game123";
              var game = new GameEntity
              {
                  PartitionKey = "game_drawing",
                  RowKey = gameId,
                  GameType = "drawing",
                  Categories = JsonSerializer.Serialize(new[] { "nafn" }),
                  StartedAt = DateTime.UtcNow
              };

              var word = new WordEntity
              {
                  PartitionKey = "nafn",
                  RowKey = "word1",
                  Word = "hestur",
                  Category = "nafn",
                  UsageCount = 5
              };

              _mockStorageService
                  .Setup(s => s.GetGameAsync(gameId))
                  .ReturnsAsync(game);
              _mockStorageService
                  .Setup(s => s.GetWordsByCategoriesAsync(It.IsAny<List<string>>()))
                  .ReturnsAsync(new List<WordEntity> { word });
              _mockStorageService
                  .Setup(s => s.GetGameWordCountAsync(gameId))
                  .ReturnsAsync(0);

              var result = await _gameService.GetNextWordAsync(gameId);

              Assert.NotNull(result);
              Assert.Equal("hestur", result.Word);
              Assert.Equal("nafn", result.Category);
              Assert.Equal("word1", result.WordId);
          }

          [Fact]
          public async Task GetNextWordAsync_ShouldThrowWhenNoWordsAvailable()
          {
              var gameId = "game123";
              var game = new GameEntity
              {
                  PartitionKey = "game_drawing",
                  RowKey = gameId,
                  GameType = "drawing",
                  Categories = JsonSerializer.Serialize(new[] { "nafn" }),
                  StartedAt = DateTime.UtcNow
              };

              _mockStorageService
                  .Setup(s => s.GetGameAsync(gameId))
                  .ReturnsAsync(game);
              _mockStorageService
                  .Setup(s => s.GetWordsByCategoriesAsync(It.IsAny<List<string>>()))
                  .ReturnsAsync(new List<WordEntity>());

              await Assert.ThrowsAsync<InvalidOperationException>(
                  () => _gameService.GetNextWordAsync(gameId));
          }

          [Fact]
          public async Task RateWordAsync_ShouldInsertRating()
          {
              var gameId = "game123";
              var wordId = "word1";
              var game = new GameEntity
              {
                  PartitionKey = "game_drawing",
                  RowKey = gameId,
                  GameType = "drawing",
                  Categories = "[]",
                  StartedAt = DateTime.UtcNow
              };

              var request = new RateWordRequest
              {
                  WordId = wordId,
                  DifficultyRating = "hard"
              };

              _mockStorageService
                  .Setup(s => s.GetGameAsync(gameId))
                  .ReturnsAsync(game);

              await _gameService.RateWordAsync(gameId, request);

              _mockStorageService.Verify(
                  s => s.InsertRatingAsync(It.Is<WordRatingEntity>(
                      r => r.Difficulty == "hard" && r.PartitionKey == wordId)),
                  Times.Once);
          }

          [Fact]
          public async Task RateWordAsync_ShouldThrowWhenGameNotFound()
          {
              var gameId = "nonexistent";
              var request = new RateWordRequest { WordId = "word1", DifficultyRating = "easy" };

              _mockStorageService
                  .Setup(s => s.GetGameAsync(gameId))
                  .ReturnsAsync((GameEntity?)null);

              await Assert.ThrowsAsync<InvalidOperationException>(
                  () => _gameService.RateWordAsync(gameId, request));
          }

          [Fact]
          public async Task SkipWordAsync_ShouldInsertSkipAsRating()
          {
              var gameId = "game123";
              var wordId = "word1";
              var game = new GameEntity
              {
                  PartitionKey = "game_drawing",
                  RowKey = gameId,
                  GameType = "drawing",
                  Categories = "[]",
                  StartedAt = DateTime.UtcNow
              };

              var request = new SkipWordRequest { WordId = wordId };

              _mockStorageService
                  .Setup(s => s.GetGameAsync(gameId))
                  .ReturnsAsync(game);

              await _gameService.SkipWordAsync(gameId, request);

              _mockStorageService.Verify(
                  s => s.InsertRatingAsync(It.Is<WordRatingEntity>(
                      r => r.Difficulty == "skipped" && r.PartitionKey == wordId)),
                  Times.Once);
          }

          [Fact]
          public async Task EndGameAsync_ShouldMarkGameAsEnded()
          {
              var gameId = "game123";
              var game = new GameEntity
              {
                  PartitionKey = "game_drawing",
                  RowKey = gameId,
                  GameType = "drawing",
                  Categories = "[]",
                  StartedAt = DateTime.UtcNow
              };

              _mockStorageService
                  .Setup(s => s.GetGameAsync(gameId))
                  .ReturnsAsync(game);
              _mockStorageService
                  .Setup(s => s.GetGameWordCountAsync(gameId))
                  .ReturnsAsync(5);

              var result = await _gameService.EndGameAsync(gameId);

              Assert.NotNull(result);
              Assert.Equal(gameId, result.GameId);
              Assert.Equal(5, result.WordCount);
              Assert.True(result.EndedAt <= DateTime.UtcNow);
          }

          [Fact]
          public async Task EndGameAsync_ShouldCallUpdateGameAsync()
          {
              var gameId = "game123";
              var game = new GameEntity
              {
                  PartitionKey = "game_drawing",
                  RowKey = gameId,
                  GameType = "drawing",
                  Categories = "[]",
                  StartedAt = DateTime.UtcNow
              };

              _mockStorageService
                  .Setup(s => s.GetGameAsync(gameId))
                  .ReturnsAsync(game);
              _mockStorageService
                  .Setup(s => s.GetGameWordCountAsync(gameId))
                  .ReturnsAsync(0);

              await _gameService.EndGameAsync(gameId);

              _mockStorageService.Verify(
                  s => s.UpdateGameAsync(It.Is<GameEntity>(g => g.EndedAt.HasValue)),
                  Times.Once);
          }

          [Fact]
          public async Task GetGameDetailsAsync_ShouldReturnCompleteGameDetails()
          {
              var gameId = "game123";
              var game = new GameEntity
              {
                  PartitionKey = "game_drawing",
                  RowKey = gameId,
                  GameType = "drawing",
                  Categories = JsonSerializer.Serialize(new[] { "nafn", "sagn" }),
                  StartedAt = DateTime.UtcNow
              };

              var gameWords = new List<GameWordEntity>
              {
                  new GameWordEntity
                  {
                      PartitionKey = gameId,
                      RowKey = "0",
                      WordId = "word1",
                      Word = "hestur",
                      Category = "nafn",
                      DrawnAt = DateTime.UtcNow
                  }
              };

              var rating = new WordRatingEntity
              {
                  PartitionKey = "word1",
                  RowKey = gameId,
                  Difficulty = "easy"
              };

              _mockStorageService
                  .Setup(s => s.GetGameAsync(gameId))
                  .ReturnsAsync(game);
              _mockStorageService
                  .Setup(s => s.GetGameWordsAsync(gameId))
                  .ReturnsAsync(gameWords);
              _mockStorageService
                  .Setup(s => s.GetRatingAsync("word1", gameId))
                  .ReturnsAsync(rating);

              var result = await _gameService.GetGameDetailsAsync(gameId);

              Assert.NotNull(result);
              Assert.Equal(gameId, result.GameId);
              Assert.Equal("drawing", result.GameType);
              Assert.Single(result.Words);
              Assert.Equal("hestur", result.Words[0].Word);
              Assert.Equal("easy", result.Words[0].Rating);
          }
      }
  }
  ```

- [ ] **Step 3: Create the solution file**

  Run from the repo root:
  ```bash
  cd /Users/kromby/Source/Personal/Ez.Ord
  dotnet new sln --name api
  dotnet sln api.sln add api/api.csproj api.Tests/api.Tests.csproj
  ```

  Expected output from `dotnet sln add`:
  ```
  Project `api/api.csproj` added to the solution.
  Project `api.Tests/api.Tests.csproj` added to the solution.
  ```

- [ ] **Step 4: Run the tests**

  ```bash
  cd /Users/kromby/Source/Personal/Ez.Ord && dotnet test api.sln
  ```

  Expected output (last lines):
  ```
  Passed! - Failed: 0, Passed: 10, Skipped: 0, Total: 10
  ```

  If you see `CS0246` errors about missing types (`GameEntity`, `WordEntity`, etc.), the `ProjectReference` in `api.Tests.csproj` is not resolving — verify the relative path `..\api\api.csproj` is correct.

  If you see `CS0234` or package resolution errors, run `dotnet restore api.sln` first.

- [ ] **Step 5: Delete the old test location**

  ```bash
  rm /Users/kromby/Source/Personal/Ez.Ord/api/Tests/GameServiceTests.cs
  rmdir /Users/kromby/Source/Personal/Ez.Ord/api/Tests
  ```

- [ ] **Step 6: Commit**

  ```bash
  cd /Users/kromby/Source/Personal/Ez.Ord
  git add api.Tests/ api.sln
  git rm api/Tests/GameServiceTests.cs
  git commit -m "feat: move tests to api.Tests project and add api.sln solution file"
  ```

---

## Task 4: Add SWA config and update GitHub Actions workflow

**Files:**
- Create: `staticwebapp.config.json`
- Modify: `.github/workflows/azure-static-web-apps-nice-field-0de1ce703.yml`

- [ ] **Step 1: Create `staticwebapp.config.json` at repo root**

  Create `/Users/kromby/Source/Personal/Ez.Ord/staticwebapp.config.json`:

  ```json
  {
    "platform": {
      "apiRuntime": "dotnet-isolated:8.0"
    }
  }
  ```

- [ ] **Step 2: Replace the GitHub Actions workflow**

  Write the following content to `.github/workflows/azure-static-web-apps-nice-field-0de1ce703.yml`:

  ```yaml
  name: Azure Static Web Apps CI/CD

  on:
    push:
      branches:
        - main
    pull_request:
      types: [opened, synchronize, reopened, closed]
      branches:
        - main

  jobs:
    build_and_deploy_job:
      if: github.event_name == 'push' || (github.event_name == 'pull_request' && github.event.action != 'closed')
      runs-on: ubuntu-latest
      name: Build and Deploy Job
      steps:
        - uses: actions/checkout@v3
          with:
            submodules: true
            lfs: false

        - name: Set up Node.js
          uses: actions/setup-node@v2
          with:
            node-version: "20"

        - name: Install dependencies
          run: npm install
          working-directory: ./app

        - name: Build Expo web
          run: npx expo export -p web
          working-directory: ./app

        - name: Set up .NET
          uses: actions/setup-dotnet@v4
          with:
            dotnet-version: "8.0.x"

        - name: Build And Deploy
          id: builddeploy
          uses: Azure/static-web-apps-deploy@v1
          with:
            azure_static_web_apps_api_token: ${{ secrets.AZURE_STATIC_WEB_APPS_API_TOKEN_NICE_FIELD_0DE1CE703 }}
            repo_token: ${{ secrets.GITHUB_TOKEN }}
            action: "upload"
            app_location: "./app/dist"
            skip_app_build: true
            api_location: "./api"
            skip_api_build: false

    close_pull_request_job:
      if: github.event_name == 'pull_request' && github.event.action == 'closed'
      runs-on: ubuntu-latest
      name: Close Pull Request Job
      steps:
        - name: Close Pull Request
          id: closepullrequest
          uses: Azure/static-web-apps-deploy@v1
          with:
            azure_static_web_apps_api_token: ${{ secrets.AZURE_STATIC_WEB_APPS_API_TOKEN_NICE_FIELD_0DE1CE703 }}
            action: "close"
  ```

  Changed from current workflow: removed `Set up Go` and `Build Go API` steps; added `Set up .NET` step pinned to `8.0.x`; changed `skip_api_build: true` to `skip_api_build: false`; removed the duplicate `skip_api_build` line; cleaned up stray comments.

- [ ] **Step 3: Commit**

  ```bash
  cd /Users/kromby/Source/Personal/Ez.Ord
  git add staticwebapp.config.json .github/workflows/azure-static-web-apps-nice-field-0de1ce703.yml
  git commit -m "feat: add staticwebapp.config.json and update CI/CD workflow for .NET 8 Functions"
  ```

---

## Task 5: Delete Go files and update `.funcignore`

**Files:**
- Delete: `api/handler.go`
- Delete: `api/go.mod`
- Delete: `api/go.sum`
- Modify: `api/.funcignore`

- [ ] **Step 1: Delete Go files**

  ```bash
  cd /Users/kromby/Source/Personal/Ez.Ord
  git rm api/handler.go api/go.mod api/go.sum
  ```

  Also remove the Go function.json stubs from the build output (these live in `api/games/` and `api/health/` — they're leftover Go artifacts):
  ```bash
  git rm -r api/games/ api/health/
  ```

  If `api/games/` and `api/health/` aren't tracked (check with `git status`), just delete them:
  ```bash
  rm -rf /Users/kromby/Source/Personal/Ez.Ord/api/games /Users/kromby/Source/Personal/Ez.Ord/api/health
  ```

- [ ] **Step 2: Update `api/.funcignore` for .NET**

  Replace the content of `api/.funcignore`:

  ```
  .git*
  .vscode
  bin
  obj
  local.settings.json
  __azurite_db*__.json
  __blobstorage__
  __queuestorage__
  ```

  Changes: added `bin` and `obj` to exclude .NET build artifacts from `func start` hot-reload scanning; removed the `test` entry (no longer relevant); kept `local.settings.json` so it's never published.

- [ ] **Step 3: Commit**

  ```bash
  cd /Users/kromby/Source/Personal/Ez.Ord
  git add api/.funcignore
  git commit -m "chore: remove Go files and update .funcignore for .NET publish"
  ```

---

## Task 6: Update `CLAUDE.md`

**Files:**
- Modify: `CLAUDE.md`

- [ ] **Step 1: Update the Backend section in `CLAUDE.md`**

  Find and replace the entire "Backend (api directory)" section and related references. The updated sections should read:

  **Project Overview paragraph** — change:
  > `**api/`**: Go backend API using Gin framework, deployed as Azure Functions`

  To:
  > `**api/`**: .NET 8 Azure Functions isolated-worker API, deployed to Azure Static Web Apps managed API`

  **Backend (api directory) commands section** — replace with:

  ```markdown
  ### Backend (api directory)

  Requires Azure Functions Core Tools v4 and Azurite (local storage emulator). One-time install:
  ```bash
  brew install azure/functions/azure-functions-core-tools@4
  npm install -g azurite
  ```

  ```bash
  # In one terminal: start local Azure Storage emulator
  azurite

  # In another terminal: start the Functions host (port 7071)
  cd api && func start

  # Build (compile check only — func start builds automatically)
  cd api && dotnet build

  # Run tests
  dotnet test api.sln
  ```
  ```

  **Backend Structure section** — replace with:

  ```markdown
  ### Backend Structure

  - **Framework**: Azure Functions v4 isolated worker with ASP.NET Core integration
  - **Language**: C# on .NET 8
  - **Entry point**: `api/Program.cs` (Functions host setup + DI wiring)
  - **Controllers**: `api/Controllers/` — standard `[ApiController]` classes, unchanged from ASP.NET Core
  - **Services**: `api/Services/` — business logic and Azure Table Storage access
  - **Models**: `api/Models/` — request/response DTOs and Table Storage entities
  - **Tests**: `api.Tests/` — xunit tests, run via `dotnet test api.sln` from repo root
  - **Deployment**: Azure Static Web Apps managed API (`api_location: "./api"`, Oryx builds)
  ```

  **Key Dependencies — Backend section** — replace with:

  ```markdown
  **Backend:**
  - `Microsoft.Azure.Functions.Worker` 2.x (Functions isolated worker host)
  - `Microsoft.Azure.Functions.Worker.Extensions.Http.AspNetCore` 2.x (ASP.NET Core integration)
  - `Azure.Data.Tables` 12.x (Azure Table Storage client)
  - .NET 8 (`net8.0`)
  ```

  **Root-level operations** — update the CI/CD description:
  Change "Builds backend Go binary" to "Lets Oryx (SWA built-in builder) compile the .NET Functions app"

  **Testing Notes — Backend** — replace:
  > `**Backend**: Go tests via `go test ./...` in the `api/` directory`

  With:
  > `**Backend**: xunit tests via `dotnet test api.sln` from the repo root`

- [ ] **Step 2: Commit**

  ```bash
  cd /Users/kromby/Source/Personal/Ez.Ord
  git add CLAUDE.md
  git commit -m "docs: update CLAUDE.md for .NET Azure Functions stack"
  ```

---

## Task 7: Push and verify SWA preview build

- [ ] **Step 1: Push to a feature branch**

  The spec calls for pushing to a feature branch so the SWA preview build runs before merging:

  ```bash
  cd /Users/kromby/Source/Personal/Ez.Ord
  git checkout -b feat/azure-functions-migration
  git push -u origin feat/azure-functions-migration
  ```

  (If you've been committing to `main` directly, create a PR from `main` or a new branch after cherry-picking. The important thing is to get a SWA preview environment running before merging.)

- [ ] **Step 2: Watch the GitHub Actions run**

  Open the repository's Actions tab and find the triggered workflow. Watch for:
  - Expo web build step: should pass (unchanged)
  - SWA deploy step with `skip_api_build: false`: Oryx will detect `api/` as a .NET project and compile it

  If Oryx fails to detect the runtime, verify `staticwebapp.config.json` is present at the repo root with `"apiRuntime": "dotnet-isolated:8.0"`.

- [ ] **Step 3: Test the preview URL**

  SWA will post the preview URL as a PR comment. Hit the `/api/games/start` endpoint:

  ```bash
  curl -s -X POST https://<preview-url>/api/games/start \
    -H "Content-Type: application/json" \
    -d '{"gameType":"drawing","categories":["nafn"]}'
  ```

  Expected: `{"success":true,"data":{"gameId":"...","gameType":"drawing",...}}`

  If you get a 404 on all routes, check that `host.json` has `"extensions": { "http": { "routePrefix": "api" } }` — this is what maps `/api/*` in SWA to the Functions routes.

- [ ] **Step 4: Merge**

  Once the SWA preview build is green and routes respond correctly, merge to `main`.
