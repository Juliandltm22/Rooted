import { Pressable, Text, TextInput, View, Image } from 'react-native';
import { useState } from 'react';
import { appStyles } from '@/styles/styles';
import { Search } from 'lucide-react-native';
import { ScreenHeader } from '@/components/screen-header';

export default function FriendsList() {
  const [name, setName] = useState('');

  return (
    <View style={appStyles.backgroundContainer}>
      <ScreenHeader title="Friends List" />
          <View style={appStyles.searchInputWrapper}>
            <Search color="#918E8E" size={18} strokeWidth={1.5} style={appStyles.searchIcon} />
            <TextInput
              style={[appStyles.input, appStyles.searchInput]}
              value={name}
              onChangeText={setName}
              placeholder="Search for a name"
              placeholderTextColor="#918E8E"
            />
        </View>

      <View style={appStyles.divider} />
      <View style={appStyles.friendsListContainer}>
        <Image
          source={require('@/assets/images/strelitzia-plant-welcome.png')}
          style={appStyles.noFriendsImage}
        />
        <Text style={[appStyles.subtitleParagraph, { fontFamily: 'Raleway-SemiBold', marginTop: 12 }]}>No friends yet!</Text>
        <Text style={[appStyles.subtitleParagraph, { fontFamily: 'Raleway-Regular', marginTop: 6 }]}>Add friends to see them here!</Text>
        <Pressable style={[appStyles.saveButton]} onPress={() => { /* handle save changes */ }}>
          <Text style={appStyles.subtitleHeadline4}>Invite Friends</Text>
        </Pressable>
       </View>
      </View>
  );
}
