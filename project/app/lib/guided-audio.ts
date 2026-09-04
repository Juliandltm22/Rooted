import type { AudioSource } from 'expo-audio';

// After adding assets/audio/calm-forest.mp3, replace null with:
// require('../../assets/audio/calm-forest.mp3')
const LOCAL_AMBIENT_AUDIO: AudioSource = null;

function isHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' || url.protocol === 'http:';
  } catch {
    return false;
  }
}

/** A bundled local track is preferred; a licensed deployment URL is also supported. */
export function getAmbientAudioSource(): AudioSource {
  if (LOCAL_AMBIENT_AUDIO) {
    return LOCAL_AMBIENT_AUDIO;
  }

  const remoteAudio = process.env.EXPO_PUBLIC_GUIDED_AMBIENT_AUDIO_URL?.trim();
  return remoteAudio && isHttpUrl(remoteAudio) ? remoteAudio : null;
}
