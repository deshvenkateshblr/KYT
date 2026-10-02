# Virtual Trip Builder Specification

The Virtual Trip feature enables users to plan and build multi-city itineraries without committing to hard calendar dates. It replaces rigid alert/prompt dialogues with a seamless, two-stage builder workflow.

## Overview
The workflow is divided into two distinct stages:
1. **The Canvas (Selection):** Select destinations and set trip features.
2. **The Builder (Refinement):** Organize attractions into virtual days.

---

## Stage 1: The Canvas (Selection)

When the user opens a Virtual Trip, they are presented with a unified, split-screen workspace.

### Top Section: Trip Identity & Features
- **Trip Name:** An inline text input to name the trip (e.g., "Winter Escape").
- **Trip Features (Taste Profile):** A horizontal, scrollable list of chips (e.g., Jain, Spiritual, Standard Pace) that define the user's preferences for this trip.
- **Selected Cities Basket:** An empty holding area. As cities are added, they appear here as removable chips (e.g., `[ Varanasi ✕ ]`).
- **Build Trigger:** A prominent **"Build Trip"** button that only appears once at least one city has been added to the basket.

### Middle Section: Separator
- A clean visual separator dividing the trip configuration from the city library.

### Bottom Section: The City Library
- **Search Bar:** A sticky search input that filters the city list in real-time by name or tags.
- **City Cards:** Rich, card-based representations of available destinations (similar to the Bucket List).
- **Add Action:** Each city card features an explicit "Add" button. Clicking this button extracts the city and drops its chip into the Top Section basket.

---

## Stage 2: The Builder (Refinement)

Once the user has selected their cities and clicks **"Build Trip"**, the view transitions to the itinerary refinement stage.

### Auto-Bucketing
- The system evaluates the selected cities against the selected Trip Features (Taste Profile).
- It extracts the matching attractions and intelligently groups them into relative virtual days (e.g., **Day 1**, **Day 2**, **Day 3**) rather than hard calendar dates.

### Itinerary Configuration (Configure Trip UX)
- **Drag-and-Drop:** Users can drag attractions to reorder them within a day or move them between different days.
- **Delete Steps:** A trash icon allows users to manually remove any auto-added attractions they don't want.
- **Edit Steps:** Users can tweak the notes or details of an attraction.

### Finalization
- Once the Virtual Trip is perfected, it remains saved in the user's "Planned Trips" list.
- A future phase will introduce connecting this virtual plan to real dates and bookings.

