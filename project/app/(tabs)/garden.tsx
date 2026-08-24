import { Text, View, TouchableOpacity, ScrollView, Image } from "react-native";
import { router } from 'expo-router'
import { Plus, Navigation } from 'lucide-react-native'
import { appStyles } from '../../styles/styles'

// Hardcoding friend data
const friends = [
  { id: '1', name: 'Desire', stage: 'Sprout', status: 'Needs water' },
  { id: '2', name: 'Delaila', stage: 'Sprout', status: 'Thriving' },
  { id: '3', name: 'Jesus', stage: 'Sprout', status: 'Calm' },
  { id: '4', name: 'Jack', stage: 'Sprout', status: 'Growing' },
]

// Maps each status string to a color
function getStatusStyle(status: string) {
  switch(status) {
    case 'Needs water':
      return { backgroundColor: '#CFE3F2', color: '#3A6B8A' }
    case 'Thriving':
      return { backgroundColor: '#DDE7C7', color: '#5B7A3A' }
    case 'Calm':
      return { backgroundColor: '#E8D9DE', color: '#8A5A6B' }
    case 'Growing':
      return { backgroundColor: '#E0E0E0', color: '#555555' }
    default:
      return { backgroundColor: '#E0E0E0', color: '#555555' }
  }
}

export default function Index() {
  const styles = appStyles;

  return (
    <View style={appStyles.backgroundContainer}>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingHorizontal: 20,
          paddingTop: 64,
          paddingBottom: 10,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text style={[
            appStyles.titleHeadline1,
            {
              fontSize: 45,
            }
            ]}>Friend's Garden</Text>
          <View
            style={{
              backgroundColor: '#DDE7C7',
              borderRadius: 12,
              paddingHorizontal: 10,
              paddingVertical: 2,
              marginLeft: 8,
            }}
          >
            <Text style={[appStyles.subtitleParagraph, { color: '#37423D', marginBottom: 2 }]}>
              {friends.length}
            </Text>
          </View>
        </View>
        <TouchableOpacity
          onPress={() => {
            // TODO: ADD LOGIC TO ADD A FRIEND
          }}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: '#8A9A7E',
            borderRadius: 20,
            paddingHorizontal: 14,
            paddingVertical: 8,
          }}
        >
          <Plus size={16} color='#FFFFFF' />
          <Text style={[appStyles.subtitleParagraph, { color: '#FFFFFF', marginLeft: 4 }]}>
            Add Friend
          </Text> 
        </TouchableOpacity>
      </View>

      {/* Friend cards grid */}
      <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100 }}>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
          {friends.map((friend) => {
            const statusStyle = getStatusStyle(friend.status)
            return (
              <View
                key={friend.id}
                style={{
                  width: '48%',
                  backgroundColor: '#FFFFFF',
                  borderRadius: 20,
                  padding: 16,
                  marginBottom: 16,
                  alignItems: 'center',
                  shadowColor: '#000',
                  shadowOpacity: 0.05,
                  shadowRadius: 6,
                  shadowOffset: { width: 0, height: 2 },
                  elevation: 2,
                }}
              >

                <Image
                  source={require('@/assets/images/friends-plant.png')}
                  resizeMode="contain"
                  style={{ width: 70, height: 70, marginBottom: 8 }}
                />

                <Text style={[appStyles.titleHeadline3, { marginBottom: 2 }]}>
                  {friend.name}
                </Text>
                <Text style={[appStyles.subtitleParagraph, { color: '#918E8E', marginBottom: 10 }]}>
                  {friend.stage}
                </Text>

                <View
                  style={{
                    backgroundColor: statusStyle.backgroundColor,
                    borderRadius: 14,
                    paddingHorizontal: 14,
                    paddingVertical: 4,
                    marginBottom: 12,
                  }}
                >
                  <Text style={{ color: statusStyle.color, fontFamily: 'Raleway-SemiBold', fontSize: 13 }}>
                    {friend.status}
                  </Text>
                </View>

                <TouchableOpacity
                  onPress={() => router.push({ pathname: '/garden/[id]', params: { id: friend.id } })}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: '#D5B9B2',
                    borderRadius: 20,
                    paddingVertical: 8,
                    width: '100%',
                  }}
                >
                  <Navigation size={14} color="#FFFFFF" />
                  <Text style={[appStyles.subtitleParagraph, { color: '#FFFFFF', marginLeft: 6 }]}>
                    Visit
                  </Text>
                </TouchableOpacity>
              </View>
            )
          })}
        </View>
      </ScrollView>
    </View>
  )
}
