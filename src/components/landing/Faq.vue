<template>
  <section id="faq" class="relative px-6 py-20 md:py-32 overflow-hidden">
    <!-- Animated dynamic background glows -->
    <div class="pointer-events-none absolute inset-0 -z-10">
      <div
        class="absolute top-1/4 -left-20 size-96 rounded-full bg-primary/10 blur-[100px] animate-pulse"
      />
      <div
        class="absolute bottom-1/4 -right-20 size-96 rounded-full bg-blue-500/10 blur-[100px] animate-pulse [animation-delay:2s]"
      />
    </div>

    <div class="mx-auto max-w-3xl">
      <div class="mb-16 text-center">
        <div
          class="mb-6 inline-flex items-center gap-2 rounded-full border border-border/50 bg-card/50 px-5 py-2 text-[10px] font-black uppercase tracking-widest text-primary backdrop-blur-md transition-all hover:bg-card/80 shadow-sm"
        >
          <AppIcon name="hugeicons:help-circle" :size="14" />
          {{ $t('landing.nav_faq') }}
        </div>
        <h2 class="text-4xl font-black tracking-tighter text-foreground md:text-5xl lg:text-6xl">
          {{ $t('landing.faq_title') }}
        </h2>
        <p class="mx-auto mt-6 max-w-xl text-base leading-relaxed text-muted-foreground md:text-lg">
          {{ $t('landing.faq_desc') }}
        </p>
      </div>

      <div class="grid gap-3">
        <div
          v-for="(item, index) in faqItems"
          :key="item.value"
          class="group overflow-hidden rounded-3xl border border-border/50 bg-card shadow-sm transition-all duration-500 hover:border-border hover:shadow-lg md:rounded-4xl"
          :style="{ animationDelay: `${index * 100}ms`, animationDuration: '800ms' }"
        >
          <Accordion type="single" collapsible class="w-full">
            <AccordionItem :value="item.value" class="border-0">
              <AccordionTrigger
                class="px-6 py-5 text-base font-bold text-left transition-all hover:no-underline data-[state=open]:text-primary md:px-8 md:text-lg"
              >
                <div class="flex items-center gap-4">
                  <div
                    class="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-muted/50 text-muted-foreground transition-colors group-hover:bg-primary/10 group-hover:text-primary"
                  >
                    <AppIcon :name="item.icon" :size="20" />
                  </div>
                  {{ $t(item.questionKey) }}
                </div>
              </AccordionTrigger>
              <AccordionContent
                class="px-6 pb-6 text-sm font-medium leading-relaxed text-muted-foreground md:px-8 md:pb-8 md:pl-[4.5rem] md:text-base"
              >
                {{ $t(item.answerKey) }}
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>

      <!-- Support CTA -->
      <div
        class="relative mt-16 overflow-hidden rounded-4xl border border-dashed border-primary/40 bg-primary/5 p-8 text-center group md:p-12"
      >
        <div
          class="absolute inset-0 bg-linear-to-br from-primary/5 via-transparent to-blue-500/5 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        />
        <div class="relative z-10">
          <p class="mb-2 text-lg font-black tracking-tight text-foreground">
            {{ $t('landing.faq_support_title') }}
          </p>
          <p class="mb-8 text-sm font-medium text-muted-foreground">
            {{ $t('landing.faq_support_desc') }}
          </p>
          <Button
            variant="default"
            class="h-auto min-h-12 w-full sm:w-auto gap-2 rounded-2xl bg-linear-to-b from-primary to-primary/90 px-6 py-3.5 text-sm font-black uppercase tracking-wide sm:tracking-widest text-white shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98] whitespace-normal"
          >
            <AppIcon name="hugeicons:customer-service" :size="20" class="shrink-0" />
            <span class="flex-1 sm:flex-none">{{ $t('landing.faq_support_button') }}</span>
          </Button>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
defineOptions({
  name: 'ComponentsLandingFaq',
})
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion'
import { Button } from '@/components/ui/button'

const faqItems = [
  {
    value: 'free',
    questionKey: 'landing.faq_q_free',
    answerKey: 'landing.faq_a_free',
    icon: 'hugeicons:license',
  },
  {
    value: 'couple',
    questionKey: 'landing.faq_q_couple',
    answerKey: 'landing.faq_a_couple',
    icon: 'hugeicons:user-group',
  },
  {
    value: 'security',
    questionKey: 'landing.faq_q_security',
    answerKey: 'landing.faq_a_security',
    icon: 'hugeicons:shield-01',
  },
  {
    value: 'mobile',
    questionKey: 'landing.faq_q_mobile',
    answerKey: 'landing.faq_a_mobile',
    icon: 'hugeicons:smart-phone-01',
  },
  {
    value: 'export',
    questionKey: 'landing.faq_q_export',
    answerKey: 'landing.faq_a_export',
    icon: 'hugeicons:file-02',
  },
  {
    value: 'category',
    questionKey: 'landing.faq_q_category',
    answerKey: 'landing.faq_a_category',
    icon: 'hugeicons:grid-view',
  },
]
</script>
