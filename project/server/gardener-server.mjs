// Minimal local HTTP server that keeps GEMINI_API_KEY off the client.
//
// The Expo app calls POST /api/gardener with the current Care check-in
// (mood, sleepHours, writtenResponse). This handler validates that input,
// asks Gemini for a structured Gardener response, validates Gemini's output
// against the same rules the client already enforces, and returns it.
//
// On ANY failure (missing key, timeout, malformed response, invalid
// activity, etc.) this server responds with a non-2xx status. It does NOT
// try to construct a fallback plan itself — the Expo client already owns a
// complete fallback recommendation system (see app/lib/garden-plan.ts) and
// falls back to it whenever this endpoint is unavailable or returns
// something invalid. Keeping the fallback in one place avoids having two
// competing recommendation systems.
//
// Run with: npm run gardener:server   (loads .env via `node --env-file`)

import { createServer } from 'node:http';
import dns from 'node:dns';
import { GoogleGenAI } from '@google/genai';
import {
  GEMINI_MODEL,
  GARDENER_SYSTEM_INSTRUCTION,
  GARDENER_RESPONSE_SCHEMA,
  buildGardenerPrompt,
  containsImmediateDanger,
  createUrgentSupportResponse,
  normalizeCheckIn,
  normalizeGardenerResponse,
} from './gardener-config.mjs';

// Some networks advertise IPv6 without fully working IPv6 routing. Node's
// fetch will try an IPv6 address first if DNS returns one, and rather than
// failing fast, the connection just hangs — which looks identical to a slow
// or unreachable API. Preferring IPv4 avoids that class of silent hang.
dns.setDefaultResultOrder('ipv4first');

const PORT = Number(process.env.GARDENER_SERVER_PORT) || 8787;
const GEMINI_TIMEOUT_MS = 12_000;
const MAX_BODY_BYTES = 10_000; // Care check-ins are small; this is a generous ceiling.

const apiKey = process.env.GEMINI_API_KEY?.trim();
const genAI = apiKey ? new GoogleGenAI({ apiKey }) : null;

if (!genAI) {
  console.warn(
    '[gardener-server] GEMINI_API_KEY is not set. Every /api/gardener request will fail ' +
      'and the Expo app will use its local fallback recommendations instead.',
  );
}

function setCorsHeaders(res) {
  // Local-only hackathon server reachable over LAN from a device/simulator;
  // no cookies or credentials are used, so a permissive origin is fine here.
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

function sendJson(res, statusCode, payload) {
  const body = JSON.stringify(payload);
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(body),
  });
  res.end(body);
}

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let received = 0;

    req.on('data', (chunk) => {
      received += chunk.length;
      if (received > MAX_BODY_BYTES) {
        reject(new Error('Request body too large.'));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });

    req.on('end', () => {
      if (chunks.length === 0) {
        resolve(null);
        return;
      }
      try {
        resolve(JSON.parse(Buffer.concat(chunks).toString('utf8')));
      } catch {
        reject(new Error('Invalid JSON body.'));
      }
    });

    req.on('error', reject);
  });
}

function withTimeout(promise, ms) {
  let timeoutHandle;
  const timeout = new Promise((_resolve, reject) => {
    timeoutHandle = setTimeout(() => reject(new Error('Gemini request timed out.')), ms);
  });

  return Promise.race([promise, timeout]).finally(() => clearTimeout(timeoutHandle));
}

async function requestGardenerPlanFromGemini(checkIn) {
  const result = await withTimeout(
    genAI.models.generateContent({
      model: GEMINI_MODEL,
      contents: buildGardenerPrompt(checkIn),
      config: {
        systemInstruction: GARDENER_SYSTEM_INSTRUCTION,
        responseMimeType: 'application/json',
        responseSchema: GARDENER_RESPONSE_SCHEMA,
      },
    }),
    GEMINI_TIMEOUT_MS,
  );

  const text = result.text;
  if (!text) {
    throw new Error('Gemini returned an empty response.');
  }

  return JSON.parse(text);
}

async function handleGardenerRequest(req, res) {
  // TEMP DIAGNOSTIC LOGGING — remove once the timeout issue is resolved.
  // Logs phase + elapsed time only. Never logs the request body, the Gemini
  // response text, or any secrets.
  const requestId = Math.random().toString(36).slice(2, 8);
  const startedAt = Date.now();
  const elapsed = () => `${Date.now() - startedAt}ms`;
  console.log(`[gardener-server][${requestId}] Request received from ${req.socket.remoteAddress}`);

  let rawBody;
  try {
    rawBody = await readJsonBody(req);
  } catch (error) {
    console.warn(`[gardener-server][${requestId}] Rejected malformed request body (${elapsed()}):`, error.message);
    sendJson(res, 400, { error: 'Invalid request.' });
    return;
  }

  const checkIn = normalizeCheckIn(rawBody);
  if (!checkIn) {
    console.warn(`[gardener-server][${requestId}] Rejected invalid check-in shape (${elapsed()}).`);
    sendJson(res, 400, { error: 'Invalid Care check-in.' });
    return;
  }

  // Deterministic safety short-circuit: never let a model call decide whether
  // to surface emergency-support guidance. This mirrors the client's own
  // fallback behavior in app/lib/garden-plan.ts.
  if (containsImmediateDanger(checkIn.writtenResponse)) {
    console.log(`[gardener-server][${requestId}] Immediate-danger short-circuit (${elapsed()}).`);
    sendJson(res, 200, createUrgentSupportResponse());
    return;
  }

  if (!genAI) {
    console.warn(`[gardener-server][${requestId}] No Gemini client configured (${elapsed()}).`);
    sendJson(res, 500, { error: 'Gardener plan service is not configured.' });
    return;
  }

  try {
    console.log(`[gardener-server][${requestId}] Calling Gemini (${elapsed()})...`);
    const rawGeminiResponse = await requestGardenerPlanFromGemini(checkIn);
    console.log(`[gardener-server][${requestId}] Gemini responded (${elapsed()}).`);
    const normalizedResponse = normalizeGardenerResponse(rawGeminiResponse);

    if (!normalizedResponse) {
      console.warn(`[gardener-server][${requestId}] Gemini response failed validation (${elapsed()}):`, rawGeminiResponse);
      sendJson(res, 502, { error: 'Gardener plan was invalid.' });
      return;
    }

    console.log(`[gardener-server][${requestId}] Sending validated plan to client (${elapsed()}).`);
    sendJson(res, 200, normalizedResponse);
  } catch (error) {
    // Never leak raw provider errors (e.g. "429 RESOURCE_EXHAUSTED") or stack
    // traces to the client. Log details server-side for debugging only.
    console.error(`[gardener-server][${requestId}] Gemini request failed (${elapsed()}):`, error);
    sendJson(res, 502, { error: 'Gardener plan service is unavailable.' });
  }
}

const server = createServer((req, res) => {
  // TEMP DIAGNOSTIC LOGGING — logs every incoming request's method/url/origin
  // so a routing mismatch (wrong path, unexpected method) is visible instead
  // of silently 404ing. No headers/body beyond this are logged.
  console.log(`[gardener-server] Incoming ${req.method} ${req.url} (origin: ${req.headers.origin ?? 'n/a'})`);

  setCorsHeaders(res);

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  if (req.method === 'POST' && req.url === '/api/gardener') {
    void handleGardenerRequest(req, res);
    return;
  }

  if (req.method === 'GET' && req.url === '/health') {
    sendJson(res, 200, { ok: true, geminiConfigured: Boolean(genAI), model: GEMINI_MODEL });
    return;
  }

  console.warn(`[gardener-server] No route matched ${req.method} ${req.url} — sending 404.`);
  sendJson(res, 404, { error: 'Not found.' });
});

server.listen(PORT, () => {
  console.log(`[gardener-server] Listening on http://localhost:${PORT}`);
  console.log(`[gardener-server] Gemini configured: ${Boolean(genAI)} (model: ${GEMINI_MODEL})`);
});
