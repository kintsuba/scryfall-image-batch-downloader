<template>
  <UModal
    v-model:open="isModalOpenRef"
    title="Select a download option"
  >
    <template #body>
      <div class="flex flex-col gap-6 py-2">
        <section class="flex flex-col gap-3">
          <UFormField
            label="File name (optional)"
            description="Specify the download file name."
          >
            <UInput
              v-model="customFileNameRef"
              placeholder="e.g. my-deck"
              :disabled="isDownloadingRef"
            />
          </UFormField>
        </section>

        <div class="flex flex-col gap-4 md:flex-row">
          <UCard class="flex-1">
            <template #header>
              <div class="flex flex-col gap-3">
                <div class="flex flex-col gap-1">
                  <h3 class="text-base font-semibold">
                    TTS Images
                  </h3>
                  <p class="text-sm text-white/60">
                    Download image sheets for Tabletop Simulator.
                  </p>
                </div>
                <UButton
                  icon="i-material-symbols-dashboard-rounded"
                  :loading="isDownloadingRef"
                  :disabled="isDownloadingRef"
                  class="w-full"
                  size="lg"
                  @click="onDownloadTtsClick"
                >
                  Download as TTS image sheets
                </UButton>
              </div>
            </template>

            <div class="flex flex-col gap-3">
              <UFormField label="Hidden Image (optional)">
                <UFileUpload
                  v-model="hiddenImageFileRef"
                  accept="image/jpeg,image/png"
                  label="Click or drag to choose an image"
                  description="Used as the hiddenImage value when downloading TTS images."
                  :disabled="isDownloadingRef"
                  :ui="{ base: 'min-h-36' }"
                />
                <p
                  v-if="hiddenImageFileRef"
                  class="text-xs text-white/60"
                >
                  Selected: {{ hiddenImageFileRef.name }}
                </p>
              </UFormField>
            </div>
          </UCard>

          <UCard class="flex-1">
            <template #header>
              <div class="flex flex-col gap-3">
                <div class="flex flex-col gap-1">
                  <h3 class="text-base font-semibold">
                    ZIP Archive
                  </h3>
                  <p class="text-sm text-white/60">
                    Download individual card images bundled together.
                  </p>
                </div>
                <UButton
                  icon="i-material-symbols-archive-rounded"
                  :loading="isDownloadingRef"
                  :disabled="isDownloadingRef"
                  class="w-full"
                  size="lg"
                  @click="onDownloadZipClick"
                >
                  Download as ZIP archive
                </UButton>
              </div>
            </template>
          </UCard>
        </div>
      </div>
    </template>
  </UModal>

  <Teleport to="body">
    <div
      v-if="isDownloadingRef"
      class="fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 bg-black/70 backdrop-blur-sm text-white"
      role="status"
      aria-live="assertive"
    >
      <UIcon
        name="i-material-symbols-sync-rounded"
        class="w-16 h-16 animate-spin"
        aria-hidden="true"
      />
      <p class="text-lg font-semibold">
        Downloading your files…
      </p>
      <p class="text-sm text-white/80">
        Large archives may take a few minutes to prepare.
      </p>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import type * as Scry from 'scryfall-sdk'

const { cards } = useCards()

const props = defineProps<{
  modelValue: boolean
  isDownloading: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'update:isDownloading': [value: boolean]
}>()

const isModalOpenRef = computed({
  get(): boolean {
    return props.modelValue
  },
  set(value: boolean) {
    emit('update:modelValue', value)
  },
})

const isDownloadingRef = computed({
  get(): boolean {
    return props.isDownloading
  },
  set(value: boolean) {
    emit('update:isDownloading', value)
  },
})

const customFileNameRef = ref<string>('')
const hiddenImageFileRef = ref<File | null>(null)

const getImageUris = (card: Scry.Card) => {
  if (card.card_faces.length >= 2 && card.card_faces[0]?.image_uris) {
    return card.card_faces[0].image_uris
  }
  else if (card.image_uris) {
    return card.image_uris
  }
}

const triggerDownload = (file: Blob, fileName: string) => {
  const url = window.URL.createObjectURL(file)
  const link = document.createElement('a')
  link.href = url
  link.setAttribute('download', fileName)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  window.URL.revokeObjectURL(url)
}

const sanitizeFileName = (name: string, fallback = '') => {
  const sanitized = name
    .replace(/\\/g, '-')
    .replace(/\//g, '-')
    .replace(/[:*?"<>|]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/[. ]+$/, '')
  return sanitized || fallback
}

const sanitizeCardName = (name: string) => sanitizeFileName(name, 'card')

const ensureFileExtension = (name: string, extension: string) => {
  const normalizedExtension = extension.startsWith('.') ? extension.toLowerCase() : `.${extension.toLowerCase()}`
  return name.toLowerCase().endsWith(normalizedExtension)
    ? name
    : `${name}${normalizedExtension}`
}

const readFileAsBase64 = (file: File) => {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result
      if (typeof result === 'string') {
        const base64 = result.split(',')[1]
        if (base64) {
          resolve(base64)
          return
        }
      }
      reject(new Error('Failed to read file as base64 string'))
    }
    reader.onerror = () => {
      reject(reader.error ?? new Error('Unknown FileReader error'))
    }
    reader.readAsDataURL(file)
  })
}

const performDownload = async (task: () => Promise<void>) => {
  if (isDownloadingRef.value) return
  isModalOpenRef.value = false

  if (cards.value.length === 0) return

  isDownloadingRef.value = true
  try {
    await task()
  }
  catch (error) {
    console.error(error)
  }
  finally {
    isDownloadingRef.value = false
  }
}

const downloadTtsImages = async () => {
  const images = cards.value
    .map((card) => {
      const imageUri = getImageUris(card as Scry.Card)?.large
      if (!imageUri) return undefined

      return {
        id: (card as Scry.Card).id,
        imageUri,
      }
    })
    .filter((entry): entry is { id: string, imageUri: string } => Boolean(entry))

  if (images.length === 0) return

  const payload: { images: { id: string, imageUri: string }[], hiddenImage?: string } = { images }

  const hiddenImage = hiddenImageFileRef.value
  if (hiddenImage) {
    payload.hiddenImage = await readFileAsBase64(hiddenImage)
  }

  const blob = await $fetch<Blob>('/api/downloadTtsImages', {
    method: 'POST',
    body: payload,
    timeout: 600000,
    responseType: 'blob',
  })

  const defaultFileName = blob.type === 'application/zip' ? 'tts-images.zip' : 'deck.png'
  const customFileName = sanitizeFileName(customFileNameRef.value)
  const fileExtension = blob.type === 'application/zip' ? 'zip' : 'png'
  const downloadFileName = customFileName
    ? ensureFileExtension(customFileName, fileExtension)
    : defaultFileName

  triggerDownload(blob, downloadFileName)
}

const downloadZipBundle = async () => {
  const files = cards.value
    .map((card, index) => {
      const url = getImageUris(card as Scry.Card)?.large
      if (!url) return undefined

      const normalizedName = `${String(index + 1).padStart(3, '0')}_${sanitizeCardName(card.name)}.png`
      return {
        url,
        fileName: normalizedName,
      }
    })
    .filter((file): file is { url: string, fileName: string } => Boolean(file))

  if (files.length === 0) return

  const blob = await $fetch<Blob>('/api/downloadZip', {
    method: 'POST',
    body: { files },
    timeout: 600000,
    responseType: 'blob',
  })

  const defaultZipFileName
    = cards.value.length === 1
      ? `${sanitizeCardName(cards.value[0]?.name ?? 'card')}.zip`
      : 'scryfall-images.zip'

  const customFileName = sanitizeFileName(customFileNameRef.value)
  const downloadFileName = customFileName
    ? ensureFileExtension(customFileName, 'zip')
    : defaultZipFileName

  triggerDownload(blob, downloadFileName)
}

const onDownloadTtsClick = () => {
  performDownload(downloadTtsImages)
}

const onDownloadZipClick = () => {
  performDownload(downloadZipBundle)
}
</script>
