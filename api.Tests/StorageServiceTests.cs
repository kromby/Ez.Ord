using Azure.Data.Tables;
using EzOrd.Models;
using EzOrd.Services;
using Xunit;

namespace EzOrd.Tests;

[Trait("Category", "Integration")]
public class StorageServiceTests : IAsyncLifetime
{
    private StorageService _service = null!;

    public async Task InitializeAsync()
    {
        var client = new TableServiceClient("UseDevelopmentStorage=true");
        _service = new StorageService(client);
        await _service.InitializeAsync();
    }

    public Task DisposeAsync() => Task.CompletedTask;

    [Fact]
    public async Task GetLookupAsync_ReturnsNullForMissingRow()
    {
        var result = await _service.GetLookupAsync("noSuchPartition", Guid.NewGuid().ToString());
        Assert.Null(result);
    }

    [Fact]
    public async Task UpsertLookupAsync_SetsCreatedAtAndUpdatedAtOnInsert()
    {
        var before = DateTime.UtcNow;
        var entity = new LookupEntity
        {
            PartitionKey = "test",
            RowKey = Guid.NewGuid().ToString(),
            Name = "Test",
            Description = "",
            Enabled = true
        };

        await _service.UpsertLookupAsync(entity);

        var result = await _service.GetLookupAsync(entity.PartitionKey, entity.RowKey);
        Assert.NotNull(result);
        Assert.True(result!.CreatedAt >= before);
        Assert.True(result.UpdatedAt >= before);
    }

    [Fact]
    public async Task UpsertLookupAsync_PreservesCreatedAtOnUpdate()
    {
        var rowKey = Guid.NewGuid().ToString();
        var entity = new LookupEntity
        {
            PartitionKey = "test",
            RowKey = rowKey,
            Name = "Initial",
            Description = "",
            Enabled = true
        };

        await _service.UpsertLookupAsync(entity);
        var first = await _service.GetLookupAsync("test", rowKey);

        await Task.Delay(10);
        entity.Name = "Updated";
        await _service.UpsertLookupAsync(entity);
        var second = await _service.GetLookupAsync("test", rowKey);

        Assert.Equal(first!.CreatedAt, second!.CreatedAt);
        Assert.True(second.UpdatedAt > first.UpdatedAt);
        Assert.Equal("Updated", second.Name);
    }

    [Fact]
    public async Task GetWordDifficultyAsync_ReturnsNullForMissingRow()
    {
        var result = await _service.GetWordDifficultyAsync("drawing", Guid.NewGuid().ToString());
        Assert.Null(result);
    }

    [Fact]
    public async Task UpsertWordDifficultyAsync_SetsUpdatedAtAndDifficulty()
    {
        var before = DateTime.UtcNow;
        var entity = new WordDifficultyEntity
        {
            PartitionKey = "drawing",
            RowKey = Guid.NewGuid().ToString(),
            Difficulty = 5
        };

        await _service.UpsertWordDifficultyAsync(entity);

        var result = await _service.GetWordDifficultyAsync(entity.PartitionKey, entity.RowKey);
        Assert.NotNull(result);
        Assert.Equal(5, result!.Difficulty);
        Assert.True(result.UpdatedAt >= before);
    }

    [Fact]
    public async Task InitializeAsync_SeedsAllThreeGameTypeRows()
    {
        var drawing = await _service.GetLookupAsync("gameType", "drawing");
        var explanation = await _service.GetLookupAsync("gameType", "explanation");
        var acting = await _service.GetLookupAsync("gameType", "acting");

        Assert.NotNull(drawing);
        Assert.NotNull(explanation);
        Assert.NotNull(acting);
        Assert.True(drawing!.Enabled);
        Assert.True(explanation!.Enabled);
        Assert.True(acting!.Enabled);
    }

    [Fact]
    public async Task InitializeAsync_DoesNotOverwriteExistingRows()
    {
        var existing = await _service.GetLookupAsync("gameType", "drawing");
        Assert.NotNull(existing);
        existing!.Enabled = false;
        await _service.UpsertLookupAsync(existing);

        // Simulate a restart
        await _service.InitializeAsync();

        var result = await _service.GetLookupAsync("gameType", "drawing");
        Assert.False(result!.Enabled);

        // Restore for other tests
        result.Enabled = true;
        await _service.UpsertLookupAsync(result);
    }
}
