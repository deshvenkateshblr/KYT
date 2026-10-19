/**
 * Cloudflare Worker for KYT Trip Shortlinks
 * Provides anonymous 60-day Key-Value storage for sharing full AI-refined travel itineraries.
 */

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Standard CORS headers allowing web apps (including vividnova.com) to access the API
    const cors = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: cors });
    }

    // ── 1. SAVE TRIP (POST /api/trip) ──────────────────────────────────────────
    if (request.method === 'POST' && url.pathname === '/api/trip') {
      try {
        const tripData = await request.json();
        if (!tripData || typeof tripData !== 'object') {
          return new Response(JSON.stringify({ error: 'Invalid trip data' }), {
            status: 400,
            headers: { ...cors, 'Content-Type': 'application/json' }
          });
        }

        // Generate a clean, random 6-character alphanumeric code (e.g. "k7x9p2")
        const id = Math.random().toString(36).substring(2, 8);

        // Store in Cloudflare KV with a 60-day auto-expiry (5,184,000 seconds)
        // Zero user data or IP addresses are stored—strictly anonymous itinerary JSON.
        if (env.TRIP_KV) {
          await env.TRIP_KV.put(id, JSON.stringify(tripData), {
            expirationTtl: 60 * 86400
          });
        } else {
          return new Response(JSON.stringify({ error: 'TRIP_KV binding missing in Cloudflare Worker settings' }), {
            status: 500,
            headers: { ...cors, 'Content-Type': 'application/json' }
          });
        }

        return new Response(JSON.stringify({ id, success: true }), {
          headers: { ...cors, 'Content-Type': 'application/json' }
        });
      } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), {
          status: 500,
          headers: { ...cors, 'Content-Type': 'application/json' }
        });
      }
    }

    // ── 2. RETRIEVE TRIP (GET /api/trip/:id) ───────────────────────────────────
    if (request.method === 'GET' && url.pathname.startsWith('/api/trip/')) {
      const id = url.pathname.replace('/api/trip/', '').trim();
      if (!id) {
        return new Response(JSON.stringify({ error: 'Missing trip ID' }), {
          status: 400,
          headers: { ...cors, 'Content-Type': 'application/json' }
        });
      }

      if (!env.TRIP_KV) {
        return new Response(JSON.stringify({ error: 'TRIP_KV binding missing' }), {
          status: 500,
          headers: { ...cors, 'Content-Type': 'application/json' }
        });
      }

      const tripJson = await env.TRIP_KV.get(id);
      if (!tripJson) {
        return new Response(JSON.stringify({ error: 'Trip not found or expired' }), {
          status: 404,
          headers: { ...cors, 'Content-Type': 'application/json' }
        });
      }

      return new Response(tripJson, {
        headers: { ...cors, 'Content-Type': 'application/json' }
      });
    }

    // ── Health Check ──────────────────────────────────────────────────────────
    if (url.pathname === '/' || url.pathname === '/health') {
      return new Response(JSON.stringify({ status: 'ok', service: 'KYT Shortener' }), {
        headers: { ...cors, 'Content-Type': 'application/json' }
      });
    }

    return new Response('Not Found', { status: 404, headers: cors });
  }
};
