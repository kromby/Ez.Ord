using Azure;
using Azure.Data.Tables;

namespace EzOrd.CategorySeeder;

internal class Program
{
    private static async Task<int> Main(string[] args)
    {
        var input = args.FirstOrDefault()
            ?? Environment.GetEnvironmentVariable("AzureTableStorage")
            ?? "UseDevelopmentStorage=true";

        TableServiceClient serviceClient;
        try
        {
            serviceClient = BuildClient(input, out var description);
            Console.WriteLine($"Seeding Categories table ({description})");
        }
        catch (Exception ex)
        {
            Console.Error.WriteLine($"Could not build a TableServiceClient from the supplied input.");
            Console.Error.WriteLine($"Reason: {ex.Message}");
            Console.Error.WriteLine();
            Console.Error.WriteLine("Pass one of:");
            Console.Error.WriteLine("  - A connection string: DefaultEndpointsProtocol=https;AccountName=...;AccountKey=...;EndpointSuffix=core.windows.net");
            Console.Error.WriteLine("  - A table-service URL with SAS query: https://<account>.table.core.windows.net/?sv=...&sig=...");
            Console.Error.WriteLine("  - UseDevelopmentStorage=true (Azurite, default)");
            return 1;
        }

        var table = serviceClient.GetTableClient("Categories");
        await table.CreateIfNotExistsAsync();

        var rows = new[]
        {
            new CategoryRow("nafnord", "hk", "Nafnorð", true),
            new CategoryRow("nafnord", "kk", "Nafnorð", false),
            new CategoryRow("nafnord", "kvk", "Nafnorð", false),
            new CategoryRow("sagnord", "so", "Sagnorð", false),
            new CategoryRow("lysingarord", "lo", "Lýsingarorð", false),
        };

        foreach (var row in rows)
        {
            var entity = new TableEntity(row.PartitionKey, row.RowKey)
            {
                { "Name", row.Name },
                { "Enabled", row.Enabled }
            };
            await table.UpsertEntityAsync(entity, TableUpdateMode.Replace);
            Console.WriteLine($"  upsert {row.PartitionKey}/{row.RowKey} (Enabled={row.Enabled})");
        }

        Console.WriteLine($"Done. Seeded {rows.Length} rows.");
        return 0;
    }

    private static TableServiceClient BuildClient(string input, out string description)
    {
        if (Uri.TryCreate(input, UriKind.Absolute, out var uri)
            && (uri.Scheme == Uri.UriSchemeHttps
                || (uri.Scheme == Uri.UriSchemeHttp && uri.IsLoopback)))
        {
            description = $"endpoint {uri.GetLeftPart(UriPartial.Path)} (SAS={(string.IsNullOrEmpty(uri.Query) ? "no" : "yes")})";
            return new TableServiceClient(uri);
        }

        if (input.Contains("UseDevelopmentStorage", StringComparison.OrdinalIgnoreCase))
        {
            description = "Azurite (local)";
            return new TableServiceClient(input);
        }

        if (input.Contains("AccountName=", StringComparison.OrdinalIgnoreCase))
        {
            var start = input.IndexOf("AccountName=", StringComparison.OrdinalIgnoreCase) + "AccountName=".Length;
            var end = input.IndexOf(';', start);
            var name = end > start ? input[start..end] : input[start..];
            description = $"AccountName={name}";
            return new TableServiceClient(input);
        }

        throw new ArgumentException("Input is neither a recognised connection string nor an HTTPS URL.");
    }

    private record CategoryRow(string PartitionKey, string RowKey, string Name, bool Enabled);
}
