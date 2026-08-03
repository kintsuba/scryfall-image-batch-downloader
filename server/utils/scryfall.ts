import * as Scry from 'scryfall-sdk'

const SCRYFALL_MIN_INTERVAL_MS = 800

type ScryfallRateLimitState = {
  nextRequestAt: number
  pendingRequest: Promise<void>
}

let agentConfigured = false

const ensureAgent = () => {
  if (agentConfigured) return

  Scry.setAgent('Scryfall Image Batch Downloader', '1.0.0')
  agentConfigured = true
}

const getRateLimitState = () => {
  const globalScope = globalThis as typeof globalThis & {
    __sibdScryfallRateLimit?: ScryfallRateLimitState
  }

  globalScope.__sibdScryfallRateLimit ??= {
    nextRequestAt: 0,
    pendingRequest: Promise.resolve(),
  }

  return globalScope.__sibdScryfallRateLimit
}

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

const withScryfallRateLimit = async <T>(request: () => Promise<T>) => {
  const state = getRateLimitState()
  const previousRequest = state.pendingRequest
  let releaseCurrentRequest!: () => void

  state.pendingRequest = new Promise((resolve) => {
    releaseCurrentRequest = resolve
  })

  try {
    await previousRequest

    const waitMs = Math.max(state.nextRequestAt - Date.now(), 0)
    if (waitMs > 0) {
      await wait(waitMs)
    }

    state.nextRequestAt = Date.now() + SCRYFALL_MIN_INTERVAL_MS
    ensureAgent()

    return await request()
  }
  finally {
    releaseCurrentRequest()
  }
}

export const scryfallByName = (name: string, exact?: boolean) => {
  return withScryfallRateLimit(() => Scry.Cards.byName(name, exact))
}

export const scryfallBySet = (
  set: string,
  collectorNumber: string,
  language?: string,
) => {
  return withScryfallRateLimit(() =>
    Scry.Cards.bySet(set, collectorNumber, language),
  )
}

export const scryfallSearch = (
  query: string,
  options?: Parameters<typeof Scry.Cards.search>[1],
) => {
  return withScryfallRateLimit(() =>
    Scry.Cards.search(query, options)
      .cancelAfterPage()
      .waitForAll(),
  )
}
