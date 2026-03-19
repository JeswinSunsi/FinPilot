<script setup>
import useFinanceData from '../composables/useFinanceData'

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
  <main class="flex w-full flex-col gap-5 px-4 py-6">
    <section>
      <h1 class="text-xl font-bold tracking-tight text-slate-900">AI Insights</h1>
      <p class="mt-1 text-xs text-slate-500">Predictive analysis and opportunities</p>
    </section>

    <div class="grid grid-cols-2 gap-3">
      <div class="rounded-2xl bg-white p-4 shadow-sm border border-slate-100">
        <p class="text-[10px] font-bold uppercase tracking-wide text-slate-400">Overspending</p>
        <p class="mt-1 text-xl font-bold" :class="riskSignals.overspending ? 'text-rose-600' : 'text-emerald-600'">
          {{ riskSignals.overspending ? 'High' : 'Stable' }}
        </p>
      </div>
      <div class="rounded-2xl bg-white p-4 shadow-sm border border-slate-100">
        <p class="text-[10px] font-bold uppercase tracking-wide text-slate-400">Spike Risk</p>
        <p class="mt-1 text-xl font-bold" :class="riskSignals.discretionarySpike ? 'text-amber-600' : 'text-emerald-600'">
          {{ riskSignals.discretionarySpike ? 'Elevated' : 'Control' }}
        </p>
      </div>
      <div class="rounded-2xl bg-white p-4 shadow-sm border border-slate-100">
        <p class="text-[10px] font-bold uppercase tracking-wide text-slate-400">Runway</p>
        <p class="mt-1 text-xl font-bold text-slate-800">{{ emergencyFundMonths.toFixed(1) }} <span class="text-xs font-medium text-slate-500">mo</span></p>
      </div>
      <div class="rounded-2xl bg-white p-4 shadow-sm border border-slate-100">
        <p class="text-[10px] font-bold uppercase tracking-wide text-slate-400">Target</p>
        <p class="mt-1 text-xl font-bold text-slate-800">{{ profile.emergencyTargetMonths }} <span class="text-xs font-medium text-slate-500">mo</span></p>
      </div>
    </div>

    <section class="rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 p-5 text-white shadow-md">
      <h2 class="text-sm font-bold flex items-center gap-2">
        <span>✨</span> Savings Opportunities
      </h2>
      <div class="mt-4 space-y-3">
        <div v-for="item in opportunities" :key="item.title" class="rounded-xl bg-white/20 p-3 backdrop-blur-md border border-white/20">
          <p class="text-[10px] uppercase tracking-wide text-emerald-100 font-bold">{{ item.title }}</p>
          <p class="mt-0.5 font-display text-2xl font-bold">{{ item.value }}</p>
          <p class="mt-1 text-xs text-emerald-50">{{ item.detail }}</p>
        </div>
      </div>
    </section>

    <section class="rounded-2xl bg-white p-5 shadow-sm border border-slate-100">
      <h2 class="text-sm font-bold text-slate-800 mb-4">Recommendation Queue</h2>
      <div class="space-y-3">
        <div
          v-for="item in recommendations"
          :key="item.title"
          class="flex flex-col gap-1.5 border-b border-slate-100 pb-3 last:border-0 last:pb-0"
        >
          <div class="flex items-center justify-between">
            <p class="text-sm font-bold text-slate-800">{{ item.title }}</p>
            <span
              class="rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider border"
              :class="
                item.priority === 'High'
                  ? 'bg-rose-50 text-rose-600 border-rose-100'
                  : item.priority === 'Medium'
                    ? 'bg-amber-50 text-amber-600 border-amber-100'
                    : 'bg-emerald-50 text-emerald-600 border-emerald-100'
              "
            >
              {{ item.priority }}
            </span>
          </div>
            <p class="text-xs text-slate-500 leading-relaxed">{{ item.detail }}</p>
          </div>
      </div>
    </section>

    <section class="rounded-2xl bg-white p-5 shadow-sm border border-slate-100 mb-4">
      <h2 class="text-sm font-bold text-slate-800 mb-4">Expense Concentration</h2>
      <div class="space-y-4">
        <div v-for="item in categorySummary" :key="item.name">
          <div class="mb-1.5 flex items-center justify-between text-xs font-semibold text-slate-700">
            <span>{{ item.name }}</span>
            <span>{{ formatCurrency(item.amount) }}</span>
          </div>
          <div class="h-1.5 rounded-full bg-slate-100 overflow-hidden">
            <div
              class="h-full rounded-full transition-all duration-500"
              :class="categoryColor[item.name] || 'bg-cyan-600'"
              :style="{ width: `${item.percent.toFixed(0)}%` }"
            ></div>
          </div>
        </div>
      </div>
    </section>
  </main>
</template>
