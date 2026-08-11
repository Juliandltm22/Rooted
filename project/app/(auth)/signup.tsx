// Takes care of all signup logic

import React, { useState } from 'react'
import { Alert, Text, TextInput, TouchableOpacity, View, Image, KeyboardAvoidingView, Platform, ScrollView } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { supabase } from '../lib/supabase'
import { appStyles } from '../../styles/styles'
import { Mail, LockKeyhole } from 'lucide-react-native'
const plantImage = require('../../assets/images/plant-horizontal.png')

export default function Signup() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const styles = appStyles


        async function signUpWithEmail() {
            if (password !== confirmPassword) {
                Alert.alert("Passwords don't match")
                return
            }

            setLoading(true)
            const { error } = await supabase.auth.signUp({
                email: email,
                password: password,
                
            })
    
            if (error){
                Alert.alert(error.message)
            } else {
                router.replace('/')
            }
            setLoading(false)
        }


    return (
        <View style={{ flex: 1, backgroundColor: '#FCF9ED' }}>
            <SafeAreaView style={{ flex: 1 }} edges={['top', 'left', 'right']}>
                <KeyboardAvoidingView
                    style={{ flex: 1 }}
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                >
                    <ScrollView
                        contentContainerStyle={{ flexGrow: 1 }}
                        keyboardShouldPersistTaps='handled'
                    >
                        <View style={{ position: 'relative' }}>
                            <View style={{ paddingTop: 40, paddingLeft: 24 }}>
                                <Text style={[appStyles.subtitleHeadline2, { lineHeight: 40 }]}>
                                    Create Your Account
                                </Text>
                                <Text style={[appStyles.subtitleHeadline2, { lineHeight: 40 }]}>
                                    and Start Growing
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
                                    borderTopLeftRadius: 24,
                                    borderTopRightRadius: 24,
                                    paddingHorizontal: 24,
                                    paddingTop: 25,
                                    paddingBottom: 40,
                                    marginTop: 225,
                                    flexGrow: 1
                                },
                            ]}>

                            <Text style={[
                                appStyles.titleHeadline1,
                                    {
                                        textAlign: 'center',
                                        paddingRight: 10,
                                        fontSize: 60
                                    }
                            ]}>
                                Sign Up
                            </Text>

                            <Text style={[
                                appStyles.bodyHeadline4,
                                {
                                    textAlign: 'center',

                                },
                            ]}>
                                Already Have an Account?{' '}
                                <Text
                                    style={{ color: '#D1B3C4', fontWeight: '600' }}
                                    onPress={() => router.push('/(auth)/login')}
                                >
                                    Login
                                </Text>
                            </Text>

                            <View style={[styles.verticallySpaced, styles.mt20]}>
                                <View style={{ position: 'relative', justifyContent: 'center' }}>
                                    <Mail
                                        size={18}
                                        color='#37423D80'
                                        style={{ position: 'absolute', left: 20, zIndex: 1 }}
                                    />
                                    <TextInput
                                        onChangeText={(text) => setEmail(text)}
                                        value={email}
                                        placeholder="Enter your email address" 
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

                            <View style={[
                                styles.verticallySpaced,
                                    {
                                        paddingTop: 10
                                    }
                                ]}>
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

                            <View style={[
                                styles.verticallySpaced,
                                    {
                                        paddingTop: 10
                                    }
                                ]}>
                                <View style={{ position: 'relative', justifyContent: 'center' }}>
                                    <LockKeyhole
                                        size={18}
                                        color='#37423D80'
                                        style={{ position: 'absolute', left: 20, zIndex: 1 }}
                                    />
                                    <TextInput
                                        onChangeText={(text) => setConfirmPassword(text)}
                                        value={confirmPassword}
                                        secureTextEntry={true}
                                        placeholder="Confirm Password"
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

                            <View style={[
                                styles.verticallySpaced,
                                    {
                                        paddingTop: 10
                                    }
                                ]}>
                                <TouchableOpacity
                                    style={[styles.button, loading && styles.buttonDisabled,
                                        {
                                            width: 358,
                                            height: 60,
                                            paddingTop: 16
                                        }
                                    ]}
                                    onPress={() => signUpWithEmail()}
                                    disabled={loading}
                                >
                                    <Text style={[
                                        styles.subtitleHeadline4,
                                            {
                                                color: '#FFFFFF',
                                                fontSize: 25
                                            }
                                        ]}>Sign up</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </ScrollView>
                </KeyboardAvoidingView>
            </SafeAreaView> 
        </View>
    )
}
