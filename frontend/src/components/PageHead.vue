<template>
  <header class="ph">
    <div class="ph__txt">
      <p class="eyebrow">{{ eyebrow }}</p>
      <h1 class="display"><slot name="title">{{ title }}</slot></h1>
      <p v-if="lede" class="lede">{{ lede }}</p>
    </div>
    <div v-if="$slots.default" class="ph__act"><slot /></div>
  </header>
</template>

<script setup>
defineProps({ eyebrow: String, title: String, lede: String });
</script>

<style scoped lang="scss">
.ph { display: flex; align-items: flex-end; justify-content: space-between; gap: 2rem; flex-wrap: wrap; padding-bottom: 1.6rem; border-bottom: 1px solid var(--line-strong); margin-bottom: 1.6rem;
  &__txt { display: grid; gap: 0.8rem; }
  &__act { display: flex; gap: 0.6rem; flex-wrap: wrap; }
  .display { font-size: clamp(2.2rem, 4.6vw, 4rem); } }
</style>
