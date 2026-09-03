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
import { useCallback, useState } from 'react';
import { router, useFocusEffect } from 'expo-router';
import { ArrowRight } from 'lucide-react-native';
import { useCareResponses } from './care-responses';
import { fetchProfileFields } from '@/app/lib/profile';

export default function Care() {
  const { responses, setAdditionalFeelings, ensureCurrentDay } = useCareResponses();
  const [isStartingPlan, setIsStartingPlan] = useState(false);
  const [profileName, setProfileName] = useState('');
  const canStartPlan = Boolean(responses.emotion) && responses.sleepHours !== null;

  const handleAdditionalFeelingsChange = (additionalFeelings: string) => {
    if (ensureCurrentDay()) {
      router.replace('/care');
      return;
    }

    setAdditionalFeelings(additionalFeelings);
  };

  useFocusEffect(
    useCallback(() => {
      setIsStartingPlan(false);
      if (ensureCurrentDay()) {
        router.replace('/care');
      }
    }, [ensureCurrentDay]),
  );

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      (async () => {
        const profileFields = await fetchProfileFields();
        if (isActive) {
          setProfileName(profileFields.name);
        }
      })();

      return () => {
        isActive = false;
      };
    }, []),
  );


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
                Hello{profileName ? <Text style={appStyles.careGreetingName}> {profileName}</Text> : ''}, how are you feeling today?
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
                value={responses.additionalFeelings}
                onChangeText={handleAdditionalFeelingsChange}
                placeholder="Anything on your mind?"
                placeholderTextColor="#918E8E"
                multiline={true}
                maxLength={500}
                textAlignVertical="top"
              />
            </ScrollView>

            <Text style={appStyles.characterCount}>
              {responses.additionalFeelings.length}/500
            </Text>
          </View>

          {/* Next Button */}
          <View style={appStyles.nextContainer}>
            <Pressable
              style={[appStyles.nextButton, (!canStartPlan || isStartingPlan) && appStyles.nextButtonDisabled]}
              disabled={!canStartPlan || isStartingPlan}
              onPress={() => {
                if (ensureCurrentDay()) {
                  setIsStartingPlan(false);
                  router.replace('/care');
                  return;
                }

                setIsStartingPlan(true);
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