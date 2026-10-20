<template>
  <Teleport to="body">
    <transition name="panel">
      <div v-if="modelValue" class="panel" :class="{ 'panel--center': centrado }" role="dialog" aria-modal="true">
        <div class="panel__backdrop" @click="cerrar" />
        <aside class="slide">
          <header class="slide__head">
            <div>
              <p class="eyebrow">{{ eyebrow }}</p>
              <h2 class="h2 panel__title">{{ title }}</h2>
            </div>
            <q-btn flat no-caps class="btn btn--icon" icon="o_close" aria-label="Cerrar" @click="cerrar" />
          </header>
          <div class="slide__body"><slot /></div>
          <footer v-if="$slots.footer" class="slide__foot"><slot name="footer" /></footer>
        </aside>
      </div>
    </transition>
  </Teleport>
</template>

<script setup>
import { onBeforeUnmount, watch } from "vue";
import Swal from "sweetalert2";

// Panel lateral propio (no es un q-dialog) para que SweetAlert, que va por encima,
// reciba el foco y el teclado sin pelearse con el "focus trap" de Quasar.
const props = defineProps({ modelValue: Boolean, title: String, eyebrow: String, centrado: Boolean });
const emit = defineEmits(["update:modelValue"]);

const cerrar = () => emit("update:modelValue", false);
const onKey = (e) => {
  if (e.key === "Escape" && !Swal.isVisible()) cerrar();
};

watch(
  () => props.modelValue,
  (open) => {
    document.documentElement.style.overflow = open ? "hidden" : "";
    open ? window.addEventListener("keydown", onKey) : window.removeEventListener("keydown", onKey);
  }
);
onBeforeUnmount(() => {
  window.removeEventListener("keydown", onKey);
  document.documentElement.style.overflow = "";
});
</script>

<style scoped lang="scss">
.panel { position: fixed; inset: 0; z-index: 2000; display: flex; justify-content: flex-end; }
.panel__backdrop { position: absolute; inset: 0; background: rgba(14, 15, 18, 0.5); backdrop-filter: blur(2px); }
.panel__title { margin-top: 0.3rem; }
.slide { position: relative; }
.panel--center { justify-content: center; align-items: center; padding: 1rem;
  .slide { height: auto; max-height: min(92vh, 46rem); width: min(32rem, 100%); border: 1px solid var(--line-strong); border-radius: 3px; box-shadow: var(--shadow); }
}

.panel-enter-active, .panel-leave-active { transition: opacity 0.25s ease; .slide { transition: transform 0.3s cubic-bezier(0.22, 1, 0.36, 1); } }
.panel-enter-from, .panel-leave-to { opacity: 0; .slide { transform: translateX(40px); } }
.panel--center.panel-enter-from .slide, .panel--center.panel-leave-to .slide { transform: translateY(16px) scale(0.98); }
</style>
