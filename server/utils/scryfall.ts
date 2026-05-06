import * as Scry from 'scryfall-sdk'

const SCRYFALL_MIN_INTERVAL_MS = 500

let agentConfigured = false

const ensureAgent = () => {
  if (agentConfigured) return

  Scry.setAgent('Scryfall Image Batch Downloader', '1.0.0')
  Scry.setTimeout(SCRYFALL_MIN_INTERVAL_MS)
  agentConfigured = true
}

export const scryfallByName = (name: string, exact?: boolean) => {
  ensureAgent()
  return Scry.Cards.byName(name, exact)
}

export const scryfallBySet = (
  set: string,
  collectorNumber: number,
  language?: string,
) => {
  ensureAgent()
  return Scry.Cards.bySet(set, collectorNumber, language)
}

export const scryfallSearch = (
  query: string,
  options?: Parameters<typeof Scry.Cards.search>[1],
) => {
  ensureAgent()
  return Scry.Cards.search(query, options)
    .cancelAfterPage()
    .waitForAll()
}
