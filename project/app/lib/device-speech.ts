import * as Speech from 'expo-speech';

const VOICE_RATE = 0.92;
const VOICE_PITCH = 1.0;

export class DeviceSpeechUnavailableError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DeviceSpeechUnavailableError';
  }
}

export function speakGuidedCue(text: string): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      Speech.speak(text, {
        rate: VOICE_RATE,
        pitch: VOICE_PITCH,
        onDone: () => resolve(),
        onStopped: () => resolve(),
        onError: () => reject(new DeviceSpeechUnavailableError('Voice guidance is unavailable right now.')),
      });
    } catch {
      reject(new DeviceSpeechUnavailableError('Voice guidance is unavailable right now.'));
    }
  });
}

export async function stopGuidedSpeech(): Promise<void> {
  try {
    await Speech.stop();
  } catch {
    // Nothing was speaking; nothing to clean up.
  }
}
