using EzOrd.Models;
using EzOrd.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Extensions.Logging;

namespace EzOrd.Functions
{
    public class CategoriesFunctions
    {
        private readonly IStorageService _storageService;
        private readonly ILogger<CategoriesFunctions> _logger;

        public CategoriesFunctions(IStorageService storageService, ILogger<CategoriesFunctions> logger)
        {
            _storageService = storageService;
            _logger = logger;
        }

        [Function("GetCategories")]
        public async Task<IActionResult> GetCategories(
            [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "categories")] HttpRequest req)
        {
            try
            {
                var rows = await _storageService.GetEnabledCategoriesAsync();
                var categories = rows
                    .GroupBy(r => r.PartitionKey)
                    .Select(g => new CategoryDto
                    {
                        Id = g.Key,
                        Name = g.First().Name
                    })
                    .OrderBy(c => c.Name)
                    .ToList();

                return new OkObjectResult(new ApiResponse<CategoriesResponse>
                {
                    Success = true,
                    Data = new CategoriesResponse { Categories = categories }
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving categories");
                return new ObjectResult(new ApiResponse<object> { Success = false, Message = "An error occurred retrieving categories." }) { StatusCode = StatusCodes.Status500InternalServerError };
            }
        }
    }
}
