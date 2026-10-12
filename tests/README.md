# KYT functional tests

End-to-end tests that drive the real pages in a headless, phone-sized Chromium (390x844, touch).
Functionality only: no screenshots or styling checks. External requests (Google Fonts, pdfmake CDN)
are blocked so runs are hermetic and work offline.

    npm install            # installs Playwright; then once:  npx playwright install chromium
    npm run test:e2e       # 54 tests, about 2 minutes
    npm test               # admin unit tests + e2e

Set KYT_CHROMIUM=/path/to/chrome to use an existing browser binary.

| File | Journeys covered |
|---|---|
| 01-trip-engine | launcher states, first-time save, add/edit/reorder/delete steps, Now view (prev/next/first/last, done auto-advance, in-progress), end trip and passport stamp |
| 02-share-and-memories | export/import round trip, bad file, attachments (link, 2 MB cap, 4 max), photo memory, completion prompt |
| 03-virtual-trips | hub, city search (aliases, ranking), day plan, taste filters, "Use as my trip" with start date, overwrite prompt, share-link import, city deep link |
| 04-passport-curated-pwa | passport mark/filter/sort/date/undo, curated list, preview, open in Virtual Trips, share link, offline shell and offline editing, manifest, catalog integrity |

Tests that fail today are real app bugs, kept red on purpose:
1. first-time user who opens the home page first cannot save a trip (js/index.js creates `kyt_db` without the `kyt_store` object store)
2. editing a step from the editor throws `KYT.stepForm.openEdit is not a function` (js/config.js calls a method step-form.js does not export)
3. `data/distance_matrix.js` has `hubli` pointing at `bangalore` and `mangalore`, which are not city ids

One test is marked `todo` (about 40 attractions have no direct Maps link).
