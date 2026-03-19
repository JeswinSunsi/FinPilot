import { computed, ref, watch } from 'vue'

const profiles = {
  student: {
    label: 'Student',
    budgetRatio: 0.65,
    emergencyTargetMonths: 2,
    focus: 'Keep fixed costs low and preserve tuition runway.',
    bucketTemplate: {
      Food: 0.18,
      Utilities: 0.1,
      Housing: 0.34,
      Transport: 0.08,
      Health: 0.06,
      Misc: 0.1,
      Savings: 0.14,
    },
  },
  professional: {
    label: 'Professional',
    budgetRatio: 0.72,
    emergencyTargetMonths: 4,
    focus: 'Balance comfort spending with steady long-term savings.',
    bucketTemplate: {
      Food: 0.15,
      Utilities: 0.09,
      Housing: 0.32,
      Transport: 0.1,
      Health: 0.08,
      Misc: 0.1,
      Savings: 0.16,
    },
  },
  advisor: {
    label: 'Advisor',
    budgetRatio: 0.68,
    emergencyTargetMonths: 6,
    focus: 'Track risk-adjusted cash behavior and optimize reserves.',
    bucketTemplate: {
      Food: 0.14,
      Utilities: 0.1,
      Housing: 0.3,
      Transport: 0.08,
      Health: 0.08,
      Misc: 0.1,
      Savings: 0.2,
    },
  },
}

const selectedProfile = ref('professional')

const backendBaseUrl = (import.meta.env.VITE_SMS_BACKEND_BASE_URL ?? 'http://127.0.0.1:8010').replace(
  /\/$/,
  '',
)

const realtimeStatus = ref('disconnected')
const realtimeError = ref('')
const backendSimulationRunning = ref(false)
const liveMessageCount = ref(0)

let feedSocket = null
let reconnectTimer = null
let connectionStarted = false
const seenLiveIds = new Set()

const transactions = ref([
  { id: 1, date: '2026-01-04', description: 'Payroll Deposit', amount: 5400, direction: 'in' },
  { id: 2, date: '2026-01-06', description: 'Rent Transfer', amount: 1720, direction: 'out' },
  { id: 3, date: '2026-01-08', description: 'Metro Card Reload', amount: 78, direction: 'out' },
  { id: 4, date: '2026-01-10', description: 'Grocery Market', amount: 210, direction: 'out' },
  { id: 5, date: '2026-01-14', description: 'Video Streaming', amount: 16, direction: 'out' },
  { id: 6, date: '2026-02-04', description: 'Payroll Deposit', amount: 5400, direction: 'in' },
  { id: 7, date: '2026-02-07', description: 'Coffee and Lunch', amount: 96, direction: 'out' },
  { id: 8, date: '2026-02-09', description: 'Utilities Electricity', amount: 124, direction: 'out' },
  { id: 9, date: '2026-02-11', description: 'Online Shopping', amount: 340, direction: 'out' },
  { id: 10, date: '2026-02-19', description: 'Freelance Invoice', amount: 850, direction: 'in' },
  { id: 11, date: '2026-03-03', description: 'Payroll Deposit', amount: 5400, direction: 'in' },
  { id: 12, date: '2026-03-05', description: 'Gym Membership', amount: 52, direction: 'out' },
  { id: 13, date: '2026-03-07', description: 'Pharmacy Purchase', amount: 45, direction: 'out' },
  { id: 14, date: '2026-03-10', description: 'Dining and Takeout', amount: 240, direction: 'out' },
  { id: 15, date: '2026-03-14', description: 'Travel Booking', amount: 460, direction: 'out' },
  { id: 16, date: '2026-03-16', description: 'Home Internet Bill', amount: 88, direction: 'out' },
  { id: 17, date: '2026-03-17', description: 'Bookstore', amount: 64, direction: 'out' },
])

const simulationMessages = [
  'Paid Rs 18.50 for coffee at Central Cafe',
  'UPI debit 1290 to FreshMart grocery store',
  'Uber ride charged Rs 24.30',
  'Electricity bill paid 3400',
  'Salary credited 5400',
  'Pharmacy purchase amount 45',
  'Netflix subscription 16.99',
]

const categoryRules = {
  Housing: ['rent', 'mortgage', 'lease', 'apartment'],
  Transport: ['metro', 'fuel', 'transport', 'uber', 'taxi', 'bus'],
  Food: ['grocery', 'lunch', 'coffee', 'dining', 'takeout', 'restaurant'],
  Utilities: ['electricity', 'water', 'internet', 'utility', 'bill'],
  Health: ['pharmacy', 'gym', 'doctor', 'clinic', 'hospital'],
  Lifestyle: ['shopping', 'travel', 'streaming', 'entertainment', 'bookstore'],
}

const defaultBucketByCategory = {
  Housing: 'Housing',
  Transport: 'Transport',
  Food: 'Food',
  Utilities: 'Utilities',
  Health: 'Health',
  Lifestyle: 'Misc',
  Other: 'Misc',
}

const bucketByCategory = ref({ ...defaultBucketByCategory })

const buildBucketSettings = (template) =>
  Object.entries(template).map(([name, ratio], index) => ({
    id: `bucket-${index + 1}`,
    name,
    ratio,
    customLimit: null,
  }))

const bucketSettings = ref(buildBucketSettings(profiles[selectedProfile.value].bucketTemplate))

watch(
  selectedProfile,
  (nextProfile) => {
    bucketSettings.value = buildBucketSettings(profiles[nextProfile].bucketTemplate)
    bucketByCategory.value = { ...defaultBucketByCategory }
  },
  { flush: 'sync' },
)

const backendBucketToCategory = {
  Groceries: 'Food',
  'Food & Dining': 'Food',
  Transport: 'Transport',
  Shopping: 'Lifestyle',
  'Bills & Utilities': 'Utilities',
  Health: 'Health',
  Entertainment: 'Lifestyle',
  Investments: 'Other',
  'Cash Withdrawal': 'Other',
  Miscellaneous: 'Other',
}

const expenseHints = [
  'paid',
  'purchase',
  'debit',
  'charged',
  'spent',
  'upi',
  'bill',
  'subscription',
  'transfer to',
]

const incomeHints = ['credited', 'salary', 'deposit', 'received', 'refund']

const formatCurrency = (value) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(value)

const categorizeTransaction = (tx) => {
  if (tx.category) {
    return tx.category
  }

  if (tx.direction === 'in') {
    return 'Income'
  }

  const source = tx.description.toLowerCase()

  for (const [category, words] of Object.entries(categoryRules)) {
    if (words.some((word) => source.includes(word))) {
      return category
    }
  }

  return 'Other'
}

const findAmountInText = (text) => {
  const normalized = text.replace(/,/g, '')
  const match = normalized.match(/(?:[$€£₹]|rs\.?|inr)?\s*(\d+(?:\.\d{1,2})?)/i)

  if (!match) {
    return 0
  }

  return Number.parseFloat(match[1])
}

const inferDirectionFromMessage = (text) => {
  const lower = text.toLowerCase()

  if (incomeHints.some((hint) => lower.includes(hint))) {
    return 'in'
  }

  if (expenseHints.some((hint) => lower.includes(hint))) {
    return 'out'
  }

  return 'out'
}

const normalizeMessageDescription = (text) =>
  text
    .replace(/\s+/g, ' ')
    .replace(/\b(?:usd|inr|rs\.?|upi)\b/gi, '')
    .trim()

const nextTransactionId = () =>
  transactions.value.reduce((maxId, tx) => Math.max(maxId, tx.id), 0) + 1

const parseMessagesToTransactions = (rawMessages, options = {}) => {
  const { includeIncome = true } = options
  const lines = Array.isArray(rawMessages)
    ? rawMessages
    : rawMessages
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter(Boolean)

  const baseDate = new Date('2026-03-18')
  let idCursor = nextTransactionId()

  return lines
    .map((line, index) => {
      const amount = findAmountInText(line)
      if (!amount) {
        return null
      }

      const direction = inferDirectionFromMessage(line)
      if (!includeIncome && direction === 'in') {
        return null
      }

      const txDate = new Date(baseDate)
      txDate.setDate(baseDate.getDate() - index)

      return {
        id: idCursor++,
        date: txDate.toISOString().slice(0, 10),
        description: normalizeMessageDescription(line),
        amount,
        direction,
        source: 'message-scan',
      }
    })
    .filter(Boolean)
}

const ingestMessages = (rawMessages, options = {}) => {
  const parsed = parseMessagesToTransactions(rawMessages, options)

  if (parsed.length > 0) {
    transactions.value.push(...parsed)
  }

  return parsed
}

const runExpenseSimulation = () => ingestMessages(simulationMessages, { includeIncome: false })

const backendWsUrl = () => {
  const url = new URL(backendBaseUrl)
  url.protocol = url.protocol === 'https:' ? 'wss:' : 'ws:'
  url.pathname = '/ws/messages'
  return url.toString()
}

const toLiveTransaction = (item) => {
  const fallbackId = `${item.transaction_id ?? ''}-${item.timestamp ?? Date.now()}`
  const id = `live-${item.id ?? fallbackId}`

  return {
    id,
    date: (item.timestamp ?? new Date().toISOString()).slice(0, 10),
    description: item.message ?? `Card spend at ${item.merchant ?? 'merchant'}`,
    amount: Number(item.amount) || 0,
    direction: 'out',
    source: 'backend-live',
    occurredAt: item.timestamp ?? new Date().toISOString(),
    category: backendBucketToCategory[item.bucket] ?? 'Other',
    bucket: bucketByCategory[backendBucketToCategory[item.bucket] ?? 'Other'] ?? 'Misc',
    backendBucket: item.bucket ?? 'Miscellaneous',
    merchant: item.merchant ?? '',
    transactionId: item.transaction_id ?? '',
  }
}

const addLiveTransaction = (item) => {
  const tx = toLiveTransaction(item)

  if (seenLiveIds.has(tx.id)) {
    return false
  }

  seenLiveIds.add(tx.id)
  transactions.value.push(tx)
  liveMessageCount.value += 1
  return true
}

const ingestHistoryPacket = (items) => {
  const sortedItems = [...items].sort((a, b) =>
    String(a.timestamp ?? '').localeCompare(String(b.timestamp ?? '')),
  )

  for (const item of sortedItems) {
    addLiveTransaction(item)
  }
}

const refreshBackendSimulationStatus = async () => {
  try {
    const response = await fetch(`${backendBaseUrl}/simulation/status`)
    if (!response.ok) {
      throw new Error(`Status HTTP ${response.status}`)
    }

    const payload = await response.json()
    backendSimulationRunning.value = Boolean(payload.running)
  } catch {
    backendSimulationRunning.value = false
  }
}

const setBackendSimulationState = async (state) => {
  const response = await fetch(`${backendBaseUrl}/simulation/control`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ state }),
  })

  if (!response.ok) {
    throw new Error(`Control HTTP ${response.status}`)
  }

  const payload = await response.json()
  backendSimulationRunning.value = Boolean(payload.running)
  return payload
}

const ensureRealtimeConnection = () => {
  if (typeof window === 'undefined' || connectionStarted) {
    return
  }

  connectionStarted = true
  realtimeStatus.value = 'connecting'
  realtimeError.value = ''

  refreshBackendSimulationStatus()

  feedSocket = new WebSocket(backendWsUrl())

  feedSocket.onopen = () => {
    realtimeStatus.value = 'connected'
    realtimeError.value = ''
  }

  feedSocket.onmessage = (event) => {
    try {
      const packet = JSON.parse(event.data)

      if (packet.type === 'history' && Array.isArray(packet.messages)) {
        ingestHistoryPacket(packet.messages)
        return
      }

      if (packet.type === 'message' && packet.data) {
        addLiveTransaction(packet.data)
      }
    } catch {
      realtimeError.value = 'Live feed packet parse failed.'
    }
  }

  feedSocket.onerror = () => {
    realtimeStatus.value = 'error'
    realtimeError.value = 'Unable to connect to backend live feed.'
  }

  feedSocket.onclose = () => {
    realtimeStatus.value = 'disconnected'
    connectionStarted = false

    if (reconnectTimer) {
      window.clearTimeout(reconnectTimer)
    }

    reconnectTimer = window.setTimeout(() => {
      ensureRealtimeConnection()
    }, 2000)
  }
}

const profile = computed(() => profiles[selectedProfile.value])

const editableBucketNames = computed(() => bucketSettings.value.map((bucket) => bucket.name))

const assignTransactionBucket = (transactionId, bucketName) => {
  if (!editableBucketNames.value.includes(bucketName)) {
    return false
  }

  const tx = transactions.value.find((item) => item.id === transactionId)
  if (!tx || tx.direction !== 'out') {
    return false
  }

  tx.bucket = bucketName
  return true
}

const updateBucketSettings = (bucketId, payload) => {
  const bucket = bucketSettings.value.find((item) => item.id === bucketId)
  if (!bucket) {
    return { ok: false, error: 'Bucket not found.' }
  }

  const nextName = typeof payload.name === 'string' ? payload.name.trim() : bucket.name
  if (!nextName) {
    return { ok: false, error: 'Bucket name is required.' }
  }

  if (
    bucketSettings.value.some(
      (item) => item.id !== bucketId && item.name.toLowerCase() === nextName.toLowerCase(),
    )
  ) {
    return { ok: false, error: 'Bucket name already exists.' }
  }

  const oldName = bucket.name
  if (nextName !== oldName) {
    bucket.name = nextName

    for (const tx of transactions.value) {
      if (tx.direction === 'out' && tx.bucket === oldName) {
        tx.bucket = nextName
      }
    }

    for (const [category, mappedName] of Object.entries(bucketByCategory.value)) {
      if (mappedName === oldName) {
        bucketByCategory.value[category] = nextName
      }
    }
  }

  if (payload.limit !== undefined) {
    const parsedLimit = Number(payload.limit)
    if (!Number.isFinite(parsedLimit) || parsedLimit < 0) {
      return { ok: false, error: 'Budget limit must be a valid positive number.' }
    }
    bucket.customLimit = parsedLimit
  }

  return { ok: true, bucket }
}

const resetBucketLimit = (bucketId) => {
  const bucket = bucketSettings.value.find((item) => item.id === bucketId)
  if (!bucket) {
    return false
  }

  bucket.customLimit = null
  return true
}

const profiledTransactions = computed(() =>
  transactions.value.map((tx) => {
    if (tx.direction === 'in') {
      return {
        ...tx,
        category: tx.category ?? 'Income',
        bucket: tx.bucket ?? 'Income',
      }
    }

    if (tx.category && tx.bucket) {
      return tx
    }

    const category = categorizeTransaction(tx)
    return {
      ...tx,
      category,
      bucket: tx.bucket ?? bucketByCategory.value[category] ?? 'Misc',
    }
  }),
)

const totalIncome = computed(() =>
  profiledTransactions.value
    .filter((tx) => tx.direction === 'in')
    .reduce((sum, tx) => sum + tx.amount, 0),
)

const totalExpenses = computed(() =>
  profiledTransactions.value
    .filter((tx) => tx.direction === 'out')
    .reduce((sum, tx) => sum + tx.amount, 0),
)

const budgetLimit = computed(() => totalIncome.value * profile.value.budgetRatio)
const netFlow = computed(() => totalIncome.value - totalExpenses.value)
const savingsRate = computed(() => (totalIncome.value > 0 ? (netFlow.value / totalIncome.value) * 100 : 0))
const budgetUsedPercent = computed(() =>
  budgetLimit.value > 0 ? Math.min((totalExpenses.value / budgetLimit.value) * 100, 100) : 0,
)

const monthlyTrend = computed(() => {
  const map = new Map()

  for (const tx of profiledTransactions.value) {
    const monthKey = tx.date.slice(0, 7)
    const monthLabel = new Date(`${monthKey}-01`).toLocaleDateString('en-US', { month: 'short' })
    const bucket = map.get(monthKey) ?? { label: monthLabel, income: 0, expenses: 0 }

    if (tx.direction === 'in') bucket.income += tx.amount
    else bucket.expenses += tx.amount

    map.set(monthKey, bucket)
  }

  return [...map.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([, value]) => value)
})

const maxTrendValue = computed(() =>
  Math.max(...monthlyTrend.value.map((item) => Math.max(item.income, item.expenses)), 1),
)

const categorySummary = computed(() => {
  const grouped = {}

  for (const tx of profiledTransactions.value.filter((item) => item.direction === 'out')) {
    grouped[tx.category] = (grouped[tx.category] ?? 0) + tx.amount
  }

  return Object.entries(grouped)
    .map(([name, amount]) => ({
      name,
      amount,
      percent: totalExpenses.value > 0 ? (amount / totalExpenses.value) * 100 : 0,
    }))
    .sort((a, b) => b.amount - a.amount)
})

const bucketAllocation = computed(() => {
  return bucketSettings.value.map((bucket) => {
    const allocated = bucket.customLimit ?? totalIncome.value * bucket.ratio
    const spent = profiledTransactions.value
      .filter((tx) => tx.direction === 'out' && tx.bucket === bucket.name)
      .reduce((sum, tx) => sum + tx.amount, 0)

    return {
      id: bucket.id,
      name: bucket.name,
      ratio: bucket.ratio,
      customLimit: bucket.customLimit,
      allocated,
      spent,
      remaining: allocated - spent,
      utilization: allocated > 0 ? (spent / allocated) * 100 : 0,
    }
  })
})

const emergencyFundMonths = computed(() => {
  const monthlyBase = Math.max(totalExpenses.value / 3, 1)
  return netFlow.value > 0 ? (netFlow.value * 3) / monthlyBase : 0
})

const riskSignals = computed(() => {
  const discretionary = bucketAllocation.value
    .filter((item) => ['Food', 'Misc'].includes(item.name))
    .reduce((sum, item) => sum + item.spent, 0)

  return {
    overspending: totalExpenses.value > budgetLimit.value,
    discretionarySpike: totalExpenses.value > 0 ? discretionary / totalExpenses.value > 0.4 : false,
    weakReserve: emergencyFundMonths.value < profile.value.emergencyTargetMonths,
    bucketPressure: bucketAllocation.value.some((item) => item.utilization > 100),
  }
})

const toasts = ref([])
let toastIdCursor = 0

const pushToast = (message, severity = 'info') => {
  const id = ++toastIdCursor
  toasts.value.push({ id, message, severity })

  window.setTimeout(() => {
    toasts.value = toasts.value.filter((toast) => toast.id !== id)
  }, 4500)

  return id
}

const dismissToast = (toastId) => {
  toasts.value = toasts.value.filter((toast) => toast.id !== toastId)
}

watch(
  riskSignals,
  (next, prev) => {
    if (next.overspending && !prev?.overspending) {
      pushToast('Severe: Total spending crossed your overall budget guardrail.', 'severe')
    }

    if (next.bucketPressure && !prev?.bucketPressure) {
      pushToast('Severe: One or more buckets are now overspent.', 'severe')
    }
  },
  { immediate: true },
)

const financialHealthScore = computed(() => {
  let score = 90

  if (riskSignals.value.overspending) score -= 25
  if (riskSignals.value.discretionarySpike) score -= 12
  if (riskSignals.value.weakReserve) score -= 18
  if (riskSignals.value.bucketPressure) score -= 10
  if (savingsRate.value >= 20) score += 6

  return Math.min(Math.max(score, 30), 99)
})

const recommendations = computed(() => {
  const notes = []

  if (riskSignals.value.bucketPressure) {
    notes.push({
      title: 'Rebalance bucket allocations',
      priority: 'High',
      detail: 'One or more spending buckets are over capacity. Shift discretionary spend to stay inside each envelope.',
    })
  }

  if (riskSignals.value.overspending) {
    notes.push({
      title: 'Enforce budget guardrail',
      priority: 'High',
      detail: `Expenses exceed budget by ${formatCurrency(totalExpenses.value - budgetLimit.value)}. Freeze optional purchases for the next 10 days.`,
    })
  }

  if (riskSignals.value.weakReserve) {
    notes.push({
      title: 'Increase emergency reserve pace',
      priority: 'Medium',
      detail: `Current reserve runway is ${emergencyFundMonths.value.toFixed(1)} months. Target ${profile.value.emergencyTargetMonths} months with scheduled transfers.`,
    })
  }

  notes.push({
    title: 'Activate auto-segregation transfers',
    priority: 'Low',
    detail: 'Move income into Food, Utilities, Housing, Transport, Health, Misc, and Savings buckets immediately on deposit.',
  })

  return notes
})

const opportunities = computed(() => [
  {
    title: 'Food bucket optimization',
    value: formatCurrency(
      (bucketAllocation.value.find((item) => item.name === 'Food')?.spent ?? 0) * 0.14,
    ),
    detail: 'Reduce meal delivery and subscription snack orders.',
  },
  {
    title: 'Utilities efficiency',
    value: formatCurrency(
      (bucketAllocation.value.find((item) => item.name === 'Utilities')?.spent ?? 0) * 0.1,
    ),
    detail: 'Lower recurring utility bills through usage caps and plan comparisons.',
  },
  {
    title: 'Automatic savings sweep',
    value: formatCurrency(Math.max(netFlow.value * 0.35, 0)),
    detail: 'Daily sweep from checking to savings when balance exceeds threshold.',
  },
])

const benefitPoints = [
  'Encourages responsible habits through automatic bucket limits and alerts.',
  'Improves financial awareness with real-time categorization and spending trend intelligence.',
  'Supports planning with risk scoring, opportunity forecasting, and guided recommendations.',
]

const categoryColor = {
  Housing: 'bg-slate-700',
  Transport: 'bg-cyan-600',
  Food: 'bg-amber-500',
  Utilities: 'bg-blue-600',
  Health: 'bg-emerald-600',
  Lifestyle: 'bg-rose-500',
  Other: 'bg-violet-500',
}

const bucketColor = {
  Food: 'bg-amber-500',
  Utilities: 'bg-blue-600',
  Housing: 'bg-slate-700',
  Transport: 'bg-cyan-600',
  Health: 'bg-emerald-600',
  Misc: 'bg-fuchsia-500',
  Savings: 'bg-lime-600',
}

export const useFinanceData = () => {
  ensureRealtimeConnection()

  return {
    profiles,
    selectedProfile,
    profile,
    transactions,
    simulationMessages,
    profiledTransactions,
    editableBucketNames,
    bucketSettings,
    assignTransactionBucket,
    updateBucketSettings,
    resetBucketLimit,
    totalIncome,
    totalExpenses,
    budgetLimit,
    budgetUsedPercent,
    netFlow,
    savingsRate,
    monthlyTrend,
    maxTrendValue,
    categorySummary,
    bucketAllocation,
    emergencyFundMonths,
    riskSignals,
    financialHealthScore,
    recommendations,
    opportunities,
    benefitPoints,
    categoryColor,
    bucketColor,
    parseMessagesToTransactions,
    ingestMessages,
    runExpenseSimulation,
    realtimeStatus,
    realtimeError,
    backendSimulationRunning,
    liveMessageCount,
    refreshBackendSimulationStatus,
    setBackendSimulationState,
    toasts,
    dismissToast,
    formatCurrency,
  }
}

export default useFinanceData
