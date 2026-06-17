<template>
  <div class="mx-auto max-w-2xl space-y-8 pb-12 pt-4">
    <div>
      <Button variant="ghost" size="sm" class="mb-4 rounded-xl" @click="router.push('/goals')">
        <AppIcon name="hugeicons:arrow-left-01" :size="16" class="mr-1" />
        {{ $t('common.back') }}
      </Button>
      <h1 class="text-3xl font-black tracking-tighter text-foreground">
        {{ $t('goal_form.title_edit') }}
      </h1>
      <p class="mt-1 font-medium text-muted-foreground">{{ $t('goal_form.subtitle_edit') }}</p>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="mx-auto max-w-2xl space-y-8 pb-12 pt-4">
      <Skeleton class="h-8 w-32 rounded-xl bg-muted/50" />
      <Skeleton class="h-10 w-64 rounded-xl bg-muted/50" />
      <Skeleton class="h-6 w-48 rounded-lg bg-muted/50" />
      <Skeleton class="h-96 w-full rounded-4xl bg-muted/50" />
    </div>

    <form
      v-else
      class="space-y-6 rounded-3xl border border-border/50 bg-card/20 p-6 backdrop-blur-sm"
      @submit.prevent="onSubmit"
    >
      <div class="grid gap-6 sm:grid-cols-2">
        <div class="space-y-4">
          <div class="space-y-2">
            <Label for="name">{{ $t('goal_form.name') }}</Label>
            <Input
              id="name"
              v-model="form.name"
              :placeholder="$t('goal_form.name_placeholder')"
              required
            />
          </div>

          <div class="space-y-2">
            <Label for="target_amount">{{ $t('goal_form.target_amount') }}</Label>
            <Input
              id="target_amount"
              v-model="amountDisplay"
              type="text"
              inputmode="numeric"
              placeholder="0"
              required
              @keydown="onNumberKeydown"
            />
          </div>

          <div class="space-y-2">
            <Label>{{ $t('goal_form.deadline') }}</Label>
            <Popover>
              <PopoverTrigger as-child>
                <Button
                  variant="outline"
                  :class="
                    cn(
                      'w-full justify-between px-3 font-normal',
                      !form.deadline && 'text-muted-foreground',
                    )
                  "
                >
                  {{
                    form.deadline
                      ? df.format(calendarDate!.toDate(getLocalTimeZone()))
                      : $t('goal_form.deadline')
                  }}
                  <AppIcon name="hugeicons:calendar-01" :size="16" class="opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent class="w-auto p-0">
                <Calendar v-model="calendarDate" initial-focus />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <div class="space-y-2">
          <Label>{{ $t('goal_form.image') }}</Label>
          <div class="relative">
            <input
              ref="fileInputRef"
              type="file"
              accept="image/png,image/jpeg,image/webp"
              class="hidden"
              @change="onFileSelect"
            />

            <!-- Empty state — dropzone -->
            <button
              v-if="!imagePreview"
              type="button"
              class="group flex w-full cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-border/60 bg-muted/20 px-6 py-10 text-center transition-all hover:border-primary/50 hover:bg-primary/[0.03]"
              @click="fileInputRef?.click()"
            >
              <div
                class="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-sm transition-all group-hover:bg-primary/15 group-hover:shadow-md"
              >
                <AppIcon name="hugeicons:image-upload-01" :size="28" />
              </div>
              <div>
                <p class="text-sm font-bold text-foreground">
                  {{ $t('goal_form.image_placeholder') }}
                </p>
                <p class="mt-0.5 text-xs font-medium text-muted-foreground">
                  PNG, JPEG, WebP — max 5MB
                </p>
              </div>
            </button>

            <!-- Preview -->
            <div v-else class="relative overflow-hidden rounded-2xl border border-border/50">
              <AspectRatio :ratio="4 / 3" class="bg-muted/20">
                <img :src="imagePreview" alt="Preview" class="h-full w-full object-contain" />
              </AspectRatio>
              <div
                class="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 transition-opacity hover:opacity-100"
              />
              <Button
                type="button"
                variant="secondary"
                size="sm"
                class="absolute right-3 top-3 rounded-full shadow-md"
                @click="removeImage"
              >
                <AppIcon name="hugeicons:delete-01" :size="14" class="mr-1" />
                {{ $t('goal_form.image_remove') }}
              </Button>
              <div class="absolute bottom-3 left-3">
                <span
                  class="rounded-full bg-black/50 px-3 py-1 text-[10px] font-bold text-white backdrop-blur-sm"
                >
                  {{ $t('goal_form.image') }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" @click="router.push('/goals')">
          {{ $t('goal_form.cancel') }}
        </Button>
        <Button type="submit" :disabled="!form.name || !form.target_amount">
          {{ $t('goal_form.save') }}
        </Button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import type { Transaction, TransactionType, TransactionFilters, SplitItem, Account, AccountRow, AccountInsert, AccountUpdate, AccountWithBalance, AccountType, Budget, BudgetRow, BudgetInsert, BudgetUpdate, BudgetWithProgress, Category, CategoryRow, CategoryInsert, CategoryUpdate, Goal, GoalRow, GoalInsert, GoalUpdate, Bill, BillRow, BillInsert, BillUpdate, RecurringTransaction, RecurringRow, RecurringInsert, RecurringUpdate, RecurringFrequency, Profile, ProfileRow, PartnerProfile, Invitation, InvitationRow, CoupleInvitation, EntityType, ActionType, ActivityLog, ActivityLogRow, ActivityLogInsert, ActivityLogFilters, SafeJson, Result } from "@/types"
defineOptions({
  name: 'PagesGoalsDetailEdit',
})
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { AspectRatio } from '@/components/ui/aspect-ratio'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { DateFormatter, getLocalTimeZone, parseDate } from '@internationalized/date'
import { cn } from '@/lib/utils'


const router = useRouter()
const route = useRoute()
const { locale } = useI18n()
const { goals, fetchGoals, updateGoal, uploadGoalImage, deleteGoalImage } = useGoals()
const { formatCurrency, parseLocalizedNumber } = useCurrency()

const df = new DateFormatter(locale.value === 'id' ? 'id-ID' : 'en-US', { dateStyle: 'long' })

const goalId = route.params.id as string
const loading = ref(true)

const fileInputRef = ref<HTMLInputElement | null>(null)
const imagePreview = ref('')
const selectedFile = ref<File | null>(null)

const form = reactive({
  name: '',
  target_amount: '' as string | number,
  deadline: '',
  color: '#ec4899',
  icon: 'target',
  image_url: null as string | null,
})

function stripCurrency(val: string) {
  return val
    .replace(/^[^\d.,]+/, '')
    .replace(/[^\d.,]+$/, '')
    .trim()
}

const amountDisplay = computed({
  get: () => {
    if (!form.target_amount) return ''
    return formatCurrency(Number(form.target_amount))
  },
  set: (val: string) => {
    form.target_amount = parseLocalizedNumber(stripCurrency(val))
  },
})

const calendarDate = computed({
  get: () => (form.deadline ? parseDate(form.deadline) : undefined),
  set: (val) => {
    if (val) form.deadline = val.toString()
  },
})

const onFileSelect = (e: Event) => {
  const target = e.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  if (file.size > 5 * 1024 * 1024) {
    const { toast } = useToast()
    toast.error(t('goals.max_size_error'))
    return
  }

  selectedFile.value = file
  const reader = new FileReader()
  reader.onload = () => {
    imagePreview.value = reader.result as string
  }
  reader.readAsDataURL(file)
}

const removeImage = () => {
  selectedFile.value = null
  imagePreview.value = ''
  form.image_url = null
  if (fileInputRef.value) fileInputRef.value.value = ''
}

const { t } = useI18n()

const onNumberKeydown = (e: KeyboardEvent) => {
  const allowed = [
    'Backspace',
    'Delete',
    'Tab',
    'Escape',
    'Enter',
    'ArrowLeft',
    'ArrowRight',
    'ArrowUp',
    'ArrowDown',
    'Home',
    'End',
  ]
  if (allowed.includes(e.key)) return
  if ((e.ctrlKey || e.metaKey) && ['a', 'c', 'v', 'x'].includes(e.key.toLowerCase())) return
  if (/^[0-9]$/.test(e.key)) return
  if (e.key === ',' || e.key === '.') {
    e.preventDefault()
    return
  }
  e.preventDefault()
}

const onSubmit = async () => {
  let imageUrl = form.image_url
  if (selectedFile.value) {
    const url = await uploadGoalImage(selectedFile.value)
    if (url) {
      if (form.image_url) {
        await deleteGoalImage(form.image_url)
      }
      imageUrl = url
    }
  }

  const { error } = await updateGoal(goalId, {
    name: form.name,
    target_amount: Number(form.target_amount),
    deadline: form.deadline || null,
    color: form.color,
    image_url: imageUrl,
  })

  if (!error) {
    router.push(`/goals/${goalId}`)
  }
}

onMounted(async () => {
  await fetchGoals()
  const goal = goals.value.find((g: Goal) => g.id === goalId)
  if (goal) {
    form.name = goal.name
    form.target_amount = goal.target_amount
    form.deadline = goal.deadline || ''
    form.color = goal.color || '#3b82f6'
    form.image_url = goal.image_url
    if (goal.image_url) imagePreview.value = goal.image_url
  }
  loading.value = false
})
</script>
