# KYT (Know Your Travel) — Project Status & Todo

## ✅ Completed

1. **Short Share URL Acronyms**
   - Created short 3-letter acronyms for all cities and 3-letter compact codes for taste profiles (intent, diet, pace) to generate clean, short shareable URLs.

2. **Dedicated Shared Trip View (`trip_detail.html`)**
   - Built a dedicated, mobile-friendly landing page for viewing shared/curated trips.
   - Includes trip header with title, description, and social share actions.
   - Destination grid with attraction summaries.
   - Filterable video gallery showcasing YouTube highlights of trip cities.
   - Seamless "Customize" / "Edit Plan" handoff into `virtual_trip.html`.

3. **Clickable City Cards in Shared Trip View (`trip_detail.html`)**
   - Made city cards interactive with hover states, cursor cues, and "Explore" badges.
   - Added rich city detail slide-over sheet (matching `virtual_trip.html`):
     - Interactive YouTube video carousel with next/previous controls.
     - Collapsible attractions list with travel style tags, pace, accessibility labels, notes, and direct Google Maps links.
     - Nearby destinations sorted by distance with one-click navigation.
     - Deep-linking (`?city=<cityId>`), history back-stack, and city share button.

4. **First-Time User Database Initialization (Defect #1 Fix)**
   - Fixed `Failed to save to database` bug when first-time users build a trip from the homepage.
   - Ensured `kyt_store` object store is properly created in IndexedDB `onupgradeneeded` in both `js/index.js` and `js/store.js` with self-repair fallback.

5. **Step Edit Button Implementation (Defect #2 Fix)**
   - Implemented and exported `openEdit(stepIndex)` in `js/step-form.js` so pencil icons on trip steps open the edit modal as expected.

6. **Hubli Distance Matrix Corrections (Defect #3 Fix)**
   - Fixed city key mismatches in `data/distance_matrix.js` (`bangalore` -> `bengaluru`, `mangalore` -> `udupi`, etc.).
   - Added city aliases mapping in `js/virtual-trips.js` and `trip_detail.html` to gracefully resolve alias lookups.

7. **Direct Google Maps Links for Newer Attractions (Defect #4 Fix)**
   - Added direct `mapsUrl` links for ~40 attractions across 13 newer cities in `data/cities.js`, removing reliance on fallback map queries.

8. **HTML Escaping & XSS Sanitization**
   - Sanitized unescaped insertions of step titles, locations, icons, and attachment data across `js/config.js`, `js/carousel.js`, and `js/step-form.js`.

9. **Branding & PWA Polish**
   - Fixed KYT logo cropping issues on header and home screen banner.
   - Removed redundant "KYT / Know Your Travel" repetition on `index.html`.
   - Paired *"Know your travel"* with *"Plan it your way"* and rewrote hero headline and lead copy in a compelling Ad-Guru voice.
   - Cleaned up hero section by removing conflicting demo mockup image (`.k-demo`) and creating a dedicated, prominent "Trip Menu" card section at the top.
   - Improved styling of the "Add to Home Screen" prompt.
   - Merged homepage redesign into `index.html` and `index.js`.
   - Bumped service worker cache version to `kyt-v22` in `sw.js`.

---

## 🟡 In Progress / Under Discussion

1. **Customization Handling for Curated Trips vs. Virtual Trips**
   - Discuss and finalize options for handling customizations when users fork a curated trip:
     - Retaining curated steps vs. auto-generating virtual trip steps.
     - Incorporating default "Journey" steps (travel, transfers, logistics) into default activity timelines when constructing virtual trips without curated steps.

---

## 📋 Backlog / Future Enhancements

1. **Admin City Management Page**
   - Create an admin page where an admin user can add a new city along with all attractions, videos, and nearby destinations.
   - Automatically save/write or export updates to data files (`cities.js`, `city_videos_data.js`, `distance_matrix.js`).

2. **Food Filter & Culinary Metadata**
   - Add meaningful food filter options when searching/filtering cities (e.g. popular local cuisines, dietary availability, satvik/veg options).
   - Ensure each city object in `cities.js` contains rich food and culinary metadata.

3. **Food-Specific Videos**
   - Gather food-specific videos separately to showcase local culinary specialties and street food scenes for each destination.

