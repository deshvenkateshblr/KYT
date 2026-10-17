/**
 * js/ui-components.js — KYT Unified UI Component Module  (window.KYT.ui)
 * Zero-dependency — safe to load on ANY page before or after store.js.
 *
 * Single source of truth for:
 *   CITY_ALIASES   — canonical id normalisation map + resolveCity(idOrCode)
 *   INTENT_META    — spiritual | cultural | heritage | nature | leisure | adventure | culinary | mixed
 *   PACE_META      — short | standard | deep  (⚡ Short < 1 hr, etc.)
 *   MOBILITY_META  — easy | walk | trek  (♿ Easy Access, etc.)
 *   PHASE_META     — Arrival | Morning | Midday | Afternoon | Evening
 *   CATEGORY_META  — step-category icon & Tailwind colour map (plane, bed, utensils, …)
 *
 * Renderers:
 *   renderAttractionAccordion / renderCityCard / renderStepCard
 *   convertCuratedTripToVirtual / cityDetail.configure|open|close
 *
 * Guarantees:
 *   window.KYT.utils.escapeHTML is always present, even on pages that
 *   do not load js/store.js (trip_detail.html, visited.html, …)
 */

window.KYT = window.KYT || {};

// ── KYT.utils.escapeHTML — merge-safe bootstrap ───────────────────────────────
// Always adds escapeHTML to whatever KYT.utils already is, so the guarantee
// holds regardless of whether store.js loaded before or after this file.
(function () {
  const utils = window.KYT.utils || {};
  if (typeof utils.escapeHTML !== 'function') {
    utils.escapeHTML = function (str) {
      if (!str) return '';
      return String(str).replace(/[&<>'"]/g, function (tag) {
        return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag);
      });
    };
  }
  window.KYT.utils = utils;
})();

window.KYT.ui = (function () {
  'use strict';

  const esc = (s) => window.KYT.utils.escapeHTML(s);

  // ── 1. Shared Constants & Metadata ──────────────────────────────────────────
  const CITY_ALIASES = {
    bangalore: 'bengaluru',
    mangalore: 'udupi',
    mangaluru: 'udupi',
    hubballi: 'hubli'
  };

  const INTENT_META = {
    spiritual: { label: 'Spiritual', icon: 'landmark', color: 'purple', badgeBg: 'bg-purple-50', badgeBorder: 'border-purple-200', badgeText: 'text-purple-700', pillIcon: 'text-purple-500' },
    cultural: { label: 'Cultural', icon: 'compass', color: 'blue', badgeBg: 'bg-blue-50', badgeBorder: 'border-blue-200', badgeText: 'text-blue-700', pillIcon: 'text-blue-500' },
    heritage: { label: 'Heritage', icon: 'landmark', color: 'amber', badgeBg: 'bg-amber-50', badgeBorder: 'border-amber-200', badgeText: 'text-amber-700', pillIcon: 'text-amber-500' },
    nature: { label: 'Nature', icon: 'tree-pine', color: 'emerald', badgeBg: 'bg-emerald-50', badgeBorder: 'border-emerald-200', badgeText: 'text-emerald-700', pillIcon: 'text-emerald-500' },
    leisure: { label: 'Leisure', icon: 'coffee', color: 'orange', badgeBg: 'bg-orange-50', badgeBorder: 'border-orange-200', badgeText: 'text-orange-700', pillIcon: 'text-orange-500' },
    adventure: { label: 'Adventure', icon: 'mountain', color: 'emerald', badgeBg: 'bg-emerald-50', badgeBorder: 'border-emerald-200', badgeText: 'text-emerald-700', pillIcon: 'text-emerald-500' },
    culinary: { label: 'Culinary', icon: 'utensils', color: 'orange', badgeBg: 'bg-orange-50', badgeBorder: 'border-orange-200', badgeText: 'text-orange-700', pillIcon: 'text-orange-500' },
    mixed: { label: 'Mixed', icon: 'compass', color: 'indigo', badgeBg: 'bg-indigo-50', badgeBorder: 'border-indigo-200', badgeText: 'text-indigo-700', pillIcon: 'text-indigo-500' }
  };

  /**
   * PACE_META — standardised badges for visit pace / duration.
   * Shape: { label, emoji, badgeBg, badgeBorder, badgeText }
   */
  const PACE_META = {
    short:    { label: 'Short (< 1 hr)',     emoji: '⚡', badgeBg: 'bg-sky-50',    badgeBorder: 'border-sky-200',    badgeText: 'text-sky-700'    },
    standard: { label: 'Standard (1-2 hrs)', emoji: '🚶', badgeBg: 'bg-slate-50',  badgeBorder: 'border-slate-200',  badgeText: 'text-slate-700'  },
    deep:     { label: 'Deep Dive (2+ hrs)', emoji: '🔍', badgeBg: 'bg-indigo-50', badgeBorder: 'border-indigo-200', badgeText: 'text-indigo-700' }
  };

  /**
   * MOBILITY_META — standardised accessibility / effort badges.
   * Shape: { label, emoji, badgeBg, badgeBorder, badgeText }
   */
  const MOBILITY_META = {
    easy: { label: 'Easy Access',      emoji: '♿', badgeBg: 'bg-emerald-50', badgeBorder: 'border-emerald-200', badgeText: 'text-emerald-700' },
    walk: { label: 'Walking Required', emoji: '🚶', badgeBg: 'bg-amber-50',   badgeBorder: 'border-amber-200',   badgeText: 'text-amber-700'   },
    trek: { label: 'Trek / Strenuous', emoji: '🧗', badgeBg: 'bg-rose-50',    badgeBorder: 'border-rose-200',    badgeText: 'text-rose-700'    }
  };

  /**
   * PHASE_META — day-phase badge colours for step cards and the builder UI.
   * Shape: { label, style }  (style = space-joined Tailwind bg/text/border classes)
   */
  const PHASE_META = {
    Arrival:   { label: 'Arrival',   style: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    Morning:   { label: 'Morning',   style: 'bg-amber-50 text-amber-700 border-amber-200'       },
    Midday:    { label: 'Midday',    style: 'bg-sky-50 text-sky-700 border-sky-200'             },
    Afternoon: { label: 'Afternoon', style: 'bg-indigo-50 text-indigo-700 border-indigo-200'    },
    Evening:   { label: 'Evening',   style: 'bg-purple-50 text-purple-700 border-purple-200'    }
  };

  /**
   * CATEGORY_META — unified step-category icon & Tailwind colour map.
   * Keys = Lucide icon names used in the step-form radio group.
   * Shape: { icon, label, color, bg, border, text }
   */
  const CATEGORY_META = {
    'plane':        { icon: 'plane',        label: 'Travel',       color: 'blue',    bg: 'bg-blue-50',    border: 'border-blue-200',    text: 'text-blue-700'    },
    'bed':          { icon: 'bed',          label: 'Sleep',        color: 'indigo',  bg: 'bg-indigo-50',  border: 'border-indigo-200',  text: 'text-indigo-700'  },
    'hotel':        { icon: 'hotel',        label: 'Hotel',        color: 'indigo',  bg: 'bg-indigo-50',  border: 'border-indigo-200',  text: 'text-indigo-700'  },
    'utensils':     { icon: 'utensils',     label: 'Food',         color: 'orange',  bg: 'bg-orange-50',  border: 'border-orange-200',  text: 'text-orange-700'  },
    'landmark':     { icon: 'landmark',     label: 'Landmark',     color: 'purple',  bg: 'bg-purple-50',  border: 'border-purple-200',  text: 'text-purple-700'  },
    'waves':        { icon: 'waves',        label: 'Beach / Water',color: 'cyan',    bg: 'bg-cyan-50',    border: 'border-cyan-200',    text: 'text-cyan-700'    },
    'tree-pine':    { icon: 'tree-pine',    label: 'Nature',       color: 'emerald', bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700' },
    'ticket':       { icon: 'ticket',       label: 'Event',        color: 'pink',    bg: 'bg-pink-50',    border: 'border-pink-200',    text: 'text-pink-700'    },
    'shopping-bag': { icon: 'shopping-bag', label: 'Shopping',     color: 'rose',    bg: 'bg-rose-50',    border: 'border-rose-200',    text: 'text-rose-700'    },
    'camera':       { icon: 'camera',       label: 'Photo Spot',   color: 'violet',  bg: 'bg-violet-50',  border: 'border-violet-200',  text: 'text-violet-700'  },
    'coffee':       { icon: 'coffee',       label: 'Café / Break', color: 'amber',   bg: 'bg-amber-50',   border: 'border-amber-200',   text: 'text-amber-700'   },
    'car':          { icon: 'car',          label: 'Drive',        color: 'slate',   bg: 'bg-slate-50',   border: 'border-slate-200',   text: 'text-slate-700'   },
    'moon':         { icon: 'moon',         label: 'Night',        color: 'violet',  bg: 'bg-violet-50',  border: 'border-violet-200',  text: 'text-violet-700'  },
    'map-pin':      { icon: 'map-pin',      label: 'Place',        color: 'blue',    bg: 'bg-blue-50',    border: 'border-blue-200',    text: 'text-blue-700'    }
  };

  // ── 2. Lookup & Formatting Helpers ──────────────────────────────────────────

  /**
   * resolveCity(idOrCode)
   * Resolves by id, 3-letter code, or CITY_ALIASES key → city object | null.
   */
  function resolveCity(idOrCode) {
    if (!idOrCode || !window.KYT_CITIES) return null;
    const norm = String(idOrCode).trim().toLowerCase();
    const aliased = CITY_ALIASES[norm] || norm;
    return window.KYT_CITIES.find(c => c.id === aliased || c.code === norm || c.id === norm) || null;
  }

  function hourToPhase(hour) {
    if (hour == null) return 'Morning';
    if (hour < 12) return 'Morning';
    if (hour >= 12 && hour < 15) return 'Midday';
    if (hour >= 15 && hour < 18) return 'Afternoon';
    return 'Evening';
  }

  function formatSuggestedTime(hour, minute = 0, phase = null) {
    if (hour == null) return phase || 'Flexible';
    const p = phase || hourToPhase(hour);
    const hStr = String(hour).padStart(2, '0');
    const mStr = String(minute || 0).padStart(2, '0');
    return `${p} (~${hStr}:${mStr})`;
  }

  /** Return Tailwind class string for a phase name (falls back to slate). */
  function phaseStyle(phase) {
    return (PHASE_META[phase] && PHASE_META[phase].style) || 'bg-slate-100 text-slate-600 border-slate-200';
  }

  /** Render a single PACE_META badge span. */
  function renderPaceBadge(paceKey) {
    const m = PACE_META[paceKey];
    if (!m) return '';
    return `<span class="inline-flex items-center gap-1 ${m.badgeBg} border ${m.badgeBorder} ${m.badgeText} text-[10px] font-semibold px-2.5 py-0.5 rounded-md">${m.emoji} ${esc(m.label)}</span>`;
  }

  /** Render a MOBILITY_META badge span (falls back to plain text). */
  function renderMobilityBadge(mobilityKey) {
    const m = MOBILITY_META[mobilityKey];
    if (!m) return `<span class="text-xs text-slate-500 font-medium">${esc(mobilityKey || '♿ Easy Access')}</span>`;
    return `<span class="inline-flex items-center gap-1 ${m.badgeBg} border ${m.badgeBorder} ${m.badgeText} text-[10px] font-semibold px-2.5 py-0.5 rounded-md">${m.emoji} ${esc(m.label)}</span>`;
  }

  /** Return the CATEGORY_META entry for a Lucide icon name (fallback: map-pin). */
  function categoryMeta(iconName) {
    return CATEGORY_META[iconName] || CATEGORY_META['map-pin'];
  }

  // ── 3. Attraction Accordion Renderer ────────────────────────────────────────
  function renderAttractionAccordion(beat, cityName = '') {
    const intents = (beat.intent || []).map(intent => {
      const meta = INTENT_META[intent] || { icon: 'star', badgeBg: 'bg-slate-50', badgeBorder: 'border-slate-200', badgeText: 'text-slate-700' };
      const label = intent.charAt(0).toUpperCase() + intent.slice(1);
      return `<span class="inline-flex items-center gap-1 ${meta.badgeBg} border ${meta.badgeBorder} ${meta.badgeText} text-[10px] font-semibold px-2.5 py-0.5 rounded-md">
                <i data-lucide="${meta.icon}" class="w-3 h-3"></i> ${esc(label)}
              </span>`;
    }).join('');

    const paces = (beat.pace || ['standard']).map(pace => renderPaceBadge(pace)).join('');

    const mobilityBadge = renderMobilityBadge(beat.mobility);
    const formattedHour = beat.hour != null ? `${String(beat.hour).padStart(2, '0')}:00` : 'Flexible';
    const mapsUrl = beat.mapsUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent((beat.title || '') + ' ' + cityName)}`;

    return `
      <details class="group bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mb-3">
        <summary class="flex items-center justify-between p-3.5 cursor-pointer list-none hover:bg-slate-50 transition-colors [&::-webkit-details-marker]:hidden">
          <div class="flex items-center gap-3 min-w-0">
            <div class="bg-blue-50 p-2 rounded-lg text-blue-600 shrink-0">
              <i data-lucide="${esc(beat.icon || 'map-pin')}" class="w-4 h-4"></i>
            </div>
            <h4 class="font-bold text-slate-800 text-sm truncate m-0">${esc(beat.title)}</h4>
          </div>
          <div class="text-slate-400 group-open:rotate-180 transition-transform shrink-0 ml-2">
            <i data-lucide="chevron-down" class="w-4 h-4"></i>
          </div>
        </summary>
        
        <div class="p-4 pt-2 border-t border-slate-100 bg-slate-50/50 space-y-3">
          <div class="grid grid-cols-2 gap-3 text-xs">
            <div>
              <p class="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Location</p>
              <p class="text-slate-700 font-medium truncate mt-0.5">${esc(beat.where || cityName || 'Various')}</p>
            </div>
            <div>
              <p class="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Suggested Time</p>
              <p class="text-slate-700 font-medium mt-0.5">${esc(formattedHour)}</p>
            </div>
          </div>

          ${(intents || paces) ? `
            <div class="flex flex-wrap gap-1.5 pt-1">
              ${intents}${paces}
            </div>
          ` : ''}

          <div class="flex items-center justify-between pt-2 border-t border-slate-100">
            ${mobilityBadge}
            <a href="${esc(mapsUrl)}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-bold hover:underline">
              <i data-lucide="navigation" class="w-3 h-3"></i> Google Maps
            </a>
          </div>

          ${beat.notes ? `
            <div class="pt-2 border-t border-slate-100 text-xs text-slate-600 leading-relaxed">
              ${esc(beat.notes)}
            </div>
          ` : ''}
        </div>
      </details>
    `;
  }

  // ── 4. Unified City Card Renderer ───────────────────────────────────────────
  function renderCityCard(city, options = {}) {
    if (!city) return '';
    const variant = options.variant || 'summary';

    if (variant === 'summary') {
      let beatsHtml = '';
      if (city.beats && city.beats.length > 0) {
        beatsHtml = '<div class="mt-4 space-y-2">';
        city.beats.forEach(beat => {
          beatsHtml += `
            <div class="flex items-start gap-2 bg-slate-50 p-2 rounded-lg border border-slate-100">
              <i data-lucide="${esc(beat.icon || 'map-pin')}" class="w-4 h-4 text-slate-400 shrink-0 mt-0.5"></i>
              <div>
                <h5 class="text-xs font-bold text-slate-700">${esc(beat.title)}</h5>
                ${beat.where ? `<p class="text-[10px] text-slate-500">${esc(beat.where)}</p>` : ''}
              </div>
            </div>
          `;
        });
        beatsHtml += '</div>';
      }

      return `
        <div class="bg-white rounded-xl border border-slate-200 hover:border-blue-400 p-4 shadow-sm hover:shadow-md transition-all flex flex-col h-full cursor-pointer group" data-city-id="${esc(city.id)}">
          <div class="flex items-start justify-between gap-3">
            <div class="flex items-start gap-3">
              <div class="p-2 bg-blue-50 text-blue-500 rounded-lg shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <i data-lucide="${esc(city.icon || 'map-pin')}" class="w-6 h-6"></i>
              </div>
              <div>
                <h4 class="text-lg font-bold text-slate-800 group-hover:text-blue-600 transition-colors">${esc(city.name)}</h4>
                <p class="text-xs text-slate-500 mt-1 line-clamp-3">${esc(city.notes || 'A beautiful destination to explore.')}</p>
              </div>
            </div>
            <div class="text-slate-300 group-hover:text-blue-500 group-hover:translate-x-0.5 transition-all shrink-0 p-1">
              <i data-lucide="chevron-right" class="w-5 h-5"></i>
            </div>
          </div>
          <div class="flex-1">
            ${beatsHtml}
          </div>
          <div class="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-blue-600 font-semibold group-hover:text-blue-700">
            <span>View city details & videos</span>
            <span class="flex items-center gap-1">Explore <i data-lucide="arrow-right" class="w-3.5 h-3.5"></i></span>
          </div>
        </div>
      `;
    }

    if (variant === 'library') {
      const isAdded = Boolean(options.isAdded);
      const beats = city.beats || [];
      const beatCount = beats.length;

      const attractionPills = beats.slice(0, 4).map((b, idx) => {
        const primaryIntent = (b.intent || ['cultural'])[0];
        const col = (INTENT_META[primaryIntent] && INTENT_META[primaryIntent].pillIcon) || 'text-slate-500';
        return `<button class="vt-attraction-pill inline-flex items-center gap-1 bg-slate-50 border border-slate-200 text-slate-700 text-[10px] font-semibold px-2 py-1 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors cursor-pointer" data-city-id="${esc(city.id)}" data-attraction-index="${idx}" title="${esc(b.notes || b.title)}">
                  <i data-lucide="${esc(b.icon || 'map-pin')}" class="w-3 h-3 ${col} shrink-0"></i>${esc(b.title)}
                </button>`;
      }).join('');
      const moreCount = beatCount > 4 ? `<span class="text-[10px] text-slate-400 font-bold px-1">+${beatCount - 4} more</span>` : '';

      return `
        <article class="bg-white rounded-2xl shadow-sm border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all" data-city-id="${esc(city.id)}">
          <div class="p-4">
            <div class="flex justify-between items-start gap-3">
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2 mb-1 flex-wrap">
                  <h4 class="font-black text-slate-800 text-base">${esc(city.name)}</h4>
                  ${city.aliases && city.aliases.length ? `<span class="text-xs font-medium text-slate-400">(${esc(city.aliases.join(', '))})</span>` : ''}
                  <span class="text-[9px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full shrink-0">${beatCount} attraction${beatCount !== 1 ? 's' : ''}</span>
                </div>
                <p class="text-xs text-slate-500 leading-relaxed line-clamp-2">${esc(city.notes || 'Explore this destination')}</p>
              </div>
              <div class="shrink-0 flex items-center gap-2">
                ${city.lat && city.lng ? `<a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(city.name + ', India')}" target="_blank" rel="noopener noreferrer" class="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="View on Google Maps" onclick="event.stopPropagation()">
                  <i data-lucide="map" class="w-4 h-4"></i>
                </a>` : ''}
                ${isAdded ?
          `<button class="bg-emerald-100 text-emerald-700 font-bold px-4 py-2 rounded-xl text-xs shadow-sm flex items-center gap-1" disabled>
                    <i data-lucide="check" class="w-3 h-3"></i> Added
                  </button>` :
          `<button class="btn-add-city bg-blue-600 text-white font-bold px-4 py-2 rounded-xl text-xs hover:bg-blue-700 active:scale-95 transition-all shadow-sm" data-id="${esc(city.id)}">
                    Add +
                  </button>`
        }
              </div>
            </div>
            ${beatCount > 0 ? `<div class="mt-3 flex flex-wrap gap-1.5 vt-attraction-list">${attractionPills}${moreCount}</div>` : ''}
          </div>

          <div class="vt-attraction-detail hidden border-t border-slate-100 p-4 space-y-4 bg-slate-50">
            <button class="ml-auto text-slate-400 hover:text-slate-600 transition-colors" onclick="event.stopPropagation(); this.closest('.vt-attraction-detail').classList.add('hidden');">
              <i data-lucide="x" class="w-5 h-5"></i>
            </button>
            <div>
              <h5 class="text-lg font-extrabold text-slate-800 vt-detail-title">Attraction</h5>
            </div>
            <div>
              <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Location</p>
              <div class="flex items-start gap-2">
                <i data-lucide="map-pin" class="w-4 h-4 text-slate-400 mt-0.5 shrink-0"></i>
                <p class="text-sm font-bold text-slate-700 vt-detail-where">Location TBD</p>
              </div>
            </div>
            <div>
              <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Suggested Time</p>
              <div class="flex items-start gap-2">
                <i data-lucide="clock" class="w-4 h-4 text-slate-400 mt-0.5 shrink-0"></i>
                <p class="text-sm font-bold text-slate-700 vt-detail-time">09:00</p>
              </div>
            </div>
            <div>
              <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Travel Style</p>
              <div class="flex flex-wrap gap-1.5 vt-detail-intent"></div>
            </div>
            <div>
              <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Travel Pace</p>
              <div class="flex flex-wrap gap-1.5 vt-detail-pace"></div>
            </div>
            <div>
              <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Accessibility</p>
              <p class="text-sm font-bold text-slate-700 capitalize vt-detail-mobility">Easy</p>
            </div>
            <div class="vt-detail-dietary hidden">
              <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Dietary Options</p>
              <div class="flex flex-wrap gap-1.5 vt-detail-diet"></div>
            </div>
            <div class="pt-2 border-t border-slate-200">
              <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">About This Attraction</p>
              <p class="text-sm leading-relaxed text-slate-600 font-medium vt-detail-notes">Explore this attraction and soak in the experience.</p>
            </div>
            <button class="w-full py-2 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold rounded-lg text-sm transition-all" onclick="event.stopPropagation(); this.closest('.vt-attraction-detail').classList.add('hidden');">
              Got It
            </button>
          </div>
        </article>
      `;
    }

    if (variant === 'nearby') {
      const dist = options.distance;
      const mode = options.mode || 'explore'; // 'add' | 'explore'
      const isAdded = Boolean(options.isAdded);

      let btnHtml = '';
      if (mode === 'add') {
        btnHtml = isAdded
          ? `<button type="button" class="w-full mt-2 py-1.5 bg-emerald-100 text-emerald-700 rounded-lg text-[10px] font-bold" disabled>Added</button>`
          : `<button type="button" class="btn-nearby-add w-full mt-2 py-1.5 bg-slate-100 text-slate-700 hover:bg-blue-600 hover:text-white rounded-lg text-[10px] font-bold transition-colors" data-nearby-add="${esc(city.id)}">Add +</button>`;
      } else {
        btnHtml = `
          <button type="button" class="mt-2 w-full py-1 bg-slate-100 hover:bg-blue-600 hover:text-white text-slate-700 text-[10px] font-bold rounded-lg transition-colors flex items-center justify-center gap-1">
            <span>Explore</span> <i data-lucide="arrow-right" class="w-3 h-3"></i>
          </button>
        `;
      }

      return `
        <div class="bg-white rounded-xl border border-slate-200 shadow-sm p-3 cursor-pointer hover:border-blue-400 transition-all flex flex-col h-full" data-nearby-id="${esc(city.id)}">
          <h4 class="font-black text-slate-800 text-xs truncate">${esc(city.name)}</h4>
          ${dist != null ? `<p class="text-[10px] text-blue-600 font-semibold mb-1.5">${esc(dist)} km away</p>` : ''}
          <p class="text-[10px] text-slate-500 leading-tight line-clamp-2 mb-2 flex-1">${esc(city.notes || 'Explore this nearby destination.')}</p>
          <div class="mt-auto">
            ${btnHtml}
          </div>
        </div>
      `;
    }

    if (variant === 'passport') {
      const bgStampHTML = city.visited ? `
        <div class="absolute inset-0 m-auto w-40 h-40 ${city.color} opacity-30 rotate-[-15deg] group-hover:rotate-[-5deg] group-hover:scale-110 transition-transform duration-700 origin-center pointer-events-none z-0">
          <svg viewBox="0 0 100 100" class="w-full h-full drop-shadow-md">
            <path id="curve-${esc(city.id)}" d="M 50, 50 m -35, 0 a 35,35 0 1,1 70,0 a 35,35 0 1,1 -70,0" fill="transparent" />
            <text font-size="10.5" font-weight="900" fill="currentColor" letter-spacing="3.5">
              <textPath href="#curve-${esc(city.id)}" startOffset="0%">BEEN THERE DONE THAT • </textPath>
            </text>
            <circle cx="50" cy="50" r="24" fill="none" stroke="currentColor" stroke-width="2" opacity="0.4"/>
            <circle cx="50" cy="50" r="46" fill="none" stroke="currentColor" stroke-width="2.5" stroke-dasharray="4 2" opacity="0.8"/>
          </svg>
        </div>
      ` : '';

      const topRightHTML = city.visited ? '' : `
        <div class="w-10 h-10 flex items-center justify-center opacity-30 relative z-10">
          <i data-lucide="lock" class="w-5 h-5 text-slate-400"></i>
        </div>
      `;

      const footerActionHTML = city.visited ? `
        <button onclick="unmarkVisited('${esc(city.id)}')" class="text-[11px] font-bold ${city.actionColor} hover:text-slate-500 flex items-center gap-1 transition-colors relative z-10">
          <i data-lucide="rotate-ccw" class="w-3.5 h-3.5"></i> Undo Visit
        </button>
      ` : `
        <button onclick="markVisited('${esc(city.id)}')" class="text-[11px] font-bold text-blue-600 flex items-center gap-1 group-hover:translate-x-1 transition-transform bg-blue-50 px-2 py-1 rounded border border-blue-100 relative z-10">
          Mark Visited <i data-lucide="check-circle" class="w-3.5 h-3.5"></i>
        </button>
      `;

      const dateDisplay = city.visited
        ? `<input type="date" value="${esc(city.date)}" onchange="updateDate('${esc(city.id)}', this.value)" class="bg-transparent text-[10px] font-semibold text-slate-700 p-0 border-none focus:ring-0 cursor-pointer w-auto mt-0.5">`
        : `<span class="text-[10px] font-semibold text-slate-400 mt-0.5">${esc(city.date)}</span>`;

      return `
        <div class="bg-white/90 backdrop-blur-sm rounded-[16px] p-5 shadow-sm border border-slate-200 hover:border-slate-300 transition-all flex flex-col relative group overflow-hidden ${city.visited ? '' : 'grayscale-[0.5]'}">
          ${bgStampHTML}
          <div class="flex justify-between items-start mb-4 relative z-10">
            <div class="w-12 h-12 rounded-[12px] ${city.bg} flex items-center justify-center ${city.color} border ${city.border} shadow-sm bg-white">
              <i data-lucide="${esc(city.icon)}" class="w-6 h-6"></i>
            </div>
            ${topRightHTML}
          </div>
          <h3 class="text-base font-bold text-slate-800 tracking-tight relative z-10 drop-shadow-sm">${esc(city.name)}</h3>
          <p class="text-xs text-slate-600 font-medium mt-1 mb-5 flex-1 leading-relaxed relative z-10">${esc(city.desc)}</p>
          <div class="flex items-center justify-between mt-auto relative z-10 pt-2 border-t border-slate-100/50">
            <div class="flex flex-col">
              <span class="text-[8px] font-bold text-slate-400 uppercase tracking-widest">${city.visited ? 'Unlocked' : 'Status'}</span>
              ${dateDisplay}
            </div>
            ${footerActionHTML}
          </div>
        </div>
      `;
    }

    return '';
  }

  // ── 5. Unified Step Card Renderer ───────────────────────────────────────────
  function renderStepCard(step, options = {}) {
    if (!step) return '';
    const variant = options.variant || 'builder';

    if (variant === 'builder') {
      const mapsLink = step.mapsUrl
        ? `<a href="${esc(step.mapsUrl)}" target="_blank" rel="noopener" class="inline-flex items-center gap-0.5 text-[9px] font-bold text-blue-500 hover:text-blue-700 mt-1"><i data-lucide="map-pin" class="w-2.5 h-2.5"></i> Map</a>`
        : '';
      const notesText = step.notes
        ? `<p class="text-[11px] text-slate-500 leading-relaxed mt-1">${esc(step.notes)}</p>`
        : '';

      const verifyTags = Array.isArray(step.verify) && step.verify.length > 0
        ? `<div class="flex flex-wrap gap-1 mt-1.5">${step.verify.map(v => `
            <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-bold">
              <i data-lucide="alert-circle" class="w-2.5 h-2.5 text-amber-600"></i> ${esc(v)}
            </span>`).join('')}</div>`
        : '';

      const phase = step.phase || (step.hour != null ? hourToPhase(step.hour) : '');
      const pStyle = phaseStyle(phase);
      const phaseBadge = phase ? `<span class="text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md border ${pStyle}">${esc(phase)}</span>` : '';
      const suggestedTime = step.suggestedTime || (step.hour != null ? formatSuggestedTime(step.hour, step.minute, phase) : '');
      const suggestiveText = (suggestedTime && suggestedTime !== phase)
        ? `<span class="text-[10px] text-slate-400 font-medium">· ${esc(suggestedTime)}</span>`
        : '';

      return `
        <div class="relative flex items-start gap-3 p-3.5 bg-white rounded-xl border border-slate-100 shadow-sm mt-2 group hover:border-slate-200 transition-colors">
          <div class="p-2 bg-blue-50 text-blue-600 rounded-lg shrink-0 mt-0.5">
            <i data-lucide="${esc(step.icon || 'map-pin')}" class="w-4 h-4"></i>
          </div>
          <div class="flex-1 min-w-0 pr-8">
            <div class="flex items-center gap-1.5 flex-wrap mb-1">
              ${phaseBadge}
              ${suggestiveText}
            </div>
            <p class="text-sm font-bold text-slate-800 leading-tight">${esc(step.title)}</p>
            ${notesText}
            ${verifyTags}
            ${mapsLink}
          </div>
          <button type="button" class="absolute right-2 top-2.5 p-1.5 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all" onclick="deleteVirtualTripStep('${esc(step.id)}')" title="Delete step">
            <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
          </button>
        </div>
      `;
    }

    if (variant === 'curated-preview') {
      const timeStr = `${String(step.hour != null ? step.hour : 9).padStart(2, '0')}:${String(step.minute || 0).padStart(2, '0')}`;
      const verifyTags = (step.verify || []).map(v => `
        <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-bold mt-1.5">
          <i data-lucide="alert-circle" class="w-2.5 h-2.5 text-amber-600"></i> ${esc(v)}
        </span>
      `).join('');

      const isHotel = /hotel|check[- ]?in|stay|lodge/i.test(step.title) || step.icon === 'hotel' || step.icon === 'bed';
      const isTravel = /options|train to|flight to|bus to|drive to|return to|journey/i.test(step.title) || ['plane', 'train-front', 'bus', 'car'].includes(step.icon);

      let actionBadgeHtml = '';
      if (step.mapsUrl) {
        actionBadgeHtml = `
          <a href="${esc(step.mapsUrl)}" target="_blank" rel="noopener" class="inline-flex items-center gap-1 text-[10px] font-bold text-blue-600 hover:text-blue-800 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100 mt-1.5 transition-colors">
            <i data-lucide="map-pin" class="w-3 h-3 text-blue-500"></i> View on Google Maps
          </a>
        `;
      } else if (isHotel) {
        actionBadgeHtml = `
          <span class="inline-flex items-center gap-1.5 text-[10px] font-bold text-amber-800 bg-amber-50/80 border border-dashed border-amber-300 rounded-md px-2 py-0.5 mt-1.5">
            <i data-lucide="bed" class="w-3 h-3 text-amber-600"></i> Stay Placeholder (Add hotel link in Virtual Trips)
          </span>
        `;
      } else if (isTravel) {
        actionBadgeHtml = `
          <span class="inline-flex items-center gap-1.5 text-[10px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-md px-2 py-0.5 mt-1.5">
            <i data-lucide="shuffle" class="w-3 h-3 text-indigo-500"></i> Multi-Mode Travel Options
          </span>
        `;
      }

      return `
        <div class="relative pl-7 pb-5 border-l-2 border-slate-100 last:border-transparent last:pb-0">
          <div class="absolute -left-2.5 top-0 w-5 h-5 rounded-full bg-blue-50 border-2 border-blue-500 flex items-center justify-center">
            <i data-lucide="${esc(step.icon || 'map-pin')}" class="w-2.5 h-2.5 text-blue-600"></i>
          </div>
          <div class="flex items-baseline justify-between gap-2">
            <span class="text-xs font-black text-slate-800">${esc(step.title)}</span>
            <span class="text-[11px] font-bold text-slate-400 tabular-nums">${esc(timeStr)}</span>
          </div>
          <div class="text-[11px] font-semibold text-slate-500 mt-0.5 flex items-center gap-1">
            <span>${esc(step.where || 'Location')}</span>
            ${step.durationMin ? `<span class="opacity-40">•</span><span>~${esc(step.durationMin)} mins</span>` : ''}
          </div>
          ${step.notes ? `<p class="text-xs text-slate-600 mt-1 leading-relaxed">${esc(step.notes)}</p>` : ''}
          ${verifyTags ? `<div class="flex flex-wrap gap-1">${verifyTags}</div>` : ''}
          ${actionBadgeHtml ? `<div>${actionBadgeHtml}</div>` : ''}
        </div>
      `;
    }

    if (variant === 'config') {
      const index = options.index || 0;
      const total = options.total || 1;
      const timeFormatted = options.timeFormatted || '';

      return `
        <div class="config-step-row flex items-center gap-1.5 sm:gap-3 p-3 sm:p-4 bg-white rounded-2xl border border-slate-100 shadow-sm transition-all hover:border-slate-200" draggable="true" data-index="${index}">
          <span class="drag-handle p-1 sm:p-1.5 text-slate-300 hover:text-slate-500 cursor-grab active:cursor-grabbing shrink-0" title="Drag to reorder">
            <i data-lucide="grip-vertical" class="w-4 h-4"></i>
          </span>
          <div class="p-2 sm:p-2.5 bg-slate-50 text-kyt-subtext rounded-xl shrink-0 hidden sm:block">
            <i data-lucide="${esc(step.icon || 'map-pin')}" class="w-4 h-4 sm:w-5 sm:h-5"></i>
          </div>
          <div class="flex-1 overflow-hidden min-w-0">
            <p class="text-[14px] sm:text-[15px] font-bold text-kyt-text truncate">${esc(step.title)}</p>
            <div class="flex items-center gap-1.5 mt-0.5 min-w-0">
              <span class="text-[11px] sm:text-[12px] font-semibold text-kyt-subtext whitespace-nowrap">${esc(timeFormatted)}</span>
              <span class="w-1 h-1 bg-slate-300 rounded-full shrink-0"></span>
              <span class="text-[11px] sm:text-[12px] text-slate-500 truncate">${esc(step.where || '—')}</span>
            </div>
          </div>
          <div class="flex items-center shrink-0">
            <div class="flex flex-col gap-0.5">
              <button class="p-1 text-slate-300 hover:text-kyt-accent transition-colors ${index === 0 ? 'opacity-0 pointer-events-none' : ''}" onclick="KYT.config.moveStep(${index}, -1)" title="Move up">
                <i data-lucide="chevron-up" class="w-3.5 h-3.5 sm:w-4 sm:h-4"></i>
              </button>
              <button class="p-1 text-slate-300 hover:text-kyt-accent transition-colors ${index === total - 1 ? 'opacity-0 pointer-events-none' : ''}" onclick="KYT.config.moveStep(${index}, 1)" title="Move down">
                <i data-lucide="chevron-down" class="w-3.5 h-3.5 sm:w-4 sm:h-4"></i>
              </button>
            </div>
            <div class="w-px h-6 bg-slate-100 mx-1"></div>
            <div class="flex flex-col gap-0.5">
              <button class="p-1 text-slate-300 hover:text-rose-500 transition-colors" onclick="KYT.config.deleteStep(${index})" title="Delete">
                <i data-lucide="trash-2" class="w-3.5 h-3.5 sm:w-4 sm:h-4"></i>
              </button>
              <button class="p-1 text-slate-300 hover:text-blue-500 transition-colors" onclick="KYT.stepForm.openEdit(${index})" title="Edit">
                <i data-lucide="pencil" class="w-3.5 h-3.5 sm:w-4 sm:h-4"></i>
              </button>
            </div>
          </div>
        </div>
      `;
    }

    if (variant === 'album') {
      const idx = options.index || 0;
      let photosHtml = '';
      if (step.memories && step.memories.length > 0) {
        photosHtml = `
          <div class="grid grid-cols-2 gap-2 mt-3">
            ${step.memories.map(m => `<img src="${esc(m)}" class="w-full h-32 object-cover rounded-xl border border-slate-100 shadow-xs">`).join('')}
          </div>
        `;
      }
      return `
        <div class="p-4 bg-slate-50 rounded-2xl border border-slate-100">
          <div class="flex items-center gap-2 mb-1.5">
            <span class="w-6 h-6 rounded-full bg-blue-100 text-blue-600 font-bold text-xs flex items-center justify-center">${idx + 1}</span>
            <h4 class="text-sm font-extrabold text-slate-800 truncate">${esc(step.title || 'Step')}</h4>
          </div>
          ${step.where ? `<p class="text-xs text-slate-500 font-medium ml-8 flex items-center gap-1"><i data-lucide="map-pin" class="w-3 h-3 text-slate-400"></i> ${esc(step.where)}</p>` : ''}
          ${step.notes ? `<p class="text-xs text-slate-600 font-normal italic ml-8 mt-1">${esc(step.notes)}</p>` : ''}
          ${photosHtml}
        </div>
      `;
    }

    return '';
  }

  // ── 6. High-Fidelity Curated Trip -> Virtual Trip Converter ─────────────────
  function convertCuratedTripToVirtual(curatedObj, customId = null) {
    if (!curatedObj) return null;
    const baseId = customId || ('idea_' + Date.now().toString(36));
    const steps = [];
    let stepCounter = 0;

    (curatedObj.days || []).forEach(d => {
      (d.steps || []).forEach(s => {
        const h = s.hour != null ? s.hour : 9;
        const m = s.minute || 0;
        const phase = s.phase || hourToPhase(h);
        const suggestedTime = s.suggestedTime || formatSuggestedTime(h, m, phase);

        steps.push({
          id: `${baseId}_${++stepCounter}`,
          dayId: d.day,
          cityName: d.cityName || s.where || 'Destination',
          title: s.title,
          notes: s.notes || '',
          where: s.where || d.cityName || 'Destination',
          mapsUrl: s.mapsUrl || '',
          hour: h,
          minute: m,
          phase: phase,
          suggestedTime: suggestedTime,
          verify: Array.isArray(s.verify) ? [...s.verify] : [],
          icon: s.icon || 'map-pin'
        });
      });
    });

    const fullCities = (curatedObj.cities && curatedObj.cities.length)
      ? curatedObj.cities.map(c => resolveCity(c)?.id || c)
      : ['tirupati'];

    return {
      id: baseId,
      name: curatedObj.title || 'Curated Trip',
      originCity: curatedObj.originCity || 'already_there',
      duration: curatedObj.durationDays || (curatedObj.days ? curatedObj.days.length : fullCities.length),
      cities: fullCities,
      taste: {
        intent: curatedObj.taste?.intent || 'spiritual',
        diet: curatedObj.taste?.diet || 'veg',
        pace: curatedObj.taste?.pace || 'standard'
      },
      steps: steps,
      curatedId: curatedObj.id
    };
  }

  // ── 7. Unified City Detail Slide-Over Controller ────────────────────────────
  const cityDetail = (function () {
    const historyStack = [];
    let currentConfig = {
      mode: 'explore', // 'add' | 'explore'
      isCityAdded: () => false,
      onPrimaryAction: null,
      onAddNearby: null
    };

    function configure(opts = {}) {
      currentConfig = { ...currentConfig, ...opts };
    }

    function open(cityId, pushHistory = true, customOpts = null) {
      if (customOpts) configure(customOpts);
      const city = resolveCity(cityId);
      if (!city) return;

      const overlay = document.getElementById('city-detail-overlay');
      const panel = document.getElementById('city-detail-panel');
      if (!overlay || !panel) return;

      if (pushHistory) {
        const url = new URL(window.location.href);
        url.searchParams.set('city', city.id);
        window.history.pushState({ cityId: city.id }, '', url.toString());
        historyStack.push(city.id);
      }

      const btnBack = document.getElementById('btn-back-city-detail');
      if (btnBack) {
        if (historyStack.length > 1) {
          btnBack.classList.remove('hidden');
        } else {
          btnBack.classList.add('hidden');
        }
      }

      const titleEl = document.getElementById('cd-title');
      const stateEl = document.getElementById('cd-state-tag');
      const descEl = document.getElementById('cd-description');
      if (titleEl) {
        titleEl.textContent = city.name;
        titleEl.dataset.cityId = city.id;
      }
      if (stateEl) stateEl.textContent = city.state || 'India';
      if (descEl) descEl.textContent = city.notes || 'A beautiful destination to explore.';

      // YouTube Video Carousel
      const heroPlaceholder = document.getElementById('cd-hero-placeholder');
      const headerDiv = heroPlaceholder ? heroPlaceholder.parentElement : null;

      const oldIframe = document.getElementById('cd-hero-yt');
      if (oldIframe) oldIframe.remove();
      const oldControls = document.getElementById('cd-yt-controls');
      if (oldControls) oldControls.remove();

      const videos = window.KYT_CITY_VIDEOS ? (window.KYT_CITY_VIDEOS[city.id] || []) : [];
      if (videos.length > 0 && headerDiv) {
        heroPlaceholder.classList.add('hidden');
        let currentVidIdx = 0;

        const iframe = document.createElement('iframe');
        iframe.id = 'cd-hero-yt';
        iframe.className = 'absolute inset-0 w-full h-full object-cover z-0';
        iframe.src = `https://www.youtube-nocookie.com/embed/${videos[currentVidIdx].id}?rel=0&modestbranding=1`;
        iframe.allowFullscreen = true;
        iframe.style.border = 'none';
        headerDiv.insertBefore(iframe, heroPlaceholder);

        if (videos.length > 1) {
          const controls = document.createElement('div');
          controls.id = 'cd-yt-controls';
          controls.className = 'absolute inset-0 pointer-events-none flex justify-between items-center px-2 z-10';
          controls.innerHTML = `
            <button type="button" class="pointer-events-auto bg-black/40 hover:bg-black/60 backdrop-blur-md text-white p-2 rounded-full transition-colors" id="btn-yt-prev" title="Previous video">
              <i data-lucide="chevron-left" class="w-4 h-4"></i>
            </button>
            <button type="button" class="pointer-events-auto bg-black/40 hover:bg-black/60 backdrop-blur-md text-white p-2 rounded-full transition-colors" id="btn-yt-next" title="Next video">
              <i data-lucide="chevron-right" class="w-4 h-4"></i>
            </button>
          `;
          headerDiv.appendChild(controls);

          document.getElementById('btn-yt-prev').onclick = (e) => {
            e.stopPropagation();
            currentVidIdx = (currentVidIdx - 1 + videos.length) % videos.length;
            iframe.src = `https://www.youtube-nocookie.com/embed/${videos[currentVidIdx].id}?rel=0&modestbranding=1`;
          };
          document.getElementById('btn-yt-next').onclick = (e) => {
            e.stopPropagation();
            currentVidIdx = (currentVidIdx + 1) % videos.length;
            iframe.src = `https://www.youtube-nocookie.com/embed/${videos[currentVidIdx].id}?rel=0&modestbranding=1`;
          };
        }
      } else if (heroPlaceholder) {
        heroPlaceholder.classList.remove('hidden');
      }

      // Attractions Accordion
      const attrList = document.getElementById('cd-attractions-list');
      if (attrList) {
        if (city.beats && city.beats.length > 0) {
          attrList.innerHTML = city.beats.map(b => renderAttractionAccordion(b, city.name)).join('');
        } else {
          attrList.innerHTML = `<p class="text-xs text-slate-400 italic">No top attractions listed yet for this city.</p>`;
        }
      }

      // Primary Action Button (#cd-btn-add-main)
      const mainBtn = document.getElementById('cd-btn-add-main');
      if (mainBtn && currentConfig.mode === 'add') {
        const added = typeof currentConfig.isCityAdded === 'function' && currentConfig.isCityAdded(city.id);
        if (added) {
          mainBtn.innerHTML = `<i data-lucide="check" class="w-4 h-4"></i> Added`;
          mainBtn.classList.replace('bg-blue-600', 'bg-emerald-600');
          mainBtn.disabled = true;
        } else {
          mainBtn.innerHTML = `<i data-lucide="plus" class="w-4 h-4"></i> Add to Trip`;
          mainBtn.classList.replace('bg-emerald-600', 'bg-blue-600');
          mainBtn.disabled = false;
          mainBtn.onclick = () => {
            if (typeof currentConfig.onPrimaryAction === 'function') {
              currentConfig.onPrimaryAction(city.id);
            }
            mainBtn.innerHTML = `<i data-lucide="check" class="w-4 h-4"></i> Added`;
            mainBtn.classList.replace('bg-blue-600', 'bg-emerald-600');
            mainBtn.disabled = true;
            if (window.lucide) lucide.createIcons();
          };
        }
      } else if (mainBtn && typeof currentConfig.onPrimaryAction === 'function') {
        mainBtn.onclick = () => currentConfig.onPrimaryAction(city.id);
      }

      // Nearby Destinations
      const nearbyList = document.getElementById('cd-nearby-list');
      if (nearbyList) {
        if (window.KYT_DISTANCE_MATRIX && window.KYT_DISTANCE_MATRIX[city.id]) {
          const nearby = Object.entries(window.KYT_DISTANCE_MATRIX[city.id])
            .sort((a, b) => a[1] - b[1])
            .slice(0, 8);

          if (nearby.length > 0) {
            nearbyList.innerHTML = nearby.map(([nId, dist]) => {
              const nCity = resolveCity(nId);
              if (!nCity) return '';
              const isAdded = typeof currentConfig.isCityAdded === 'function' && currentConfig.isCityAdded(nCity.id);
              return renderCityCard(nCity, {
                variant: 'nearby',
                distance: dist,
                mode: currentConfig.mode,
                isAdded: isAdded
              });
            }).join('');
          } else {
            nearbyList.innerHTML = `<p class="text-xs text-slate-400 italic col-span-2">No nearby destinations found.</p>`;
          }
        } else {
          nearbyList.innerHTML = `<p class="text-xs text-slate-400 italic col-span-2">Distance data not available.</p>`;
        }
      }

      if (window.lucide) lucide.createIcons();

      overlay.classList.remove('hidden');
      setTimeout(() => {
        overlay.classList.remove('opacity-0');
        panel.classList.remove('translate-y-full', 'md:translate-x-full');
      }, 10);
    }

    function close(pushHistory = true) {
      const overlay = document.getElementById('city-detail-overlay');
      const panel = document.getElementById('city-detail-panel');
      if (!overlay || !panel) return;

      if (pushHistory) {
        const url = new URL(window.location.href);
        if (url.searchParams.has('city')) {
          url.searchParams.delete('city');
          window.history.pushState({ cityId: null }, '', url.toString());
        }
      }
      historyStack.length = 0;

      const oldIframe = document.getElementById('cd-hero-yt');
      if (oldIframe) oldIframe.remove();
      const oldControls = document.getElementById('cd-yt-controls');
      if (oldControls) oldControls.remove();

      overlay.classList.add('opacity-0');
      panel.classList.add('translate-y-full', 'md:translate-x-full');
      setTimeout(() => {
        overlay.classList.add('hidden');
      }, 300);
    }

    return { configure, open, close };
  })();

  return {
    /** Shared metadata — single source of truth */
    constants: {
      CITY_ALIASES,
      INTENT_META,
      PACE_META,
      MOBILITY_META,
      PHASE_META,
      CATEGORY_META
    },
    /** Lookup */
    resolveCity,
    /** Helpers */
    hourToPhase,
    formatSuggestedTime,
    phaseStyle,
    renderPaceBadge,
    renderMobilityBadge,
    categoryMeta,
    /** Renderers */
    renderAttractionAccordion,
    renderCityCard,
    renderStepCard,
    convertCuratedTripToVirtual,
    /** City detail slide-over */
    cityDetail
  };
})();