import { Text, TextInput, View, Pressable, Image } from 'react-native';
import { appStyles } from '@/styles/styles';
import { useState } from 'react';
import { router } from 'expo-router';
import { Minus, Plus, ArrowRight } from 'lucide-react-native';
import { Background } from '@react-navigation/elements';

export default function Care() {

  return (
    <View style={appStyles.agentBackgroundContainer}>
      {/* Hero Section */}
      <View style={appStyles.agentHero}>
        <View style={appStyles.careHeroText}>
          <Text style={appStyles.careGreeting}>
            Thank you for sharing, <Text style={appStyles.careGreetingName}>Julian</Text>.
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
    </View>
  );
}
