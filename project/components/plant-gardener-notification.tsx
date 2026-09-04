import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { X } from 'lucide-react-native';
import {
  DEFAULT_GARDENER_ID,
  fetchSelectedGardenerId,
  getGardenerById,
  type GardenerId,
} from '@/app/lib/gardener';
import { GardenerBubble } from '@/components/gardener-bubble';
import { usePlantNotification } from '@/context/plant-notification-context';

export function PlantGardenerNotification() {
  const { notification, hidePlantNotification } = usePlantNotification();
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
      style={[styles.overlay, { top: insets.top + 10 }]}
    >
      <View style={styles.notificationPanel}>
        <GardenerBubble
          key={notification.id}
          title={title}
          message={notification.message}
          avatarSource={getGardenerById(gardenerId).image}
          accessibilityLiveRegion="polite"
          style={styles.bubble}
        />
        <Pressable
          accessibilityLabel="Dismiss notification"
          accessibilityRole="button"
          hitSlop={8}
          onPress={hidePlantNotification}
          style={styles.closeButton}
        >
          <X color="#37423D" size={18} strokeWidth={2} />
        </Pressable>
      </View>
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
  notificationPanel: {
    position: 'relative',
  },
  bubble: {
    borderWidth: 1,
    borderColor: '#E8E6D7',
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 15,
    backgroundColor: 'rgba(252, 249, 237, 0.82)',
  },
});
