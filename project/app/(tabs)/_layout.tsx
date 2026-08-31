import { Tabs } from "expo-router";
import { TabBar } from "@/components/tab-bar";

const TabLayout = () => {
  return (
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
  );
}

export default TabLayout;
