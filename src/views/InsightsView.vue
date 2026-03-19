<script setup>
import { onMounted } from 'vue'
import useFinanceData from '../composables/useFinanceData'

const {
  riskSignals,
  emergencyFundMonths,
  profile,
  recommendations,
  opportunities,
  monthEndForecast,
  anomalySignals,
  recurringSignals,
  demoScenarios,
  activeDemoScenarioId,
  demoScenarioLoading,
  demoScenarioApplying,
  demoScenarioError,
  refreshDemoScenarios,
  activateDemoScenario,
  categorySummary,
  categoryColor,
  formatCurrency,
} = useFinanceData()

onMounted(() => {
  refreshDemoScenarios()
})

const applyScenario = async (scenarioId) => {
  await activateDemoScenario(scenarioId)
}
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

    <section
      class="rounded-2xl border p-4"
      :class="monthEndForecast.status === 'at-risk' ? 'border-rose-200 bg-rose-50' : 'border-emerald-200 bg-emerald-50'"
    >
      <div class="flex items-center justify-between">
        <h2 class="text-sm font-bold text-slate-800">Month-End Outlook</h2>
        <span
          class="rounded-full px-2 py-1 text-[10px] font-bold uppercase tracking-wider"
          :class="monthEndForecast.status === 'at-risk' ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'"
        >
          {{ monthEndForecast.status === 'at-risk' ? 'At Risk' : 'On Track' }}
        </span>
      </div>
      <p class="mt-2 text-xs text-slate-600">
        Forecast {{ formatCurrency(monthEndForecast.projectedExpenses) }} against {{ formatCurrency(monthEndForecast.monthBudget) }} for {{ monthEndForecast.monthLabel }}.
      </p>
    </section>

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

    <section class="rounded-2xl bg-white p-5 shadow-sm border border-slate-100">
      <h2 class="text-sm font-bold text-slate-800 mb-4">Spending Anomalies</h2>
      <div v-if="anomalySignals.anomalies.length" class="space-y-2">
        <div
          v-for="item in anomalySignals.anomalies.slice(0, 4)"
          :key="item.id"
          class="rounded-xl border border-amber-200 bg-amber-50 p-3"
        >
          <div class="flex items-center justify-between gap-2">
            <p class="text-xs font-bold text-slate-800">{{ item.description }}</p>
            <span class="rounded-full bg-amber-100 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-amber-700">{{ item.severity }}</span>
          </div>
          <p class="mt-1 text-[11px] text-slate-600">{{ item.date }} | {{ item.category }}</p>
          <p class="mt-1 text-xs font-semibold text-amber-800">{{ formatCurrency(item.amount) }} (baseline {{ formatCurrency(item.baseline) }})</p>
        </div>
      </div>
      <p v-else class="text-xs text-slate-500">No unusual spending spikes detected in current history.</p>
    </section>

    <section class="rounded-2xl bg-white p-5 shadow-sm border border-slate-100">
      <h2 class="text-sm font-bold text-slate-800 mb-4">Recurring and Subscriptions</h2>
      <div v-if="recurringSignals.recurring.length" class="space-y-2">
        <div
          v-for="item in recurringSignals.recurring"
          :key="item.id"
          class="rounded-xl border border-cyan-100 bg-cyan-50 p-3"
        >
          <div class="flex items-center justify-between gap-2">
            <p class="text-xs font-bold text-slate-800">{{ item.merchant }}</p>
            <span class="rounded-full bg-cyan-100 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-cyan-700">
              {{ item.subscription ? 'Subscription' : 'Recurring' }}
            </span>
          </div>
          <p class="mt-1 text-[11px] text-slate-600">{{ item.cadence }} cadence | Next expected {{ item.nextExpectedDate }}</p>
          <p class="mt-1 text-xs font-semibold text-cyan-800">Expected {{ formatCurrency(item.predictedAmount) }}</p>
        </div>
      </div>
      <p v-else class="text-xs text-slate-500">No recurring charge patterns found yet.</p>
    </section>

    <section class="rounded-2xl bg-white p-5 shadow-sm border border-slate-100">
      <div class="mb-3 flex items-center justify-between">
        <h2 class="text-sm font-bold text-slate-800">Demo Scenarios (Backend)</h2>
        <button
          type="button"
          class="rounded-full border border-slate-300 bg-white px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-slate-600"
          @click="refreshDemoScenarios"
        >
          Refresh
        </button>
      </div>

      <p v-if="demoScenarioLoading" class="text-xs text-slate-500">Loading scenarios from backend...</p>
      <p v-else-if="demoScenarioError" class="text-xs font-semibold text-rose-600">{{ demoScenarioError }}</p>
      <div v-else-if="demoScenarios.length" class="space-y-2">
        <button
          v-for="scenario in demoScenarios"
          :key="scenario.id"
          type="button"
          class="w-full rounded-xl border px-3 py-2 text-left transition"
          :class="
            activeDemoScenarioId === scenario.id
              ? 'border-cyan-300 bg-cyan-50'
              : 'border-slate-200 bg-white hover:bg-slate-50'
          "
          :disabled="demoScenarioApplying"
          @click="applyScenario(scenario.id)"
        >
          <div class="flex items-center justify-between gap-2">
            <p class="text-xs font-bold text-slate-800">{{ scenario.name }}</p>
            <span v-if="activeDemoScenarioId === scenario.id" class="rounded-full bg-cyan-100 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-cyan-700">Active</span>
          </div>
          <p v-if="scenario.description" class="mt-1 text-[11px] text-slate-500">{{ scenario.description }}</p>
        </button>
      </div>
      <p v-else class="text-xs text-slate-500">No backend scenarios returned.</p>
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
