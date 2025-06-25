
import { createClient } from '@supabase/supabase-js'

// Get Supabase configuration from environment variables
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.')
}

// Create client with additional options for debugging
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false
  },
  db: {
    schema: 'public'
  },
  global: {
    headers: {
      'X-Client-Info': 'expo-music-player'
    }
  }
})

// Helper function to ensure we have some kind of session
export const ensureAnonymousSession = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      console.log('No user found, attempting to create temporary session...')
      
      // Try anonymous sign-in first
      const { data: anonData, error: anonError } = await supabase.auth.signInAnonymously()
      
      if (anonError) {
        console.warn('Anonymous sign-in failed:', anonError.message)
        
        // If anonymous is disabled, try creating a temporary user with email/password
        const tempEmail = `temp_${Date.now()}@musicapp.local`
        const tempPassword = 'TempPassword123!'
        
        console.log('Trying to create temporary user:', tempEmail)
        
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email: tempEmail,
          password: tempPassword,
        })
        
        if (signUpError) {
          console.warn('Temporary user creation failed:', signUpError.message)
          return null
        }
        
        console.log('Created temporary user:', signUpData.user?.id)
        return signUpData.user
      }
      
      console.log('Created anonymous session:', anonData.user?.id)
      return anonData.user
    }
    
    return user
  } catch (error) {
    console.warn('Error ensuring session:', error)
    return null
  }
}

export default supabase