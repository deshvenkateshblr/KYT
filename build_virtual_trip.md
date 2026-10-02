# Next Iteration: Virtual Trip Enhancements

This document outlines the next set of requirements and features to be implemented for the Virtual Trips functionality in KYT (Know Your Travel).

## 1. City Distance Estimation
**Goal:** Provide users with an estimate of distances between cities added to their virtual trip.
**Details:**
*   When multiple cities are added to the "Canvas", automatically calculate or approximate the travel distance between consecutive cities.
*   Display these estimates in the UI (e.g., in the Builder or Canvas view) so users can gauge the feasibility of their itinerary.
*   *Implementation idea:* Use a lightweight coordinate map or matrix for the 130 cities to compute direct distances, or integrate a routing API if exact road distance is required.

## 2. AI Travel Plan Prompt Generation
**Goal:** Allow users to easily generate an optimal travel plan using an external AI tool, ensuring the output is perfectly formatted to be imported back into KYT.
**Details:**
*   Add a feature to generate an "AI Prompt" based on the user's selected cities, dates, and trip features (taste/vibe).
*   The prompt must include explicit instructions for the AI to format its output in a specific JSON structure (or similar) that KYT can natively parse.
*   Users can copy this prompt, paste it into an LLM (like ChatGPT or Gemini), and then copy-paste the resulting itinerary back into KYT to instantly populate their steps.

## 3. Share, Export, and Import Virtual Trips
**Goal:** Introduce seamless sharing for Virtual Trips, matching the existing functionality in the Configure Trip view.
**Details:**
*   **Export:** Allow users to download their drafted Virtual Trip (selected cities, features, generated itinerary) as a `.json` file.
*   **Import:** Provide an upload mechanism in the Virtual Trips Hub so users can load a `.json` file and instantly restore a trip state.
*   *Implementation idea:* Replicate the logic from `js/config.js` and `store.js` that handles standard trip exports, adapting it to handle the `kyt_virtual_trips` data structure.

## 4. Rich city views with youtube video links, in-place player and search actions.
