import { Text, View, Pressable, Image } from 'react-native';
import { Sprout } from 'lucide-react-native';
import { appStyles } from '@/styles/styles';
import { ScreenHeader } from '@/components/screen-header';

// Only one species exists today. The rest are placeholders until more
// plants are added.
const CACTUS_IMAGE = require('@/assets/images/transparent-cactus/Stage_1_-_Blue_Pot.png');
const COMING_SOON_COUNT = 5;

export default function ChangeSpecies() {
  return (
    <View style={appStyles.backgroundContainer}>
      <ScreenHeader title="Change Species" />
      <View style={appStyles.gardenerPicker}>
        <View style={appStyles.speciesOptionsRow}>
          <Pressable
            style={({ pressed }) => [
              appStyles.speciesOption,
              appStyles.speciesOptionAvailable,
              pressed && appStyles.speciesOptionPressed,
            ]}
            onPress={() => { /* handle species selection */ }}
            accessibilityRole="button"
            accessibilityLabel="Choose Cactus as your plant species"
          >
            <Image source={CACTUS_IMAGE} style={appStyles.speciesOptionImage} resizeMode="contain" />
            <Text style={[appStyles.subtitleHeadline4, appStyles.speciesOptionLabel]}>Cactus</Text>
          </Pressable>

          {Array.from({ length: COMING_SOON_COUNT }).map((_, index) => (
            <Pressable
              key={index}
              style={({ pressed }) => [
                appStyles.speciesOption,
                appStyles.speciesOptionComingSoon,
                pressed && appStyles.speciesOptionPressed,
              ]}
              onPress={() => { /* not available yet */ }}
              accessibilityRole="button"
              accessibilityLabel="More species coming soon"
            >
              <Sprout color="#B9CCA4" size={28} strokeWidth={1.75} />
              <Text style={[appStyles.subtitleHeadline4, appStyles.speciesOptionComingSoonLabel]}>
                Coming Soon...
              </Text>
            </Pressable>
          ))}
        </View>
      </View>
    </View>
  );
}
