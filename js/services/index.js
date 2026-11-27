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

  let timer;
  function updateRotation() {
    if (motionPreference.matches) {
      window.clearInterval(timer);
      timer = undefined;
    } else if (timer === undefined) {
      timer = window.setInterval(advance, 2000);
    }
  }

  motionPreference.addEventListener('change', updateRotation);
  updateRotation();
}
