export function initializeFaq({ document, motionPreference }) {
  document.querySelectorAll('.faq details').forEach((details) => {
    const summary = details.querySelector('summary');
    const answer = details.querySelector('p');
    if (!summary || !answer) return;

    answer.style.overflow = 'hidden';
    answer.style.transition = motionPreference.matches ? 'none' : 'height 400ms ease';
    motionPreference.addEventListener('change', (event) => {
      answer.style.transition = event.matches ? 'none' : 'height 400ms ease';
      if (!event.matches || details.dataset.animating !== 'true') return;
      const closing = details.dataset.closing === 'true';
      details.open = !closing;
      answer.style.height = closing ? '0px' : 'auto';
      delete details.dataset.closing;
      delete details.dataset.animating;
    });
    if (!details.open) answer.style.height = '0px';

    summary.addEventListener('click', (event) => {
      event.preventDefault();
      if (details.dataset.animating === 'true') return;

      if (!details.open) {
        delete details.dataset.closing;
        details.open = true;
        answer.style.height = '0px';
        if (motionPreference.matches) {
          answer.style.height = 'auto';
          return;
        }
        void answer.offsetHeight;
        answer.style.height = `${answer.scrollHeight}px`;
        details.dataset.animating = 'true';
      } else {
        if (motionPreference.matches) {
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
}
