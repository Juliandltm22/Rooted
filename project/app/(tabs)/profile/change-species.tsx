import { Text, View, Pressable } from 'react-native';
import { appStyles } from '@/styles/styles';
import { ScreenHeader } from '@/components/screen-header';

export default function ChangeSpecies() {
  return (
    <View style={appStyles.backgroundContainer}>
      <ScreenHeader title="Change Species" />
      <View style={appStyles.gardenerPicker}>
          <View style={appStyles.speciesOptionsRow}>
          <Pressable style={[appStyles.speciesOption, { backgroundColor: '#f72585' }]} onPress={() => { /* handle species selection */ }}>
              <Text style={appStyles.subtitleHeadline4}>Cactus</Text>
          </Pressable>
          <Pressable style={[appStyles.speciesOption, { backgroundColor: '#00afb9' }]} onPress={() => { /* handle species selection */ }}>
            <Text style={appStyles.subtitleHeadline4}>Coming Soon...</Text>
          </Pressable>
          <Pressable style={[appStyles.speciesOption, { backgroundColor: '#64dfdf' }]} onPress={() => { /* handle species selection */ }}>
            <Text style={appStyles.subtitleHeadline4}>Coming Soon...</Text>
          </Pressable>
          <Pressable style={[appStyles.speciesOption, { backgroundColor: '#f72585' }]} onPress={() => { /* handle species selection */ }}>
            <Text style={appStyles.subtitleHeadline4}>Coming Soon...</Text>
          </Pressable>
          <Pressable style={[appStyles.speciesOption, { backgroundColor: '#00afb9' }]} onPress={() => { /* handle species selection */ }}>
            <Text style={appStyles.subtitleHeadline4}>Coming Soon...</Text>
          </Pressable>
          <Pressable style={[appStyles.speciesOption, { backgroundColor: '#64dfdf' }]} onPress={() => { /* handle species selection */ }}>
            <Text style={appStyles.subtitleHeadline4}>Coming Soon...</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}
