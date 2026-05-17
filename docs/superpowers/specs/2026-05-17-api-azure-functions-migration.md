# API Migration to Azure Functions (SWA Managed API)

**Date:** 2026-05-17
**Status:** Approved for implementation

## Goal

Convert the existing `api/` ASP.NET Core 10 web app into an Azure Functions v4 isolated-worker app deployable to Azure Static Web Apps' managed API. Preserve all controller code, services, DI, and HTTP routes; change only the host model and project configuration.

## Why

Static Web Apps' managed API rail only accepts Azure Functions. The previous Go API used a Functions custom-handler model that deployed unreliably, prompting a rewrite to .NET. The .NET rewrite landed as a plain ASP.NET Core web app, which cannot deploy to SWA at all. This spec restores SWA-compatible packaging while keeping the .NET code already written.

## Decisions

- **Programming model:** Isolated worker with ASP.NET Core integration (`Microsoft.Azure.Functions.Worker.Extensions.Http.AspNetCore`). Existing `[ApiController]` classes carry over unchanged.
- **Deployment target:** SWA managed API. Standalone Function App ("bring your own") was considered and deferred; switching later is a deployment-config change, not a code change.
- **Target framework:** `net8.0`. SWA managed runtimes cap at .NET 8.0 as of 2026-05-17.
- **Test layout:** Tests move to a separate `api.Tests/` project; an `api.sln` ties them together.
- **Build owner:** Oryx (SWA's built-in builder) compiles the Functions app during the SWA deploy step. The workflow stops pre-building.

## Project structure after migration

```
api/                                  # Functions isolated-worker project
├── api.csproj                        # rewritten
├── Program.cs                        # rewritten
├── host.json                         # rewritten
├── local.settings.json               # NEW, gitignored
├── .funcignore                       # updated for .NET publish
├── Controllers/                      # unchanged
├── Services/                         # unchanged
└── Models/                           # unchanged

api.Tests/                            # NEW
├── api.Tests.csproj
└── GameServiceTests.cs               # moved from api/Tests/

api.sln                               # NEW
staticwebapp.config.json              # NEW at repo root
.github/workflows/azure-static-web-apps-*.yml   # updated for .NET
```

Removed entirely: `api/handler.go`, `api/go.mod`, `api/go.sum`, `api/Tests/`.

## Configuration files

### `api/api.csproj`

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

Removed packages: `Microsoft.AspNetCore.OpenApi`, `Swashbuckle.AspNetCore`, `xunit`, `xunit.runner.visualstudio`, `Moq`, `Microsoft.NET.Test.Sdk`. Swashbuckle is dropped for now; reintroduce via NSwag in a follow-up if Swagger UI is needed.

### `api/Program.cs`

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

Controllers, services, models, and DTOs do not change. The existing `[Route("api/games")]` attribute already produces the correct `/api/games/*` URLs.

### `api/host.json`

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

The previous `customHandler` block (Go) is removed.

### `api/local.settings.json` (gitignored)

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

`builder.Configuration.GetConnectionString("AzureTableStorage")` resolves against this file locally and against the SWA-managed app settings in production.

### `staticwebapp.config.json` (repo root)

```json
{
  "platform": {
    "apiRuntime": "dotnet-isolated:8.0"
  }
}
```

Pins the runtime so SWA's auto-detection cannot pick the wrong stack.

## Test project

### `api.Tests/api.Tests.csproj`

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

`GameServiceTests.cs` moves over unchanged.

### `api.sln`

Created via `dotnet new sln` then `dotnet sln add api/api.csproj api.Tests/api.Tests.csproj`. Lets `dotnet test` run from the repo root and gives IDEs a single entry point.

## GitHub Actions workflow

`.github/workflows/azure-static-web-apps-nice-field-0de1ce703.yml`:

- Remove the `Set up Go` and `go build` steps.
- Add `actions/setup-dotnet@v4` pinned to `8.0.x` before the SWA deploy step.
- Set `skip_api_build: false` so SWA's Oryx builder compiles `api/`.
- Keep `api_location: "./api"` and `app_location: "./app/dist"`.
- Keep the existing Node setup and Expo export steps for the frontend.

## Local development

```sh
# one-time
brew install azure/functions/azure-functions-core-tools@4
npm install -g azurite

# run the API
azurite                                  # local Azure Storage emulator
cd api && func start                     # Functions host on :7071
```

The existing `StorageInitializerService` creates tables against Azurite the same way it does against Azure.

## Migration order

1. Update `api/api.csproj`, `api/Program.cs`, `api/host.json`; confirm `dotnet build` succeeds on .NET 8.
2. Create `api/local.settings.json`; run Azurite; run `func start`; verify each route via curl.
3. Create `api.Tests/` project; move `GameServiceTests.cs`; create `api.sln`; confirm `dotnet test` runs.
4. Add `staticwebapp.config.json`; update the GitHub Actions workflow.
5. Delete `api/handler.go`, `api/go.mod`, `api/go.sum`. Update `api/.funcignore` for .NET.
6. Update `CLAUDE.md` to reflect the new stack and dev commands.
7. Push to a feature branch; let the SWA preview build complete end-to-end before merging.

## Risks and known gaps

- **Code targeting newer .NET features:** any C# 13 or .NET 10 API usage breaks on .NET 8. The codebase is small; `dotnet build` will surface anything.
- **Swagger is dropped:** add NSwag in a follow-up if interactive API exploration is needed.
- **`api.Tests/` at the repo root** (sibling to `api/`) is the standard .NET layout but is a small departure from the current single-directory pattern. Chosen so test code sits outside SWA's `api_location` boundary and isn't published.
- **Application Insights provisioning** is handled by SWA. The `host.json` sampling block applies once SWA wires the resource on first deploy.

## Out of scope

- Reintroducing Swagger / OpenAPI.
- Adding non-HTTP triggers (timer, queue, Service Bus, etc.).
- Migrating to a standalone Function App. Re-evaluate if any of these trigger: non-HTTP work is needed, Managed Identity is needed, or .NET 8 approaches end of support (November 2026).
