using appweb.Infrastructure;
using appweb.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.Extensions.FileProviders;
using System;

var builder = WebApplication.CreateBuilder(args);

// Đăng ký các dịch vụ hệ thống MVC và API Controller
builder.Services.AddControllersWithViews();
builder.Services.AddControllers();

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll",
        builder =>
        {
            builder.SetIsOriginAllowed(origin => true) // SignalR requires this instead of AllowAnyOrigin
                   .AllowAnyMethod()
                   .AllowAnyHeader()
                   .AllowCredentials(); // Required for SignalR
        });
});

builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Đăng ký SignalR
builder.Services.AddSignalR();

// Đăng ký Authentication (Cookie)
builder.Services.AddAuthentication(CookieAuthenticationDefaults.AuthenticationScheme)
    .AddCookie(options =>
    {
        options.LoginPath = "/Account/Login";
        options.LogoutPath = "/Account/Logout";
        options.AccessDeniedPath = "/Account/AccessDenied";
        options.ExpireTimeSpan = TimeSpan.FromDays(30);
    });

// Đăng ký FileService
builder.Services.AddScoped<IFileService, FileService>();

// Đăng ký các Repositories
builder.Services.AddScoped<appweb.Repositories.UserRepository>();
builder.Services.AddScoped<appweb.Repositories.MovieRepository>();
builder.Services.AddScoped<appweb.Repositories.BookingRepository>();
builder.Services.AddScoped<appweb.Repositories.ShowtimeRepository>();
builder.Services.AddScoped<appweb.Repositories.CinemaRepository>();

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    var context = services.GetRequiredService<ApplicationDbContext>();
    DbInitializer.Initialize(context);
}

// ĐƯA SWAGGER RA NGOÀI ĐỂ LUÔN HOẠT ĐỘNG KHI CHẠY DỰ ÁN
app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "App Web API V1");
});

if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Home/Error");
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseStaticFiles(); // Default wwwroot

// Serve frontend directory (if exists - e.g., local development)
var frontendPath = Path.GetFullPath(Path.Combine(builder.Environment.ContentRootPath, "../frontend"));
if (Directory.Exists(frontendPath))
{
    app.UseStaticFiles(new StaticFileOptions
    {
        FileProvider = new PhysicalFileProvider(frontendPath),
        RequestPath = "" // Map directly to root so /src/engagement/... works
    });
}

app.UseCors("AllowAll");

app.UseRouting();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Home}/{action=Index}/{id?}");

app.MapControllers();

app.MapHub<appweb.Hubs.NotificationHub>("/notificationHub");
app.MapHub<appweb.Hubs.CineMatchHub>("/cinematchHub");

app.Run();