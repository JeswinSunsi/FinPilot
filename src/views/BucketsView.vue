<script setup>
import { useFinanceData } from '../composables/useFinanceData'

const {
  bucketAllocation,
  totalIncome,
  profile,
  budgetUsedPercent,
  recommendations,
  formatCurrency,
  bucketColor,
} = useFinanceData()
</script>

<template>
  <main class="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-6 sm:px-6 sm:py-10">
    <section class="metric-card">
      <p class="font-display text-sm uppercase tracking-[0.16em] text-slate-500">Money Segregation Engine</p>
      <h1 class="font-display text-3xl text-ink">Automatic Bucket Allocator</h1>
      <p class="mt-2 max-w-2xl text-sm text-slate-600">
        Every income event is automatically divided into spending envelopes: Food, Utilities, Housing,
        Transport, Health, Misc, and Savings, based on your active profile behavior model.
      </p>
      <div class="mt-4 flex flex-wrap gap-4 text-sm text-slate-700">
        <span class="rounded-xl bg-slate-100 px-3 py-2">Income considered: {{ formatCurrency(totalIncome) }}</span>
        <span class="rounded-xl bg-slate-100 px-3 py-2">Budget usage: {{ budgetUsedPercent.toFixed(0) }}%</span>
        <span class="rounded-xl bg-slate-100 px-3 py-2">Profile strategy: {{ profile.label }}</span>
      </div>
    </section>

    <section class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      <article v-for="bucket in bucketAllocation" :key="bucket.name" class="metric-card">
        <div class="flex items-center justify-between">
          <h2 class="font-display text-xl text-ink">{{ bucket.name }}</h2>
          <span
            class="rounded-full px-2 py-1 text-xs font-semibold"
            :class="bucket.utilization > 100 ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'"
          >
            {{ bucket.utilization.toFixed(0) }}%
          </span>
        </div>
        <div class="mt-4 space-y-2 text-sm text-slate-700">
          <p>Allocated: <strong>{{ formatCurrency(bucket.allocated) }}</strong></p>
          <p>Spent: <strong>{{ formatCurrency(bucket.spent) }}</strong></p>
          <p>
            Remaining:
            <strong :class="bucket.remaining >= 0 ? 'text-emerald-700' : 'text-rose-700'">
              {{ formatCurrency(bucket.remaining) }}
            </strong>
          </p>
        </div>
        <div class="mt-3 h-2 rounded-full bg-slate-200">
          <div
            class="h-full rounded-full"
            :class="bucketColor[bucket.name] || 'bg-cyan-600'"
            :style="{ width: `${Math.min(bucket.utilization, 100)}%` }"
          ></div>
        </div>
      </article>
    </section>

    <section class="metric-card">
      <div class="flex items-center justify-between gap-3">
        <h2 class="font-display text-xl text-ink">Bucket Automation Playbook</h2>
        <RouterLink to="/insights" class="text-xs font-semibold text-cyan-700">Open insights</RouterLink>
      </div>
      <div class="mt-4 grid gap-3 md:grid-cols-2">
        <div
          v-for="item in recommendations"
          :key="item.title"
          class="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200"
        >
          <p class="text-sm font-semibold text-slate-900">{{ item.title }}</p>
          <p class="mt-2 text-sm text-slate-600">{{ item.detail }}</p>
        </div>
      </div>
    </section>
  </main>
</template>
