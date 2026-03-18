<script setup>
import { RouterLink, RouterView, useRoute } from 'vue-router'

const route = useRoute()

const navItems = [
  { label: 'Dashboard', path: '/' },
  { label: 'Transactions', path: '/transactions' },
  { label: 'Buckets', path: '/buckets' },
  { label: 'Insights', path: '/insights' },
]

const isActive = (path) => route.path === path
</script>

<template>
  <div class="relative min-h-screen overflow-hidden bg-gradient-to-b from-skyline via-slate-100 to-white pb-24">
    <div class="pointer-events-none absolute -left-20 top-0 h-80 w-80 rounded-full bg-cyan-200/45 blur-3xl"></div>
    <div class="pointer-events-none absolute -right-16 top-56 h-72 w-72 rounded-full bg-emerald-200/50 blur-3xl"></div>

    <header class="sticky top-0 z-20 border-b border-white/30 bg-white/75 backdrop-blur-lg">
      <div class="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <div>
          <p class="font-display text-lg text-ink">FinPilot AI</p>
          <p class="text-xs text-slate-500">Full Financial Companion</p>
        </div>
        <nav class="hidden gap-2 md:flex">
          <RouterLink
            v-for="item in navItems"
            :key="item.path"
            :to="item.path"
            class="rounded-xl px-3 py-2 text-sm font-semibold transition"
            :class="isActive(item.path) ? 'bg-ink text-white' : 'text-slate-700 hover:bg-slate-200'"
          >
            {{ item.label }}
          </RouterLink>
        </nav>
      </div>
    </header>

    <RouterView />

    <nav class="fixed inset-x-0 bottom-3 z-20 mx-auto flex w-[min(96%,30rem)] items-center justify-between rounded-2xl border border-white/50 bg-white/85 px-2 py-2 shadow-glow backdrop-blur-lg md:hidden">
      <RouterLink
        v-for="item in navItems"
        :key="item.path"
        :to="item.path"
        class="rounded-xl px-3 py-2 text-xs font-semibold transition"
        :class="isActive(item.path) ? 'bg-ink text-white' : 'text-slate-600'"
      >
        {{ item.label }}
      </RouterLink>
    </nav>
  </div>
</template>
