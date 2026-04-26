# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Ez.Ord** enables Icelandic word games for children learning the language. The application pulls from a comprehensive Icelandic dictionary database to power games like drawing games (Pictionary-style), Scrabble variants, word explanation games, and acting games.

The project is organized as a monorepo:
- **`app/`**: React Native/Expo frontend (web, iOS, Android targets)
- **`api/`**: Go backend API using Gin framework, deployed as Azure Functions

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

```bash
# Build the API
go build

# Run the API
./handler              # (after building)

# Testing
go test ./...

# Formatting and vetting
go fmt ./...
go vet ./...
```

### Root-level operations

The project uses GitHub Actions for CI/CD (Azure Static Web Apps workflow):
- Triggers on push to `main` and pull requests
- Builds frontend with `npx expo export -p web` → outputs to `./app/dist`
- Builds backend Go binary
- Deploys to Azure Static Web Apps

## Architecture

### Frontend Structure

- **Framework**: React Native with Expo (file-based routing via Expo Router)
- **TypeScript**: Fully typed
- **Platforms**: Web (primary deployment), iOS, Android support
- **Entry point**: `app/_layout.tsx` (root layout), `app/index.tsx` (home screen)

The Expo web build exports to `./app/dist/` for static hosting.

### Backend Structure

- **Framework**: Gin (HTTP web framework)
- **Language**: Go 1.21
- **Entry point**: `api/handler.go` (Azure Functions handler + Gin router setup)
- **Deployment**: Azure Functions (hence the `host.json` and `.funcignore`)

Current endpoints:
- `GET /api/ping` → returns "pong"
- (Additional game-specific endpoints are likely in `/games` subdirectory)

## Key Dependencies

**Frontend:**
- `expo` ~51.0.24 (framework)
- `react-native` 0.74.3
- `expo-router` ~3.5.20 (file-based routing)
- `typescript` ~5.3.3
- `jest-expo` (testing)

**Backend:**
- `github.com/gin-gonic/gin` v1.10.0 (web framework)
- Go 1.21

## Deployment

The project deploys via Azure Static Web Apps:
1. Frontend built and output to `app/dist/` (Expo web export)
2. Go API built and deployed from `api/` directory
3. Frontend served as static files, API available at `/api/*` routes

## Testing Notes

- **Frontend**: Jest tests via `npm test` in the `app/` directory
- **Backend**: Go tests via `go test ./...` in the `api/` directory
