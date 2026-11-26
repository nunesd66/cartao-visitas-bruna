export function initializeMap(document) {
  document.querySelectorAll('[data-map-load]').forEach((button) => {
    const frame = button.closest('.map-embed')?.querySelector('iframe[data-map-src]');
    const url = frame?.dataset.mapSrc;
    if (!url || !url.startsWith('https://www.google.com/maps/embed?pb=')) return;

    button.addEventListener('click', () => {
      frame.src = url;
      frame.removeAttribute('tabindex');
      if (document.activeElement === button) frame.focus();
      button.remove();
    });
    button.hidden = false;
  });
}
