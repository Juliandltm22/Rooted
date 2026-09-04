import { useEffect, useRef } from 'react';
import { Animated, Modal, Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import { X } from 'lucide-react-native';
import { appStyles } from '@/styles/styles';
import { usePlantNotification } from '@/context/plant-notification-context';

type NotificationModalProps = {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

export function NotificationModal({ visible, onClose, onConfirm }: NotificationModalProps) {
  const {
    taskNotificationsEnabled,
    planNotificationsEnabled,
    setTaskNotificationsEnabled,
    setPlanNotificationsEnabled,
  } = usePlantNotification();
  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const sheetTranslateY = useRef(new Animated.Value(40)).current;

  useEffect(() => {
    if (!visible) {
      return;
    }

    backdropOpacity.setValue(0);
    sheetTranslateY.setValue(40);
    Animated.parallel([
      Animated.timing(backdropOpacity, { toValue: 1, duration: 180, useNativeDriver: true }),
      Animated.timing(sheetTranslateY, { toValue: 0, duration: 240, useNativeDriver: true }),
    ]).start();
  }, [backdropOpacity, sheetTranslateY, visible]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType='none'
      onRequestClose={onClose}
    >
      <View style={appStyles.modalOverlay}>
        <Animated.View
          pointerEvents="none"
          style={[StyleSheet.absoluteFill, styles.backdrop, { opacity: backdropOpacity }]}
        />
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />

        <Animated.View style={[appStyles.modalSheet, { transform: [{ translateY: sheetTranslateY }] }]}>
          <View style={appStyles.modalHeader}>
            <Pressable onPress={onClose} hitSlop={10}>
              <X color="#37423D" size={24} strokeWidth={1.5} />
            </Pressable>
            <Text style={[appStyles.modalTitle, { color: '#899878' } ]}>Notification</Text>
            <View style={{ width: 24 }} />
          </View>

          <Text style={appStyles.modalQuestion}>Would you like to change your notifications settings?</Text>
          <View style={styles.preferenceList}>
            <View style={styles.preferenceRow}>
              <Text style={styles.preferenceLabel}>Task completed</Text>
              <Switch
                value={taskNotificationsEnabled}
                onValueChange={setTaskNotificationsEnabled}
                trackColor={{ false: '#D5D1C3', true: '#B9CCA4' }}
                thumbColor="#FCF9ED"
                accessibilityLabel="Task completed notifications"
              />
            </View>
            <View style={styles.preferenceRow}>
              <Text style={styles.preferenceLabel}>Plan fully completed</Text>
              <Switch
                value={planNotificationsEnabled}
                onValueChange={setPlanNotificationsEnabled}
                trackColor={{ false: '#D5D1C3', true: '#B9CCA4' }}
                thumbColor="#FCF9ED"
                accessibilityLabel="Plan fully completed notifications"
              />
            </View>
          </View>

          <View style={appStyles.modalButtonRow}>
            <Pressable style={appStyles.modalConfirmButton} onPress={onConfirm}>
              <Text style={appStyles.modalConfirmText}>Done</Text>
            </Pressable>
          </View>
        </Animated.View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  backdrop: {
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  preferenceList: {
    gap: 8,
    marginTop: 20,
    marginBottom: 20,
  },
  preferenceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 44,
  },
  preferenceLabel: {
    flex: 1,
    fontFamily: 'Raleway-SemiBold',
    fontSize: 15,
    color: '#37423D',
  },
});
