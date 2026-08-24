import {
  Text,
  TextInput,
  View,
  Pressable,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Platform,
  ScrollView,
} from 'react-native';
import { appStyles } from '@/styles/styles';
import { useState } from 'react';
import { router } from 'expo-router';
import { ArrowRight } from 'lucide-react-native';

export default function Care() {
  const [userPrompt, setUserPrompt] = useState('');


  return (
  <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
        <View style={appStyles.backgroundContainer}>
      {/* Hero Section */}
      <View style={appStyles.careHero}>
        <View style={appStyles.careHeroText}>
          <Text style={appStyles.careGreeting}>
            Hello <Text style={appStyles.careGreetingName}>Julian</Text>, how are you feeling today?
          </Text>
        </View>
        <View style={appStyles.careHeroImageWrapper}>
          <Image
            source={require('@/assets/images/farmer-respira.png')}
            style={appStyles.careIllustration}
            resizeMode="contain"
          />
        </View>
      </View>
      {/* User Input Section */}
      <View style={appStyles.userInputContainer}>
        <Text style={appStyles.sectionLabel}>Want to share a little more?</Text>
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={true}
          indicatorStyle='default'
        >
          <TextInput
            style={appStyles.noteInput}
            value={userPrompt}
            onChangeText={setUserPrompt}
            placeholder="Anything on your mind?"
            placeholderTextColor="#918E8E"
            multiline={true}
            maxLength={500}
            textAlignVertical="top"
          />
                      </ScrollView>

        <Text style={appStyles.characterCount}>
          {userPrompt.length}/500
        </Text>
</View>

      {/* Next Button */}
      <View style={appStyles.nextContainer}>
        <Pressable
          style={appStyles.nextButton}
          onPress={() => {
            router.push('/care/agent')
          }}
        >
          <Text style={appStyles.nextButtonText}>Talk to my Gardener</Text>
          <ArrowRight color="#37423D" size={18} strokeWidth={1.8} />
        </Pressable>
            </View>
    </View>
    </KeyboardAvoidingView>
</TouchableWithoutFeedback>
  );
}
