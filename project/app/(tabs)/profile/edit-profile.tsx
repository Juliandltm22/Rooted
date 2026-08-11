import { Text, TextInput, View, Pressable } from 'react-native';
import { useState } from 'react';
import { appStyles } from '@/styles/styles';
import { ScreenHeader } from '@/components/screen-header';

export default function EditProfile() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  return (
    <View style={appStyles.backgroundContainer}>
      <ScreenHeader title="Edit Profile" />
      <View style={appStyles.screenContent}>
        <View style={[appStyles.profileCircle2]}></View>
      </View>
      <View style={appStyles.userInputEmail}>
        <View style={appStyles.inputGroup}>
          <Text style={appStyles.subtitleHeadline4}>Name</Text>
          <TextInput
            style={[
              appStyles.input,
              {
                borderRadius: 20,
                backgroundColor: '#ffffff',
              }
            ]}
            value={name}
            onChangeText={setName}
            placeholder="Enter your name" // Change to stored name
            placeholderTextColor="#918E8E"
          />
        </View>
        <View style={appStyles.inputGroup}>
          <Text style={appStyles.subtitleHeadline4}>Email</Text>
          <TextInput
            style={[
              appStyles.input,
              {
                borderRadius: 20,
                backgroundColor: '#ffffff',
              }
            ]}
            value={email}
            onChangeText={setEmail}
            placeholder="Enter your email" // Change to stored email
            placeholderTextColor="#918E8E"
          />
        </View>
      </View>
      <View style={appStyles.gardenerPicker}>
        <Text style={appStyles.subtitleHeadline4}>Pick your Gardener</Text>
        <View style={appStyles.gardenerOptionsRow}>
          <Pressable style={[appStyles.gardenerOption, { backgroundColor: '#f72585' }]} onPress={() => { /* handle gardener selection */ }}>
            <Text style={appStyles.subtitleHeadline4}>Select Gardener</Text>
          </Pressable>
          <Pressable style={[appStyles.gardenerOption, { backgroundColor: '#00afb9' }]} onPress={() => { /* handle gardener selection */ }}>
            <Text style={appStyles.subtitleHeadline4}>Select Gardener</Text>
          </Pressable>
          <Pressable style={[appStyles.gardenerOption, { backgroundColor: '#64dfdf' }]} onPress={() => { /* handle gardener selection */ }}>
            <Text style={appStyles.subtitleHeadline4}>Select Gardener</Text>
          </Pressable>
        </View>
      </View>
      <Pressable style={[appStyles.saveButton]} onPress={() => { /* handle save changes */ }}>
          <Text style={appStyles.subtitleHeadline4}>Save Changes</Text>
      </Pressable>
    </View>
  );
}
