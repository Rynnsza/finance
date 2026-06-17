import { createRouter, createWebHistory } from 'vue-router'
import routes from 'virtual:generated-pages'
import { getPageTitleKey } from '@/lib/utils'

// Define which paths should use the 'blank' layout
const blankLayoutRoutes = [
  '/',
  '/login',
  '/about',
  '/contact',
  '/privacy-policy',
  '/terms-of-service',
  '/auth/login',
  '/auth/callback',
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    ...routes.map((route) => {
      // Check if this route should be blank
      const isBlank = blankLayoutRoutes.includes(route.path)

      return {
        ...route,
        meta: {
          ...route.meta,
          layout: isBlank ? 'blank' : 'default',
          title: getPageTitleKey(route.path),
        },
      }
    }),
    {
      path: '/source',
      name: 'source',
      component: { template: '<div>{{ $t("common.redirecting") }}</div>' },
      beforeEnter() {
        window.location.replace('https://github.com/seaavey/finance')
      },
    },
  ],
})

// Public routes = blankLayoutRoutes + '/source'
const publicRoutes = [...blankLayoutRoutes, '/source']

router.beforeEach(async (to) => {
  if (to.hash?.includes('access_token') || to.query?.code) {
    return true
  }

  if (to.path === '/auth/login') {
    const { useAuth } = await import('@/composables/useAuth')
    const { getSession } = useAuth()
    const session = await getSession()
    if (session) {
      return '/dashboard'
    }
    return true
  }

  if (publicRoutes.includes(to.path)) {
    return true
  }

  const { useAuth } = await import('@/composables/useAuth')
  const { getSession } = useAuth()
  const session = await getSession()

  if (!session) {
    return '/auth/login'
  }

  return true
})

export default router
