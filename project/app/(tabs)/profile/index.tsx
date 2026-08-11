import { Text, View, Pressable, ScrollView, Alert } from "react-native";
import { appStyles } from '@/styles/styles';
import { useState } from 'react';
import { UserPen, Lock, LogOut, ChevronRight, Sprout, Flower, Bell, Users, Shield } from "lucide-react-native";
import { router } from "expo-router";
import { LogoutModal } from '@/components/logout-modal';
import { NotificationModal } from '@/components/notification-modal';
import { supabase } from '../../lib/supabase'


export default function Profile() {
  const [logoutVisible, setLogoutVisible] = useState(false);
  const [notificationVisible, setNotificationVisible] = useState(false);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) {
      Alert.alert(error.message)
      return
    }
    setLogoutVisible(false);
    setNotificationVisible(false);
    router.replace('/(auth)/welcome')
  };

  return (
    <View style={appStyles.backgroundContainer}>
      {/* Profile Section */}
      <View style={appStyles.profileContainer}>
        <View style={appStyles.profileCircle} />
        <Text style={appStyles.titleHeadline1}>Julian</Text>
        <Text style={appStyles.subtitleParagraph}>Growing for 23 days</Text>
        <View style={appStyles.profileStatusContainer}>
          <View style={appStyles.streakContainer}>
            <Text style={appStyles.subtitleParagraph}>7 streak 🔥</Text>
          </View>
          <View style={appStyles.statsContainer}>
            <Text style={appStyles.subtitleParagraph}>Thriving</Text>
          </View>
          <View style={appStyles.friendsContainer}>
            <Text style={appStyles.subtitleParagraph}>5 friends 😊</Text>
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

              <Pressable style={appStyles.settingRow} onPress={() => { router.push('/profile/friends-list') }}>
                <View style={appStyles.settingRowLeft}>
                  <Users color="#918E8E" />
                  <Text style={[appStyles.subtitleHeadline4, { color: '#918E8E' }]}>Friends List</Text>
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
          onConfirm={handleLogout}
        />
      </ScrollView>
    </View>
  );
}
