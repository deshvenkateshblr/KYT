# KYT (Know Your Travel) — Product Specification & Roadmap

## 1. Vision & Core Philosophy

### 1.1 The Core USP: Fluid Sequencing over Rigid Schedules
Travel in India is vibrant, culturally rich, and naturally fluid. Forcing strict, artificial clock timestamps (`07:00, 08:00, 10:00`) on an auto-generated itinerary creates immediate friction and breaks travel reality when flights shift, lines stretch, or spontaneous roadside chai stops happen.

**KYT’s Governing Principles**:
1. **Fluid Narrative Sequence**: Daily activities are organized by natural day phases (**Morning**, **Midday**, **Afternoon**, **Evening**) or sequential beats rather than minute-by-minute prison time.
2. **User as Sovereign Editor**: Every activity, meal, and travel step is a suggestion that the user can browse, reorder, modify, or delete with a single tap.
3. **Hard Timestamps Only for Hard Bookings**: Fixed wall-clock times are reserved exclusively for hard bookings (train departures, flight times, darshan slots, safari gates) explicitly entered by the user or crafted by expert curators.
4. **Macro-Structure Before Micro-Planning**: Key journey parameters (origin city, stay bases vs. day visits, travel windows) must be established *before* fine-grained day activity planning begins.

---

## 2. Unified Design System & UX Standards

To maintain visual harmony and prevent jarring transitions across screens, all primary surfaces follow a unified visual grammar:

| Element | Specification across all views (Virtual Trip, Trip Detail, Customize/Builder) |
| :--- | :--- |
| **Top Header Bar** | Clean, full-width sticky header (`bg-white border-b border-slate-200 px-4 py-3`). Contains `[KYT Logo] + Screen/Trip Title` on the left, and standard action buttons (`Share`, `Home`, etc.) on the right. No disjointed floating pill bars. |
| **Container Width** | Responsive max-width container (`max-w-4xl` or `max-w-5xl` centered on desktop, collapsing smoothly to edge-padded mobile padding). Prevents mobile-constrained column cramps on desktop. |
| **Back Navigation** | A single, clear breadcrumb/back action (e.g. `← Edit Cities` or `← Back to Trip`). Never duplicate back buttons on the same screen. |
| **Card Style** | Rounded modern cards (`rounded-2xl border border-slate-200 bg-white shadow-sm hover:border-blue-300`). |
| **Action Buttons** | Primary call-to-actions styled in KYT royal blue (`bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl`). Secondary actions in soft blue tint (`bg-blue-50 text-blue-700 hover:bg-blue-100`). |

---

## 3. Trip-Level Attribute Specification

Both Virtual Trips and Curated Trips share a unified macro-attribute model:

### 3.1 Macro Trip Attributes
- **Origin City (`originCity`)**: Where the traveller begins (e.g., *Delhi*, *Bengaluru*, or *"Already in first destination"*).
  - If `originCity != firstCity`: A dedicated **Day 0: Travel & Arrival** is generated, allowing a clean slate for Day 1 exploration.
- **Stay Allocation (`stayCities`)**: Distinguishes which destinations are **Overnight Stay Bases** 🏨 (hotel check-in allocated) vs **Day Excursions / En-route Stops** 🚗 (sightseeing only; no redundant hotel check-ins).
- **Return Type (`returnType`)**:
  - `round_trip`: Automatically generates a wrap-up return journey back to the origin city.
  - `one_way`: Concludes in the final destination city for open-jaw itineraries.

### 3.2 Traveller Profile & Travel Style (`profile`)
- **Intent**: Spiritual, Cultural, Heritage, Nature, Leisure, Adventure, Mixed.
- **Dietary Preference**: Vegetarian, Jain, Satvik, Any/Local.
- **Pace**: Relaxed (Short), Standard (Balanced), Deep Dive.
- **Party Composition (`party`)**:
  - 👨‍👩‍👧‍👦 *Family with Elders* (Easy mobility, gentle pace, minimal steep climbs).
  - 👶 *Family with Kids* (Afternoon rest buffers, child-friendly stops).
  - 👫 *Couples / Friends* (Flexible walking stretches, sunrise/evening centric).
  - 🎒 *Solo Explorer* (High-mobility, fast transit).
- **Transit Mode (`transitMode`)**: Personal Car / Self-Drive, Hired Cab, Express Train / Vande Bharat, Flight + Local Cab.

### 3.3 Inter-City Transit Windows
- **Transfer Day Phase**: Morning transit (`07:30 – 11:30`), Midday, or Evening.
- **Live Google Maps Routing**: Direct driving directions URL integrated into every transfer leg for live traffic, expressway toll estimates, and real-time transit duration.

---

## 4. Curated Trips $\rightarrow$ Virtual Trips Integration (Approach A: High-Fidelity Blueprint)

When a user customizes a Curated Trip into the Virtual Trip builder:
1. **Zero Loss of Fidelity**: Curated steps, notes, and local expert verify checklists are loaded directly without being replaced by generic catalog beats.
2. **Editorial Timing Badges**: Curated timings are presented as gentle expert guidelines (`Suggested ~09:30 AM` or `Morning`) rather than rigid alarms.
3. **Full Customizability**: Users can freely delete unwanted steps, reorder beats, or append extra cities and days to the tail of the curated trip.

---

## 5. Incremental Execution Roadmap

### Phase 1: Navigation & Header Unification *(Next Up)*
- [ ] Align top header bar across `virtual_trip.html` (Canvas and Builder) with `trip_detail.html` standard header.
- [ ] Remove duplicate back buttons in Builder mode (`< Edit Cities` breadcrumb vs blue right button).
- [ ] Standardize container width to responsive max-width layout.

### Phase 2: Macro Trip Parameters on Canvas
- [ ] Add Origin City selector (*"Starting from [City] / Already in destination"*).
- [ ] Add Stay Type toggles on selected city chips (*Overnight Stay Base* 🏨 vs *Day Excursion* 🚗).
- [ ] Add Party Composition chips (*Family with Elders, Kids, Friends, Solo*).
- [ ] Inter-city transfer cards with direct Google Maps driving link.

### Phase 3: Fluid Sequence Day Generation (No Clock Clutter)
- [ ] Remove rigid artificial clock timestamps (`07:00, 08:00`) from auto-generated builder view.
- [ ] Adopt day phase headers (*Morning*, *Midday*, *Afternoon*, *Evening*).
- [ ] Render curated steps with high-fidelity badges and checklist annotations.
- [ ] Eliminate meal collisions with existing food walk beats.

### Phase 4: Full App Sync & Offline Hardening
- [ ] Ensure seamless state persistence between `virtual_trip.html`, `trip_detail.html`, and `view_trip.html`.
- [ ] Service worker cache updates for all changed assets.

