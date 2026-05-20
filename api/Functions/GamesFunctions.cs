using EzOrd.Models;
using EzOrd.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Extensions.Logging;

namespace EzOrd.Functions
{
    public class GamesFunctions
    {
        private readonly GameService _gameService;
        private readonly ILogger<GamesFunctions> _logger;

        public GamesFunctions(GameService gameService, ILogger<GamesFunctions> logger)
        {
            _gameService = gameService;
            _logger = logger;
        }

        [Function("StartGame")]
        public async Task<IActionResult> StartGame(
            [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "games/start")] HttpRequest req)
        {
            try
            {
                var request = await req.ReadFromJsonAsync<GameStartRequest>();
                if (request is null)
                {
                    return new BadRequestObjectResult(new ApiResponse<object> { Success = false, Message = "Request body is required." });
                }

                var response = await _gameService.StartGameAsync(request);
                return new OkObjectResult(new ApiResponse<GameStartResponse> { Success = true, Data = response });
            }
            catch (InvalidOperationException ex)
            {
                return new BadRequestObjectResult(new ApiResponse<object> { Success = false, Message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error starting game");
                return new ObjectResult(new ApiResponse<object> { Success = false, Message = "An error occurred starting the game." }) { StatusCode = StatusCodes.Status500InternalServerError };
            }
        }

        [Function("GetNextWord")]
        public async Task<IActionResult> GetNextWord(
            [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "games/{gameId}/next-word")] HttpRequest req,
            string gameId)
        {
            try
            {
                var response = await _gameService.GetNextWordAsync(gameId);
                return new OkObjectResult(new ApiResponse<WordResponse> { Success = true, Data = response });
            }
            catch (InvalidOperationException ex)
            {
                return new BadRequestObjectResult(new ApiResponse<object> { Success = false, Message = ex.Message });
            }
        }

        [Function("RateWord")]
        public async Task<IActionResult> RateWord(
            [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "games/{gameId}/rate-word")] HttpRequest req,
            string gameId)
        {
            try
            {
                var request = await req.ReadFromJsonAsync<RateWordRequest>();
                if (request is null)
                {
                    return new BadRequestObjectResult(new ApiResponse<object> { Success = false, Message = "Request body is required." });
                }

                await _gameService.RateWordAsync(gameId, request);
                return new OkObjectResult(new ApiResponse<object> { Success = true });
            }
            catch (InvalidOperationException ex)
            {
                return new BadRequestObjectResult(new ApiResponse<object> { Success = false, Message = ex.Message });
            }
        }

        [Function("SkipWord")]
        public async Task<IActionResult> SkipWord(
            [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "games/{gameId}/skip-word")] HttpRequest req,
            string gameId)
        {
            try
            {
                var request = await req.ReadFromJsonAsync<SkipWordRequest>();
                if (request is null)
                {
                    return new BadRequestObjectResult(new ApiResponse<object> { Success = false, Message = "Request body is required." });
                }

                await _gameService.SkipWordAsync(gameId, request);
                return new OkObjectResult(new ApiResponse<object> { Success = true });
            }
            catch (InvalidOperationException ex)
            {
                return new BadRequestObjectResult(new ApiResponse<object> { Success = false, Message = ex.Message });
            }
        }

        [Function("EndGame")]
        public async Task<IActionResult> EndGame(
            [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "games/{gameId}/end")] HttpRequest req,
            string gameId)
        {
            try
            {
                var response = await _gameService.EndGameAsync(gameId);
                return new OkObjectResult(new ApiResponse<GameEndResponse> { Success = true, Data = response });
            }
            catch (InvalidOperationException ex)
            {
                return new BadRequestObjectResult(new ApiResponse<object> { Success = false, Message = ex.Message });
            }
        }

        [Function("GetGameDetails")]
        public async Task<IActionResult> GetGameDetails(
            [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "games/{gameId}")] HttpRequest req,
            string gameId)
        {
            try
            {
                var response = await _gameService.GetGameDetailsAsync(gameId);
                return new OkObjectResult(new ApiResponse<GameDetailsResponse> { Success = true, Data = response });
            }
            catch (InvalidOperationException ex)
            {
                return new BadRequestObjectResult(new ApiResponse<object> { Success = false, Message = ex.Message });
            }
        }
    }
}
