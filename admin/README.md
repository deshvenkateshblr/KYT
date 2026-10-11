# KYT Admin: curated trips generator

A static tool (no server, no build). It turns AI output into `data/curated_trips.js`, the file KYT reads.

## Run it
Put the `admin/` folder in the KYT repo root, next to `data/` and `lib/`, then serve the repo and open `/admin/index.html`:

    python3 -m http.server 8000      # from the KYT repo root

It loads `../data/cities.js` for city ids. Without it the tool still works but cannot match cities.

## Workflow
1. **Plan**: choose the starting city and, optionally, length, months, focus (spiritual shows a Faith choice) and free-text notes. *Step 1* asks the AI for about 12 tagged trip ideas, with no itineraries. *Step 2* develops only the ideas you like, one itinerary per answer, by copy-paste or by calling Gemini from the page. Dismiss ideas you do not want.
2. **Bring in AI output**: paste an itinerary answer. Every import is a draft.
3. **Review and edit**: fix places, times and links, check the "verify" notes, adjust tags (track, faiths, suits), then approve. "Make a variation" writes a prompt that changes an existing trip (slower, Jain friendly, budget, kids) and returns a new draft linked by `variantOf`.
4. **Library and export**: download `curated_trips.js` (approved only by default). Load an existing file to keep editing. Download backups: the library lives in browser storage.

The admin applies no editorial limits (days, travel time, how packed a day is). It only blocks a missing title or no days, and it still strips HTML and allows only https Google Maps links, since AI text is untrusted. Editing an approved trip returns it to draft.

### Tags KYT can filter on
Each trip carries `taste.intent`, `faiths[]`, `taste.pace`, `taste.diet`, `audience[]`, `budget`, `transport.mode`, `transport.approxTravelHours`, `bestMonths[]`, `track` (theme label) and `kind` (weekend or long-weekend, from its length). `ideaId` and `variantOf` link trips from the same idea.

### Before you go and special days (mainly for spiritual trips)
- `beforeYouGo: [{ type: booking|id|dress|rules|timing|other, text }]`: hard prerequisites such as darshan booking windows, original ID, dress code, phone and camera rules, permits.
- `specialDays: [{ name, when, effect: festival|special-darshan|closed|crowded|other, note }]`: festivals, special darshan or seva days, weekly specials, closures, crowd peaks. Many follow the lunar calendar, so `when` is the occasion and usual months, not exact dates; show it with a "confirm with the temple" line.
Both are empty lists when not relevant. A spiritual trip with neither gets an info note in Review (never a block).

## Output file
    window.KYT_CURATED_TRIPS_SCHEMA = 1;
    window.KYT_CURATED_TRIPS_GENERATED_AT = "<ISO>";
    window.KYT_CURATED_TRIPS = [ { id, rev, status, title, tagline, track, ideaId, variantOf, originCity, originName, kind, durationDays,
      bestMonths:[1..12], taste:{intent,diet,pace}, faiths[], audience[], budget, transport:{mode,note,approxTravelHours},
      cities[], highlights[], tips[], beforeYouGo[], specialDays[], sources[{name,url}], generated{via,model,at},
      days:[{ day, title, cityId, cityName, steps:[{ title, where, hour, minute, icon, mapsUrl, mapsAuto?, notes, durationMin?, verify[] }] }] } ];

`taste`, `cities` and icons use KYT's own vocabulary and ids. `mapsAuto: true` means the link is a Maps search made by the tool, not one the AI supplied.

## Reading it in KYT
    <script src="data/curated_trips.js"></script>   <!-- before your page script -->

    var trips = window.KYT_CURATED_TRIPS || [];
    // Real trip: steps in the shape KYT's main store uses
    steps = toKytSteps(trip, startDate);       // see admin/core.js
    // Virtual trip record for the Virtual Trips screen
    vt = toVirtualTrip(trip);                  // see admin/core.js

Copy those two functions from `core.js` (they have no dependencies) rather than loading all of it. Add `data/curated_trips.js` to the service worker cache list.

**Important for KYT:** treat every string as text. Render with `textContent` or escape it. The admin strips HTML and restricts links to https Google Maps, but the file is data, not trusted markup.

## Tests
    node admin/tests/core.test.js     # 56 unit tests; try TZ=Asia/Kolkata and TZ=America/Los_Angeles

## Known limits
- Gemini call uses the Interactions endpoint and a model name you can edit. It was tested only against a mock, not the live API.
- Map links and opening hours from AI can be wrong. Always spot-check approved trips.
- Check Google's terms on Maps-grounded output (attribution, storage) before shipping content generated that way.
- Six icon names used in KYT's own city data (adventure, water, tree, museum, monument, island) are not valid lucide icons; the admin only offers icons verified to exist.
