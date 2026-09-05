import { View, Text, TextInput, Pressable, Alert } from 'react-native';
import { useState } from 'react';
import { router } from 'expo-router';
import { appStyles } from '@/styles/styles';
import { ScreenHeader } from '@/components/screen-header';
import { supabase } from '@/app/lib/supabase';

const MIN_PASSWORD_LENGTH = 8;

export default function ChangePassword() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (isSaving) {
      return;
    }

    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert('Missing information', 'Please fill in all three fields.');
      return;
    }
    if (newPassword.length < MIN_PASSWORD_LENGTH) {
      Alert.alert('Password too short', `Your new password must be at least ${MIN_PASSWORD_LENGTH} characters.`);
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert("Passwords don't match", 'Your new password and confirmation must match.');
      return;
    }
    if (newPassword === currentPassword) {
      Alert.alert('Choose a different password', 'Your new password must be different from your current one.');
      return;
    }

    setIsSaving(true);
    try {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData.user?.email) {
        throw userError ?? new Error('You need to be signed in to change your password.');
      }

      // Since supabase has no direct "check this password", we verify using a real sign-in
      const { error: verifyError } = await supabase.auth.signInWithPassword({
        email: userData.user.email,
        password: currentPassword,
      });
      if (verifyError) {
        Alert.alert('Incorrect password', 'Your current password is incorrect.');
        return;
      }

      const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });
      if (updateError) {
        throw updateError;
      }

      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      Alert.alert('Password updated', 'Your password has been changed.', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error) {
      Alert.alert(
        'Could not update password',
        error instanceof Error ? error.message : 'Please try again.',
      );
    } finally {
      setIsSaving(false);
    }
  };

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
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
            textContentType="password"
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
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
            textContentType="newPassword"
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
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
            textContentType="newPassword"
          />
        </View>
      </View>
      <Pressable
        style={[appStyles.saveButton, isSaving && { opacity: 0.6 }]}
        onPress={handleSave}
        disabled={isSaving}
      >
        <Text style={appStyles.subtitleHeadline4}>{isSaving ? 'Saving…' : 'Save Changes'}</Text>
      </Pressable>
    </View>
  );
}