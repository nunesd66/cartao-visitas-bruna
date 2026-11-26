export function initializeCarousel({ window, document, motionPreference }) {
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
    let rotationPaused = motionPreference.matches;
    let pausedBeforeReducedMotion = false;
    let inViewport = !('IntersectionObserver' in window);

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
      const activeElement = document.activeElement;
      const focusedArrow = activeElement === previous || activeElement === next ? activeElement : null;
      const wasEnabled = focusedArrow && !focusedArrow.disabled;

      previous.disabled = activeIndex === 0;
      next.disabled = activeIndex === slides.length - 1;
      status.textContent = (activeIndex + 1) + ' de ' + slides.length;
      dots.forEach((dot, index) => {
        dot.setAttribute('aria-current', String(index === activeIndex));
      });

      if (wasEnabled && focusedArrow.disabled) {
        const alternativeArrow = focusedArrow === next ? previous : next;
        if (!alternativeArrow.disabled) alternativeArrow.focus({ preventScroll: true });
      }
    };

    const updateRotationControl = () => {
      rotationToggle.setAttribute('data-paused', String(rotationPaused));
      rotationToggle.setAttribute('aria-label', rotationPaused ? 'Retomar rotação' : 'Parar rotação');
      if (motionPreference.matches && document.activeElement === rotationToggle) {
        const focusTarget = next.disabled ? previous : next;
        if (!focusTarget.disabled) focusTarget.focus();
      }
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
      const startTime = window.performance.now();
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
      if (rotationTimer !== null || rotationPaused || motionPreference.matches || document.hidden || !inViewport) return;
      rotationTimer = window.setInterval(advance, 2000);
    };

    const resetRotation = () => {
      if (motionPreference.matches) pausedBeforeReducedMotion = true;
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
    carousel.addEventListener('focusin', (event) => {
      // Let the rotation button apply the action shown before the user activated it.
      if (event.target !== rotationToggle) pauseRotationForInteraction();
    });
    let mouseDrag = null;
    let suppressDragClick = false;

    viewport.addEventListener('pointerdown', (event) => {
      cancelCarouselAnimation();
      pauseRotationForInteraction();
      suppressDragClick = false;

      if (event.pointerType !== 'mouse' || event.button !== 0
          || viewport.scrollWidth <= viewport.clientWidth) return;
      mouseDrag = {
        id: event.pointerId,
        startX: event.clientX,
        startLeft: viewport.scrollLeft,
        link: event.target.closest?.('a[href]'),
        moved: false,
      };
    });

    document.addEventListener('pointermove', (event) => {
      if (!mouseDrag || event.pointerId !== mouseDrag.id) return;
      const distance = event.clientX - mouseDrag.startX;
      if (!mouseDrag.moved) {
        if (Math.abs(distance) < 5) return;
        mouseDrag.moved = true;
        viewport.setPointerCapture(event.pointerId);
        viewport.classList.add('is-dragging');
      }
      viewport.scrollLeft = mouseDrag.startLeft - distance;
    });

    const finishMouseDrag = (event, openLink = false) => {
      if (!mouseDrag || event.pointerId !== mouseDrag.id) return;
      const target = mouseDrag.moved ? getSlideTarget(getActiveIndex()) : null;
      const link = mouseDrag.moved && openLink ? mouseDrag.link : null;
      suppressDragClick = mouseDrag.moved;
      mouseDrag = null;
      viewport.classList.remove('is-dragging');
      if (target !== null) animateTo(target);
      // Pointer capture retargets the click after a drag to the viewport.
      // Activate the original link once, only on a completed mouse release.
      link?.click();
    };

    document.addEventListener('pointerup', (event) => finishMouseDrag(event, true));
    document.addEventListener('pointercancel', (event) => finishMouseDrag(event));
    viewport.addEventListener('lostpointercapture', (event) => finishMouseDrag(event));
    viewport.addEventListener('dragstart', (event) => {
      if (mouseDrag) event.preventDefault();
    });
    viewport.addEventListener('click', (event) => {
      if (!suppressDragClick || event.detail === 0) return;
      suppressDragClick = false;
      event.preventDefault();
      event.stopImmediatePropagation();
    }, true);
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
      if (event.matches) {
        pausedBeforeReducedMotion = rotationPaused;
        rotationPaused = true;
      } else {
        rotationPaused = pausedBeforeReducedMotion;
      }
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
    if ('IntersectionObserver' in window) {
      const observer = new window.IntersectionObserver(([entry]) => {
        inViewport = Boolean(entry?.isIntersecting);
        if (inViewport) startRotation();
        else {
          stopRotation();
          cancelCarouselAnimation();
        }
      });
      observer.observe(carousel);
    }
    startRotation();
  });
}
