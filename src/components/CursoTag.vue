<template>
  <span class="tag" :style="{ '--h': hue }">
    <i class="tag__dot" />
    <span v-if="!soloCodigo" class="tag__name">{{ sentenceCase(curso?.nombre) }}</span>
    <span class="tag__code">{{ curso?.codigo }}</span>
  </span>
</template>

<script setup>
import { computed } from "vue";
import { hueOf, sentenceCase } from "@/utils/format";

const props = defineProps({ curso: Object, soloCodigo: Boolean });
const hue = computed(() => hueOf(props.curso?.codigo));
</script>

<style scoped>
.tag__name { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
</style>
