export function initializeParallax({ window, document, motionPreference }) {
  const aboutVisual = document.querySelector('.about__visual');

  if (aboutVisual) {
    let parallaxFrame = 0;

    const updateAboutParallax = () => {
      const bounds = aboutVisual.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const progress = Math.min(1, Math.max(0, (viewportHeight - bounds.top) / (viewportHeight + bounds.height)));
      const shift = (0.5 - progress) * 28;

      aboutVisual.style.setProperty('--about-image-shift', shift.toFixed(2) + 'px');
      aboutVisual.style.setProperty('--about-frame-shift', (shift * 0.55).toFixed(2) + 'px');
      aboutVisual.style.setProperty('--about-orbit-shift', (-shift * 0.75).toFixed(2) + 'px');
      parallaxFrame = 0;
    };

    const resetAboutParallax = () => {
      if (parallaxFrame) window.cancelAnimationFrame(parallaxFrame);
      parallaxFrame = 0;
      for (const property of ['--about-image-shift', '--about-frame-shift', '--about-orbit-shift']) {
        aboutVisual.style.removeProperty(property);
      }
    };

    const requestAboutParallaxUpdate = () => {
      if (motionPreference.matches) {
        resetAboutParallax();
        return;
      }
      if (parallaxFrame) return;
      parallaxFrame = window.requestAnimationFrame(updateAboutParallax);
    };

    window.addEventListener('scroll', requestAboutParallaxUpdate, { passive: true });
    window.addEventListener('resize', requestAboutParallaxUpdate);
    motionPreference.addEventListener('change', requestAboutParallaxUpdate);
    requestAboutParallaxUpdate();
  }
}
