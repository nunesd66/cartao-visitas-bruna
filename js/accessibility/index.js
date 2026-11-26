export const accessibilityShortcutTargets = Object.freeze({
  Digit0: 'hero-title',
  Digit1: 'casos-reais',
  Digit2: 'about-eyebrow',
  Digit3: 'depoimentos',
  Digit4: 'faq',
  Digit5: 'contato',
});

export function initializeAccessibility({ window, document, motionPreference, revealSiteHeader }) {
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

    const footerObserver = new window.IntersectionObserver(([entry]) => {
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

  if (accessibilityTools) accessibilityTools.hidden = false;
  accessibilityTools?.addEventListener('toggle', () => {
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
    if (accessibilityTools?.open && event.target instanceof window.Element
        && !accessibilityTools.contains(event.target) && !event.target.closest('[data-privacy-panel]')) {
      accessibilityTools.open = false;
    }
  });

  document.querySelectorAll('[data-page-scroll]').forEach((button) => {
    button.addEventListener('click', () => {
      const destination = button.dataset.pageScroll === 'bottom'
        ? document.documentElement.scrollHeight
        : 0;
      window.scrollTo({ top: destination, behavior: motionPreference.matches ? 'auto' : 'smooth' });
      if (destination === 0) revealSiteHeader();
      accessibilityTools.open = false;
      accessibilityToolsToggle?.focus();
    });
  });

  const isTouchDevice = window.navigator.maxTouchPoints > 0
    || window.matchMedia('(hover: none) and (pointer: coarse)').matches;

  document.addEventListener('keydown', (event) => {
    if (isTouchDevice) return;
    const target = event.target instanceof window.Element ? event.target : null;
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
    if (event.code === 'Digit0') revealSiteHeader();
  });
}
