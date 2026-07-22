export default {
  title: 'Components/MovieCard',
  tags: ['autodocs'],
  render: ({ title, genre, rating, posterUrl }) => {
    const card = document.createElement('div');
    card.className = 'w-64 bg-slate-800 rounded-xl overflow-hidden shadow-lg border border-slate-700 hover:scale-105 transition-transform duration-300';
    card.innerHTML = `
      <img src="${posterUrl}" alt="${title}" class="w-full h-80 object-cover" />
      <div class="p-4">
        <div class="flex items-center justify-between mb-2">
          <span class="text-xs font-bold px-2 py-0.5 rounded bg-red-600/80 text-white">${genre}</span>
          <span class="text-amber-400 font-semibold text-sm">★ ${rating}</span>
        </div>
        <h3 class="text-lg font-bold text-white truncate">${title}</h3>
        <button class="mt-3 w-full py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg text-sm transition-colors">
          Đặt Vé
        </button>
      </div>
    `;
    return card;
  },
  argTypes: {
    title: { control: 'text' },
    genre: { control: 'text' },
    rating: { control: 'number' },
    posterUrl: { control: 'text' }
  }
};

export const Default = {
  args: {
    title: 'Avatar: The Way of Water',
    genre: 'Hành Động / Viễn Tưởng',
    rating: 4.8,
    posterUrl: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=400&q=80'
  }
};
