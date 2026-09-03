import type { ImageProps, ImageSourcePropType, StyleProp, ViewStyle } from 'react-native';
import { Image, Text, View } from 'react-native';
import { appStyles } from '@/styles/styles';

interface GardenerBubbleProps {
  message: string;
  title: string;
  avatarSource?: ImageSourcePropType;
  avatarResizeMode?: ImageProps['resizeMode'];
  style?: StyleProp<ViewStyle>;
  accessibilityLiveRegion?: 'none' | 'polite' | 'assertive';
}

export function GardenerBubble({
  message,
  title,
  avatarSource = require('@/assets/images/leo-pfp.png'),
  avatarResizeMode = 'cover',
  style,
  accessibilityLiveRegion = 'none',
}: GardenerBubbleProps) {
  return (
    <View
      style={[appStyles.agentPlanGreeting, style]}
      accessibilityLiveRegion={accessibilityLiveRegion}
    >
      <View style={appStyles.agentPlanAvatarClip}>
        <Image
          source={avatarSource}
          style={appStyles.agentPlanAvatar}
          resizeMode={avatarResizeMode}
        />
      </View>
      <View style={appStyles.agentPlanGreetingText}>
        <Text style={appStyles.agentPlanGreetingTitle}>{title}</Text>
        <Text style={appStyles.agentPlanGreetingBody}>{message}</Text>
      </View>
    </View>
  );
}
