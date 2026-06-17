import { ref } from 'vue'
import { useRouter } from 'vue-router'
import type { User } from '@supabase/supabase-js'
import { useSupabase } from '@/lib/supabase'
import { logActivity } from '@/services/activity.service'

// State shared across all useAuth calls
export const user = ref<User | null>(null)
export const loading = ref(true)
let loginLogged = false

export const useAuth = () => {
  const supabase = useSupabase()
  const router = useRouter()

  const signInWithGoogle = async () => {
    const redirectTo = `${window.location.origin}/auth/callback`

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo,
      },
    })

    if (error) {
      throw error
    }
  }

  const signOut = async () => {
    // Log activity BEFORE signOut — RLS needs the session
    try {
      if (user.value?.id) {
        await logActivity({
          user_id: user.value.id,
          entity_type: 'auth',
          action: 'logout',
          metadata: {},
        })
      }
    } catch {
      // Best-effort — don't block signOut if logging fails
    }
    await supabase.auth.signOut()
    user.value = null
    loginLogged = false
    if (router) await router.push('/auth/login')
  }

  const getSession = async () => {
    loading.value = true
    const {
      data: { session },
    } = await supabase.auth.getSession()

    const sessionUser = session?.user ?? null
    // Only update if identity changed or logging in/out
    if (!user.value || !sessionUser || user.value.id !== sessionUser.id) {
      user.value = sessionUser
    }

    if (session?.user && !loginLogged) {
      loginLogged = true
      supabase
        .from('activity_logs')
        .insert({
          user_id: session.user.id,
          entity_type: 'auth',
          action: 'login',
          metadata: {},
        })
        .then()
    }
    loading.value = false
    return session
  }

  return { user, loading, signInWithGoogle, signOut, getSession }
}
