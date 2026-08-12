import { Text, TextInput, View, Pressable, Image } from 'react-native';
import { appStyles } from '@/styles/styles';
import { useState } from 'react';
import { router } from 'expo-router';
import { Minus, Plus, ArrowRight } from 'lucide-react-native';
import { Background } from '@react-navigation/elements';

export default function Care() {
  const [userPrompt, setUserPrompt] = useState('');


  return (
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
        <TextInput
            style={appStyles.noteInput}
            value={userPrompt}
            onChangeText={setUserPrompt}
            placeholder="Anything on your mind?"
            placeholderTextColor="#918E8E"
          />
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
  );
}
