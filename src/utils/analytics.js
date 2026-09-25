const measurementId = "G-8M0HY1BXNB";

export function enableAnalytics() {
  if (window.gtag) return;

  window.dataLayer = window.dataLayer || [];
  window.gtag = (...args) => window.dataLayer.push(args);
  window.gtag("js", new Date());
  window.gtag("config", measurementId);

  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
  document.head.appendChild(script);
}

export function trackEvent(name, parameters = {}) {
  if (window.gtag) {
    window.gtag("event", name, parameters);
  }
}
