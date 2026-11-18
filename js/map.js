(() => {
  document.querySelectorAll('[data-map-load]').forEach((button) => {
    button.addEventListener('click', () => {
      const frame = button.closest('.map-embed')?.querySelector('iframe[data-map-src]');
      const url = frame?.dataset.mapSrc;
      if (!url || !url.startsWith('https://maps.google.com/maps?')) return;
      frame.src = url;
      button.remove();
    });
  });
})();
