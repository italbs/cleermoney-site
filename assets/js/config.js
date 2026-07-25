/* Cleer Money launch configuration (single source of truth for every primary CTA).
 *
 * LAUNCH DAY: change LAUNCH_STATE from 'waitlist' to 'live' and paste the real
 * App Store URL into states.live.href below. That one edit re-points and
 * re-labels every primary CTA across the whole site. Nothing else to touch.
 *
 * Loaded before main.js on every page. main.js reads window.CLEER_LAUNCH and
 * applies it to any element tagged [data-cta], [data-launch-badge] or
 * [data-launch-note].
 */
(function () {
  'use strict';

  // ─────────────────────────────────────────────────────────────
  // Flip THIS one value on launch day: 'waitlist' | 'live'
  var LAUNCH_STATE = 'waitlist';
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
      // TODO(launch): replace with the real App Store listing URL before flipping
      // LAUNCH_STATE to 'live'. Leaving the placeholder here is harmless while the
      // site stays in 'waitlist' mode; nothing reads it until the flip.
      href: 'https://apps.apple.com/au/app/id0000000000',
      labels: {
        hero: 'Download now',
        nav:  'Download',
        lite: 'Download free',
        pro:  'Get Cleer Pro'
      },
      badge: 'Available now on iOS · Open Banking (CDR)',
      note:  'Free to start · Pro from $7.99/month'
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
