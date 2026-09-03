// Serves as the manager file. Determines when and which screen is shown
// Traffic cop

import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { Redirect } from 'expo-router'
import Account from '../../components/Accounts'
import { View } from 'react-native'
import { appStyles } from '../../styles/styles'

export default function App() {
  const [userId, setUserId] = useState<string | null>(null)
  const [email, setEmail] = useState<string | undefined>(undefined)
  const [checkingSession, setCheckingSession] = useState(true)
  const styles = appStyles;

  useEffect(() => {
    supabase.auth.getClaims().then(({ data, error }) => {
      // Checking if the user is currently logged in
      if (error || !data) {
        setUserId(null) // If logged in, save the user id
        setEmail(undefined)
      } else {
        const { claims } = data
        if (claims) {
          setUserId(claims.sub)
          setEmail(claims.email)
        }
      }
      setCheckingSession(false)
    })

    const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, _session) => {
      const { data, error } = await supabase.auth.getClaims()
      if (error || !data?.claims) {
        setUserId(null)
        setEmail(undefined)
        return
      }
      setUserId(data.claims.sub)
      setEmail(data.claims.email)
    })

    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [])

  if (checkingSession) {
    return <View />
  }

  if (!userId) {
    return <Redirect href="/(auth)/welcome" />
  }

  return <Account key={userId} userId={userId} email={email} />
}
