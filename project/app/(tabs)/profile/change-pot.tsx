import { Text, View, Pressable } from 'react-native';
import { appStyles } from '@/styles/styles';
import { ScreenHeader } from '@/components/screen-header';

export default function ChangePot() {
  return (
    <View style={appStyles.backgroundContainer}>
      <ScreenHeader title="Change Pot" />
      <View style={appStyles.gardenerPicker}>
          <View style={appStyles.speciesOptionsRow}>
          <Pressable style={appStyles.speciesOption} onPress={() => { /* handle species selection */ }}>
              <Text style={appStyles.subtitleHeadline4}>Blue Pot</Text>
          </Pressable>
          <Pressable style={[appStyles.speciesOption, { backgroundColor: '#00afb9' }]} onPress={() => { /* handle species selection */ }}>
            <Text style={appStyles.subtitleHeadline4}>Red Pot</Text>
          </Pressable>
          <Pressable style={[appStyles.speciesOption, { backgroundColor: '#64dfdf' }]} onPress={() => { /* handle species selection */ }}>
            <Text style={appStyles.subtitleHeadline4}>White Pot</Text>
          </Pressable>
          <Pressable style={[appStyles.speciesOption, { backgroundColor: '#f72585' }]} onPress={() => { /* handle species selection */ }}>
              <Text style={appStyles.subtitleHeadline4}>Black Pot</Text>
          </Pressable>
          <Pressable style={[appStyles.speciesOption, { backgroundColor: '#00afb9' }]} onPress={() => { /* handle species selection */ }}>
            <Text style={appStyles.subtitleHeadline4}>Pink Pot</Text>
          </Pressable>
          <Pressable style={[appStyles.speciesOption, { backgroundColor: '#64dfdf' }]} onPress={() => { /* handle species selection */ }}>
            <Text style={appStyles.subtitleHeadline4}>Purple Pot</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}
