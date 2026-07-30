using appweb.Infrastructure;
using appweb.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Microsoft.Extensions.FileProviders;
using Microsoft.AspNetCore.Identity;
using appweb.Models;
using System;
using System.Text;
using Microsoft.AspNetCore.RateLimiting;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllersWithViews()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
    });
builder.Services.AddControllers();

builder.Services.AddRateLimiter(options =>
{
    options.AddFixedWindowLimiter("loginPolicy", opt =>
    {
        opt.Window = TimeSpan.FromMinutes(1);
        opt.PermitLimit = 5;
        opt.QueueProcessingOrder = System.Threading.RateLimiting.QueueProcessingOrder.OldestFirst;
        opt.QueueLimit = 0;
    });
    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
});

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll",
        policy =>
            policy.WithOrigins("http://localhost:3000", "http://127.0.0.1:3000", "https://32dk-web-app-project.vercel.app")
                  .AllowAnyMethod()
                  .AllowAnyHeader()
                  .AllowCredentials());
});

builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddSignalR();

var jwtKey = builder.Configuration["Jwt:Key"]!;
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = builder.Configuration["Jwt:Issuer"],
        ValidAudience = builder.Configuration["Jwt:Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey))
    };
    // Allow SignalR to receive JWT from query string
    options.Events = new JwtBearerEvents
    {
        OnMessageReceived = context =>
        {
            var accessToken = context.Request.Query["access_token"];
            var path = context.HttpContext.Request.Path;
            if (!string.IsNullOrEmpty(accessToken) &&
                (path.StartsWithSegments("/seatHub") ||
                 path.StartsWithSegments("/notificationHub") ||
                 path.StartsWithSegments("/cinematchHub")))
            {
                context.Token = accessToken;
            }
            return Task.CompletedTask;
        }
    };
});

builder.Services.AddScoped<IFileService, FileService>();

builder.Services.AddScoped<appweb.Repositories.UserRepository>();
builder.Services.AddScoped<appweb.Repositories.MovieRepository>();
builder.Services.AddScoped<appweb.Repositories.BookingRepository>();
builder.Services.AddScoped<appweb.Repositories.ShowtimeRepository>();
builder.Services.AddScoped<appweb.Repositories.CinemaRepository>();

builder.Services.AddHostedService<appweb.Services.SeatCleanupService>();

var app = builder.Build();

using var scope = app.Services.CreateScope();
var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

if (builder.Configuration.GetValue<bool>("Database:InitializeOnStartup"))
{
    try
    {
        DbInitializer.Initialize(context);
    }
    catch (Exception ex)
    {
        app.Logger.LogError(ex, "Database initialization failed.");
    }
}

app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "App Web API V1");
});

app.UseHttpsRedirection();
app.UseStaticFiles();

var frontendPath = Path.GetFullPath(Path.Combine(builder.Environment.ContentRootPath, "../frontend"));
if (Directory.Exists(frontendPath))
{
    app.UseStaticFiles(new StaticFileOptions
    {
        FileProvider = new PhysicalFileProvider(frontendPath),
        RequestPath = ""
    });
}

app.UseRouting();
app.UseRateLimiter();

app.UseCors("AllowAll");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Home}/{action=Index}/{id?}");

app.MapControllers();

app.MapHub<appweb.Hubs.NotificationHub>("/notificationHub");
app.MapHub<appweb.Hubs.CineMatchHub>("/cinematchHub");
app.MapHub<appweb.Hubs.SeatHub>("/seatHub");

app.Run();
