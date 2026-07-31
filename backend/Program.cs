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

builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
    });

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

builder.Services.AddMemoryCache();
builder.Services.AddHttpClient();
builder.Services.AddScoped<IFileService, FileService>();
builder.Services.AddScoped<IRatingService, RatingService>();

builder.Services.AddScoped<appweb.Repositories.UserRepository>();
builder.Services.AddScoped<appweb.Repositories.MovieRepository>();
builder.Services.AddScoped<appweb.Repositories.BookingRepository>();
builder.Services.AddScoped<appweb.Repositories.ShowtimeRepository>();
builder.Services.AddScoped<appweb.Repositories.CinemaRepository>();

builder.Services.AddHostedService<appweb.Services.SeatCleanupService>();

var app = builder.Build();

// PONYTAIL: Force Developer Exception Page to see why Somee is crashing with 500
app.UseDeveloperExceptionPage();

using var scope = app.Services.CreateScope();
var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
try {
    // 👱‍♀️ PONYTAIL: Bypassing EF Migrations for the 2FA column because the migration history 
    // is currently out of sync (Table 'Cinemas' already exists). 
    // CEILING: This raw SQL won't be tracked in EF migrations history.
    // UPGRADE PATH: Once the DB schema is properly reverse-engineered or migration history is fixed, 
    // move this into a proper EF migration and remove this raw SQL.
    context.Database.ExecuteSqlRaw("IF COL_LENGTH('users', 'is_two_factor_enabled') IS NULL ALTER TABLE users ADD is_two_factor_enabled BIT NOT NULL DEFAULT 0;");
} catch (Exception ex) {
    app.Logger.LogWarning(ex, "Failed to run alter table for 2FA column.");
}
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

string? frontendPath = null;
try {
    var frontendDevPath = Path.GetFullPath(Path.Combine(builder.Environment.ContentRootPath, "../frontend"));
    var frontendProdPath = Path.GetFullPath(Path.Combine(builder.Environment.ContentRootPath, "frontend"));
    frontendPath = Directory.Exists(frontendProdPath) ? frontendProdPath : (Directory.Exists(frontendDevPath) ? frontendDevPath : null);
} catch (Exception ex) {
    app.Logger.LogWarning(ex, "Could not resolve frontend path, skipping static files for frontend.");
}

if (frontendPath != null)
{
    try {
        app.UseStaticFiles(new StaticFileOptions
        {
            FileProvider = new PhysicalFileProvider(frontendPath),
            RequestPath = ""
        });
    } catch (Exception ex) {
        app.Logger.LogWarning(ex, "Could not use static files for frontend.");
    }
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
