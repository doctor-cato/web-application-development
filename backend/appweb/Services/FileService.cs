using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using System;
using System.IO;
using System.Linq;
using System.Threading.Tasks;

namespace appweb.Services
{
    public class FileService : IFileService
    {
        private readonly IWebHostEnvironment _environment;
        // Limit to 5MB
        private const int MaxFileSize = 5 * 1024 * 1024;
        private readonly string[] _allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".gif", ".webp" };

        public FileService(IWebHostEnvironment environment)
        {
            _environment = environment;
        }

        public async Task<string> UploadImageAsync(IFormFile file)
        {
            if (file == null || file.Length == 0)
            {
                throw new ArgumentException("File is empty or null.");
            }

            if (file.Length > MaxFileSize)
            {
                throw new ArgumentException("File size exceeds the 5MB limit.");
            }

            var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
            if (!_allowedExtensions.Contains(extension))
            {
                throw new ArgumentException("Invalid file extension. Allowed extensions are: " + string.Join(", ", _allowedExtensions));
            }

            // Create uploads/images folder if it doesn't exist
            var uploadsFolder = Path.Combine(_environment.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot"), "uploads", "images");
            if (!Directory.Exists(uploadsFolder))
            {
                Directory.CreateDirectory(uploadsFolder);
            }

            // Generate unique filename
            var uniqueFileName = Guid.NewGuid().ToString() + "_" + DateTime.Now.Ticks + extension;
            var filePath = Path.Combine(uploadsFolder, uniqueFileName);

            using (var fileStream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(fileStream);
            }

            // Return relative path for web access
            return $"/uploads/images/{uniqueFileName}";
        }

        public bool DeleteImage(string imageFileName)
        {
            if (string.IsNullOrEmpty(imageFileName))
            {
                return false;
            }

            // Extract just the filename if a full URL/path was passed
            var fileName = Path.GetFileName(imageFileName);
            
            var uploadsFolder = Path.Combine(_environment.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot"), "uploads", "images");
            var filePath = Path.Combine(uploadsFolder, fileName);

            if (File.Exists(filePath))
            {
                File.Delete(filePath);
                return true;
            }

            return false;
        }
    }
}
