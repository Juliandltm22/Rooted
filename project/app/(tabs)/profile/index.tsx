import { Text, View, Pressable, ScrollView, Alert, Image } from "react-native";
import { appStyles } from '@/styles/styles';
import { useCallback, useState } from 'react';
import { UserPen, Lock, LogOut, ChevronRight, Sprout, Flower, Bell, Users, Shield } from "lucide-react-native";
import { router, useFocusEffect } from "expo-router";
import { LogoutModal } from '@/components/logout-modal';
import { NotificationModal } from '@/components/notification-modal';
import { supabase } from '../../lib/supabase'
import { DEFAULT_GARDENER_ID, fetchSelectedGardenerId, getGardenerById, type GardenerId } from '@/app/lib/gardener';
import { fetchProfileFields, fetchGrowingDays } from '@/app/lib/profile';


export default function Profile() {
  const [logoutVisible, setLogoutVisible] = useState(false);
  const [notificationVisible, setNotificationVisible] = useState(false);
  const [selectedGardenerId, setSelectedGardenerId] = useState<GardenerId>(DEFAULT_GARDENER_ID);
  const [name, setName] = useState('');
  const [growingDays, setGrowingDays] = useState(0);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      (async () => {
        const [gardenerId, profileFields, days] = await Promise.all([
          fetchSelectedGardenerId(),
          fetchProfileFields(),
          fetchGrowingDays(),
        ]);
        if (isActive) {
          setSelectedGardenerId(gardenerId);
          setName(profileFields.name);
          setGrowingDays(days);
        }
      })();

      return () => {
        isActive = false;
      };
    }, []),
  );

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) {
      Alert.alert(error.message)
      return
    }
    setLogoutVisible(false);
    router.replace('/(auth)/welcome')
  };

  const handleNotification = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) {
      Alert.alert(error.message)
      return
    }
    setNotificationVisible(false);
  };

  return (
    <View style={appStyles.backgroundContainer}>
      {/* Profile Section */}
      <View style={appStyles.profileContainer}>
        <Image
          source={getGardenerById(selectedGardenerId).image}
          style={appStyles.profileCircleImage}
          resizeMode="cover"
        />
        <Text style={appStyles.titleHeadline1}>{name}</Text>
        <Text style={appStyles.subtitleParagraph}> Growing for {growingDays} day{growingDays === 1 ? '' : 's'} </Text>
        <View style={appStyles.profileStatusContainer}>
          <View style={appStyles.statsContainer}>
            <Text style={appStyles.subtitleParagraph}>Thriving</Text>
          </View>
        </View>
      </View>
      <ScrollView
        style={appStyles.backgroundContainer}
        contentContainerStyle={appStyles.scrollContent}
      >
        <View style={appStyles.settingContainer}>


          {/* Account Section */}
          <View style={appStyles.accountContainer}>
            <Text style={[appStyles.subtitleParagraph, { fontFamily: 'Raleway-SemiBold' }]}>ACCOUNT</Text>
            <View style={appStyles.settingsCard}>
              <Pressable style={appStyles.settingRow} onPress={() => { router.push('/profile/edit-profile') }}>
                <View style={appStyles.settingRowLeft}>
                  <UserPen color="#918E8E" />
                  <Text style={[appStyles.subtitleHeadline4, { color: '#918E8E' }]}>Edit Profile</Text>
                </View>
                <ChevronRight color="#918E8E" />
              </Pressable>

              <View style={appStyles.divider} />

              <Pressable style={appStyles.settingRow} onPress={() => { router.push('/profile/change-password') }}>
                <View style={appStyles.settingRowLeft}>
                  <Lock color="#918E8E" />
                  <Text style={[appStyles.subtitleHeadline4, { color: '#918E8E' }]}>Change Password</Text>
                </View>
                <ChevronRight color="#918E8E" />
              </Pressable>

              <View style={appStyles.divider} />

              <Pressable style={appStyles.settingRow} onPress={() => setLogoutVisible(true)}>
                <View style={appStyles.settingRowLeft}>
                  <LogOut color="#918E8E" />
                  <Text style={[appStyles.subtitleHeadline4, { color: '#918E8E' }]}>Log Out</Text>
                </View>
                <ChevronRight color="#D5B9B2" />
              </Pressable>
            </View>
          </View>


          {/* My Plant Section */}
          <View style={appStyles.myPlantContainer}>
            <Text style={[appStyles.subtitleParagraph, { fontFamily: 'Raleway-SemiBold' }]}>MY PLANT</Text>
            <View style={appStyles.settingsCard}>
              <Pressable style={appStyles.settingRow} onPress={() => { router.push('/profile/change-species') }}>
                <View style={appStyles.settingRowLeft}>
                  <Sprout color="#918E8E" />
                  <Text style={[appStyles.subtitleHeadline4, { color: '#918E8E' }]}>Change Species</Text>
                </View>
                <ChevronRight color="#918E8E" />
              </Pressable>

              <View style={appStyles.divider} />

              <Pressable style={appStyles.settingRow} onPress={() => { router.push('/profile/change-pot') }}>
                <View style={appStyles.settingRowLeft}>
                  <Flower color="#918E8E" />
                  <Text style={[appStyles.subtitleHeadline4, { color: '#918E8E' }]}>Change Pot</Text>
                </View>
                <ChevronRight color="#918E8E" />
              </Pressable>
            </View>
          </View>
          {/* Social Section */}
          <View style={appStyles.socialContainer}>
            <Text style={[appStyles.subtitleParagraph, { fontFamily: 'Raleway-SemiBold' }]}>SOCIAL</Text>
            <View style={appStyles.settingsCard}>
              <Pressable style={appStyles.settingRow} onPress={() => setNotificationVisible(true)}>
                <View style={appStyles.settingRowLeft}>
                  <Bell color="#918E8E" />
                  <Text style={[appStyles.subtitleHeadline4, { color: '#918E8E' }]}>Notifications</Text>
                </View>
                <ChevronRight color="#918E8E" />
              </Pressable>

              <View style={appStyles.divider} />

              <Pressable style={appStyles.settingRow} onPress={() => { router.push('/profile/privacy') }}>
                <View style={appStyles.settingRowLeft}>
                  <Shield color="#D5B9B2" />
                  <Text style={[appStyles.subtitleHeadline4, { color: '#D5B9B2' }]}>Privacy</Text>
                </View>
                <ChevronRight color="#D5B9B2" />
              </Pressable>
            </View>
          </View>
        </View>
        <LogoutModal
          visible={logoutVisible}
          onClose={() => setLogoutVisible(false)}
          onConfirm={handleLogout}
        />
        <NotificationModal
          visible={notificationVisible}
          onClose={() => setNotificationVisible(false)}
          onConfirm={handleNotification}
        />
      </ScrollView>
    </View>
  );
}
