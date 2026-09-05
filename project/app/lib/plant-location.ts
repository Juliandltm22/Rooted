import * as Location from 'expo-location';
import type { ApproximateCoordinates } from '@/app/lib/plant-time';

let cachedCoordinates: ApproximateCoordinates | null | undefined;
let locationRequest: Promise<ApproximateCoordinates | null> | null = null;

export async function getApproximateCoordinates(): Promise<ApproximateCoordinates | null> {
  if (cachedCoordinates !== undefined) {
    return cachedCoordinates;
  }

  if (locationRequest) {
    return locationRequest;
  }

  locationRequest = (async () => {
    try {
      const permission = await Location.requestForegroundPermissionsAsync();
      if (permission.status !== Location.PermissionStatus.GRANTED) {
        cachedCoordinates = null;
        return null;
      }

      const position = await Location.getLastKnownPositionAsync({
        maxAge: 12 * 60 * 60 * 1000,
        requiredAccuracy: 50_000,
      }) ?? await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      cachedCoordinates = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      };
      return cachedCoordinates;
    } catch (error) {
      console.warn('Unable to determine local sunrise and sunset; using clock fallback.', error);
      cachedCoordinates = null;
      return null;
    } finally {
      locationRequest = null;
    }
  })();

  return locationRequest;
}
