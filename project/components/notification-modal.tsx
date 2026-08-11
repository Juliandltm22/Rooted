import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { X } from 'lucide-react-native';
import { appStyles } from '@/styles/styles';

type NotificationModalProps = {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

export function NotificationModal({ visible, onClose, onConfirm }: NotificationModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType='slide'
      onRequestClose={onClose}
    >
      <View style={appStyles.modalOverlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />

        <View style={appStyles.modalSheet}>
          <View style={appStyles.modalHeader}>
            <Pressable onPress={onClose} hitSlop={10}>
              <X color="#37423D" size={24} strokeWidth={1.5} />
            </Pressable>
            <Text style={[appStyles.modalTitle, { color: '#899878' } ]}>Notification</Text>
            <View style={{ width: 24 }} />
          </View>

          <Text style={appStyles.modalQuestion}>Would you like to change your notifications settings?</Text>
          <Text style={appStyles.modalSubtitle}></Text>

          <View style={appStyles.modalButtonRow}>
            <Pressable style={appStyles.modalConfirmButton} onPress={onConfirm}>
              <Text style={appStyles.modalConfirmText}>Turn Off Notifications</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  )
}
