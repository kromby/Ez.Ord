using Microsoft.AspNetCore.Mvc;
using EzOrd.Models;
using EzOrd.Services;

namespace EzOrd.Controllers
{
    [ApiController]
    [Route("api/categories")]
    public class CategoriesController : ControllerBase
    {
        private readonly StorageService _storageService;

        public CategoriesController(StorageService storageService)
        {
            _storageService = storageService;
        }

        [HttpGet]
        public async Task<ActionResult<CategoriesResponse>> GetCategories()
        {
            try
            {
                var categoryNames = await _storageService.GetCategoriesAsync();
                var categories = categoryNames.Select((name, index) => new CategoryDto
                {
                    Id = name, // For now, use name as ID
                    Name = name
                }).ToList();

                return Ok(new ApiResponse<CategoriesResponse>
                {
                    Success = true,
                    Data = new CategoriesResponse { Categories = categories }
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ApiResponse<object> { Success = false, Message = ex.Message });
            }
        }
    }
}
