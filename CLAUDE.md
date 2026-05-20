# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Ez.Ord** enables Icelandic word games for children learning the language. The application pulls from a comprehensive Icelandic dictionary database to power games like drawing games (Pictionary-style), Scrabble variants, word explanation games, and acting games.

The project is organized as a monorepo:
- **`app/`**: React Native/Expo frontend (web, iOS, Android targets)
- **`api/`**: .NET 8 Azure Functions isolated-worker API, deployed to Azure Static Web Apps managed API

The monorepo structure allows the SPA frontend to be deployed alongside the backend API to Azure Static Web Apps.

## Development Commands

### Frontend (app directory)

```bash
# Install dependencies
npm install

# Start development server (interactive menu to choose platform)
npm start              # or: npx expo start

# Specific platforms
npm run ios            # Start iOS simulator
npm run android        # Start Android emulator
npm run web            # Start web version

# Testing
npm test               # Run Jest tests in watch mode

# Linting
npm run lint           # Lint code with expo lint

# Build for production
npx expo export -p web # Export for web deployment
```

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

### Root-level operations

The project uses GitHub Actions for CI/CD (Azure Static Web Apps workflow):
- Triggers on push to `main` and pull requests
- Builds frontend with `npx expo export -p web` → outputs to `./app/dist`
- Lets Oryx (SWA built-in builder) compile the .NET Functions app
- Deploys to Azure Static Web Apps

## Architecture

### Frontend Structure

- **Framework**: React Native with Expo (file-based routing via Expo Router)
- **TypeScript**: Fully typed
- **Platforms**: Web (primary deployment), iOS, Android support
- **Entry point**: `app/_layout.tsx` (root layout), `app/index.tsx` (home screen)

The Expo web build exports to `./app/dist/` for static hosting.

### Backend Structure

- **Framework**: Azure Functions v4 isolated worker with ASP.NET Core integration
- **Language**: C# on .NET 8
- **Entry point**: `api/Program.cs` (Functions host setup + DI wiring)
- **Controllers**: `api/Controllers/` — standard `[ApiController]` classes, unchanged from ASP.NET Core
- **Services**: `api/Services/` — business logic and Azure Table Storage access
- **Models**: `api/Models/` — request/response DTOs and Table Storage entities
- **Tests**: `api.Tests/` — xunit tests, run via `dotnet test api.sln` from repo root
- **Deployment**: Azure Static Web Apps managed API (`api_location: "./api"`, Oryx builds)

## Key Dependencies

**Frontend:**
- `expo` ~51.0.24 (framework)
- `react-native` 0.74.3
- `expo-router` ~3.5.20 (file-based routing)
- `typescript` ~5.3.3
- `jest-expo` (testing)

**Backend:**
- `Microsoft.Azure.Functions.Worker` 2.x (Functions isolated worker host)
- `Microsoft.Azure.Functions.Worker.Extensions.Http.AspNetCore` 2.x (ASP.NET Core integration)
- `Azure.Data.Tables` 12.x (Azure Table Storage client)
- .NET 8 (`net8.0`)

## Deployment

The project deploys via Azure Static Web Apps:
1. Frontend built and output to `app/dist/` (Expo web export)
2. .NET Functions app compiled by Oryx and deployed from `api/` directory
3. Frontend served as static files, API available at `/api/*` routes

## Testing Notes

- **Frontend**: Jest tests via `npm test` in the `app/` directory
- **Backend**: xunit tests via `dotnet test api.sln` from the repo root
