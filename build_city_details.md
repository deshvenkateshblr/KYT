# Rich City Detail Pages - Enhancement Plan

This document outlines the roadmap and features to be implemented for the "Rich City Detail" slide-over view. The goal is to make each city page highly immersive, shareable, and actionable for users building their virtual trips.

## 1. YouTube Video Header Carousel
**Goal:** Replace the static image header placeholder with an embedded, interactive YouTube video player to give users a virtual preview of the city.
**Details:**
*   Create a new data file `data/city_videos_data.js` via a curation script (using `yt-dlp` to fetch metadata).
*   **Language Filter:** During generation, append "in English" to queries to prioritize English content. 
*   **TODO:** In a future iteration, allow users to set a language preference (e.g., Hindi, Tamil, Telugu) in the app settings, and dynamically source/filter videos based on that preference.
*   Implement a carousel UI in the header (with previous/next buttons) allowing users to swipe through or click through multiple videos of the city right inside the slide-over.

## 2. Expanded Attraction Details
**Goal:** Provide deeper context for the top attractions directly within the slide-over.
**Details:**
*   Currently, the "Top Attractions" section shows the title and a brief note/location.
*   Verify and validate the extended data available for each attraction (beats).
*   Implement an expansion mechanism (or richer card layout) to display these expanded details so users don't have to leave the page to understand why an attraction is significant.

## 3. Direct City Sharing
**Goal:** Allow users to share a specific destination directly with friends.
**Details:**
*   Add a prominent "Share" button to the City Detail slide-over (perhaps next to the title or in the header).
*   Clicking this will generate a link that points directly to this specific city's detail page (e.g., using a URL hash parameter like `#city=agra`).
*   When a recipient opens the link, the app will automatically launch and slide open this specific city's view.

## 4. Prominent POIs via Google Maps (Hotels & Restaurants)
**Goal:** Help users visualize the local infrastructure by surfacing highly-rated establishments.
**Details:**
*   Figure out a strategy to query or link to prominent places, hotels, and restaurants.
*   **Constraint/Filter:** Only show establishments with a minimum of 5,000 reviews to ensure high quality and relevance.
*   *Implementation Strategy:* Since KYT is zero-server, this may involve constructing highly specific Google Maps Search URLs (e.g., `https://www.google.com/maps/search/Hotels+in+Agra/`), or pre-curating a lightweight dataset of top-tier hotels/restaurants per city.

