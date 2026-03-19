<script setup>
import useFinanceData from '../composables/useFinanceData'

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
  <main class="flex w-full flex-col gap-5 px-4 py-6">
    <section>
      <h1 class="text-xl font-bold tracking-tight text-slate-900">Buckets</h1>
      <p class="mt-1 text-xs text-slate-500">Auto-allocated spending envelopes</p>

      <div class="mt-4 flex flex-wrap gap-2 text-[10px] font-semibold text-slate-600">
        <span class="rounded-full bg-cyan-50 px-3 py-1.5 border border-cyan-100 text-cyan-800">Income: {{ formatCurrency(totalIncome) }}</span>
        <span class="rounded-full bg-slate-100 px-3 py-1.5 border border-slate-200">Usage: {{ budgetUsedPercent.toFixed(0) }}%</span>
        <span class="rounded-full bg-purple-50 px-3 py-1.5 border border-purple-100 text-purple-800">{{ profile.label }}</span>
      </div>
    </section>

    <section class="flex flex-col gap-3">
      <article v-for="bucket in bucketAllocation" :key="bucket.name" class="rounded-2xl bg-white p-4 shadow-sm border border-slate-100">
        <div class="flex items-center justify-between mb-3">
          <div class="flex items-center gap-2">
            <div class="h-8 w-8 rounded-full flex items-center justify-center text-xs" :class="bucketColor[bucket.name] || 'bg-cyan-100 text-cyan-700'">
               📁
            </div>
            <h2 class="font-bold text-slate-800">{{ bucket.name }}</h2>
          </div>
          <span
            class="rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider"
            :class="bucket.utilization > 100 ? 'bg-rose-50 text-rose-600 border border-rose-100' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'"
          >
            {{ bucket.utilization.toFixed(0) }}%
          </span>
        </div>
        
        <div class="flex items-end justify-between text-xs mb-2">
          <div class="flex flex-col gap-0.5">
            <span class="text-slate-400">Spent / Allocated</span>
            <span class="font-medium text-slate-700">{{ formatCurrency(bucket.spent) }} <span class="text-slate-300">/</span> {{ formatCurrency(bucket.allocated) }}</span>
          </div>
          <div class="flex flex-col items-end gap-0.5">
            <span class="text-slate-400">Left</span>
            <span class="font-bold" :class="bucket.remaining >= 0 ? 'text-emerald-600' : 'text-rose-600'">
              {{ formatCurrency(bucket.remaining) }}
            </span>
          </div>
        </div>

        <div class="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
          <div
            class="h-full rounded-full transition-all duration-500"
            :class="bucket.utilization > 100 ? 'bg-rose-500' : 'bg-cyan-500'"
            :style="{ width: `${Math.min(bucket.utilization, 100)}%` }"
          ></div>
        </div>
      </article>
    </section>

    <section class="mt-2 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 p-5 shadow-lg text-white">
      <div class="flex items-center justify-between mb-4">
        <div>
          <h2 class="text-sm font-bold">Automation Playbook</h2>
          <p class="text-[10px] text-slate-400 mt-0.5">AI-driven bucket insights</p>
        </div>
        <RouterLink to="/insights" class="rounded-full bg-white/10 px-3 py-1.5 text-[10px] font-bold transition hover:bg-white/20">
          More
        </RouterLink>
      </div>
      
      <div class="flex flex-col gap-3">
        <div
          v-for="item in recommendations.slice(0, 2)"
          :key="item.title"
          class="flex items-start gap-3 rounded-xl bg-white/5 p-3"
        >
          <div class="mt-0.5 text-lg">💡</div>
          <div>
            <p class="text-xs font-bold text-white">{{ item.title }}</p>
            <p class="mt-1 text-[10px] text-slate-300 leading-relaxed">{{ item.detail }}</p>
          </div>
        </div>
      </div>
    </section>
  </main>
</template>
