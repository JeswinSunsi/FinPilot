<script setup>
import { useFinanceData } from '../composables/useFinanceData'

const {
  riskSignals,
  emergencyFundMonths,
  profile,
  recommendations,
  opportunities,
  categorySummary,
  categoryColor,
  formatCurrency,
} = useFinanceData()
</script>

<template>
  <main class="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-6 sm:px-6 sm:py-10">
    <section class="grid gap-4 xl:grid-cols-3">
      <article class="metric-card xl:col-span-2">
        <p class="font-display text-sm uppercase tracking-[0.16em] text-slate-500">Predictive Intelligence</p>
        <h1 class="font-display text-3xl text-ink">Financial Risks and Recommendations</h1>

        <div class="mt-4 grid gap-3 sm:grid-cols-2">
          <div class="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
            <p class="text-xs uppercase tracking-wide text-slate-500">Overspending Risk</p>
            <p class="mt-1 text-lg font-semibold" :class="riskSignals.overspending ? 'text-rose-700' : 'text-emerald-700'">
              {{ riskSignals.overspending ? 'High' : 'Stable' }}
            </p>
          </div>
          <div class="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
            <p class="text-xs uppercase tracking-wide text-slate-500">Discretionary Spike</p>
            <p class="mt-1 text-lg font-semibold" :class="riskSignals.discretionarySpike ? 'text-amber-700' : 'text-emerald-700'">
              {{ riskSignals.discretionarySpike ? 'Elevated' : 'Controlled' }}
            </p>
          </div>
          <div class="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
            <p class="text-xs uppercase tracking-wide text-slate-500">Emergency Runway</p>
            <p class="mt-1 text-lg font-semibold text-slate-800">{{ emergencyFundMonths.toFixed(1) }} months</p>
          </div>
          <div class="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
            <p class="text-xs uppercase tracking-wide text-slate-500">Target Runway</p>
            <p class="mt-1 text-lg font-semibold text-slate-800">{{ profile.emergencyTargetMonths }} months</p>
          </div>
        </div>
      </article>

      <article class="metric-card">
        <h2 class="font-display text-xl text-ink">Savings Opportunities</h2>
        <div class="mt-4 space-y-3">
          <div v-for="item in opportunities" :key="item.title" class="rounded-2xl bg-mint p-4">
            <p class="text-xs uppercase tracking-wide text-emerald-800">{{ item.title }}</p>
            <p class="mt-1 font-display text-2xl text-emerald-900">{{ item.value }}</p>
            <p class="mt-1 text-xs text-emerald-800/90">{{ item.detail }}</p>
          </div>
        </div>
      </article>
    </section>

    <section class="grid gap-4 xl:grid-cols-3">
      <article class="metric-card xl:col-span-2">
        <h2 class="font-display text-xl text-ink">AI Recommendation Queue</h2>
        <div class="mt-4 space-y-3">
          <div
            v-for="item in recommendations"
            :key="item.title"
            class="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200"
          >
            <div class="flex items-center justify-between gap-3">
              <p class="font-semibold text-slate-900">{{ item.title }}</p>
              <span
                class="rounded-full px-2 py-1 text-xs font-semibold"
                :class="
                  item.priority === 'High'
                    ? 'bg-red-100 text-red-700'
                    : item.priority === 'Medium'
                      ? 'bg-amber-100 text-amber-700'
                      : 'bg-emerald-100 text-emerald-700'
                "
              >
                {{ item.priority }}
              </span>
            </div>
            <p class="mt-2 text-sm text-slate-600">{{ item.detail }}</p>
          </div>
        </div>
      </article>

      <article class="metric-card">
        <h2 class="font-display text-xl text-ink">Expense Concentration</h2>
        <div class="mt-4 space-y-3">
          <div v-for="item in categorySummary" :key="item.name">
            <div class="mb-1 flex items-center justify-between text-sm text-slate-700">
              <span class="font-semibold">{{ item.name }}</span>
              <span>{{ formatCurrency(item.amount) }}</span>
            </div>
            <div class="h-2 rounded-full bg-slate-200">
              <div
                class="h-full rounded-full"
                :class="categoryColor[item.name] || 'bg-cyan-600'"
                :style="{ width: `${item.percent.toFixed(0)}%` }"
              ></div>
            </div>
          </div>
        </div>
      </article>
    </section>
  </main>
</template>
