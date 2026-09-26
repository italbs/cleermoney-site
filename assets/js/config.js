/* Cleer Money launch configuration (single source of truth for every primary CTA).
 *
 * LAUNCHED 2026-09-14: LAUNCH_STATE is 'live' and states.live.href holds the real
 * App Store URL. That one value re-points and re-labels every primary CTA across
 * the whole site. The static HTML now carries the same live wording as its no-JS
 * fallback, so move the two together if the destination ever changes.
 *
 * Loaded before main.js on every page. main.js reads window.CLEER_LAUNCH and
 * applies it to any element tagged [data-cta], [data-launch-badge] or
 * [data-launch-note].
 */
(function () {
  'use strict';

  // ─────────────────────────────────────────────────────────────
  // 'waitlist' | 'live' — flipped to 'live' on launch day, 2026-09-14.
  var LAUNCH_STATE = 'live';
  // ─────────────────────────────────────────────────────────────

  var STATES = {
    waitlist: {
      // In-page waitlist anchor. Root-relative so it resolves from every page
      // (including subdirectories like /compare/ynab/ and /try/).
      href: '/#waitlist',
      labels: {
        hero: 'Join the waitlist',
        nav:  'Join waitlist',
        lite: 'Get started free',
        pro:  'Get Cleer Pro'
      },
      badge: 'Built for Australians · Open Banking (CDR)',
      note:  'Free to start · Pro from $7.99/month'
    },
    live: {
      // Canonical listing URL (slug form, so it resolves without a redirect hop).
      href: 'https://apps.apple.com/au/app/cleer-money-spending-tracker/id6761325697',
      labels: {
        hero: 'Download now',
        nav:  'Download',
        lite: 'Download free',
        pro:  'Start 7-day free trial'
      },
      badge: 'Available now on iPhone · Open Banking (CDR)',
      note:  'iPhone only · Free to start · Try Pro free for 7 days'
    }
  };

  var active = STATES[LAUNCH_STATE] || STATES.waitlist;

  window.CLEER_LAUNCH = {
    state:  LAUNCH_STATE,       // recorded as a property on the cta_click event
    href:   active.href,
    labels: active.labels,
    badge:  active.badge,
    note:   active.note
  };
})();
