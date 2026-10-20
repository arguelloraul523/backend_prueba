<template>
  <img :src="logo" alt="SENA" class="brand" draggable="false" />
</template>

<script setup>
import logo from "@/assets/sena.png";
</script>

<style scoped>
.brand { display: block; width: 2.4rem; height: auto; user-select: none; }
</style>
