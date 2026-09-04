import { useEffect, useRef } from 'react';
import { Animated, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { X } from 'lucide-react-native';
import { appStyles } from '@/styles/styles';

type LogoutModalProps = {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

export function LogoutModal({ visible, onClose, onConfirm }: LogoutModalProps) {
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
            <Text style={appStyles.modalTitle}>Logout</Text>
            <View style={{ width: 24 }} />
          </View>

          <Text style={appStyles.modalQuestion}>Are you sure you want to Logout?</Text>
          <Text style={appStyles.modalSubtitle}>Your plant will see you soon</Text>

          <View style={appStyles.modalButtonRow}>
            <Pressable style={appStyles.modalCancelButton} onPress={onClose}>
              <Text style={appStyles.modalCancelText}>Cancel</Text>
            </Pressable>
            <Pressable style={appStyles.modalConfirmButton} onPress={onConfirm}>
              <Text style={appStyles.modalConfirmText}>Yes, Logout</Text>
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
});
