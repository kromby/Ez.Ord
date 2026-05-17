using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Mvc;
using EzOrd.Models;
using EzOrd.Services;

namespace EzOrd.Controllers
{
    [EnableCors("AllowAll")]
    [ApiController]
    [Route("api/games")]
    public class GamesController : ControllerBase
    {
        private readonly GameService _gameService;

        public GamesController(GameService gameService)
        {
            _gameService = gameService;
        }

        [HttpPost("start")]
        public async Task<ActionResult<GameStartResponse>> StartGame([FromBody] GameStartRequest request)
        {
            try
            {
                var response = await _gameService.StartGameAsync(request);
                return Ok(new ApiResponse<GameStartResponse> { Success = true, Data = response });
            }
            catch (Exception ex)
            {
                return BadRequest(new ApiResponse<object> { Success = false, Message = ex.Message });
            }
        }

        [HttpGet("{gameId}/next-word")]
        public async Task<ActionResult<WordResponse>> GetNextWord(string gameId)
        {
            try
            {
                var response = await _gameService.GetNextWordAsync(gameId);
                return Ok(new ApiResponse<WordResponse> { Success = true, Data = response });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new ApiResponse<object> { Success = false, Message = ex.Message });
            }
        }

        [HttpPost("{gameId}/rate-word")]
        public async Task<ActionResult> RateWord(string gameId, [FromBody] RateWordRequest request)
        {
            try
            {
                await _gameService.RateWordAsync(gameId, request);
                return Ok(new ApiResponse<object> { Success = true });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new ApiResponse<object> { Success = false, Message = ex.Message });
            }
        }

        [HttpPost("{gameId}/skip-word")]
        public async Task<ActionResult> SkipWord(string gameId, [FromBody] SkipWordRequest request)
        {
            try
            {
                await _gameService.SkipWordAsync(gameId, request);
                return Ok(new ApiResponse<object> { Success = true });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new ApiResponse<object> { Success = false, Message = ex.Message });
            }
        }

        [HttpPost("{gameId}/end")]
        public async Task<ActionResult<GameEndResponse>> EndGame(string gameId)
        {
            try
            {
                var response = await _gameService.EndGameAsync(gameId);
                return Ok(new ApiResponse<GameEndResponse> { Success = true, Data = response });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new ApiResponse<object> { Success = false, Message = ex.Message });
            }
        }

        [HttpGet("{gameId}")]
        public async Task<ActionResult<GameDetailsResponse>> GetGameDetails(string gameId)
        {
            try
            {
                var response = await _gameService.GetGameDetailsAsync(gameId);
                return Ok(new ApiResponse<GameDetailsResponse> { Success = true, Data = response });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new ApiResponse<object> { Success = false, Message = ex.Message });
            }
        }
    }
}
