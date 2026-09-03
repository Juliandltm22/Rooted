import { View, Pressable, Text } from 'react-native';
import { router } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { appStyles } from '@/styles/styles';

type ScreenHeaderProps = {
  title: string;
};

export function ScreenHeader({ title }: ScreenHeaderProps) {
  return (
    <View style={appStyles.screenHeader}>
      <Pressable onPress={() => router.back()} hitSlop={10}>
        <ChevronLeft color="#37423D" size={30} />
      </Pressable>
      <Text style={appStyles.titleHeadline2}>{title}</Text>
      <View style={{ width: 26 }} />
    </View>
  );
}
