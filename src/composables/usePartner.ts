import { ref, computed } from 'vue'
import { useQuery, useQueryClient } from '@tanstack/vue-query'
import {
  getProfile,
  queryInvitations,
  sendInvitation,
  acceptInvitation as acceptInvitationService,
  rejectInvitation as rejectInvitationService,
  cancelInvitation as cancelInvitationService,
  disconnectPartner as disconnectPartnerService,
  querySentInvitations,
  getExistingPendingInvitation,
} from '@/services/partner.service'
import { callEdgeFunction } from '@/lib/rpc'

export const usePartner = () => {
  const queryClient = useQueryClient()
  const { user } = useAuth()
  const { toast } = useToast()
  const { t } = useI18n()
  const activity = useActivityLog()

  const sending = ref(false)

  const { data: myProfileData, refetch: _refetchMyProfile } = useQuery({
    queryKey: ['myProfile', computed(() => user.value?.id)],
    queryFn: async () => {
      if (!user.value) return null
      const result = await getProfile(user.value.id)
      if (result.error) throw result.error
      return result.data
    },
    enabled: computed(() => !!user.value),
    staleTime: 60_000,
  })

  const myProfile = computed(() => myProfileData.value || null)

  const { data: partnerData, refetch: fetchPartner } = useQuery({
    queryKey: ['partner', computed(() => user.value?.id)],
    queryFn: async () => {
      if (!user.value) return null
      const myProfileResult = await getProfile(user.value.id)
      if (myProfileResult.error) throw myProfileResult.error

      if (myProfileResult.data?.partner_id) {
        const partnerProfileResult = await getProfile(myProfileResult.data.partner_id)
        if (partnerProfileResult.error) throw partnerProfileResult.error
        return partnerProfileResult.data
      }
      return null
    },
    enabled: computed(() => !!user.value),
    staleTime: 60_000,
  })

  const partner = computed(() => partnerData.value || null)
  const isPartnered = computed(() => partner.value !== null)

  const partnerDisplayName = computed(
    () => partner.value?.display_name || (partner.value ? t('sidebar.partner') : ''),
  )

  const {
    data: sentInvitationsData,
    isLoading: loadingSent,
    refetch: fetchSentInvitations,
  } = useQuery({
    queryKey: ['invitations:sent', computed(() => user.value?.id)],
    queryFn: async () => {
      if (!user.value) return []
      const result = await querySentInvitations(user.value.id)
      if (result.error) throw result.error
      return result.data || []
    },
    enabled: computed(() => !!user.value),
    staleTime: 60_000,
  })

  const {
    data: receivedInvitationsData,
    isLoading: loadingReceived,
    refetch: fetchReceivedInvitations,
  } = useQuery({
    queryKey: ['invitations:received', computed(() => user.value?.email)],
    queryFn: async () => {
      if (!user.value?.email) return []
      const result = await queryInvitations(user.value.email)
      if (result.error) throw result.error
      return result.data || []
    },
    enabled: computed(() => !!user.value?.email),
    staleTime: 30_000,
  })

  const sentInvitations = computed(() => sentInvitationsData.value || [])
  const receivedInvitations = computed(() => receivedInvitationsData.value || [])
  const loading = computed(() => loadingSent.value || loadingReceived.value)

  const fetchInvitations = async () => {
    await Promise.all([fetchSentInvitations(), fetchReceivedInvitations()])
  }

  const sendInvite = async (email: string) => {
    if (!user.value) {
      toast.error(t('toast.login_required'))
      return { error: new Error('Not authenticated') }
    }

    if (user.value.email === email) {
      toast.error(t('toast.partner_invite_self'))
      return { error: new Error('Cannot invite yourself') }
    }

    sending.value = true

    // Check if user already has a partner
    const myProfileResult = await getProfile(user.value.id)
    if (myProfileResult.data?.partner_id) {
      toast.error(t('toast.partner_already_connected'))
      sending.value = false
      return { error: new Error('Already partnered') }
    }

    // Check for existing pending invitation to this email
    const existingResult = await getExistingPendingInvitation(user.value.id, email)
    if (existingResult.error) {
      sending.value = false
      return { error: existingResult.error }
    }
    const existing = existingResult.data

    if (existing) {
      toast.error(t('toast.partner_invite_exists'))
      sending.value = false
      return { error: new Error('Invitation already pending') }
    }

    const result = await sendInvitation(user.value.id, email)

    if (!result.error) {
      queryClient.invalidateQueries({ queryKey: ['invitations:sent'] })
      toast.success(t('toast.partner_invite_sent'))

      // Notify recipient via email (fire-and-forget)
      callEdgeFunction('send-couple-invite', {
        sender_id: user.value!.id,
        recipient_email: email,
      }).catch((e) => {
        console.warn('Failed to send notification email:', e)
      })
    } else {
      toast.error(t('toast.partner_invite_error'))
    }

    sending.value = false
    return { error: result.error }
  }

  const acceptInvite = async (invitationId: string) => {
    const result = await acceptInvitationService(invitationId)

    if (!result.error) {
      queryClient.invalidateQueries({ queryKey: ['partner'] })
      queryClient.invalidateQueries({ queryKey: ['accounts'] })
      queryClient.invalidateQueries({ queryKey: ['invitations:sent'] })
      queryClient.invalidateQueries({ queryKey: ['invitations:received'] })
      toast.success(t('toast.partner_connected'))
      activity.log('partner', 'connected')
    } else {
      toast.error(t('toast.partner_accept_error'))
    }
    return { error: result.error }
  }

  const rejectInvite = async (invitationId: string) => {
    const result = await rejectInvitationService(invitationId)
    if (!result.error) {
      queryClient.invalidateQueries({ queryKey: ['invitations:received'] })
      toast.success(t('toast.partner_rejected'))
    }
    return { error: result.error }
  }

  const cancelInvite = async (invitationId: string) => {
    const result = await cancelInvitationService(invitationId)
    if (!result.error) {
      queryClient.invalidateQueries({ queryKey: ['invitations:sent'] })
      toast.success(t('toast.partner_cancelled'))
    }
    return { error: result.error }
  }

  const disconnectPartner = async () => {
    const result = await disconnectPartnerService()
    if (!result.error) {
      queryClient.invalidateQueries({ queryKey: ['partner'] })
      queryClient.invalidateQueries({ queryKey: ['accounts'] })
      queryClient.invalidateQueries({ queryKey: ['invitations:sent'] })
      queryClient.invalidateQueries({ queryKey: ['invitations:received'] })
      toast.success(t('toast.partner_disconnected'))
      activity.log('partner', 'disconnected')
    } else {
      toast.error(t('toast.partner_disconnect_error'))
    }
    return { error: result.error }
  }

  return {
    myProfile,
    partner,
    sentInvitations,
    receivedInvitations,
    loading,
    sending,
    isPartnered,
    partnerDisplayName,
    fetchPartner,
    fetchInvitations,
    sendInvite,
    acceptInvite,
    rejectInvite,
    cancelInvite,
    disconnectPartner,
  }
}
