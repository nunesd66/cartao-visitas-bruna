document.addEventListener('click', (event) => {
  const target = event.target instanceof Element ? event.target : event.target.parentElement;
  const trigger = target?.closest('[data-analytics-event]');
  if (!trigger || typeof window.gtag !== 'function') return;

  const eventName = trigger.dataset.analyticsEvent;
  if (eventName === 'faq_open' && trigger.closest('details')?.open) return;

  const parameters = {};
  if (trigger.dataset.analyticsLocation) parameters.cta_location = trigger.dataset.analyticsLocation;
  if (trigger.dataset.analyticsService) parameters.service_name = trigger.dataset.analyticsService;
  if (trigger.dataset.analyticsChannel) parameters.channel = trigger.dataset.analyticsChannel;
  if (trigger.dataset.analyticsQuestion) parameters.faq_id = trigger.dataset.analyticsQuestion;

  window.gtag('event', eventName, parameters);
}, true);

document.querySelectorAll('.brand[href="#inicio"]').forEach((brand) => {
  brand.addEventListener('click', (event) => {
    event.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
});

const faqAnswers = document.querySelectorAll('.faq details');
const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
const reduceMotion = motionPreference.matches;

document.querySelectorAll('.mobile-nav').forEach((menu) => {
  const summary = menu.querySelector('summary');
  summary?.addEventListener('click', () => {
    window.requestAnimationFrame(() => {
      summary.setAttribute('aria-label', menu.open ? 'Fechar menu de navegação' : 'Abrir menu de navegação');
      if (menu.open) menu.querySelector('nav a')?.focus();
    });
  });
  menu.addEventListener('click', (event) => {
    if (event.target.closest('a[href^="#"]')) menu.open = false;
  });
  menu.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape' || !menu.open) return;
    menu.open = false;
    summary?.focus();
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

document.querySelectorAll('[data-whatsapp-form]').forEach((form) => {
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const question = new FormData(form).get('question')?.toString().trim();
    if (!question) return;
    const message = `Ol\u00e1, tenho uma d\u00favida espec\u00edfica: ${question}`;
    const url = `https://wa.me/5534992797055?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  });
});
const imageRotators = [];

document.querySelectorAll('[data-image-rotator]').forEach((gallery) => {
  const images = [...gallery.querySelectorAll('img')];
  const toggle = gallery.querySelector('[data-rotation-toggle]');
  if (images.length < 2 || !toggle) return;

  let activeIndex = images.findIndex((image) => image.classList.contains('is-active'));
  if (activeIndex < 0) activeIndex = 0;

  let timer = null;
  let paused = motionPreference.matches;

  const renderState = () => {
    toggle.textContent = paused ? 'Retomar' : 'Pausar';
    toggle.setAttribute(
      'aria-label',
      paused ? 'Retomar rotação automática das imagens' : 'Pausar rotação automática das imagens',
    );
  };

  const rotate = () => {
    images[activeIndex].classList.remove('is-active');
    images[activeIndex].setAttribute('aria-hidden', 'true');
    activeIndex = (activeIndex + 1) % images.length;
    images[activeIndex].classList.add('is-active');
    images[activeIndex].removeAttribute('aria-hidden');
  };

  const stop = () => {
    if (timer === null) return;
    window.clearInterval(timer);
    timer = null;
  };

  const start = () => {
    if (timer !== null) return;
    timer = window.setInterval(rotate, 5000);
  };

  const pause = () => {
    paused = true;
    stop();
    renderState();
  };

  images.forEach((image, index) => {
    if (index === activeIndex) image.removeAttribute('aria-hidden');
    else image.setAttribute('aria-hidden', 'true');
  });
  toggle.hidden = false;
  toggle.addEventListener('click', () => {
    paused = !paused;
    if (paused) stop();
    else start();
    renderState();
  });
  gallery.addEventListener('focusin', pause);
  gallery.addEventListener('pointerenter', pause);

  const controller = { pause, start, stop, get paused() { return paused; } };
  imageRotators.push(controller);
  renderState();
  if (!paused) start();
});

motionPreference.addEventListener('change', (event) => {
  if (!event.matches) return;
  imageRotators.forEach((rotator) => rotator.pause());
});
