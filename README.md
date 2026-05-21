# Ez.Ord
Get Icelandic word for your word game of choice

## Runtime constraints

The `api/` project deploys to Azure Static Web Apps managed API, which only supports **.NET 8 or .NET 9** Functions runtimes. Do not bump `api/api.csproj` (or `api.Tests/api.Tests.csproj`) to `net10.0` or newer — Azure SWA will not run it.
