import { View, Text, TextInput, Pressable } from 'react-native';
import { useState } from 'react';
import { appStyles } from '@/styles/styles';
import { ScreenHeader } from '@/components/screen-header';

export default function ChangePassword() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  return (
    <View style={appStyles.backgroundContainer}>
      <ScreenHeader title="Change Password" />
        <View style={appStyles.userInputEmail}>
          <View style={appStyles.inputGroup}>
            <Text style={appStyles.subtitleHeadline4}>Current Password</Text>
            <TextInput
              style={[
              appStyles.input,
              {
                borderRadius: 20,
                backgroundColor: '#ffffff',
              }
              ]}
              value={currentPassword}
              onChangeText={setCurrentPassword}
              placeholder="Enter your current password"
              placeholderTextColor="#918E8E"
            />
          </View>
          <View style={appStyles.inputGroup}>
            <Text style={appStyles.subtitleHeadline4}>New Password</Text>
            <TextInput
              style={[
                appStyles.input,
                {
                  borderRadius: 20,
                  backgroundColor: '#ffffff',
                }
                ]}
                value={newPassword}
                onChangeText={setNewPassword}
                placeholder="Enter your new password"
                placeholderTextColor="#918E8E"
              />
            </View>
            <View style={appStyles.inputGroup}>
              <Text style={appStyles.subtitleHeadline4}>Confirm Password</Text>
              <TextInput
                style={[
                appStyles.input,
                {
                  borderRadius: 20,
                  backgroundColor: '#ffffff',
                }
                ]}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Confirm your new password"
                placeholderTextColor="#918E8E"
              />
            </View>
        </View>
        <Pressable style={[appStyles.saveButton]} onPress={() => { /* handle save changes */ }}>
          <Text style={appStyles.subtitleHeadline4}>Save Changes</Text>
        </Pressable>
    </View>
  );
}
