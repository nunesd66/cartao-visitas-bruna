(() => {
  const measurementIdPattern = /^G-[A-Z0-9]{6,}$/;
  const deniedConsent = Object.freeze({
    analytics_storage: 'denied',
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
  });
  const grantedConsent = Object.freeze({
    ...deniedConsent,
    analytics_storage: 'granted',
  });
  const allowed = {
    locations: new Set([
      'header_desktop',
      'mobile_menu',
      'hero',
      'service_card',
      'final_cta',
      'footer',
      'floating',
      'contact_section',
      'testimonial_source',
      'review_request',
    ]),
    services: new Set([
      'micropigmentacao',
      'design_sobrancelhas',
      'design_tintura',
      'design_henna',
      'avaliacao_micropigmentacao',
    ]),
    channels: new Set(['whatsapp', 'instagram', 'google_maps', 'phone', 'google']),
    faqIds: new Set(['faq_01', 'faq_02', 'faq_03', 'faq_04', 'faq_05', 'faq_06']),
  };

  let consentGranted = false;
  let tagRequested = false;
  let tagFailed = false;
  let tagConfigured = false;
  let tagLoaded = false;
  let pendingScript = null;

  const readMeasurementId = () => {
    const meta = document.querySelector('meta[name="ga4-measurement-id"]');
    const value = meta?.content?.trim() || '';
    return measurementIdPattern.test(value) ? value : '';
  };

  const setGoogleCollectionDisabled = (disabled) => {
    const measurementId = readMeasurementId();
    if (measurementId) window[`ga-disable-${measurementId}`] = disabled;
  };

  const clearAnalyticsCookies = () => {
    let cookieNames = [];
    try {
      cookieNames = document.cookie
        .split(';')
        .map((cookie) => cookie.trim().split('=')[0])
        .filter((name) => /^_ga(?:_|$)|^_gid$|^_gat(?:_|$)|^_gac_/.test(name));
    } catch {
      return;
    }

    const pathname = window.location.pathname || '/';
    const directory = pathname.endsWith('/') ? pathname : pathname.slice(0, pathname.lastIndexOf('/') + 1) || '/';
    const paths = new Set(['/', directory]);
    const hostname = window.location.hostname;
    const domains = [null, ...(hostname ? [hostname, `.${hostname}`] : [])];

    cookieNames.forEach((name) => {
      paths.forEach((path) => {
        domains.forEach((domain) => {
          const domainAttribute = domain ? `; domain=${domain}` : '';
          try {
            document.cookie = `${name}=; Max-Age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=${path}${domainAttribute}; SameSite=Lax`;
          } catch {
            // Cookie deletion is best effort; collection is still disabled at the tag level.
          }
        });
      });
    });
  };

  const discardPendingTag = () => {
    if (!pendingScript) return;
    pendingScript.onload = null;
    pendingScript.onerror = null;
    pendingScript.remove?.();
    pendingScript = null;
    tagRequested = false;
    tagFailed = false;
    tagLoaded = false;
    tagConfigured = false;
    // A failed or aborted tag never processed its queued config/events.
    // Do not replay those commands if the visitor accepts again.
    if (Array.isArray(window.dataLayer)) window.dataLayer.length = 0;
  };

  const queueGoogleTag = () => {
    if (!Array.isArray(window.dataLayer)) window.dataLayer = [];
    if (typeof window.gtag !== 'function') {
      window.gtag = function gtag() {
        window.dataLayer.push(arguments);
      };
    }
  };

  const loadGoogleTag = () => {
    const measurementId = readMeasurementId();
    if (!consentGranted || !measurementId || tagRequested) return false;

    queueGoogleTag();
    if (!tagConfigured) {
      const pageLocation = `${window.location.origin}${window.location.pathname}`;
      let pageReferrer = '';
      try {
        if (document.referrer) pageReferrer = new URL(document.referrer).origin;
      } catch {
        pageReferrer = '';
      }

      window.gtag('consent', 'default', { ...deniedConsent });
      window.gtag('consent', 'update', { ...grantedConsent });
      window.gtag('js', new Date());
      window.gtag('config', measurementId, {
        send_page_view: false,
        page_location: pageLocation,
        ...(pageReferrer ? { page_referrer: pageReferrer } : {}),
        allow_google_signals: false,
        allow_ad_personalization_signals: false,
      });
      // The Analytics destination sends its initial page_view when the tag loads.
      tagConfigured = true;
    }

    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`;
    script.onload = () => {
      if (pendingScript !== script) return;
      tagLoaded = true;
      pendingScript = null;
    };
    script.onerror = () => {
      if (pendingScript !== script) return;
      discardPendingTag();
      tagFailed = true;
    };
    tagFailed = false;
    tagRequested = true;
    pendingScript = script;
    document.head.appendChild(script);
    return true;
  };

  const setConsent = (granted) => {
    if (granted !== true) {
      consentGranted = false;
      setGoogleCollectionDisabled(true);
      // Revoke before download completion: cancel script and queued commands.
      if (!tagLoaded) discardPendingTag();
      if (tagRequested && typeof window.gtag === 'function') {
        window.gtag('consent', 'update', { ...deniedConsent });
      }
      clearAnalyticsCookies();
      return false;
    }

    if (consentGranted && tagRequested) return true;
    consentGranted = true;
    setGoogleCollectionDisabled(false);
    if (tagRequested) {
      window.gtag('consent', 'update', { ...grantedConsent });
      return true;
    }

    return loadGoogleTag();
  };

  const isEnabled = () => consentGranted && tagRequested && !tagFailed;

  const normalizeEvent = (sourceName, values = {}) => {
    const source = values && typeof values === 'object' ? values : {};
    const sourceLocation = allowed.locations.has(source.cta_location) ? source.cta_location : '';
    const service = allowed.services.has(source.service_name) ? source.service_name : '';

    if (sourceName === 'whatsapp_booking_click') {
      if (!sourceLocation) return null;
      const parameters = { channel: 'whatsapp', cta_location: sourceLocation };
      if (service) parameters.service_name = service;
      return { name: 'contact_intent', parameters };
    }

    if (sourceName === 'contact_channel_click') {
      const channel = allowed.channels.has(source.channel) ? source.channel : '';
      if (!channel) return null;
      if (channel === 'whatsapp') {
        const location = sourceLocation || 'footer';
        const parameters = { channel, cta_location: location };
        if (service) parameters.service_name = service;
        return { name: 'contact_intent', parameters };
      }

      const location = sourceLocation || (channel === 'instagram' ? 'footer' : 'contact_section');
      return { name: 'contact_channel_click', parameters: { channel, cta_location: location } };
    }

    if (sourceName === 'testimonial_source_click') {
      const channel = source.channel === 'google' || source.channel === 'instagram' ? source.channel : '';
      if (!channel) return null;
      return {
        name: 'contact_channel_click',
        parameters: { channel, cta_location: 'testimonial_source' },
      };
    }

    if (sourceName === 'review_request_click' && source.channel === 'google') {
      return {
        name: 'contact_channel_click',
        parameters: { channel: 'google', cta_location: 'review_request' },
      };
    }

    if (sourceName === 'faq_open' && allowed.faqIds.has(source.faq_id)) {
      return { name: 'faq_open', parameters: { faq_id: source.faq_id } };
    }

    return null;
  };

  const track = (sourceName, values) => {
    if (!isEnabled() || typeof window.gtag !== 'function') return false;
    const event = normalizeEvent(sourceName, values);
    if (!event) return false;
    window.gtag('event', event.name, event.parameters);
    return true;
  };

  window.BrunaAnalytics = Object.freeze({ setConsent, isEnabled, track });
})();
