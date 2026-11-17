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
    ]),
    channels: new Set(['whatsapp', 'instagram', 'google_maps', 'phone', 'google']),
    faqIds: new Set(['faq_01', 'faq_02', 'faq_03', 'faq_04', 'faq_05', 'faq_06']),
  };

  let consentGranted = false;
  let tagRequested = false;
  let tagFailed = false;

  const readMeasurementId = () => {
    const meta = document.querySelector('meta[name="ga4-measurement-id"]');
    const value = meta?.content?.trim() || '';
    return measurementIdPattern.test(value) ? value : '';
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
    window.gtag('event', 'page_view');

    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`;
    script.onerror = () => {
      tagFailed = true;
    };
    tagRequested = true;
    document.head.appendChild(script);
    return true;
  };

  const setConsent = (granted) => {
    if (granted !== true) {
      const wasGranted = consentGranted;
      consentGranted = false;
      if (wasGranted && tagRequested && typeof window.gtag === 'function') {
        window.gtag('consent', 'update', { ...deniedConsent });
      }
      return false;
    }

    if (consentGranted && tagRequested) return true;
    consentGranted = true;
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
