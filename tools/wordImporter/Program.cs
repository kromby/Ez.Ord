// See https://aka.ms/new-console-template for more information
using Ez.Word.Importer;
using Microsoft.Extensions.Configuration;

Console.WriteLine("Word Importer!");

var configuration = new ConfigurationBuilder().SetBasePath(Directory.GetCurrentDirectory()).AddJsonFile("appsettings.local.json", optional: true, reloadOnChange: true).Build();

var connectionString = configuration["ConnectionString"];
var inputPath = configuration["FilePath"];
var outputPath = configuration["OutputPath"];

if(string.IsNullOrWhiteSpace(connectionString) || string.IsNullOrWhiteSpace(inputPath) || string.IsNullOrWhiteSpace(outputPath))
{
    Console.WriteLine("Please provide ConnectionString and FilePath in appsettings.json");
    return;
}

//string filePath = "C:\\Users\\kromb\\source\\Ez.Ord\\data\\SHsnid.csv";
var wordEntities = CsvReaderService.ReadWordEntities(inputPath);

Console.WriteLine($"Word count: {wordEntities.Count}");

Console.WriteLine();

int lineNumber = 0;
foreach (var wordEntity in wordEntities)
{
    Console.WriteLine($"{lineNumber++} - ID: {wordEntity.Id}, Word: {wordEntity.Word}, Type: {wordEntity.Type}, Category: {wordEntity.Category}");
    if (lineNumber > 100)
        break;    
}


Console.WriteLine();

//Console.WriteLine("Inserting word entities into Azure Table Storage...");
//AzureDataTableService tableService = new(connectionString);
//await tableService.InsertWordEntitiesAsync(wordEntities);

Console.WriteLine("Saving CSV");
CsvWriterService.SaveWordEntities(outputPath, wordEntities);

Console.WriteLine("Done!");
Console.WriteLine("Press any key to exit...");
Console.WriteLine();

Console.ReadLine();