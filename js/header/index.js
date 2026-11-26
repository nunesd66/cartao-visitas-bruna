export function initializeHeader({ window, document, motionPreference }) {
  document.querySelectorAll('.brand[href="#inicio"]').forEach((brand) => {
    brand.addEventListener('click', (event) => {
      event.preventDefault();
      window.scrollTo({ top: 0, behavior: motionPreference.matches ? 'auto' : 'smooth' });
      revealSiteHeader();
    });
  });

  document.querySelectorAll('.mobile-nav').forEach((menu) => {
    const summary = menu.querySelector('summary');
    summary?.addEventListener('click', () => {
      window.requestAnimationFrame(() => {
        if (menu.open) menu.querySelector('nav a')?.focus();
      });
    });
    menu.addEventListener('click', (event) => {
      if (event.target instanceof window.Element && event.target.closest('a[href^="#"]')) {
        menu.open = false;
      }
    });
    menu.addEventListener('focusout', (event) => {
      if (menu.open && event.relatedTarget instanceof window.Node && !menu.contains(event.relatedTarget)) {
        menu.open = false;
      }
    });
    menu.addEventListener('keydown', (event) => {
      if (event.key !== 'Escape' || !menu.open) return;
      menu.open = false;
      summary?.focus();
    });
  });

  const siteHeader = document.querySelector('.site-header');
  const casesRealAnchor = document.querySelector('#casos-reais');
  const headerPin = document.querySelector('[data-header-pin]');
  let revealSiteHeader = () => {};

  if (siteHeader && casesRealAnchor) {
    const directionLockMs = 2000;
    let lastScrollY = window.scrollY;
    let lastTransitionAt = window.performance.now() - directionLockMs;
    let scrollFrame = 0;
    let pendingVisibility = null;
    let pendingTimer = null;
    let headerHidden = false;
    let headerPinned = false;

    const applyVisibility = (visible) => {
      if (!visible && siteHeader.contains(document.activeElement)) return;
      headerHidden = !visible;
      siteHeader.classList.toggle('is-hidden', headerHidden);
      siteHeader.inert = headerHidden;
      lastTransitionAt = window.performance.now();
    };

    revealSiteHeader = () => {
      pendingVisibility = null;
      window.clearTimeout(pendingTimer);
      pendingTimer = null;
      applyVisibility(true);
    };

    const requestVisibility = (visible) => {
      if (visible === !headerHidden) {
        pendingVisibility = null;
        window.clearTimeout(pendingTimer);
        pendingTimer = null;
        return;
      }

      const lockRemaining = directionLockMs - (window.performance.now() - lastTransitionAt);
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

    if (headerPin) headerPin.hidden = false;
    headerPin?.addEventListener('click', () => {
      headerPinned = !headerPinned;
      const label = headerPinned ? 'Desafixar cabeçalho' : 'Fixar cabeçalho';
      headerPin.setAttribute('data-pinned', String(headerPinned));
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
      lastTransitionAt = window.performance.now() - directionLockMs;
    });
  }

  return revealSiteHeader;
}
