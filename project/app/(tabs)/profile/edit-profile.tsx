import { Text, TextInput, View, Pressable, Image, Alert, ActivityIndicator } from 'react-native';
import { useCallback, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { Check } from 'lucide-react-native';
import { appStyles } from '@/styles/styles';
import { ScreenHeader } from '@/components/screen-header';
import {
  DEFAULT_GARDENER_ID,
  fetchSelectedGardenerId,
  getGardenerById,
  saveSelectedGardenerId,
  GARDENERS,
  type GardenerId,
} from '@/app/lib/gardener';
import { fetchProfileFields, saveProfileFields } from '@/app/lib/profile';

export default function EditProfile() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [selectedGardenerId, setSelectedGardenerId] = useState<GardenerId>(DEFAULT_GARDENER_ID);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      (async () => {
        setIsLoading(true);
        const [gardenerId, profileFields] = await Promise.all([
          fetchSelectedGardenerId(),
          fetchProfileFields(),
        ]);
        if (isActive) {
          setSelectedGardenerId(gardenerId);
          setName(profileFields.name);
          setEmail(profileFields.email);
          setIsLoading(false);
        }
      })();

      return () => {
        isActive = false;
      };
    }, []),
  );

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await Promise.all([
        saveSelectedGardenerId(selectedGardenerId),
        saveProfileFields({ name, email }),
      ]);
    } catch (error) {
      Alert.alert(
        'Could not save your changes',
        error instanceof Error ? error.message : 'Please try again.',
      );
      return;
    } finally {
      setIsSaving(false);
    }
  };

  const previewImage = getGardenerById(selectedGardenerId).image;

  return (
    <View style={appStyles.backgroundContainer}>
      <ScreenHeader title="Edit Profile" />
      <View style={appStyles.screenContent}>
        <Image source={previewImage} style={appStyles.profileCircleImage2} resizeMode="cover" />
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
            placeholder="Enter your name"
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
            placeholder="Enter your email"
            placeholderTextColor="#918E8E"
          />
        </View>
      </View>
      <View style={appStyles.gardenerPicker}>
        <Text style={appStyles.subtitleHeadline4}>Pick your Gardener</Text>
        {isLoading ? (
          <ActivityIndicator color="#899878" />
        ) : (
          <View style={appStyles.gardenerOptionsRow}>
            {GARDENERS.map((gardener) => {
              const isSelected = gardener.id === selectedGardenerId;
              return (
                <View key={gardener.id} style={appStyles.gardenerOptionColumn}>
                  <Pressable
                    style={[appStyles.gardenerOption, isSelected && appStyles.gardenerOptionSelected]}
                    onPress={() => setSelectedGardenerId(gardener.id)}
                    accessibilityRole="button"
                    accessibilityState={{ selected: isSelected }}
                    accessibilityLabel={`Choose ${gardener.name} as your Gardener`}
                  >
                    <View style={appStyles.gardenerOptionImageWrapper}>
                      <Image
                        source={gardener.image}
                        style={appStyles.gardenerOptionImage}
                        resizeMode="cover"
                      />
                    </View>
                    {isSelected && (
                      <View style={appStyles.gardenerOptionCheck}>
                        <Check color="#FCF9ED" size={14} strokeWidth={3} />
                      </View>
                    )}
                  </Pressable>
                  <Text style={[appStyles.subtitleParagraph, appStyles.gardenerOptionLabel]}>
                    {gardener.name}
                  </Text>
                </View>
              );
            })}
          </View>
        )}
      </View>
      <Pressable style={[appStyles.saveButton]} onPress={handleSave} disabled={isSaving}>
        <Text style={appStyles.subtitleHeadline4}>{isSaving ? 'Saving…' : 'Save Changes'}</Text>
      </Pressable>
    </View>
  );
}
