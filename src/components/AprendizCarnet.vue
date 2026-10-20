<template>
  <article class="id" :class="{ 'id--off': aprendiz.status !== 0 }" :style="{ '--h': hueOf(aprendiz.curso?.codigo) }">
    <header class="id__top">
      <img :src="logo" alt="" class="id__logo" />
      <span class="eyebrow id__lbl">Carné de aprendiz</span>
    </header>

    <div class="id__main">
      <Avatar :name="aprendiz.nombre" :seed="aprendiz.curso?.codigo" class="id__av" />
      <div class="id__who">
        <h3>{{ titleCase(aprendiz.nombre) }}</h3>
        <p class="mono">{{ aprendiz.documento }}</p>
      </div>
    </div>

    <dl class="id__data">
      <div><dt class="eyebrow">Correo</dt><dd>{{ aprendiz.email }}</dd></div>
      <div><dt class="eyebrow">Curso</dt><dd><CursoTag v-if="aprendiz.curso" :curso="aprendiz.curso" /><span v-else>—</span></dd></div>
    </dl>

    <footer class="id__foot">
      <span class="pill" :class="{ 'pill--off': aprendiz.status !== 0 }">{{ aprendiz.status === 0 ? "Activo" : "Inactivo" }}</span>
      <span class="id__acts">
        <q-btn flat no-caps class="btn btn--icon" icon="o_edit" @click="$emit('edit')"><q-tooltip>Editar</q-tooltip></q-btn>
        <q-btn flat no-caps class="btn btn--icon" :icon="aprendiz.status === 0 ? 'o_person_off' : 'o_person_add'" @click="$emit('toggle')"><q-tooltip>{{ aprendiz.status === 0 ? "Desactivar" : "Activar" }}</q-tooltip></q-btn>
      </span>
    </footer>
  </article>
</template>

<script setup>
import logo from "@/assets/sena.png";
import Avatar from "./Avatar.vue";
import CursoTag from "./CursoTag.vue";
import { hueOf, titleCase } from "@/utils/format";

defineProps({ aprendiz: { type: Object, required: true } });
defineEmits(["edit", "toggle"]);
</script>

<style scoped lang="scss">
.id { position: relative; display: flex; flex-direction: column; background: var(--card); border: 1px solid var(--line-strong); border-top: 4px solid hsl(var(--h) 62% var(--hl)); box-shadow: var(--shadow); transition: transform 0.25s cubic-bezier(0.22, 1, 0.36, 1);
  &:hover { transform: translateY(-3px); }
  &--off { opacity: 0.6; filter: saturate(0.3); }
  &__top { display: flex; align-items: center; justify-content: space-between; padding: 0.8rem 1.1rem 0; }
  &__logo { width: 1.6rem; height: auto; }
  &__lbl { font-size: 0.58rem; }
  &__main { display: flex; align-items: center; gap: 0.9rem; padding: 1.1rem 1.1rem 0.9rem; :deep(.av) { width: 3.4rem; height: 3.4rem; font-size: 1rem; } }
  &__who { min-width: 0; h3 { font-family: var(--font-display); font-weight: 400; font-size: 1.22rem; line-height: 1.15; margin: 0; } p { margin: 0.25rem 0 0; font-size: 0.78rem; color: var(--ink-2); letter-spacing: 0.04em; } }
  &__data { margin: 0; padding: 0.9rem 1.1rem; border-top: 1px dashed var(--line-strong); display: grid; gap: 0.7rem; flex: 1;
    dt { margin-bottom: 0.15rem; font-size: 0.58rem; } dd { margin: 0; font-size: 0.85rem; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; } }
  &__foot { display: flex; align-items: center; justify-content: space-between; padding: 0.35rem 0.6rem 0.4rem 1.1rem; border-top: 1px solid var(--line); background: var(--paper-2); }
  &__acts { display: flex; } }
</style>
