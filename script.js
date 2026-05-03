const filters = document.querySelectorAll('.filter');
const tiles = document.querySelectorAll('.tile');

filters.forEach((button) => {
  button.addEventListener('click', () => {
    filters.forEach((item) => item.classList.remove('active'));
    button.classList.add('active');

    const filter = button.dataset.filter;
    tiles.forEach((tile) => {
      const tags = tile.dataset.tags || '';
      const show = filter === 'all' || tags.includes(filter);
      tile.classList.toggle('hidden', !show);
    });
  });
});
