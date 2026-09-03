import { StyleSheet } from 'react-native';
import { PlatformPressable } from 'expo-router/react-navigation';
import { Leaf, Droplet, BookText, Flower2, UserRound } from "lucide-react-native";
import { ReactElement } from 'react';

const icon: Record<string, (props: { color: string }) => ReactElement> = {
  care: ({ color }) => <Droplet color={color} size={32} strokeWidth={1.5} />,
  journal: ({ color }) => <BookText color={color} size={32} strokeWidth={1.5} />,
  index: ({ color }) => <Leaf color={color} size={32} strokeWidth={1.5} />,
  garden: ({ color }) => <Flower2 color={color} size={32} strokeWidth={1.5} />,
  profile: ({ color }) => <UserRound color={color} size={32} strokeWidth={1.5} />,
};

type TabBarButtonProps = {
  route: any;
  isFocused: boolean;
  options: any;
  onPress: () => void;
  onLongPress: () => void;
  buildHref: (name: string, params: any) => string | undefined;
};

export function TabBarButton({
  route,
  isFocused,
  options,
  onPress,
  onLongPress,
  buildHref,
}: TabBarButtonProps) {
  return (
    <PlatformPressable
      href={buildHref(route.name, route.params)}
      accessibilityState={isFocused ? { selected: true } : {}}
      accessibilityLabel={options.tabBarAccessibilityLabel}
      testID={options.tabBarButtonTestID}
      onPress={onPress}
      onLongPress={onLongPress}
      style={styles.tabbarItem}
    >
      {icon[route.name]({
        color: isFocused ? '#37423D' : '#ffffff',
      })}
    </PlatformPressable>
  );
}

const styles = StyleSheet.create({
  tabbarItem: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
});
