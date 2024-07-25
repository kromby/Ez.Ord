using System;
using System.Collections.Generic;
using System.Formats.Asn1;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Net.NetworkInformation;
using CsvHelper;
using CsvHelper.Configuration;

namespace Ez.Word.Importer;

public class CsvReaderService
{
    private static readonly string[] INCLUDE_TYPES = ["kk"];
    private static readonly string[] EXCLUDE_CATEGORIES = ["ism", "föð", "móð", "bibl", "bibl,erl", "bibl,föð", "bibl,móð", "gæl"];

    internal static List<WordEntity> ReadWordEntities(string filePath)
    {
        var wordEntitiesDict = new Dictionary<int, WordEntity>();
        var config = new CsvConfiguration(CultureInfo.InvariantCulture)
        {
            Delimiter = ";",
            HasHeaderRecord = true,
        };

        using (var reader = new StreamReader(filePath))
        using (var csv = new CsvReader(reader, config))
        {
            var records = csv.GetRecords<dynamic>();
            foreach (var record in records)
            {                
                string word = record.Word;
                int id = int.Parse(record.Id);
                string type = record.Type;
                string category = record.Category;
                string inflectionForm = record.InflectionForm;
                string inflectionFormType = record.InflectionFormType;

                if (!INCLUDE_TYPES.Contains(type) || EXCLUDE_CATEGORIES.Contains(category))
                    continue;

                if (word.StartsWith("aðal"))
                    continue;

                if (wordEntitiesDict.TryGetValue(id, out var wordEntity))
                {
                    if(!wordEntity.InflectionForms.ContainsKey(inflectionForm))
                        wordEntity.InflectionForms.Add(inflectionForm, inflectionFormType);
                }
                else
                {
                    wordEntity = new WordEntity(id, word, type, category);
                    if (!string.IsNullOrEmpty(inflectionForm))
                    {
                        wordEntity.InflectionForms.Add(inflectionForm, inflectionFormType);
                    }
                    wordEntitiesDict[id] = wordEntity;
                }
            }
        }

        return [.. wordEntitiesDict.Values];
    }
}