<template>
  <span class="av" :style="{ '--h': hue }">{{ iniciales }}</span>
</template>

<script setup>
import { computed } from "vue";
import { hueOf, initials } from "@/utils/format";

const props = defineProps({ name: { type: String, default: "" }, seed: String });
const iniciales = computed(() => initials(props.name));
const hue = computed(() => hueOf(props.seed || props.name));
</script>

<style scoped>
.av { flex: none; display: inline-grid; place-items: center; width: 2.4rem; height: 2.4rem; border-radius: 50%; font-family: var(--font-mono); font-size: 0.74rem; font-weight: 500;
  background: hsl(var(--h) 55% var(--hl-tint)); color: hsl(var(--h) 55% var(--hl-ink)); border: 1px solid hsl(var(--h) 50% var(--hl) / 0.4); }
</style>
