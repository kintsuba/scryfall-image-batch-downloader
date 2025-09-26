<template>
  <main class="h-full">
    <section
      class="flex flex-col gap-5 items-center justify-center h-full mt-[-48px]"
    >
      <UTextarea
        v-model="cardsStringRef"
        variant="outline"
        size="xl"
        :rows="10"
        resize
        placeholder="1 Kenrith, the Returned King
1 Archivist of Oghma
1 Avacyn's Pilgrim
1 Biomancer's Familiar
..."
      />
      <UButton
        icon="i-material-symbols-image-search-rounded"
        size="xl"
        color="primary"
        variant="solid"
        label="Search"
        :trailing="false"
        :disabled="!canStart"
        @click="toSelect"
      />
    </section>
  </main>
</template>

<script setup lang="ts">
import type * as Scry from "scryfall-sdk";

const { cards, updateCardNames } = useCards();

onMounted(() => {
  if (cards && cards.value.length !== 0) {
    const names = (cards.value as Scry.Card[]).map((c) => c.name);
    cardsStringRef.value = "1 " + names.join("\n1 ");
  }
});

const cardsStringRef = ref<string>(
  "1 Kenrith, the Returned King\n1 Archivist of Oghma"
);

const cardNamesRef = computed(() => {
  if (cardsStringRef.value === "") return [];
  const tempArray = cardsStringRef.value.split("\n");

  if (tempArray.every((t) => /\d+ (.*)/.test(t))) {
    return tempArray.map((t) => {
      const matchedNames = t.match(/\d+ (.*)/);
      return matchedNames ? matchedNames[1] : "";
    }) as string[];
  } else {
    return [];
  }
});

const canStart = computed(() => {
  return cardNamesRef.value.length !== 0;
});

const toSelect = async () => {
  const router = useRouter();

  updateCardNames(cardNamesRef.value);
  router.push("/select");
};
</script>
