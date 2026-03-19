<script setup>
import { computed, ref, watch } from 'vue'
import useFinanceData from '../composables/useFinanceData'

const {
  profiledTransactions,
  editableBucketNames,
  assignTransactionBucket,
  formatCurrency,
} = useFinanceData()

const activeFilter = ref('All')
const selectedTransactionId = ref(null)

const filters = computed(() => ['All', 'Income', ...editableBucketNames.value])

watch(filters, (nextFilters) => {
  if (!nextFilters.includes(activeFilter.value)) {
    activeFilter.value = 'All'
  }
})

const sortedTransactions = computed(() =>
  [...profiledTransactions.value].sort((a, b) => {
    const left = a.occurredAt ?? `${a.date}T00:00:00Z`
    const right = b.occurredAt ?? `${b.date}T00:00:00Z`
    return right.localeCompare(left)
  }),
)

const visibleTransactions = computed(() => {
  if (activeFilter.value === 'All') {
    return sortedTransactions.value
  }

  if (activeFilter.value === 'Income') {
    return sortedTransactions.value.filter((tx) => tx.direction === 'in')
  }

  return sortedTransactions.value.filter((tx) => tx.bucket === activeFilter.value)
})

const openBucketPicker = (tx) => {
  if (tx.direction !== 'out') {
    return
  }

  selectedTransactionId.value = selectedTransactionId.value === tx.id ? null : tx.id
}

const saveBucketForTransaction = (bucketName) => {
  if (selectedTransactionId.value == null) {
    return
  }

  assignTransactionBucket(selectedTransactionId.value, bucketName)
  selectedTransactionId.value = null
}
</script>

<template>
  <main class="flex w-full flex-col gap-5 px-4 py-6">
    <section>
      <h1 class="text-xl font-bold tracking-tight text-slate-900">Transactions</h1>
      <p class="mt-1 text-xs text-slate-500">Auto-categorized spending feed</p>
      
      <div class="mt-4 flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        <button
          v-for="item in filters"
          :key="item"
          type="button"
          class="whitespace-nowrap rounded-full px-4 py-1.5 text-xs font-semibold transition-colors border"
          :class="activeFilter === item ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'"
          @click="activeFilter = item"
        >
          {{ item }}
        </button>
      </div>
    </section>

    <section class="flex flex-col gap-3">
      <h2 class="text-sm font-bold text-slate-800 mt-2">Recent Activity</h2>
      
      <div
        v-for="tx in visibleTransactions"
        :key="tx.id"
        class="rounded-2xl bg-white p-4 shadow-sm border border-slate-100"
      >
        <div
          class="flex items-center justify-between"
          :class="tx.direction === 'out' ? 'cursor-pointer' : ''"
          @click="openBucketPicker(tx)"
        >
          <div class="flex items-center gap-3">
            <div class="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-slate-50 text-lg border border-slate-100">
              {{ tx.direction === 'in' ? '📈' : '🛒' }}
            </div>
            <div class="flex flex-col">
              <span class="text-sm font-bold text-slate-800">{{ tx.description }}</span>
              <div class="flex items-center gap-2 mt-0.5">
                <span class="text-[10px] text-slate-500">{{ tx.date }}</span>
                <span class="text-[10px] text-slate-300">•</span>
                <span class="text-[10px] font-medium text-slate-500">{{ tx.bucket }}</span>
              </div>
            </div>
          </div>
          <div class="text-right flex flex-col items-end">
            <span class="text-sm font-bold" :class="tx.direction === 'in' ? 'text-emerald-600' : 'text-slate-800'">
              {{ tx.direction === 'in' ? '+' : '-' }}{{ formatCurrency(tx.amount) }}
            </span>
            <span class="text-[10px] font-medium text-slate-400 mt-0.5">{{ tx.category }}</span>
          </div>
        </div>

        <div v-if="selectedTransactionId === tx.id && tx.direction === 'out'" class="mt-3 rounded-xl border border-cyan-100 bg-cyan-50/60 p-3">
          <p class="text-[11px] font-semibold text-slate-700">Move this transaction to bucket:</p>
          <div class="mt-2 flex flex-wrap gap-2">
            <button
              v-for="bucket in editableBucketNames"
              :key="`${tx.id}-${bucket}`"
              type="button"
              class="rounded-full border px-3 py-1 text-[11px] font-semibold transition-colors"
              :class="tx.bucket === bucket ? 'border-cyan-600 bg-cyan-600 text-white' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'"
              @click="saveBucketForTransaction(bucket)"
            >
              {{ bucket }}
            </button>
            <button
              type="button"
              class="rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-semibold text-slate-500 hover:bg-slate-50"
              @click="selectedTransactionId = null"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
      
      <div v-if="!visibleTransactions.length" class="py-8 text-center text-sm text-slate-500">
        No transactions found.
      </div>
    </section>
  </main>
</template>
