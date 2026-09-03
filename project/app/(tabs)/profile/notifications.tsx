import { ScrollView, View } from 'react-native';
import { appStyles } from '@/styles/styles';
import { ScreenHeader } from '@/components/screen-header';

export default function Notifications() {
  return (
    <ScrollView
      style={appStyles.backgroundContainer}
      contentContainerStyle={appStyles.scrollContent}
    >
      <ScreenHeader title="Notifications" />
      <View style={appStyles.screenContent}>
        {/* Page-specific content goes here */}
      </View>
    </ScrollView>
  );
}
