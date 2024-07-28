using System.Globalization;
using CsvHelper;
using CsvHelper.Configuration;
using wordImporter;

namespace Ez.Word.Importer;

public class CsvWriterService
{
    internal static void SaveWordEntities(string filePath, List<WordEntity> wordEntities)
    {
        var config = new CsvConfiguration(CultureInfo.InvariantCulture)
        {
            Delimiter = ",",
            HasHeaderRecord = true,
        };

        using var writer = new StreamWriter(filePath);
        using var csv = new CsvWriter(writer, config);

        csv.WriteHeader<WordEntityTable>();
        csv.NextRecord();
        foreach (var wordEntity in wordEntities)
        {
            var entity = new WordEntityTable(wordEntity);
            csv.WriteRecord(entity);
            csv.NextRecord();
        }
    }
}