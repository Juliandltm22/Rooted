import { View, Text, TouchableOpacity, Image } from 'react-native'
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { appStyles } from '../../styles/styles'
import { AlignCenter, PlaneTakeoff } from 'lucide-react-native'
const plantImage = require('../../assets/images/plant-pot.png')

export default function Welcome() {
    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#FCF9ED'}}>
            <Image source={plantImage} 
                style={{
                    width: 431,
                    height: 431,
                    alignSelf: 'center'
            }}
            />
            <View
                style={[
                    appStyles.welcomeBlock,
                    {
                        maxHeight: 420,
                        borderTopLeftRadius: 24,
                        borderTopRightRadius: 24,
                        marginTop: 'auto',
                        marginBottom: -40,
                        paddingHorizontal: 24,
                        paddingTop: 17,
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
                            fontSize: 70
                        },
                    ]}>Rooted</Text>

                <Text 
                    style={[
                        appStyles.subtitleHeadline2,
                        {
                            marginTop: 28,
                            textAlign: 'center',
                            color: 'black',
                            fontSize: 40
                        }
                    ]}>Lets Grow Together</Text>

                <Text 
                    style={[
                        appStyles.bodyHeadline4,
                        {
                            textAlign: 'center',
                            marginTop: 15,
                            lineHeight: 26,
                            fontSize: 20
                        },
                    ]}
                    >Small, healthy habits can make a big difference care for your 
                    plant each day, and watch both of you grow together.</Text>

                <TouchableOpacity 
                    onPress={() => router.push('/(auth)/login')}
                    style={[appStyles.button,
                      {
                        height: 60,
                        width: 355,
                        marginTop: 25,
                        paddingTop: 16
                      }  
                    ]}
                    >
                    <Text style={[appStyles.subtitleHeadline4, { color: '#FFFFFF', fontSize: 25 }]}>Get Started</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    )
}