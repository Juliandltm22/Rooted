import { Text, View, Pressable, Image, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { useCallback, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { Check } from 'lucide-react-native';
import { appStyles } from '@/styles/styles';
import { ScreenHeader } from '@/components/screen-header';
import {
  DEFAULT_POT_COLOR_ID,
  fetchSelectedPotColorId,
  getPotColorById,
  saveSelectedPotColorId,
  POT_COLORS,
  type PotColorId,
} from '@/app/lib/pot';

export default function ChangePot() {
  const [selectedPot, setSelectedPot] = useState<PotColorId>(DEFAULT_POT_COLOR_ID);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      (async () => {
        setIsLoading(true);
        const potColorId = await fetchSelectedPotColorId();
        if (isActive) {
          setSelectedPot(potColorId);
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
      await saveSelectedPotColorId(selectedPot);
    } catch (error) {
      Alert.alert(
        'Could not save your pot',
        error instanceof Error ? error.message : 'Please try again.',
      );
      return;
    } finally {
      setIsSaving(false);
    }
  };

  const previewPot = getPotColorById(selectedPot);

  return (
    <View style={appStyles.backgroundContainer}>
      <ScreenHeader title="Change Pot" />
      <ScrollView contentContainerStyle={{ paddingBottom: 140 }} showsVerticalScrollIndicator={false}>
        <View style={appStyles.gardenerPicker}>
          <View style={appStyles.speciesOptionsRow}>
            {POT_COLORS.map((pot) => {
              const isSelected = pot.id === selectedPot;
              return (
                <Pressable
                  key={pot.id}
                  disabled={isLoading}
                  style={({ pressed }) => [
                    appStyles.speciesOption,
                    appStyles.potOption,
                    isSelected && appStyles.potOptionSelected,
                    pressed && appStyles.speciesOptionPressed,
                  ]}
                  onPress={() => setSelectedPot(pot.id)}
                  accessibilityRole="button"
                  accessibilityState={{ selected: isSelected }}
                  accessibilityLabel={`Choose ${pot.label}`}
                >
                  <Image source={pot.image} style={appStyles.speciesOptionImage} resizeMode="contain" />
                  <Text style={[appStyles.subtitleHeadline4, appStyles.speciesOptionLabel]}>
                    {pot.label}
                  </Text>
                  {isSelected && (
                    <View style={appStyles.gardenerOptionCheck}>
                      <Check color="#FCF9ED" size={14} strokeWidth={3} />
                    </View>
                  )}
                </Pressable>
              );
            })}
          </View>

          <View style={appStyles.potPreviewContainer}>
            <Text style={[appStyles.subtitleParagraph, appStyles.potPreviewLabel, { fontFamily: 'Raleway-SemiBold' }]}>
              SELECTED
            </Text>
            {isLoading ? (
              <ActivityIndicator color="#899878" style={{ marginTop: 24 }} />
            ) : (
              <Image source={previewPot.image} style={appStyles.potPreviewImage} resizeMode="contain" />
            )}
          </View>

          <Pressable
            style={[appStyles.saveButton, appStyles.saveButtonCompact, isSaving && { opacity: 0.6 }]}
            onPress={handleSave}
            disabled={isSaving || isLoading}
          >
            <Text style={appStyles.subtitleHeadline4}>{isSaving ? 'Saving…' : 'Save Changes'}</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}