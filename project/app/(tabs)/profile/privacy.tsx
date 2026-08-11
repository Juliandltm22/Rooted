import { ScrollView, View } from 'react-native';
import { appStyles } from '@/styles/styles';
import { ScreenHeader } from '@/components/screen-header';

export default function Privacy() {
  return (
    <ScrollView
      style={appStyles.backgroundContainer}
      contentContainerStyle={appStyles.scrollContent}
    >
      <ScreenHeader title="Privacy" />
      <View style={appStyles.screenContent}>
        {/* Page-specific content goes here */}
      </View>
    </ScrollView>
  );
}
