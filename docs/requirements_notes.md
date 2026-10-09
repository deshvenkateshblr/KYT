The current Bucket List is unhappy for a structural reason: it is **not a bucket list**. It is a **canned India brochure** (about ten destinations) with hearts, category chips, attraction lists, and Map / YouTube search. Your spec asked for a **sandbox of your aspirations**, plus one-tap into a trip. That conversion does not exist. Users cannot add their own place.

That mismatch is the UX problem, not the filters.

---

### Jobs that actually belong in KYT

A companion app is used in two tempos: **on a trip** and **between trips**. Bucket List only earns a door on the home screen if it serves the between-trips tempo.

**1. Park a spark (the real bucket list)**  
Someone mentions Hampi, you see a reel, a cousin says “next time Amritsar.” You want to drop **a name**, maybe a Maps link, maybe one line of why — with **no dates, no steps, no commitment**. That is the sandbox in the spec.

**2. Decide “what’s next”**  
On a Sunday you open KYT not to travel, but to look at *your* shortlist and pick the next trip. Filtering by mood (Spiritual, Adventure, …) is useful **on your items**, not on a magazine.

**3. Promote a dream into a trip**  
The only job that connects Module 3 to Module 1. One action: this item becomes the trip (title, notes, cover if any) and optionally **seeds steps** from whatever you already attached (attractions you cared about, a note). Without this, Bucket List is a dead end beside an itinerary app.

**4. (Light) steal a starter, then make it yours**  
A small bundled catalog is fine as **seeds**, not as the list. “Add Ladakh to my list” copies destination, tagline, maps, suggested beats into **your** sandbox so you can delete, rewrite, ignore YouTube. The catalog should never be the thing you scroll as “my bucket list.”

---

### Jobs that do *not* belong (this is what you built)

| Use case | Why it fails in KYT |
|---|---|
| Browse destinations like a guide | You will always lose to Google / YouTube / maps. Ten static cards feel thin and dated. |
| “Latest YouTube” / travel research | Needs the network, goes stale, pulls people **out** of the app. A search-results URL is not a feature. |
| Mini encyclopedia (days, season, modes, full attraction lists) | Editorial content you must maintain. It also makes every card heavy — the opposite of a sandbox. |
| Heart = save our content | Wishlist of *KYT’s* places, not *your* places. Empty “Saved” until they heart the brochure. |

Those are guidebook use cases. KYT is a **personal sequence tool**. Mixing them is why the screen feels like a sidecar that does not belong next to On/Done.

---

### What I would treat as in-scope UX (still small)

- **Default view = My list** (user-created + seeded). Empty state: “Park a place for later” + optional “Start from an idea.”
- **Each item is a stub, not an article:** title, category, optional note, optional map. Details folded. No obligatory attractions/YouTube row.
- **Primary action on an item: Make this the trip** (or “Add these as steps” if a trip already exists). That is the feature the spec promised.
- **Catalog, if you keep it:** a secondary “Ideas” sheet that *copies into My list*. Hearts on catalog items go away.

YouTube and long attraction copy can be parked the same way you parked pin-to-face: nice later, not the job.

---

### The one decision that unlocks the UX

Is Bucket List **my private parking lot**, or **KYT’s inspiration feed**?

If it is the parking lot, the current screen should be inverted: **my items first**, catalog as optional seed, convert-to-trip as the payoff.  
If it is the feed, it will always feel second-rate next to the itinerary, and it will never feel like *yours*.

Given zero-server and “no pressure of a timeline,” the parking lot is the only use-case set that is honest. The rest is content you don’t want to be in the business of.


Next step is to lock a circuit pack format that the existing trip engine can import: one template = ordered destinations, 
each with optional taste-tagged beats (not only food — spiritual, adventure, family, pace, budget, and culinary including Jain/veg), 
plus a small taste chip set on the bucket screen that includes/excludes beats at import time. 
Do not add AI, YouTube, or live search yet; take one real circuit (e.g. Ayodhya–Varanasi–Prayag–Lucknow), 
tag a handful of beats per city, and implement a single action — Use as trip — that writes matching destinations
and beats into stepsData so you can judge whether the template-plus-taste idea is right before generating more packs.

### Update: Move to Virtual Trips

The Bucket List and Explore modules were removed and replaced entirely by the 'Virtual Trips' feature. The decision was made because the bucket list paradigm felt too static and brochure-like. Virtual Trips allows users to 'park a spark' and explore destinations in a more engaging, trip-oriented format without the overhead of maintaining a separate bucket list feature.
