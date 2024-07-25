using Azure;
using Azure.Data.Tables;
using Ez.Word.Importer;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace wordImporter
{
    internal class AzureDataTableService(string connectionString)
    {
        private readonly TableClient _wordTableClient = new(connectionString, "Words");
        private readonly TableClient _formTableClient = new(connectionString, "WordForms");

        public async Task InsertWordEntitiesAsync(IList<WordEntity> wordEntities)
        {
            foreach (var wordEntity in wordEntities)
            {
                var wordEntityTable = new WordEntityTable(wordEntity);
                await _wordTableClient.AddEntityAsync(wordEntityTable);

                await InsertInflectionFormsAsync(wordEntityTable.RowKey, wordEntity.InflectionForms);
            }
        }

        private async Task InsertInflectionFormsAsync(string wordId, IDictionary<string, string> inflectionForms)
        {
            foreach (var inflectionForm in inflectionForms.Keys)
            {
                var inflectionFormEntity = new InflectionFormEntity(wordId, inflectionForm, inflectionForms[inflectionForm]);
                await _formTableClient.AddEntityAsync(inflectionFormEntity);
            }
        }
    }

    internal class WordEntityTable(WordEntity wordEntity) : ITableEntity
    {
        public string Word { get; set; } = wordEntity.Word;
        public string Category { get; set; } = wordEntity.Category;
        //public IList<string> InflectionForms { get; set; } = wordEntity.InflectionForms;

        public string PartitionKey { get; set; } = wordEntity.Type;
        public string RowKey { get; set; } = wordEntity.Id.ToString();
        public DateTimeOffset? Timestamp { get; set; }
        public ETag ETag { get; set; }
    }

    internal class InflectionFormEntity(string wordId, string form, string type) : ITableEntity
    {
        public string PartitionKey { get; set; } = wordId;
        public string RowKey { get; set; } = type;
        public string Form { get; set; } = form;
        public DateTimeOffset? Timestamp { get; set; }
        public ETag ETag { get; set; }
    }
}
