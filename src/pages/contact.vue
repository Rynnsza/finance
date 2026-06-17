<template>
  <div
    class="flex min-h-screen flex-col bg-background text-foreground transition-colors duration-300"
  >
    <LandingNavbar />

    <main class="flex-1 px-6 pt-32 pb-24">
      <div class="mx-auto max-w-6xl">
        <!-- Hero Section -->
        <div class="mb-16 text-center md:mb-24">
          <h1 class="text-5xl font-black tracking-tighter md:text-7xl leading-none mb-6">
            {{ $t('contact.hero_title') }}
          </h1>
          <p class="mx-auto max-w-2xl text-lg font-medium text-muted-foreground md:text-xl">
            {{ $t('contact.hero_desc') }}
          </p>
        </div>

        <div class="grid grid-cols-1 gap-8 lg:grid-cols-2">
          <!-- Left Column: Info Cards -->
          <div class="space-y-6">
            <div class="rounded-4xl border border-border/50 bg-card p-8 shadow-sm">
              <h2
                class="mb-8 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/90"
              >
                {{ $t('contact.info_title') }}
              </h2>

              <div class="space-y-8">
                <div class="flex items-start gap-4">
                  <div
                    class="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-sm"
                  >
                    <AppIcon name="hugeicons:mail-01" :size="24" />
                  </div>
                  <div>
                    <p
                      class="text-xs font-black uppercase tracking-widest text-muted-foreground mb-1"
                    >
                      {{ $t('contact.email_label') }}
                    </p>
                    <a
                      href="mailto:me@seaavey.com"
                      class="text-lg font-black text-foreground hover:text-primary transition-colors"
                      >me@seaavey.com</a
                    >
                  </div>
                </div>

                <div class="flex items-start gap-4">
                  <div
                    class="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-sm"
                  >
                    <AppIcon name="hugeicons:customer-service" :size="24" />
                  </div>
                  <div>
                    <p
                      class="text-xs font-black uppercase tracking-widest text-muted-foreground mb-1"
                    >
                      {{ $t('contact.support_label') }}
                    </p>
                    <p class="text-lg font-black text-foreground">
                      {{ $t('contact.support_hours') }}
                    </p>
                  </div>
                </div>

                <div class="flex items-start gap-4">
                  <div
                    class="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-sm"
                  >
                    <AppIcon name="hugeicons:share-01" :size="24" />
                  </div>
                  <div>
                    <p
                      class="text-xs font-black uppercase tracking-widest text-muted-foreground mb-1"
                    >
                      {{ $t('contact.social_label') }}
                    </p>
                    <div class="flex gap-3 mt-2">
                      <a
                        v-for="s in socials"
                        :key="s.icon"
                        :href="s.href"
                        class="size-10 flex items-center justify-center rounded-xl bg-muted/50 text-muted-foreground hover:bg-primary/10 hover:text-primary transition-all"
                      >
                        <AppIcon :name="s.icon" :size="20" />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Right Column: Form -->
          <div class="rounded-4xl border border-border/50 bg-card p-8 md:p-12 shadow-xl">
            <h2 class="mb-8 text-2xl font-black tracking-tighter text-foreground">
              {{ $t('contact.form_title') }}
            </h2>

            <form @submit.prevent="handleSubmit" class="space-y-6">
              <div class="space-y-2">
                <Label
                  for="name"
                  class="text-[10px] font-black uppercase tracking-widest text-muted-foreground/90 ml-1"
                  >{{ $t('contact.form_name') }}</Label
                >
                <Input
                  id="name"
                  required
                  :placeholder="$t('contact.form_name_placeholder')"
                  class="h-12 rounded-2xl border-border/50 bg-muted/30 font-bold focus:border-primary/50 transition-all"
                />
              </div>

              <div class="space-y-2">
                <Label
                  for="email"
                  class="text-[10px] font-black uppercase tracking-widest text-muted-foreground/90 ml-1"
                  >{{ $t('contact.form_email') }}</Label
                >
                <Input
                  id="email"
                  type="email"
                  required
                  :placeholder="$t('contact.form_email_placeholder')"
                  class="h-12 rounded-2xl border-border/50 bg-muted/30 font-bold focus:border-primary/50 transition-all"
                />
              </div>

              <div class="space-y-2">
                <Label
                  for="message"
                  class="text-[10px] font-black uppercase tracking-widest text-muted-foreground/90 ml-1"
                  >{{ $t('contact.form_message') }}</Label
                >
                <Textarea
                  id="message"
                  required
                  :placeholder="$t('contact.form_message_placeholder')"
                  class="min-h-[150px] rounded-2xl border-border/50 bg-muted/30 font-bold focus:border-primary/50 transition-all"
                />
              </div>

              <Button
                type="submit"
                :disabled="loading"
                class="h-14 w-full rounded-2xl bg-linear-to-b from-primary to-primary/90 text-base font-black uppercase tracking-widest text-white shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <span v-if="!loading">{{ $t('contact.form_submit') }}</span>
                <AppIcon v-else name="hugeicons:loading-01" class="animate-spin" :size="24" />
              </Button>
            </form>
          </div>
        </div>
      </div>
    </main>

    <LandingFooter />
  </div>
</template>

<script setup lang="ts">
defineOptions({
  name: 'ContactPage',
})
const { toast } = useToast()
const { t } = useI18n()
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import LandingNavbar from '@/components/landing/Navbar.vue'
import LandingFooter from '@/components/landing/Footer.vue'

const loading = ref(false)

const socials = [{ icon: 'hugeicons:github', href: 'https://github.com/seaavey' }]

const handleSubmit = async () => {
  loading.value = true
  // Simulate API call
  await new Promise((resolve) => setTimeout(resolve, 1500))
  loading.value = false
  toast.success(t('contact.success'))
}

useSeoMeta({
  title: t('contact.title'),
  ogTitle: t('contact.title'),
  description: t('contact.subtitle'),
  ogDescription: t('contact.subtitle'),
})
</script>
