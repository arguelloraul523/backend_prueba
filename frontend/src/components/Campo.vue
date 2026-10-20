<template>
  <div class="fld">
    <span class="fld__label">{{ label }}</span>
    <slot />
    <span v-if="hint" class="fld__hint">{{ hint }}</span>
  </div>
</template>

<script setup>
defineProps({ label: String, hint: String });
</script>
