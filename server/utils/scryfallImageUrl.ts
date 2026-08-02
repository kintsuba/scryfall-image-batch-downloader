export const SCRYFALL_IMAGE_HOSTS = [
  'cards.scryfall.io',
] as const

const SCRYFALL_IMAGE_HOST_SET = new Set<string>(SCRYFALL_IMAGE_HOSTS)

export const parseScryfallImageUrl = (input: string) => {
  const url = new URL(input)

  if (url.protocol !== 'https:') {
    throw new Error('Scryfall image URL must use HTTPS')
  }

  if (!SCRYFALL_IMAGE_HOST_SET.has(url.hostname)) {
    throw new Error('Scryfall image URL host is not allowed')
  }

  if (url.username || url.password) {
    throw new Error('Scryfall image URL must not contain credentials')
  }

  if (url.port) {
    throw new Error('Scryfall image URL must use the default HTTPS port')
  }

  return url
}

export const isAllowedScryfallImageUrl = (input: string) => {
  try {
    parseScryfallImageUrl(input)
    return true
  }
  catch {
    return false
  }
}
