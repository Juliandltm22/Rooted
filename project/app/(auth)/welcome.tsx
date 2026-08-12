import { View, Text, TouchableOpacity, Image, Dimensions } from 'react-native'
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { appStyles } from '../../styles/styles'
import { AlignCenter, PlaneTakeoff } from 'lucide-react-native'
const plantImage = require('../../assets/images/plant-pot.png')
const { width: screenWidth } = Dimensions.get('window')

export default function Welcome() {
    return (
        <View style={{ flex: 1, backgroundColor: '#FCF9ED' }}>
            <SafeAreaView style={{ flex: 1 }} edges={['top', 'left', 'right']}>
                <Image source={plantImage} 
                    style={{
                        width: '90%',
                        height: undefined,
                        aspectRatio: 1,
                        alignSelf: 'center'
                }}
                />
                <View
                    style={[
                        appStyles.welcomeBlock,
                        {
                            borderTopLeftRadius: 24,
                            borderTopRightRadius: 24,
                            marginTop: 'auto',
                            paddingHorizontal: 24,
                            paddingTop: 17,
                            paddingBottom: 40,
                        },
                    ]}
                >
                    <Text
                        style={[
                            appStyles.titleLogo,
                            {
                                marginTop: 17,
                                textAlign: 'center',
                                color: 'black',
                                fontSize: screenWidth * 0.18
                            },
                        ]}>Rooted</Text>

                    <Text 
                        style={[
                            appStyles.subtitleHeadline2,
                            {
                                marginTop: 35,
                                textAlign: 'center',
                                color: 'black',
                                fontSize: screenWidth * 0.10
                            }
                        ]}>Lets Grow Together</Text>

                    <Text 
                        style={[
                            appStyles.bodyHeadline4,
                            {
                                textAlign: 'center',
                                marginTop: 25,
                                lineHeight: 26,
                                fontSize: screenWidth * 0.05
                            },
                        ]}
                        >Small, healthy habits can make a big difference care for your 
                        plant each day, and watch both of you grow together.</Text>

                    <TouchableOpacity 
                        onPress={() => router.push('/(auth)/login')}
                        style={[appStyles.button,
                        {
                            height: 60,
                            width: '100%',
                            marginTop: 35,
                            justifyContent: 'center',
                            alignItems: 'center'
                        }  
                        ]}
                        >
                        <Text style={[appStyles.subtitleHeadline4, { color: '#FFFFFF', fontSize: screenWidth * 0.065 }]}>Get Started</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        </View>
    )
}