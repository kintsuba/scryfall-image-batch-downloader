import got from 'got'

export default defineEventHandler(async (event) => {
  await new Promise(resolve => setTimeout(resolve, 100))

  const body = await readBody(event)
  const url = body.url as string

  return await got.get(url).buffer()
})
