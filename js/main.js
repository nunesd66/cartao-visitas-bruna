document.querySelectorAll('.brand[href="#inicio"]').forEach((brand) => {
  brand.addEventListener('click', (event) => {
    event.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
});

const faqAnswers = document.querySelectorAll('.faq details');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

document.querySelectorAll('.mobile-nav').forEach((menu) => {
  menu.addEventListener('click', (event) => {
    if (event.target.closest('a[href^="#"]')) menu.open = false;
  });
});

const aboutVisual = document.querySelector('.about__visual');

if (aboutVisual && !reduceMotion) {
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

  const requestAboutParallaxUpdate = () => {
    if (parallaxFrame) return;
    parallaxFrame = window.requestAnimationFrame(updateAboutParallax);
  };

  window.addEventListener('scroll', requestAboutParallaxUpdate, { passive: true });
  window.addEventListener('resize', requestAboutParallaxUpdate);
  requestAboutParallaxUpdate();
}

document.querySelectorAll('[data-carousel]').forEach((carousel) => {
  const viewport = carousel.querySelector('[data-carousel-viewport]');
  const track = carousel.querySelector('.testimonials__track');
  const slides = [...carousel.querySelectorAll('.testimonial-slide')];
  const controls = carousel.querySelector('[data-carousel-controls]');
  const previous = carousel.querySelector('[data-carousel-prev]');
  const next = carousel.querySelector('[data-carousel-next]');
  const status = carousel.querySelector('[data-carousel-status]');

  if (!viewport || !track || !slides.length || !controls || !previous || !next || !status) return;

  controls.hidden = false;
  let statusFrame = 0;

  const getStep = () => {
    const gap = Number.parseFloat(window.getComputedStyle(track).gap) || 0;
    return slides[0].getBoundingClientRect().width + gap;
  };

  const updateControls = () => {
    const step = getStep();
    const maxScroll = viewport.scrollWidth - viewport.clientWidth;
    const activeIndex = step ? Math.round(viewport.scrollLeft / step) : 0;

    previous.disabled = viewport.scrollLeft <= 1;
    next.disabled = viewport.scrollLeft >= maxScroll - 1;
    status.textContent = (Math.min(activeIndex + 1, slides.length)) + ' de ' + slides.length;
  };

  const move = (direction) => {
    viewport.scrollBy({
      left: direction * getStep(),
      behavior: reduceMotion ? 'auto' : 'smooth',
    });
  };

  previous.addEventListener('click', () => move(-1));
  next.addEventListener('click', () => move(1));

  viewport.addEventListener('scroll', () => {
    if (statusFrame) return;
    statusFrame = window.requestAnimationFrame(() => {
      statusFrame = 0;
      updateControls();
    });
  }, { passive: true });

  window.addEventListener('resize', updateControls);
  updateControls();
});

faqAnswers.forEach((details) => {
  const summary = details.querySelector('summary');
  const answer = details.querySelector('p');
  if (!summary || !answer) return;

  answer.style.overflow = 'hidden';
  answer.style.transition = reduceMotion ? 'none' : 'height 400ms ease';
  if (!details.open) answer.style.height = '0px';

  summary.addEventListener('click', (event) => {
    event.preventDefault();
    if (details.dataset.animating === 'true') return;

    if (!details.open) {
      delete details.dataset.closing;
      details.open = true;
      answer.style.height = '0px';
      if (reduceMotion) {
        answer.style.height = 'auto';
        return;
      }
      void answer.offsetHeight;
      answer.style.height = `${answer.scrollHeight}px`;
      details.dataset.animating = 'true';
    } else {
      if (reduceMotion) {
        details.open = false;
        answer.style.height = '0px';
        return;
      }
      answer.style.height = `${answer.scrollHeight}px`;
      void answer.offsetHeight;
      answer.style.height = '0px';
      details.dataset.animating = 'true';
      details.dataset.closing = 'true';
    }
  });

  answer.addEventListener('transitionend', (event) => {
    if (event.propertyName !== 'height') return;
    if (details.dataset.closing === 'true') {
      details.open = false;
      answer.style.height = '0px';
      delete details.dataset.closing;
      delete details.dataset.animating;
    } else if (details.open) {
      answer.style.height = 'auto';
      delete details.dataset.animating;
    }
  });
});
