import got from 'got'
import sharp from 'sharp'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const urls = body.urls as string[]

  const images = await Promise.all(
    urls.map(async url => await got.get(url).buffer()),
  )

  // outputする画像の設定
  const outputImgWidth = 6720
  const outputImgHeight = 6552
  const width = 672

  const compositeParams = []

  let totalLeft = 0
  let index = 0

  for (const image of images) {
    const row = Math.floor(index / 10)

    compositeParams.push({
      input: image,
      gravity: 'northwest',
      left: totalLeft - row * outputImgWidth,
      top: row * 936,
    })

    totalLeft += width
    index++
  }

  // 連結処理
  return await sharp({
    create: {
      width: outputImgWidth,
      height: outputImgHeight,
      channels: 3,
      background: { r: 0, g: 0, b: 0 },
    },
  })
    .composite(compositeParams)
    .png()
    .toBuffer()
})
