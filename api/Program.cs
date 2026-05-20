using Azure.Data.Tables;
using EzOrd.Services;

var builder = WebApplication.CreateBuilder(args);

// Add services
builder.Services.AddControllers();
builder.Services.AddSwaggerGen();
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", b => b.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader());
});

// Register Azure Table Storage client
var connectionString = builder.Configuration.GetConnectionString("AzureTableStorage")
    ?? "UseDevelopmentStorage=true"; // Local Azure Storage Emulator for dev
builder.Services.AddSingleton(new TableServiceClient(connectionString));

// Register storage service
builder.Services.AddSingleton<IStorageService, StorageService>();

// Register game service
builder.Services.AddScoped<GameService>();

// Add hosted service to initialize tables
builder.Services.AddHostedService<StorageInitializerService>();

var app = builder.Build();

// Configure middleware
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("AllowAll");
app.UseRouting();
app.MapControllers();

app.Run();
