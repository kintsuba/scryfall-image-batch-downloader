import got from 'got'
import {
  downloadBodySchema,
  validateWith,
} from '../utils/validation'

export default defineEventHandler(async (event) => {
  await new Promise(resolve => setTimeout(resolve, 100))

  const { url } = await readValidatedBody(
    event,
    validateWith(downloadBodySchema),
  )

  return await got.get(url).buffer()
})
