using Microsoft.Extensions.Hosting;

namespace EzOrd.Services
{
    public class StorageInitializerService : IHostedService
    {
        private readonly IStorageService _storageService;

        public StorageInitializerService(IStorageService storageService)
        {
            _storageService = storageService;
        }

        public async Task StartAsync(CancellationToken cancellationToken)
        {
            await _storageService.InitializeAsync();
        }

        public Task StopAsync(CancellationToken cancellationToken) => Task.CompletedTask;
    }
}
