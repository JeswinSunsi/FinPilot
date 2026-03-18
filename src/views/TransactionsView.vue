<script setup>
import { computed, ref } from 'vue'
import { useFinanceData } from '../composables/useFinanceData'

const { profiledTransactions, formatCurrency } = useFinanceData()

const filters = ['All', 'Income', 'Food', 'Utilities', 'Housing', 'Transport', 'Health', 'Misc']
const activeFilter = ref('All')

const visibleTransactions = computed(() => {
  if (activeFilter.value === 'All') {
    return profiledTransactions.value
  }

  if (activeFilter.value === 'Income') {
    return profiledTransactions.value.filter((tx) => tx.direction === 'in')
  }

  return profiledTransactions.value.filter((tx) => tx.bucket === activeFilter.value)
})
</script>

<template>
  <main class="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-6 sm:px-6 sm:py-10">
    <section class="metric-card">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p class="font-display text-sm uppercase tracking-[0.16em] text-slate-500">Transaction Intelligence</p>
          <h1 class="font-display text-3xl text-ink">Automated Categorization Feed</h1>
          <p class="mt-2 text-sm text-slate-600">Each movement is auto-tagged by category and segregated into spending buckets.</p>
        </div>
        <div class="flex flex-wrap gap-2">
          <button
            v-for="item in filters"
            :key="item"
            type="button"
            class="rounded-xl px-3 py-2 text-sm font-semibold transition"
            :class="activeFilter === item ? 'bg-ink text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'"
            @click="activeFilter = item"
          >
            {{ item }}
          </button>
        </div>
      </div>
    </section>

    <section class="metric-card overflow-hidden">
      <div class="overflow-x-auto">
        <table class="min-w-full text-left text-sm">
          <thead>
            <tr class="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
              <th class="px-3 py-3">Date</th>
              <th class="px-3 py-3">Description</th>
              <th class="px-3 py-3">Category</th>
              <th class="px-3 py-3">Bucket</th>
              <th class="px-3 py-3 text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="tx in [...visibleTransactions].reverse()"
              :key="tx.id"
              class="border-b border-slate-100 last:border-none"
            >
              <td class="px-3 py-3 text-slate-600">{{ tx.date }}</td>
              <td class="px-3 py-3 font-semibold text-slate-900">{{ tx.description }}</td>
              <td class="px-3 py-3 text-slate-700">{{ tx.category }}</td>
              <td class="px-3 py-3">
                <span class="rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700">{{ tx.bucket }}</span>
              </td>
              <td class="px-3 py-3 text-right font-semibold" :class="tx.direction === 'in' ? 'text-emerald-700' : 'text-rose-600'">
                {{ tx.direction === 'in' ? '+' : '-' }}{{ formatCurrency(tx.amount) }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </main>
</template>
