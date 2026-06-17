<template>
  <section id="testimonials" class="relative overflow-hidden py-24 md:py-40">
    <div class="mx-auto max-w-5xl px-6">
      <div class="mx-auto mb-16 max-w-2xl text-center md:mb-24">
        <div
          class="mb-6 inline-flex items-center gap-2 rounded-full border border-border/50 bg-card/50 px-5 py-2 text-[10px] font-black uppercase tracking-widest text-primary backdrop-blur-md transition-all hover:bg-card/80 shadow-sm"
        >
          <AppIcon name="hugeicons:comment-01" :size="14" />
          {{ $t('landing.testimonials_title') }}
        </div>
        <h2 class="text-4xl font-black tracking-tighter text-foreground md:text-5xl">
          {{ $t('landing.testimonials_heading') }}
        </h2>
        <p class="mt-4 text-lg font-medium text-muted-foreground">
          {{ $t('landing.testimonials_desc') }}
        </p>
      </div>
    </div>

    <!-- Marquee Container -->
    <div class="group relative flex overflow-hidden py-12 [--duration:40s] [--gap:2rem]">
      <div
        class="flex shrink-0 animate-marquee items-stretch gap-[--gap] px-[--gap] group-hover:paused"
      >
        <!-- 3 sets of testimonials to ensure full coverage and smooth loop -->
        <template v-for="set in 3" :key="set">
          <div
            v-for="(testimonial, index) in testimonials"
            :key="`t${set}-${index}`"
            class="flex w-[340px] shrink-0 flex-col justify-between rounded-4xl border border-border/50 bg-card p-8 transition-all duration-300 hover:border-border hover:shadow-xl hover:shadow-primary/5 dark:hover:shadow-none"
            :style="{ marginRight: 'var(--gap)' }"
          >
            <div>
              <!-- Stars -->
              <div class="flex gap-1">
                <AppIcon
                  v-for="n in 5"
                  :key="n"
                  name="material-symbols:star"
                  :size="16"
                  :class="
                    n <= (testimonial.rating as number) ? 'text-amber-400' : 'text-muted-foreground/20'
                  "
                />
              </div>
              <!-- Quote -->
              <p class="mt-6 text-sm font-medium italic leading-relaxed text-muted-foreground">
                "{{ rt(testimonial.quote) }}"
              </p>
            </div>

            <!-- Author -->
            <div class="mt-8 flex items-center gap-4">
              <Avatar class="size-11 shrink-0 border-2 border-background shadow-sm">
                <AvatarImage :src="rt(testimonial.avatar)" :alt="rt(testimonial.name)" />
                <AvatarFallback
                  class="text-xs font-black"
                  :class="getColorClasses(testimonial.color)"
                >
                  {{ rt(testimonial.initials) }}
                </AvatarFallback>
              </Avatar>
              <div class="min-w-0">
                <p class="truncate text-sm font-black tracking-tight text-foreground">
                  {{ rt(testimonial.name) }}
                </p>
                <p
                  class="truncate text-[10px] font-black uppercase tracking-widest text-muted-foreground/90"
                >
                  {{ rt(testimonial.role) }}
                </p>
              </div>
            </div>
          </div>
        </template>
      </div>
    </div>

    <!-- Gradient Overlays for smooth fade -->
    <div
      class="pointer-events-none absolute inset-y-0 left-0 w-1/4 bg-linear-to-r from-background to-transparent"
    />
    <div
      class="pointer-events-none absolute inset-y-0 right-0 w-1/4 bg-linear-to-l from-background to-transparent"
    />
  </section>
</template>

<script setup lang="ts">
defineOptions({
  name: 'ComponentsLandingTestimonials',
})
const { tm, rt } = useI18n()

interface Testimonial {
  name: string | object
  role: string | object
  quote: string | object
  initials: string | object
  color: string | object
  rating: number | object
  avatar: string | object
}

const rawTestimonials = tm('landing.testimonials_items') as Record<string, unknown>[]
const testimonials = rawTestimonials.map((t) => ({
  ...t,
  rating:
    typeof t.rating === 'number' ? t.rating : parseInt(rt(t.rating as unknown as string)) || 5,
})) as unknown as Testimonial[]

const getColorClasses = (color: string | object) => {
  const colorStr = typeof color === 'string' ? color : rt(color as unknown as string)
  switch (colorStr) {
    case 'pink':
      return 'bg-pink-500/15 text-pink-500 dark:text-pink-400'
    case 'blue':
      return 'bg-blue-500/15 text-blue-500 dark:text-blue-400'
    case 'purple':
      return 'bg-purple-500/15 text-purple-500 dark:text-purple-400'
    case 'amber':
      return 'bg-amber-500/15 text-amber-500 dark:text-amber-400'
    case 'emerald':
      return 'bg-emerald-500/15 text-emerald-500 dark:text-emerald-400'
    default:
      return 'bg-primary/15 text-primary'
  }
}
</script>

<style scoped>
@keyframes marquee {
  0% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(calc(-1 / 3 * 100%));
  }
}

.animate-marquee {
  animation: marquee var(--duration) linear infinite;
}
</style>
