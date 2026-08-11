import { LayoutChangeEvent, StyleSheet, View } from 'react-native';
import { useLinkBuilder, useTheme } from '@react-navigation/native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useState } from 'react';
import Animated, { useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { TabBarButton } from './tab-bar-button';

export function TabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const { colors } = useTheme();
  const { buildHref } = useLinkBuilder();
  const [tabWidth, setTabWidth] = useState(0);

  const onTabBarLayout = (e: LayoutChangeEvent) => {
    setTabWidth(e.nativeEvent.layout.width / state.routes.length);
  };

  const animatedIndicatorStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: withTiming(state.index * tabWidth, { duration: 250 }) },
    ],
  }));

  return (
    <View style={styles.tabbar} onLayout={onTabBarLayout}>
      {tabWidth > 0 && (
        <Animated.View
          style={[styles.indicator, { width: tabWidth }, animatedIndicatorStyle]}
        >
          <View style={styles.indicatorCircle} />
        </Animated.View>
      )}

      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name, route.params);
          }
        };

        const onLongPress = () => {
          navigation.emit({
            type: 'tabLongPress',
            target: route.key,
          });
        };

        return (
          <TabBarButton
            key={route.key}
            route={route}
            isFocused={isFocused}
            options={options}
            onPress={onPress}
            onLongPress={onLongPress}
            buildHref={buildHref}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  tabbar: {
    position: 'absolute',
    bottom: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#899878',
    marginHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 50,
  },
  indicator: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  indicatorCircle: {
    width: 50,
    height: 50,
    borderRadius: 24,
    backgroundColor: '#D5B9B2',
  },
});
