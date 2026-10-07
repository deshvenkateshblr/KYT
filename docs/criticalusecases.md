# KYT - Critical Use Cases & Regression Checklist

This document serves as a master checklist of critical user journeys. It should be used to test the KYT application after any major architecture change, feature addition, or refactor to ensure no core functionality has degraded.

## 1. Application Initialization & State Persistence
- [ ] **First-Time Boot:** Open `index.html` with empty LocalStorage/IndexedDB. Verify the user is routed to the New User landing page options (Configure Upcoming Trip, Start Virtual Trip).
- [ ] **State Preservation:** Modify the trip (add a step, change trip name), close the browser, and reopen `index.html`. Verify the app bypasses the landing page and routes directly to the returning user state (the main carousel or view_trip).
- [ ] **Offline Capability (PWA):** Disconnect the network and reload the application. Ensure the Service Worker (`sw.js`) serves cached versions of all multi-page HTML, CSS, and JS files without breaking navigation.

## 2. Multi-Page Navigation
- [ ] **Universal Toolbar:** Verify the top-right toolbar appears uniformly across `view_trip.html`, `configure_trip.html`, and `virtual_trip.html`.
- [ ] **Home Button:** Click the Home (house) icon from any sub-page and ensure it routes cleanly back to `index.html`.
- [ ] **Escape/Close Flows:** Click "Save & Close" (or "End Current Trip") in `configure_trip.html` and verify the app properly routes away from the configuration page instead of throwing blank overlay screens.

## 3. Configure Trip (Trip Editor)
- [ ] **Field Population:** Navigate to Configure Trip; verify that the Trip Name and Trip Notes input fields correctly display the saved string values (no empty placeholders if data exists).
- [ ] **Step Management:** Add a new timeline step, drag-and-drop to reorder it, and delete a step. Ensure the "Timeline Steps" badge accurately reflects the count dynamically.
- [ ] **End Trip:** Click "End Current Trip", confirm the prompt, and ensure all trip state is wiped clean, returning the app to the New User landing state.

## 4. Virtual Trips Engine
- [ ] **Hub Loading:** Open `virtual_trip.html` and verify the Hub screen loads without blanking out.
- [ ] **City Search & Addition:** Open the builder, search for a destination (e.g., "Agra" or "Mumbai"), and add it. Ensure the city card populates with its "beats" (features).
- [ ] **Taste Profile Parsing:** Ensure selecting/deselecting tags (e.g., Spiritual, Cultural, Fast Pace) correctly filters the generated itinerary items.
- [ ] **Build Execution:** Click "Generate Virtual Trip" and confirm the system successfully populates `KYT.store` with the corresponding itinerary steps, ending up in the main `view_trip.html` flow.

## 5. Main Timeline / Carousel (`view_trip.html`)
- [ ] **Card Rendering:** Ensure the current step card renders with the correct title, location (Google Maps link), and relative time logic.
- [ ] **VCR Controls:** Test the Previous and Next buttons to ensure they cycle through the `currentIndex` without going out of bounds.
- [ ] **Status Toggling:** Mark a step as "Done" and verify it auto-advances to the next step. Toggle it back to "To-Do".
- [ ] **Countdown Clock:** Ensure the live countdown timer ticking on the active step does not throw console errors and accurately calculates the delta.

## 6. Export / Import Data
- [ ] **Export Integrity:** Click "Export Trip", download the `.json` file, and ensure it contains valid JSON (Trip Name, Notes, Steps Array).
- [ ] **Import Parsing:** Wipe the current trip, click "Import Trip", upload the `.json` file, and verify all UI elements and the timeline are immediately restored to the exact exported state.

## 7. View Story Album
- [ ] **Album Rendering:** Access the Album view and ensure it correctly pulls memories (photos, notes) attached to timeline steps.
- [ ] **Social Sharing Logic:** Verify that users can generate the trip report/PDF and that the layout elegantly displays the completed journey without overlapping or breaking CSS boundaries.

