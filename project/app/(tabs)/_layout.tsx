import { Tabs } from "expo-router";
import { StyleSheet, View } from 'react-native';
import { TabBar } from "@/components/tab-bar";
import { PlantGardenerNotification } from '@/components/plant-gardener-notification';
import { PlantNotificationProvider } from '@/context/plant-notification-context';

const TabLayout = () => {
  return (
    <PlantNotificationProvider>
      <View style={styles.container}>
        <Tabs
          tabBar={(props) => <TabBar {...props} />}
          screenOptions={{
            headerShown: false,
          }}
        >
          <Tabs.Screen name="care" options={{ title: "Care", }} />
          <Tabs.Screen name="journal" options={{ title: "Journal", }}/>
          <Tabs.Screen name="index" options={{ title: "My Plant", }}/>
          <Tabs.Screen name="profile" options={{ title: "Profile", }}/>
        </Tabs>
        <PlantGardenerNotification />
      </View>
    </PlantNotificationProvider>
  );
}

export default TabLayout;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
