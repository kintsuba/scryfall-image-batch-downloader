<template>
  <UModal
    v-model:open="isModalOpenRef"
    :title="t('downloadModal.title')"
    :ui="{ content: 'max-w-xl sm:max-w-2xl' }"
  >
    <template #body>
      <div class="flex flex-col gap-6 py-2">
        <section class="flex flex-col gap-3">
          <UFormField
            :label="t('downloadModal.fileNameField.label')"
            :description="t('downloadModal.fileNameField.description')"
          >
            <UInput
              v-model="customFileNameRef"
              :placeholder="t('downloadModal.fileNameField.placeholder')"
              :disabled="isDownloadingRef"
            />
          </UFormField>
        </section>

        <div class="flex flex-col gap-4 md:flex-row">
          <UCard
            class="flex-1"
            :ui="{ root: 'h-full' }"
          >
            <template #header>
              <div class="flex flex-col gap-3">
                <div class="flex flex-col gap-1">
                  <h3 class="text-base font-semibold">
                    {{ t('downloadModal.zipCard.title') }}
                  </h3>
                  <p class="text-sm text-muted">
                    {{ t('downloadModal.zipCard.description') }}
                  </p>
                </div>
              </div>
            </template>
            <template #footer>
              <UButton
                icon="i-material-symbols-archive-rounded"
                :loading="isDownloadingRef"
                :disabled="isDownloadingRef"
                class="w-full"
                size="lg"
                @click="onDownloadZipClick"
              >
                {{ t('downloadModal.zipCard.button') }}
              </UButton>
            </template>
          </UCard>
          <UCard class="flex-1">
            <template #header>
              <div class="flex flex-col gap-3">
                <div class="flex flex-col gap-1">
                  <h3 class="text-base font-semibold">
                    {{ t('downloadModal.ttsCard.title') }}
                  </h3>
                  <p class="text-sm text-muted">
                    {{ t('downloadModal.ttsCard.description') }}
                  </p>
                </div>
              </div>
            </template>

            <div class="flex flex-col gap-3">
              <UFormField :label="t('downloadModal.hiddenImageField.label')">
                <UFileUpload
                  v-model="hiddenImageFileRef"
                  accept="image/jpeg,image/png"
                  :label="t('downloadModal.hiddenImageField.uploadLabel')"
                  :description="t('downloadModal.hiddenImageField.uploadDescription')"
                  :disabled="isDownloadingRef"
                  :ui="{ base: 'min-h-36' }"
                />
              </UFormField>
            </div>

            <template #footer>
              <UButton
                icon="i-material-symbols-dashboard-rounded"
                :loading="isDownloadingRef"
                :disabled="isDownloadingRef"
                class="w-full"
                size="lg"
                @click="onDownloadTtsClick"
              >
                {{ t('downloadModal.ttsCard.button') }}
              </UButton>
            </template>
          </UCard>
        </div>
      </div>
    </template>
  </UModal>

  <Teleport to="body">
    <div
      v-if="isDownloadingRef"
      class="fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 bg-black/70 backdrop-blur-sm text-default"
      role="status"
      aria-live="assertive"
    >
      <UIcon
        name="i-material-symbols-sync-rounded"
        class="w-16 h-16 animate-spin"
        aria-hidden="true"
      />
      <p class="text-lg font-semibold">
        {{ t('downloadModal.progressTitle') }}
      </p>
      <p class="text-sm text-muted">
        {{ t('downloadModal.progressDescription') }}
      </p>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import type * as Scry from 'scryfall-sdk'

const { cards } = useCards()
const { t } = useI18n()

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

const getFileMimeType = (file: File) => {
  if (file.type && file.type.length > 0) {
    return file.type
  }

  const extension = file.name.split('.').pop()?.toLowerCase()
  if (extension === 'jpg' || extension === 'jpeg') {
    return 'image/jpeg'
  }
  if (extension === 'png') {
    return 'image/png'
  }

  return 'application/octet-stream'
}

const readFileAsDataUrl = (file: File) => {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result
      if (typeof result === 'string') {
        const [, base64] = result.split(',')
        if (base64) {
          const mimeType = getFileMimeType(file)
          resolve(`data:${mimeType};base64,${base64}`)
          return
        }
      }
      reject(new Error('Failed to read file as data URL'))
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
    payload.hiddenImage = await readFileAsDataUrl(hiddenImage)
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
