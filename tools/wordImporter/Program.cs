// See https://aka.ms/new-console-template for more information
using Ez.Word.Importer;
using wordImporter;

Console.WriteLine("Word Importer!");

string filePath = "C:\\Users\\kromb\\source\\Ez.Ord\\data\\SHsnid.csv";
var wordEntities = CsvReaderService.ReadWordEntities(filePath);

Console.WriteLine($"Word count: {wordEntities.Count}");

Console.WriteLine();

AzureDataTableService tableService = new("");

int lineNumber = 0;
foreach (var wordEntity in wordEntities)
{
    Console.WriteLine($"{lineNumber++} - ID: {wordEntity.Id}, Word: {wordEntity.Word}, Type: {wordEntity.Type}, Category: {wordEntity.Category}");
    //if (wordEntity.InflectionForms.Count > 0)
    //{
    //    Console.WriteLine("Inflection Forms: " + string.Join(", ", wordEntity.InflectionForms));
    //}
    //Console.WriteLine();

    if (lineNumber > 100)
        break;    
}


Console.WriteLine();
Console.WriteLine("Inserting word entities into Azure Table Storage...");

await tableService.InsertWordEntitiesAsync(wordEntities);

Console.WriteLine("Done!");
Console.WriteLine("Press any key to exit...");
Console.WriteLine();

Console.ReadLine();