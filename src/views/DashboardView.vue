<script setup>
import { useFinanceData } from '../composables/useFinanceData'

const {
  profile,
  totalIncome,
  totalExpenses,
  netFlow,
  budgetLimit,
  budgetUsedPercent,
  savingsRate,
  financialHealthScore,
  monthlyTrend,
  maxTrendValue,
  recommendations,
  formatCurrency,
} = useFinanceData()
</script>

<template>
  <main class="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-6 sm:px-6 sm:py-10">
    <section class="glass rounded-3xl px-5 py-6 shadow-glow sm:px-8">
      <div class="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p class="font-display text-sm uppercase tracking-[0.16em] text-slate-500">AI Financial Companion</p>
          <h1 class="font-display text-3xl text-ink sm:text-4xl">Financial Command Center</h1>
          <p class="mt-2 max-w-xl text-sm text-slate-600 sm:text-base">
            Intelligent budgeting, automated categorization, risk prediction, and saving opportunities.
          </p>
        </div>
      </div>
    </section>

    <section class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <article class="metric-card">
        <p class="text-xs uppercase tracking-wide text-slate-500">Net Flow</p>
        <p class="mt-2 font-display text-3xl text-ink">{{ formatCurrency(netFlow) }}</p>
        <p class="mt-2 text-xs text-emerald-700">Income {{ formatCurrency(totalIncome) }} | Expenses {{ formatCurrency(totalExpenses) }}</p>
      </article>
      <article class="metric-card">
        <p class="text-xs uppercase tracking-wide text-slate-500">Budget Utilization</p>
        <p class="mt-2 font-display text-3xl text-ink">{{ budgetUsedPercent.toFixed(0) }}%</p>
        <div class="mt-3 h-2 rounded-full bg-slate-200">
          <div class="h-full rounded-full bg-cyan-600" :style="{ width: `${budgetUsedPercent}%` }"></div>
        </div>
        <p class="mt-2 text-xs text-slate-600">Budget cap {{ formatCurrency(budgetLimit) }}</p>
      </article>
      <article class="metric-card">
        <p class="text-xs uppercase tracking-wide text-slate-500">Savings Rate</p>
        <p class="mt-2 font-display text-3xl text-ink">{{ savingsRate.toFixed(1) }}%</p>
        <p class="mt-2 text-xs text-slate-600">Auto-reserve plan is profile aligned</p>
      </article>
      <article class="metric-card">
        <p class="text-xs uppercase tracking-wide text-slate-500">Health Score</p>
        <div class="mt-2 flex items-center justify-between">
          <p class="font-display text-3xl text-ink">{{ financialHealthScore }}</p>
          <div
            class="grid h-14 w-14 place-items-center rounded-full text-xs font-bold text-slate-700"
            :style="{ background: `conic-gradient(#0891b2 ${financialHealthScore}%, #e2e8f0 ${financialHealthScore}% 100%)` }"
          >
            <span class="grid h-10 w-10 place-items-center rounded-full bg-white">AI</span>
          </div>
        </div>
        <p class="mt-2 text-xs text-slate-600">Budget + bucket + reserve diagnostics</p>
      </article>
    </section>

    <section class="grid gap-4 xl:grid-cols-3">
      <article class="metric-card xl:col-span-2">
        <div class="flex items-center justify-between">
          <h2 class="font-display text-xl text-ink">Spending Trends</h2>
          <p class="text-xs text-slate-500">Income vs expense by month</p>
        </div>
        <div class="mt-5 grid grid-cols-3 gap-3">
          <div
            v-for="month in monthlyTrend"
            :key="month.label"
            class="rounded-2xl bg-slate-50 p-3 ring-1 ring-slate-200"
          >
            <p class="text-xs font-semibold uppercase text-slate-500">{{ month.label }}</p>
            <div class="mt-3 space-y-2">
              <div>
                <div class="mb-1 flex items-center justify-between text-[11px] text-slate-500">
                  <span>Income</span><span>{{ formatCurrency(month.income) }}</span>
                </div>
                <div class="h-2 rounded-full bg-slate-200">
                  <div class="h-full rounded-full bg-emerald-500" :style="{ width: `${(month.income / maxTrendValue) * 100}%` }"></div>
                </div>
              </div>
              <div>
                <div class="mb-1 flex items-center justify-between text-[11px] text-slate-500">
                  <span>Expense</span><span>{{ formatCurrency(month.expenses) }}</span>
                </div>
                <div class="h-2 rounded-full bg-slate-200">
                  <div class="h-full rounded-full bg-rose-500" :style="{ width: `${(month.expenses / maxTrendValue) * 100}%` }"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </article>

      <article class="metric-card">
        <div class="flex items-center justify-between">
          <h2 class="font-display text-xl text-ink">Top Recommendations</h2>
          <RouterLink to="/insights" class="text-xs font-semibold text-cyan-700">View all</RouterLink>
        </div>
        <div class="mt-4 space-y-3">
          <div
            v-for="item in recommendations.slice(0, 3)"
            :key="item.title"
            class="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200"
          >
            <div class="flex items-center justify-between gap-3">
              <h3 class="font-semibold text-slate-900">{{ item.title }}</h3>
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
    </section>
  </main>
</template>
