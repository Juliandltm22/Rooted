import { View, Text, TouchableOpacity, Image, Dimensions } from 'react-native'
import { router } from 'expo-router'
import { appStyles } from '../../styles/styles'
import { AlignCenter, PlaneTakeoff } from 'lucide-react-native'
const plantImage = require('../../assets/images/plant-pot.png')
const { width: screenWidth } = Dimensions.get('window')

export default function Welcome() {
    return (
        <View style={appStyles.backgroundColor}>
          <View style={appStyles.imageContainer}>
                <Image source={plantImage}
                    style={{
                        width: '100%',
                        height: undefined,
                        aspectRatio: 1,
                        alignSelf: 'center'
                }}
                />
          </View>
          <View style={appStyles.heroBlock}>
                    <Text
                        style={[
                            appStyles.titleLogo,
                            {
                                textAlign: 'center',
                            },
                        ]}>Rooted</Text>
            <View style={appStyles.introBlock}>
                    <Text
                        style={[
                            appStyles.subtitleHeadline2,
                            {
                                marginTop: 35,
                                textAlign: 'center',
                            }
                        ]}>Lets Grow Together</Text>

                    <Text
                        style={[
                            appStyles.bodyHeadline4,
                            {
                                textAlign: 'center',
                                marginTop: 15,
                            },
                        ]}
                        >Small, healthy habits can make a big difference care for your
                        plant each day, and watch both of you grow together.</Text>
                  </View>

                    <TouchableOpacity
                        onPress={() => router.push('/(auth)/login')}
                        style={[appStyles.button,
                        {
                            height: 60,
                            width: '100%',
                            marginTop: 30,
                            justifyContent: 'center',
                            alignItems: 'center'
                        }
                        ]}
                        >
                        <Text style={[appStyles.subtitleHeadline4, { color: '#FFFFFF', fontSize: screenWidth * 0.065 }]}>Get Started</Text>
                    </TouchableOpacity>
                </View>
        </View>
    )
}
