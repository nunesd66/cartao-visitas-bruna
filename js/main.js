document.addEventListener('click', (event) => {
  const target = event.target instanceof Element ? event.target : event.target.parentElement;
  const trigger = target?.closest('[data-analytics-event]');
  const analytics = window.BrunaAnalytics;
  if (!trigger || typeof analytics?.track !== 'function') return;

  const eventName = trigger.dataset.analyticsEvent;
  if (eventName === 'faq_open' && trigger.closest('details')?.open) return;

  const parameters = {};
  if (trigger.dataset.analyticsLocation) parameters.cta_location = trigger.dataset.analyticsLocation;
  if (trigger.dataset.analyticsService) parameters.service_name = trigger.dataset.analyticsService;
  if (trigger.dataset.analyticsChannel) parameters.channel = trigger.dataset.analyticsChannel;
  if (trigger.dataset.analyticsQuestion) parameters.faq_id = trigger.dataset.analyticsQuestion;

  analytics.track(eventName, parameters);
}, true);

const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
const reduceMotion = motionPreference.matches;

document.querySelectorAll('.brand[href="#inicio"]').forEach((brand) => {
  brand.addEventListener('click', (event) => {
    event.preventDefault();
    window.scrollTo({ top: 0, behavior: motionPreference.matches ? 'auto' : 'smooth' });
  });
});

const faqAnswers = document.querySelectorAll('.faq details');

document.querySelectorAll('.mobile-nav').forEach((menu) => {
  const summary = menu.querySelector('summary');
  const syncMenuState = () => {
    if (!summary) return;
    summary.setAttribute('aria-expanded', String(menu.open));
    summary.setAttribute(
      'aria-label',
      menu.open ? 'Fechar menu de navegação' : 'Abrir menu de navegação',
    );
  };

  menu.addEventListener('toggle', syncMenuState);
  summary?.addEventListener('click', () => {
    window.requestAnimationFrame(() => {
      syncMenuState();
      if (menu.open) menu.querySelector('nav a')?.focus();
    });
  });
  menu.addEventListener('click', (event) => {
    if (event.target instanceof Element && event.target.closest('a[href^="#"]')) {
      menu.open = false;
      syncMenuState();
    }
  });
  menu.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape' || !menu.open) return;
    menu.open = false;
    syncMenuState();
    summary?.focus();
  });
  syncMenuState();
});

const siteHeader = document.querySelector('.site-header');
const casesRealAnchor = document.querySelector('#casos-reais');
const headerPin = document.querySelector('[data-header-pin]');

if (siteHeader && casesRealAnchor) {
  const directionLockMs = 2000;
  let lastScrollY = window.scrollY;
  let lastTransitionAt = performance.now() - directionLockMs;
  let scrollFrame = 0;
  let pendingVisibility = null;
  let pendingTimer = null;
  let headerHidden = false;
  let headerPinned = false;

  const applyVisibility = (visible) => {
    headerHidden = !visible;
    siteHeader.classList.toggle('is-hidden', headerHidden);
    lastTransitionAt = performance.now();
  };

  const requestVisibility = (visible) => {
    if (visible === !headerHidden) {
      pendingVisibility = null;
      window.clearTimeout(pendingTimer);
      pendingTimer = null;
      return;
    }

    const lockRemaining = directionLockMs - (performance.now() - lastTransitionAt);
    if (lockRemaining <= 0) {
      pendingVisibility = null;
      window.clearTimeout(pendingTimer);
      pendingTimer = null;
      applyVisibility(visible);
      return;
    }

    if (pendingVisibility === visible && pendingTimer !== null) return;
    pendingVisibility = visible;
    window.clearTimeout(pendingTimer);
    pendingTimer = window.setTimeout(() => {
      const visibilityToApply = pendingVisibility;
      pendingVisibility = null;
      pendingTimer = null;
      if (visibilityToApply !== null && visibilityToApply !== !headerHidden) {
        applyVisibility(visibilityToApply);
      }
    }, lockRemaining);
  };

  const updateHeaderOnScroll = () => {
    scrollFrame = 0;
    const currentScrollY = window.scrollY;
    const scrollDirection = Math.sign(currentScrollY - lastScrollY);
    lastScrollY = currentScrollY;
    if (scrollDirection === 0) return;
    if (headerPinned) return;

    if (currentScrollY <= 16 || scrollDirection < 0) {
      requestVisibility(true);
      return;
    }

    const casesAreNearHeader = casesRealAnchor.getBoundingClientRect().top <= siteHeader.offsetHeight + 40;
    requestVisibility(!casesAreNearHeader);
  };

  window.addEventListener('scroll', () => {
    if (scrollFrame) return;
    scrollFrame = window.requestAnimationFrame(updateHeaderOnScroll);
  }, { passive: true });

  headerPin?.addEventListener('click', () => {
    headerPinned = !headerPinned;
    const label = headerPinned ? 'Desafixar cabeçalho' : 'Fixar cabeçalho';
    headerPin.setAttribute('aria-pressed', String(headerPinned));
    headerPin.setAttribute('aria-label', label);
    headerPin.setAttribute('title', label);
    if (headerPinned) {
      pendingVisibility = null;
      window.clearTimeout(pendingTimer);
      pendingTimer = null;
      applyVisibility(true);
      return;
    }

    lastScrollY = window.scrollY;
    lastTransitionAt = performance.now() - directionLockMs;
  });
}

const accessibilityHelp = document.querySelector('.accessibility-help');
const accessibilityTools = document.querySelector('.accessibility-tools');
const accessibilityToolsToggle = accessibilityTools?.querySelector(':scope > summary');
const siteFooter = document.querySelector('.site-footer');

if (accessibilityTools && siteFooter && 'IntersectionObserver' in window) {
  const positionToolsBeforeFooter = () => {
    if (!accessibilityTools.classList.contains('is-footer-visible')) return;
    const footerTop = siteFooter.getBoundingClientRect().top;
    const toggleHeight = accessibilityToolsToggle?.getBoundingClientRect().height || 48;
    const top = Math.max(8, Math.min(
      footerTop - toggleHeight - 4,
      window.innerHeight - toggleHeight - 84,
    ));
    accessibilityTools.style.setProperty('--accessibility-tools-top', `${top}px`);
  };

  const footerObserver = new IntersectionObserver(([entry]) => {
    accessibilityTools.classList.toggle('is-footer-visible', entry.isIntersecting);
    if (entry.isIntersecting) positionToolsBeforeFooter();
    else accessibilityTools.style.removeProperty('--accessibility-tools-top');
  });
  footerObserver.observe(siteFooter);

  let footerPositionFrame = 0;
  window.addEventListener('scroll', () => {
    if (footerPositionFrame || !accessibilityTools.classList.contains('is-footer-visible')) return;
    footerPositionFrame = window.requestAnimationFrame(() => {
      footerPositionFrame = 0;
      positionToolsBeforeFooter();
    });
  }, { passive: true });

  window.addEventListener('resize', positionToolsBeforeFooter);
}

accessibilityTools?.addEventListener('toggle', () => {
  accessibilityToolsToggle?.setAttribute('aria-expanded', String(accessibilityTools.open));
  if (!accessibilityTools.open && accessibilityHelp) accessibilityHelp.open = false;
});

accessibilityTools?.addEventListener('keydown', (event) => {
  if (event.key !== 'Escape' || !accessibilityTools.open) return;
  event.preventDefault();

  if (accessibilityHelp?.open) {
    accessibilityHelp.open = false;
    accessibilityHelp.querySelector('summary')?.focus();
    return;
  }

  accessibilityTools.open = false;
  accessibilityToolsToggle?.focus();
});

document.addEventListener('pointerdown', (event) => {
  if (accessibilityTools?.open && event.target instanceof Element
      && !accessibilityTools.contains(event.target) && !event.target.closest('[data-privacy-panel]')) {
    accessibilityTools.open = false;
  }
});

document.querySelectorAll('[data-page-scroll]').forEach((button) => {
  button.addEventListener('click', () => {
    const destination = button.dataset.pageScroll === 'bottom'
      ? document.documentElement.scrollHeight
      : 0;
    window.scrollTo({ top: destination, behavior: reduceMotion ? 'auto' : 'smooth' });
    if (destination === 0) siteHeader?.classList.remove('is-hidden');
    accessibilityTools.open = false;
    accessibilityToolsToggle?.focus();
  });
});

const accessibilityShortcutTargets = {
  Digit0: 'hero-title',
  Digit1: 'casos-reais',
  Digit2: 'about-eyebrow',
  Digit3: 'depoimentos',
  Digit4: 'faq',
  Digit5: 'contato',
};
const isTouchDevice = navigator.maxTouchPoints > 0
  || window.matchMedia('(hover: none) and (pointer: coarse)').matches;

document.addEventListener('keydown', (event) => {
  if (isTouchDevice) return;
  const target = event.target instanceof Element ? event.target : null;
  if (!target || target.closest('input, textarea, select, [contenteditable="true"]')) return;
  const windowsOrLinux = event.ctrlKey && event.altKey && event.shiftKey && !event.metaKey;
  const mac = event.metaKey && event.altKey && event.shiftKey && !event.ctrlKey;
  if ((!windowsOrLinux && !mac) || event.repeat) return;

  const targetId = accessibilityShortcutTargets[event.code];
  if (!targetId) return;

  const heading = document.getElementById(targetId);
  if (!heading) return;

  event.preventDefault();
  if (accessibilityHelp) accessibilityHelp.open = false;
  if (accessibilityTools) accessibilityTools.open = false;
  heading.tabIndex = -1;
  heading.focus({ preventScroll: true });
  heading.scrollIntoView({
    behavior: motionPreference.matches ? 'auto' : 'smooth',
    block: 'start',
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
  const rotationToggle = carousel.querySelector('[data-carousel-rotation]');
  const pagination = carousel.querySelector('[data-carousel-pagination]');

  if (!viewport || !track || !slides.length || !controls || !previous || !next || !status || !rotationToggle || !pagination) return;

  const dots = slides.map((slide, index) => {
    const dot = document.createElement('button');
    dot.className = 'testimonials__dot';
    dot.type = 'button';
    dot.setAttribute('aria-label', 'Ir para avaliação ' + (index + 1));
    dot.setAttribute('aria-controls', viewport.id);
    dot.setAttribute('aria-current', index === 0 ? 'true' : 'false');
    dot.addEventListener('click', () => moveTo(index));
    pagination.append(dot);
    return dot;
  });

  controls.hidden = false;
  let statusFrame = 0;
  let rotationTimer = null;
  let scrollAnimationFrame = 0;
  let rotationPaused = reduceMotion;

  const getActiveIndex = () => {
    const viewportRect = viewport.getBoundingClientRect();
    const viewportCenter = viewportRect.left + viewport.clientLeft + viewport.clientWidth / 2;
    let activeIndex = 0;
    let nearestDistance = Number.POSITIVE_INFINITY;

    slides.forEach((slide, index) => {
      const slideRect = slide.getBoundingClientRect();
      const slideCenter = slideRect.left + slideRect.width / 2;
      const distance = Math.abs(viewportCenter - slideCenter);

      if (distance < nearestDistance) {
        nearestDistance = distance;
        activeIndex = index;
      }
    });

    return activeIndex;
  };

  const getSlideTarget = (index) => {
    const viewportRect = viewport.getBoundingClientRect();
    const slideRect = slides[index].getBoundingClientRect();
    const viewportContentLeft = viewportRect.left + viewport.clientLeft;
    const slideContentLeft = viewport.scrollLeft + slideRect.left - viewportContentLeft;

    return slideContentLeft + (slideRect.width - viewport.clientWidth) / 2;
  };

  const updateControls = () => {
    const activeIndex = getActiveIndex();

    previous.disabled = activeIndex === 0;
    next.disabled = activeIndex === slides.length - 1;
    status.textContent = (activeIndex + 1) + ' de ' + slides.length;
    dots.forEach((dot, index) => {
      dot.setAttribute('aria-current', String(index === activeIndex));
    });
  };

  const updateRotationControl = () => {
    rotationToggle.setAttribute('aria-pressed', String(rotationPaused));
    rotationToggle.textContent = rotationPaused ? 'Retomar rotação' : 'Parar rotação';
    rotationToggle.hidden = motionPreference.matches;
  };

  const stopRotation = () => {
    if (rotationTimer === null) return;
    window.clearInterval(rotationTimer);
    rotationTimer = null;
  };

  const cancelCarouselAnimation = () => {
    if (!scrollAnimationFrame) return;
    window.cancelAnimationFrame(scrollAnimationFrame);
    scrollAnimationFrame = 0;
    viewport.classList.remove('is-animating');
  };

  const animateTo = (requestedLeft) => {
    const maxScroll = viewport.scrollWidth - viewport.clientWidth;
    const targetLeft = Math.max(0, Math.min(requestedLeft, maxScroll));
    cancelCarouselAnimation();

    if (motionPreference.matches) {
      viewport.scrollLeft = targetLeft;
      return;
    }

    const startLeft = viewport.scrollLeft;
    const distance = targetLeft - startLeft;
    if (Math.abs(distance) < 1) return;

    const duration = 1000;
    const startTime = performance.now();
    const easeInOutCubic = (progress) => (
      progress < 0.5
        ? 4 * progress * progress * progress
        : 1 - Math.pow(-2 * progress + 2, 3) / 2
    );

    viewport.classList.add('is-animating');
    const animateFrame = (time) => {
      const progress = Math.min((time - startTime) / duration, 1);
      viewport.scrollLeft = startLeft + distance * easeInOutCubic(progress);

      if (progress < 1) {
        scrollAnimationFrame = window.requestAnimationFrame(animateFrame);
        return;
      }

      scrollAnimationFrame = 0;
      viewport.scrollLeft = targetLeft;
      window.requestAnimationFrame(() => viewport.classList.remove('is-animating'));
    };

    scrollAnimationFrame = window.requestAnimationFrame(animateFrame);
  };

  const advance = () => {
    const activeIndex = getActiveIndex();
    const nextIndex = activeIndex === slides.length - 1 ? 0 : activeIndex + 1;
    status.setAttribute('aria-live', 'off');
    animateTo(getSlideTarget(nextIndex));
  };

  const startRotation = () => {
    if (rotationTimer !== null || rotationPaused || motionPreference.matches) return;
    rotationTimer = window.setInterval(advance, 2000);
  };

  const resetRotation = () => {
    stopRotation();
    startRotation();
  };

  const pauseRotationForInteraction = () => {
    if (rotationPaused) return;
    rotationPaused = true;
    stopRotation();
    updateRotationControl();
    status.setAttribute('aria-live', 'polite');
  };

  const move = (direction) => {
    const currentIndex = getActiveIndex();
    const nextIndex = Math.max(0, Math.min(currentIndex + direction, slides.length - 1));
    animateTo(getSlideTarget(nextIndex));
    resetRotation();
    status.setAttribute('aria-live', 'polite');
  };

  function moveTo(index) {
    animateTo(getSlideTarget(Math.max(0, Math.min(index, slides.length - 1))));
    resetRotation();
    status.setAttribute('aria-live', 'polite');
  }

  previous.addEventListener('click', () => move(-1));
  next.addEventListener('click', () => move(1));
  carousel.addEventListener('focusin', pauseRotationForInteraction);
  viewport.addEventListener('pointerdown', () => {
    cancelCarouselAnimation();
    pauseRotationForInteraction();
  });
  rotationToggle.addEventListener('click', () => {
    rotationPaused = !rotationPaused;
    if (rotationPaused) stopRotation();
    else startRotation();
    updateRotationControl();
    status.setAttribute('aria-live', 'polite');
  });

  viewport.addEventListener('scroll', () => {
    if (statusFrame) return;
    statusFrame = window.requestAnimationFrame(() => {
      statusFrame = 0;
      updateControls();
    });
  }, { passive: true });

  window.addEventListener('resize', updateControls);
  motionPreference.addEventListener('change', (event) => {
    if (event.matches) cancelCarouselAnimation();
    rotationPaused = event.matches;
    if (rotationPaused) stopRotation();
    else startRotation();
    updateRotationControl();
  });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      stopRotation();
      cancelCarouselAnimation();
    }
    else startRotation();
  });
  updateControls();
  updateRotationControl();
  startRotation();
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
  const questionField = form.querySelector('textarea');
  if (!questionField) return;

  const resizeQuestionField = () => {
    questionField.style.height = 'auto';
    questionField.style.height = `${questionField.scrollHeight}px`;
  };
  questionField.addEventListener('input', resizeQuestionField);

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const question = questionField.value.trim();
    if (!question) return;
    const message = `Ol\u00e1! Vim pelo site e enviei uma d\u00favida pela se\u00e7\u00e3o de d\u00favidas frequentes: ${question}`;
    const url = `https://wa.me/5534992797055?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  });

  form.hidden = false;
  resizeQuestionField();
});
const imageRotators = [];

document.querySelectorAll('[data-image-rotator]').forEach((gallery) => {
  const images = [...gallery.querySelectorAll('img')];
  if (images.length < 2) return;

  let activeIndex = images.findIndex((image) => image.classList.contains('is-active'));
  if (activeIndex < 0) activeIndex = 0;

  let timer = null;

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
    if (timer !== null || motionPreference.matches) return;
    timer = window.setInterval(rotate, 3000);
  };

  images.forEach((image, index) => {
    if (index === activeIndex) image.removeAttribute('aria-hidden');
    else image.setAttribute('aria-hidden', 'true');
  });

  const controller = { start, stop };
  imageRotators.push(controller);
  start();
});

motionPreference.addEventListener('change', (event) => {
  imageRotators.forEach((rotator) => (event.matches ? rotator.stop() : rotator.start()));
});
