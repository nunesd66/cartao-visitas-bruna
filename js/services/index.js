export function initializeServicePhotos({ window, document, motionPreference }) {
  const galleries = [...document.querySelectorAll('.service-card__gallery')].map((gallery) => ({
    photos: [...gallery.children],
    current: 0,
  })).filter(({ photos }) => photos.length > 1);
  if (galleries.length === 0) return;

  function advance() {
    for (const gallery of galleries) {
      const { photos, current } = gallery;
      const next = (current + 1) % photos.length;
      photos[current].setAttribute('data-inactive', '');
      photos[next].removeAttribute('data-inactive');
      gallery.current = next;
    }
  }

  const control = document.querySelector('[data-service-rotation]');
  if (!control) return;

  let timer;
  function setPlaying(playing) {
    if (timer !== undefined) {
      window.clearInterval(timer);
      timer = undefined;
    }
    if (playing) timer = window.setInterval(advance, 2000);
    control.textContent = playing ? 'Pausar troca de fotos' : 'Retomar troca de fotos';
  }

  control.addEventListener('click', () => setPlaying(timer === undefined));
  motionPreference.addEventListener('change', (event) => {
    if (event.matches) setPlaying(false);
  });
  setPlaying(!motionPreference.matches);
  control.hidden = false;
}
