import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  DEFAULT_GARDENER_ID,
  fetchSelectedGardenerId,
  getGardenerById,
  type GardenerId,
} from '@/app/lib/gardener';
import { GardenerBubble } from '@/components/gardener-bubble';
import { usePlantNotification } from '@/context/plant-notification-context';

export function PlantGardenerNotification() {
  const { notification } = usePlantNotification();
  const insets = useSafeAreaInsets();
  const [gardenerId, setGardenerId] = useState<GardenerId>(DEFAULT_GARDENER_ID);

  useEffect(() => {
    if (!notification) {
      return;
    }

    let isActive = true;
    void fetchSelectedGardenerId().then((selectedGardenerId) => {
      if (isActive) {
        setGardenerId(selectedGardenerId);
      }
    });

    return () => {
      isActive = false;
    };
  }, [notification]);

  if (!notification) {
    return null;
  }

  const title = notification.type === 'plan-completed'
    ? 'Your Gardener is celebrating!'
    : 'A little note from your Gardener';

  return (
    <View
      pointerEvents="none"
      style={[styles.overlay, { top: insets.top + 10 }]}
    >
      <GardenerBubble
        key={notification.id}
        title={title}
        message={notification.message}
        avatarSource={getGardenerById(gardenerId).image}
        accessibilityLiveRegion="polite"
        style={styles.bubble}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    left: 16,
    right: 16,
    zIndex: 1000,
    elevation: 20,
  },
  bubble: {
    borderWidth: 1,
    borderColor: '#E8E6D7',
  },
});
