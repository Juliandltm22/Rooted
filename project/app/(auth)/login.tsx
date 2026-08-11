// Takes care of all the login logic

import React, { useState } from 'react'
import { Alert, Text, TextInput, TouchableOpacity, View, Image, KeyboardAvoidingView, Platform, ScrollView} from 'react-native'
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { supabase } from '../lib/supabase'
import { appStyles } from '../../styles/styles'
import { UserRound, LockKeyhole } from 'lucide-react-native'
const plantImage = require('../../assets/images/plant-horizontal.png')



export default function Login() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const styles = appStyles
    
    async function signInWithEmail() {
        setLoading(true)
        const { error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password,
        })

        if (error) {
            Alert.alert(error.message)
        } else {
            router.replace('/')
        }
        setLoading(false)
    }

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#FCF9ED' }}>
            <KeyboardAvoidingView
                style={{ flex: 1, backgroundColor: '#FCF9ED' }}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                >
                    <ScrollView
                        contentContainerStyle={{ flexGrow: 1, backgroundColor: '#FCF9ED' }}
                        keyboardShouldPersistTaps="handled"
                    >
                    <View style={{ position: 'relative' }}>
                        <View style={{ paddingTop: 40, paddingLeft: 24 }}>
                            <Text style={[appStyles.subtitleHeadline2, { lineHeight: 40 }]}>
                                Continue Growing
                            </Text>
                            <Text style={[appStyles.subtitleHeadline2, { lineHeight: 40 }]}>
                                Your Healthy 
                            </Text>
                            <Text style={[appStyles.subtitleHeadline2, { lineHeight: 40 }]}>
                                Habits
                            </Text>
                        </View>

                        <Image
                            source={plantImage}
                            resizeMode="contain"
                            style={{
                                position: 'absolute',
                                top: 70,
                                left: 80,
                                width: 313,
                                height: 348
                            }}
                        />
                    </View>

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
                                paddingTop: 25
                            },
                        ]}>
                        
                        <Text style={[
                            appStyles.titleHeadline1,
                                {
                                    textAlign: 'center',
                                    fontSize: 60,
                                }
                        ]}>
                            Login
                        </Text>

                        <Text style={[
                            appStyles.bodyHeadline4,
                            {
                                textAlign: 'center',
                            },
                        ]}>
                            Dont Have an Account?{' '}
                            <Text
                                style={{ color: '#D1B3C4', fontWeight: '600' }}
                                onPress={() => router.push('/(auth)/signup')}
                            >
                                Sign Up
                            </Text>
                        </Text>
                        
                        <View style={[styles.verticallySpaced, styles.mt20]}>
                            <View style={{ position: 'relative', justifyContent: 'center' }}>
                                    <UserRound
                                        size={18}
                                    color='#37423D80'
                                        style={{ position: 'absolute', left: 20, zIndex: 1 }}
                                    />
                                    <TextInput
                                        onChangeText={(text) => setEmail(text)}
                                        value={email}
                                        placeholder="Email"
                                    placeholderTextColor='#37423D80'
                                        autoCapitalize="none"
                                        style={[
                                            styles.input,
                                            {
                                                backgroundColor: '#D5B9B280',
                                                borderRadius: 30,
                                                borderColor: '#D5B9B280',
                                                width: 358,
                                                height: 60,
                                                paddingLeft: 48
                                            }
                                        ]}
                                    />
                            </View>
                        </View>

                        <View style={styles.verticallySpaced}>
                            <View style={{ position: 'relative', justifyContent: 'center' }}>
                                <LockKeyhole
                                    size={18}
                                    color='#37423D80'
                                    style={{ position: 'absolute', left: 20, zIndex: 1 }}
                                />
                                <TextInput
                                    onChangeText={(text) => setPassword(text)}
                                    value={password}
                                    secureTextEntry={true}
                                    placeholder="Password"
                                    placeholderTextColor='#37423D80'
                                    autoCapitalize="none"
                                    style={[
                                        styles.input,
                                        {
                                            backgroundColor: '#D5B9B280',
                                            borderRadius: 30,
                                            borderColor: '#D5B9B280',
                                            width: 358,
                                            height: 60,
                                            paddingLeft: 48
                                        }
                                    ]}
                                />
                            </View>
                        </View>

                        <View style={[styles.verticallySpaced, styles.mt20]}>
                            <TouchableOpacity
                                style={[
                                    styles.button, loading && styles.buttonDisabled,
                                    {
                                        height: 60,
                                        width: 358,
                                        paddingTop: 16
                                    }

                                ]}
                                onPress={() => signInWithEmail()}
                                disabled={loading}
                            >
                                <Text style={[
                                    styles.subtitleHeadline4,
                                    {
                                        color: '#FFFFFF',
                                        fontSize: 25
                                    } 
                                ]}>Login</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>   
        </SafeAreaView>
    )
}
