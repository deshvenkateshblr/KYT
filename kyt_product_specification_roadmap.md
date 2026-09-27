### KYT (Know Your Travel) - Core Specification & Roadmap

KYT is a travel companion that allows users to construct flexible itineraries by breaking trips down into sequential steps—ranging from flights to dining—with indicative timing, direct Google Maps routing, and essential attachments. The interface uses bold, interactive controls to easily track active and completed states, providing a calm, focused travel experience.

### Technical Architecture & Constraints
To maintain privacy, speed, ease of use and a premium feel, KYT operates strictly under these technical parameters:
*   **Zero-Server:** Built entirely on progressive web technologies (HTML, CSS, vanilla JS). There are no user accounts, no backend servers, and no cloud syncing.
*   **Local State Only:** 100% of user data is stored on-device via browser storage (`localStorage`). 
*   **Offline-First:** As a Progressive Web App (PWA), it must function flawlessly without an internet connection once loaded.
*   **Client-Side Processing:** Advanced features—like generating shareable images (e.g., via `html2canvas`) or reading document attachments—happen strictly in the browser's memory.

### Design & UX Principles
KYT strictly adheres to the following UX constraints to maintain its identity as a lightweight, desirable tool:
*   **Mobile-First & Tactile:** 
*   **Highly Desirable Aesthetic:** Borrows from the clean, intentional design language of modern iOS native apps. It utilizes crisp typography, expansive whitespace, vibrant accents, and smooth animations to feel energetic and inherently trustworthy.
*   **Native App Illusion:** Designed to be added to the iOS/Android Home Screen, hiding browser UI and behaving instantly like a native application.
*   **Progressive Disclosure:** Users are only shown what they need *right now*. The interface prioritizes the immediate current/next step to reduce cognitive load, avoiding overwhelming calendar views.

---

### Feature Modules & Progressive Scope

To ensure a focused and iterative build process, KYT's feature set is organized into progressive modules.

#### Module 1: The Core Itinerary Engine (MVP - Current)
*   Configure/Create a Trip with a Title, optional Cover Image, and optional Notes.
	* **Rich Step Attributes:** Every travel step is a self-contained unit capturing the *What* (Title & Category Icon), *When* (Target Date & Time), and *Where* (Location Name & Direct Google Maps URL), alongside optional Notes.
*   **Contextual "Now" View:** A dynamic, swipeable card interface that prioritizes the most relevant current or upcoming step based on time.
*   **Flexible Step Sequence:** The ability to easily create, edit, and reorder steps along a soft timeline.
*   **Hybrid Attachments:** Support for lightweight file uploads (PDFs, Images) with an elegant in-app viewer, plus fallback support for external Drive/Web links.
*   **Compact Sharing:** Export/Import functionality generating minified text files (excluding attachments) for easy sharing with co-travelers.

#### Module 2: Social Celebration & Memories
Bridging the gap between private planning and social sharing, allowing users to celebrate their journeys immediately upon completion.
*   **Travel Memory Card:** Upon completing an itinerary, the app synthesizes the trip's highlights (destination, total miles, steps conquered).
*   **Algorithmically Generated Assets:** The app automatically designs a beautiful, highly stylized image (like a digital luggage tag or boarding pass) based on the user's unique trip data.
*   **Native Export:** Users can download this crisp visual snapshot directly to their camera roll to share on social media.

#### Module 3: Beautiful Accomplishment Dashboard
A highly visual, centralized hub that celebrates the user's travel history. 
*   **Visual Milestones:** A unified, timeline of all past trips.
*   **Travel Stats:** Dynamically computed and energetically displayed accomplishments, such as total travel miles (calculating point-to-point geodesic distances), total days traveled, and total experiences completed.
*   **Category Insights:** Colorful breakdowns of travel styles (e.g., time spent at museums vs. beaches vs. transit).

#### Module 4: Inspiration & Bucket List
A dedicated space for capturing future aspirations without the pressure of a committed timeline.
*   **Digital Sandbox:** A place to save dream destinations, inspirational links, and loose ideas. Filtered by category,such as Spiritual, Adventure, Culinary, or Cultural.
	* Each bucket list items expands to popular attractions, points to popular and latest youtube videos, and provides a direct link to Google Maps for location context.
*   **Seamless Conversion:** A one-tap workflow to promote a saved "Bucket List" item directly into an active Trip, automatically porting over all saved notes and context into the main timeline view.