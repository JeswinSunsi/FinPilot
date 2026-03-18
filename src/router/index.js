import { createRouter, createWebHistory } from 'vue-router'
import DashboardView from '../views/DashboardView.vue'
import TransactionsView from '../views/TransactionsView.vue'
import BucketsView from '../views/BucketsView.vue'
import InsightsView from '../views/InsightsView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'dashboard',
      component: DashboardView,
    },
    {
      path: '/transactions',
      name: 'transactions',
      component: TransactionsView,
    },
    {
      path: '/buckets',
      name: 'buckets',
      component: BucketsView,
    },
    {
      path: '/insights',
      name: 'insights',
      component: InsightsView,
    },
  ],
})

export default router
