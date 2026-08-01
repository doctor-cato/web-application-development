using appweb.Infrastructure;
using appweb.Models;
using Microsoft.EntityFrameworkCore;

namespace appweb.Repositories
{
    public class ComboRepository
    {
        private readonly ApplicationDbContext _context;

        public ComboRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<List<Combo>> GetAllAsync()
        {
            return await _context.Combos.ToListAsync();
        }

        public async Task<Combo?> GetByIdAsync(string id)
        {
            return await _context.Combos.FirstOrDefaultAsync(c => c.Id == id);
        }

        public async Task AddAsync(Combo combo)
        {
            await _context.Combos.AddAsync(combo);
            await _context.SaveChangesAsync();
        }

        public async Task UpdateAsync(Combo combo)
        {
            _context.Combos.Update(combo);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(string id)
        {
            var combo = await GetByIdAsync(id);
            if (combo != null)
            {
                _context.Combos.Remove(combo);
                await _context.SaveChangesAsync();
            }
        }
    }
}
