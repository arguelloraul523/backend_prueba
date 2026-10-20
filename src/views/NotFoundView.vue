<template>
  <main class="nf">
    <BrandMark class="nf__mark" />
    <p class="eyebrow">Error 404</p>
    <h1 class="display">Esta ficha <em>no existe.</em></h1>
    <p class="lede">La página que buscas no está en el archivo.</p>
    <q-btn unelevated no-caps class="btn btn--solid" to="/" label="Volver al panorama" />
  </main>
</template>

<script setup>
import BrandMark from "@/components/BrandMark.vue";
</script>

<style scoped lang="scss">
.nf { min-height: 100vh; display: grid; place-content: center; justify-items: start; gap: 1rem; padding: 2rem; max-width: 40rem; margin: 0 auto; }
.nf__mark { width: 3rem; height: 3rem; }
</style>
