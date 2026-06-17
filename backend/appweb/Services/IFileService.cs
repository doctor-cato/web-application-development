using Microsoft.AspNetCore.Http;
using System.Threading.Tasks;

namespace appweb.Services
{
    public interface IFileService
    {
        Task<string> UploadImageAsync(IFormFile file);
        bool DeleteImage(string imageFileName);
    }
}
