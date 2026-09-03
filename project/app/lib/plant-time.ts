import { getTimes } from 'suncalc';

export type PlantTimeOfDay = 'day' | 'sunset' | 'night';

export interface ApproximateCoordinates {
  latitude: number;
  longitude: number;
}

const SUNSET_WINDOW_MS = 45 * 60 * 1000;

function isUsableDate(value: Date | null): value is Date {
  return value instanceof Date && Number.isFinite(value.getTime());
}

function getClockFallback(now: Date): PlantTimeOfDay {
  const hour = now.getHours() + now.getMinutes() / 60;

  if (hour >= 6 && hour < 17.25) {
    return 'day';
  }

  if (hour >= 17.25 && hour < 19.25) {
    return 'sunset';
  }

  return 'night';
}

export function getPlantTimeOfDay(
  now = new Date(),
  coordinates?: ApproximateCoordinates | null,
): PlantTimeOfDay {
  if (!coordinates) {
    return getClockFallback(now);
  }

  const { sunrise, sunset, alwaysUp, alwaysDown } = getTimes(
    now,
    coordinates.latitude,
    coordinates.longitude,
  );

  if (alwaysUp) {
    return 'day';
  }

  if (alwaysDown) {
    return 'night';
  }

  if (!isUsableDate(sunrise) || !isUsableDate(sunset)) {
    return getClockFallback(now);
  }

  const currentTime = now.getTime();
  const sunsetStarts = sunset.getTime() - SUNSET_WINDOW_MS;
  const sunsetEnds = sunset.getTime() + SUNSET_WINDOW_MS;

  if (currentTime >= sunsetStarts && currentTime <= sunsetEnds) {
    return 'sunset';
  }

  if (currentTime >= sunrise.getTime() && currentTime < sunsetStarts) {
    return 'day';
  }

  return 'night';
}
