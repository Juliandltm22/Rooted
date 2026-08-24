import { View, Text, TouchableOpacity } from 'react-native'
import { router } from 'expo-router'
import { ChevronLeft } from 'lucide-react-native'
import { appStyles } from '@/styles/styles'

export default function VisitFriend() {
    return (
        <View style={appStyles.backgroundContainer}>
            <TouchableOpacity
                onPress={() => router.back()}
                style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingHorizontal: 20,
                    paddingTop: 60,
                }}
            >
                <ChevronLeft size={24} color="#37423D" />
                <Text style={[appStyles.subtitleParagraph, { marginLeft: 4 }]}>Back</Text>
            </TouchableOpacity>

            <Text style={appStyles.titleHeadline3}>Coming soon</Text>
        </View>
    )
}