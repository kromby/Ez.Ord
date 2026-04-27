namespace EzOrd.Services
{
    public class StorageInitializerService : IHostedService
    {
        private readonly StorageService _storageService;

        public StorageInitializerService(StorageService storageService)
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
