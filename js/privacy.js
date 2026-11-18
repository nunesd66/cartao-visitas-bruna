(() => {
  const storageKey = 'bruna-analytics-consent-v1';
  const panel = document.querySelector('[data-privacy-panel]');
  const toggles = [...document.querySelectorAll('[data-privacy-toggle]')];
  const menuToggle = document.querySelector('.accessibility-tools__toggle');
  const acceptButton = panel?.querySelector('[data-privacy-choice="accepted"]');
  const rejectButton = panel?.querySelector('[data-privacy-choice="rejected"]');
  const analytics = window.BrunaAnalytics;

  if (!panel || !toggles.length || !acceptButton || !rejectButton) {
    analytics?.setConsent(false);
    return;
  }

  const readChoice = () => {
    try {
      const choice = window.localStorage.getItem(storageKey);
      return choice === 'accepted' || choice === 'rejected' ? choice : '';
    } catch {
      return '';
    }
  };

  const persistChoice = (choice) => {
    try {
      window.localStorage.setItem(storageKey, choice);
    } catch {
      // The explicit decision still applies for this page view if storage is unavailable.
    }
  };

  let openingToggle;

  const setPanelOpen = (open, moveFocus = false) => {
    panel.hidden = !open;
    toggles.forEach((toggle) => {
      toggle.hidden = open;
      toggle.setAttribute('aria-expanded', String(open));
    });
    if (open && moveFocus) acceptButton.focus();
    if (!open && moveFocus) {
      const focusTarget = [openingToggle, ...toggles, menuToggle]
        .find((control) => control?.checkVisibility?.() ?? Boolean(control?.getClientRects().length));
      focusTarget?.focus();
    }
  };

  const choose = (choice) => {
    persistChoice(choice);
    if (choice === 'accepted') analytics?.setConsent(true);
    else analytics?.setConsent(false);
    setPanelOpen(false, true);
  };

  acceptButton.addEventListener('click', () => choose('accepted'));
  rejectButton.addEventListener('click', () => choose('rejected'));
  toggles.forEach((toggle) => {
    toggle.addEventListener('click', () => {
      openingToggle = toggle;
      setPanelOpen(true, true);
    });
  });

  const restoreChoice = () => {
    const choice = readChoice();
    analytics?.setConsent(choice === 'accepted');
    const focused = document.activeElement;
    setPanelOpen(!choice, choice ? panel.contains(focused) : toggles.includes(focused));
  };

  window.addEventListener('storage', (event) => {
    if (event.key !== storageKey && event.key !== null) return;
    try {
      if (event.storageArea !== window.localStorage) return;
    } catch {
      return;
    }

    // Read the current choice in case another tab changed it again before this event arrived.
    restoreChoice();
  });

  restoreChoice();
})();
