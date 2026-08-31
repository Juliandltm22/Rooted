const VOICE_REQUEST_TIMEOUT_MS = 15000;
const voiceUrlCache = new Map<string, Promise<string>>();

export class GuidedAudioUnavailableError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'GuidedAudioUnavailableError';
  }
}

function isSafeAudioUrl(value: unknown): value is string {
  return typeof value === 'string' && /^https:\/\//i.test(value);
}

async function withTimeout<T>(request: Promise<T>, milliseconds: number): Promise<T> {
  let timeout: ReturnType<typeof setTimeout> | undefined;

  try {
    return await Promise.race([
      request,
      new Promise<T>((_, reject) => {
        timeout = setTimeout(() => reject(new GuidedAudioUnavailableError('Voice took too long to load.')), milliseconds);
      }),
    ]);
  } finally {
    if (timeout) {
      clearTimeout(timeout);
    }
  }
}

/**
 * Requests one small TTS clip from a server-side provider adapter. The app never
 * receives an ElevenLabs key; the adapter should persist/cache by cacheKey and
 * return { audioUrl: 'https://...' }. Reusing the promise avoids duplicate taps
 * and duplicate TTS requests during a single app run.
 */
export function getGuidedVoiceAudioUrl(text: string, cacheKey: string): Promise<string> {
  const existingRequest = voiceUrlCache.get(cacheKey);
  if (existingRequest) {
    return existingRequest;
  }

  const endpoint = process.env.EXPO_PUBLIC_GUIDED_TTS_ENDPOINT;
  if (!endpoint) {
    return Promise.reject(new GuidedAudioUnavailableError('Voice has not been configured yet.'));
  }

  const request = withTimeout(fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      text,
      cacheKey,
      voiceStyle: 'soft, warm, calm, patient, and reassuring; speak slowly',
    }),
  }), VOICE_REQUEST_TIMEOUT_MS)
    .then(async (response) => {
      if (!response.ok) {
        throw new GuidedAudioUnavailableError('Voice is unavailable right now.');
      }

      const body: unknown = await response.json();
      const audioUrl = body && typeof body === 'object' && 'audioUrl' in body
        ? (body as { audioUrl: unknown }).audioUrl
        : null;

      if (!isSafeAudioUrl(audioUrl)) {
        throw new GuidedAudioUnavailableError('Voice returned an invalid audio file.');
      }

      return audioUrl;
    })
    .catch((error: unknown) => {
      voiceUrlCache.delete(cacheKey);
      if (error instanceof GuidedAudioUnavailableError) {
        throw error;
      }

      throw new GuidedAudioUnavailableError('Voice is unavailable right now.');
    });

  voiceUrlCache.set(cacheKey, request);
  return request;
}

/** A licensed, CORS-enabled ambient track URL supplied by the deployment. */
export function getAmbientAudioUrl(): string | null {
  const value = process.env.EXPO_PUBLIC_GUIDED_AMBIENT_AUDIO_URL;
  return isSafeAudioUrl(value) ? value : null;
}
