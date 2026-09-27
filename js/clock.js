/**
 * clock.js — Live clock, date display, and relative-time formatting
 * Dispatches 'kyt:tick' every minute so carousel.js can refresh the card.
 */

window.KYT = window.KYT || {};

window.KYT.clock = (() => {
  const timeEl     = document.getElementById('live-time');
  const dateEl     = document.getElementById('live-date');
  const configView = document.getElementById('config-view');

  // ── Relative time ─────────────────────────────────────────────────────────
  function getRelativeTimeString(targetDate) {
    const now     = new Date();
    const diffMs  = targetDate - now;
    const diffMin = Math.round(diffMs / 60_000);
    const absMin  = Math.abs(diffMin);

    if (absMin < 1) return 'Right now';

    const days  = Math.floor(absMin / 1440);
    const hours = Math.floor((absMin % 1440) / 60);
    const mins  = absMin % 60;

    let label = '';
    if (absMin < 60) {
      label = `${absMin} min`;
    } else if (absMin < 1440) {
      label = hours > 0 ? `${hours} hr` : '';
      if (mins > 0) label += ` ${mins} min`;
      label = label.trim();
    } else if (days < 14) {
      label = `${days} day${days > 1 ? 's' : ''}`;
      if (hours > 0) label += ` ${hours} hr`;
    } else {
      label = targetDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      return diffMs > 0 ? label : `${label} (past)`;
    }

    return diffMs > 0 ? `in ${label}` : `${label} ago`;
  }

  function formatTimeExact(date) {
    if (!(date instanceof Date) || isNaN(date)) return '—';
    const datePart = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const timePart = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    return `${datePart} · ${timePart}`;
  }

  // ── Clock tick ────────────────────────────────────────────────────────────
  function tick() {
    const now = new Date();
    timeEl.textContent = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    dateEl.textContent = now.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });

    if (now.getSeconds() === 0 && configView.classList.contains('hidden')) {
      document.dispatchEvent(new CustomEvent('kyt:tick'));
    }
  }

  function start() {
    tick();
    setInterval(tick, 1000);
  }

  return { start, getRelativeTimeString, formatTimeExact };
})();

