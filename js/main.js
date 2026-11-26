import { initializeAccessibility } from './accessibility/index.js';
import { createAnalytics, initializeAnalyticsTracking } from './analytics.js';
import { initializeCarousel } from './carousel/index.js';
import { initializeFaq } from './faq/index.js';
import { initializeHeader } from './header/index.js';
import { initializeMap } from './map.js';
import { initializeParallax } from './parallax/index.js';
import { initializePrivacy } from './privacy.js';
import { initializeServicePhotos } from './services/index.js';
import { initializeWhatsAppForm } from './whatsapp/index.js';

export function initializeSite(window) {
  const { document } = window;
  const analytics = createAnalytics(window, document);
  window.BrunaAnalytics = analytics;
  initializePrivacy({ window, document, analytics });
  initializeMap(document);
  initializeServicePhotos({ window, document });
  initializeAnalyticsTracking({ window, document, analytics });

  const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
  const revealSiteHeader = initializeHeader({ window, document, motionPreference });
  initializeAccessibility({ window, document, motionPreference, revealSiteHeader });
  initializeParallax({ window, document, motionPreference });
  initializeCarousel({ window, document, motionPreference });
  initializeFaq({ document, motionPreference });
  initializeWhatsAppForm({ window, document });
}

if (typeof window !== 'undefined') initializeSite(window);
