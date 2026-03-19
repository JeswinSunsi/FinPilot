<script setup>
import { RouterLink, RouterView, useRoute } from 'vue-router'
import useFinanceData from './composables/useFinanceData'

const route = useRoute()
const { toasts, dismissToast } = useFinanceData()

const navItems = [
  { label: 'Dashboard', path: '/', icon: '<svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>' },
  { label: 'Transactions', path: '/transactions', icon: '<svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/></svg>' },
  { label: 'Buckets', path: '/buckets', icon: '<svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/></svg>' },
  { label: 'Insights', path: '/insights', icon: '<svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>' },
]

const isActive = (path) => route.path === path
</script>

<template>
  <div class="relative mx-auto min-h-screen w-full max-w-md overflow-hidden bg-slate-50 pb-20 shadow-2xl sm:border-x sm:border-slate-200">
    <header class="sticky top-0 z-20 border-b border-slate-200 bg-white/90 px-4 py-4 pt-8 backdrop-blur-md">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="font-display text-xl font-bold tracking-tight text-slate-900">FinPilot</h1>
          <p class="text-xs font-medium text-slate-500">Good Morning</p>
        </div>
        <div class="grid h-10 w-10 place-items-center rounded-full bg-slate-100 text-slate-600 shadow-sm ring-1 ring-slate-200">
          <span class="text-sm font-bold">FP</span>
        </div>
      </div>
    </header>

    <div class="pointer-events-none fixed left-1/2 top-24 z-40 flex w-full max-w-md -translate-x-1/2 flex-col gap-2 px-4">
      <div
        v-for="toast in toasts"
        :key="toast.id"
        class="pointer-events-auto rounded-xl border px-3 py-2 shadow-lg backdrop-blur"
        :class="toast.severity === 'severe' ? 'border-rose-300 bg-rose-50 text-rose-700' : 'border-slate-200 bg-white text-slate-700'"
      >
        <div class="flex items-start justify-between gap-3">
          <p class="text-xs font-semibold leading-relaxed">{{ toast.message }}</p>
          <button
            type="button"
            class="rounded-full px-1 text-xs font-bold text-current/80 hover:bg-black/5"
            @click="dismissToast(toast.id)"
          >
            x
          </button>
        </div>
      </div>
    </div>

    <RouterView />

    <nav class="fixed bottom-0 z-30 flex w-full max-w-md items-center justify-around border-t border-slate-200 bg-white pb-safe pt-2 sm:px-0 px-2 pb-6">
      <RouterLink
        v-for="item in navItems"
        :key="item.path"
        :to="item.path"
        class="flex w-16 flex-col items-center gap-1 rounded-xl p-2 transition-colors"
        :class="isActive(item.path) ? 'text-cyan-600' : 'text-slate-400 hover:text-slate-600'"
      >
        <span v-html="item.icon" class="mb-0.5"></span>
        <span class="text-[10px] font-semibold tracking-wide">{{ item.label }}</span>
      </RouterLink>
    </nav>
  </div>
</template>
