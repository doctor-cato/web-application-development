using appweb.Infrastructure;
using appweb.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.Extensions.FileProviders;
using System;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllersWithViews()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
    });
builder.Services.AddControllers();

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

builder.Services.AddAuthentication(CookieAuthenticationDefaults.AuthenticationScheme)
    .AddCookie(options =>
    {
        options.LoginPath = "/Account/Login";
        options.LogoutPath = "/Account/Logout";
        options.AccessDeniedPath = "/Account/AccessDenied";
        options.ExpireTimeSpan = TimeSpan.FromDays(30);
    });

builder.Services.AddScoped<IFileService, FileService>();

builder.Services.AddScoped<appweb.Repositories.UserRepository>();
builder.Services.AddScoped<appweb.Repositories.MovieRepository>();
builder.Services.AddScoped<appweb.Repositories.BookingRepository>();
builder.Services.AddScoped<appweb.Repositories.ShowtimeRepository>();
builder.Services.AddScoped<appweb.Repositories.CinemaRepository>();

var app = builder.Build();

if (builder.Configuration.GetValue<bool>("Database:InitializeOnStartup"))
{
    using var scope = app.Services.CreateScope();
    try
    {
        var services = scope.ServiceProvider;
        var context = services.GetRequiredService<ApplicationDbContext>();
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

app.UseCors("AllowAll");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Home}/{action=Index}/{id?}");

app.MapControllers();

app.MapHub<appweb.Hubs.NotificationHub>("/notificationHub");
app.MapHub<appweb.Hubs.CineMatchHub>("/cinematchHub");

app.Run();
