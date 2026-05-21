using EzOrd.Models;
using EzOrd.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Extensions.Logging;

namespace EzOrd.Functions;

public class WordTypesFunctions
{
    private readonly IStorageService _storageService;
    private readonly ILogger<WordTypesFunctions> _logger;

    public WordTypesFunctions(IStorageService storageService, ILogger<WordTypesFunctions> logger)
    {
        _storageService = storageService;
        _logger = logger;
    }

    [Function("GetWordTypes")]
    public async Task<IActionResult> GetWordTypesAsync(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "word-types")] HttpRequest req)
    {
        try
        {
            var entities = await _storageService.GetEnabledWordTypesAsync();
            var types = entities
                .GroupBy(t => t.RowKey)
                .Select(g => new WordTypeDto
                {
                    Id = g.Key,
                    Name = g.First().Name
                })
                .OrderBy(t => t.Name)
                .ToList();

            return new OkObjectResult(new ApiResponse<WordTypesResponse>
            {
                Success = true,
                Data = new WordTypesResponse { Types = types }
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving word types");
            return new ObjectResult(new ApiResponse<object> { Success = false, Message = "An error occurred retrieving word types." }) { StatusCode = StatusCodes.Status500InternalServerError };
        }
    }
}
