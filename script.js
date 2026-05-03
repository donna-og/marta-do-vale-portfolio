const modal = document.querySelector('.video-modal');
const frame = document.getElementById('video-frame');
const closeButton = document.querySelector('.video-close');
const filmCards = document.querySelectorAll('.film-card');

const closeModal = () => {
  modal.hidden = true;
  frame.src = '';
  document.body.style.overflow = '';
};

filmCards.forEach((card) => {
  card.addEventListener('click', () => {
    frame.src = card.dataset.video;
    modal.hidden = false;
    document.body.style.overflow = 'hidden';
  });
});

closeButton.addEventListener('click', closeModal);
modal.addEventListener('click', (event) => {
  if (event.target === modal) closeModal();
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && !modal.hidden) closeModal();
});
