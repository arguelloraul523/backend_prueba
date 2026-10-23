<template>
  <article class="ficha" :class="{ 'ficha--off': curso.status !== 0 }" :style="{ '--h': hueOf(curso.codigo) }">
    <span class="ficha__tab mono">{{ curso.codigo }}</span>
    <div class="ficha__body">
      <h3 class="ficha__name">{{ sentenceCase(curso.nombre) }}</h3>

      <div class="ficha__meter">
        <div class="ficha__meterhead"><span class="eyebrow">Duración</span><b class="mono">{{ fmtNumber(curso.duracion) }} h</b></div>
        <div class="ficha__track"><i :style="{ width: (curso.duracion / maxHoras) * 100 + '%' }" /></div>
      </div>

      <div class="ficha__foot">
        <button class="ficha__who" @click="$emit('roster')">
          <b>{{ aprendices }}</b>
          <span>{{ aprendices === 1 ? "aprendiz" : "aprendices" }}</span>
        </button>
        <span class="pill" :class="{ 'pill--off': curso.status !== 0 }">{{ curso.status === 0 ? "Activo" : "Inactivo" }}</span>
      </div>
    </div>

    <div class="ficha__acts">
      <q-btn flat no-caps class="btn btn--icon" icon="o_groups" @click="$emit('roster')"><q-tooltip>Ver nómina</q-tooltip></q-btn>
      <q-btn flat no-caps class="btn btn--icon" icon="o_edit" @click="$emit('edit')"><q-tooltip>Editar</q-tooltip></q-btn>
      <q-btn flat no-caps class="btn btn--icon" :icon="curso.status === 0 ? 'o_toggle_on' : 'o_toggle_off'" @click="$emit('toggle')">
        <q-tooltip>{{ curso.status === 0 ? "Desactivar" : "Activar" }}</q-tooltip>
      </q-btn>
    </div>
  </article>
</template>

<script setup>
import { fmtNumber, hueOf, sentenceCase } from "@/utils/format";

defineProps({ curso: { type: Object, required: true }, aprendices: { type: Number, default: 0 }, maxHoras: { type: Number, default: 1 } });
defineEmits(["roster", "edit", "toggle"]);
</script>

<style scoped lang="scss">
.ficha { position: relative; display: flex; flex-direction: column; background: var(--card); border: 1px solid var(--line-strong); border-top: 0; margin-top: 1.7rem; box-shadow: var(--shadow); transition: transform 0.25s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.25s;
  &:hover { transform: translateY(-3px); }
  &--off { opacity: 0.62; filter: saturate(0.4); }
  /* pestaña de archivador */
  &__tab { position: absolute; top: -1.7rem; left: -1px; padding: 0.35rem 0.85rem 0.3rem; font-size: 0.7rem; letter-spacing: 0.06em; background: hsl(var(--h) 62% var(--hl)); color: #fff; border: 1px solid var(--line-strong); border-bottom: 0; border-radius: 4px 4px 0 0; max-width: 80%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  &::before { content: ""; position: absolute; top: 0; left: 0; right: 0; height: 1px; background: var(--line-strong); }
  &__body { padding: 1.4rem 1.3rem 1.1rem; display: grid; gap: 1.2rem; flex: 1; }
  &__name { font-family: var(--font-display); font-weight: 400; font-size: 1.4rem; line-height: 1.15; letter-spacing: -0.01em; margin: 0; min-height: 3.2rem; }
  &__meterhead { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 0.4rem; b { font-size: 0.78rem; font-weight: 500; } }
  &__track { height: 0.4rem; background: var(--paper-2); overflow: hidden; i { display: block; height: 100%; background: hsl(var(--h) 62% var(--hl)); } }
  &__foot { display: flex; justify-content: space-between; align-items: center; }
  &__who { background: none; border: 0; padding: 0; cursor: pointer; display: flex; align-items: baseline; gap: 0.4rem; b { font-family: var(--font-display); font-weight: 300; font-size: 2rem; line-height: 1; } span { font-size: 0.8rem; color: var(--ink-2); } &:hover span { color: var(--accent); text-decoration: underline; } }
  &__acts { display: flex; justify-content: flex-end; gap: 0.1rem; padding: 0.4rem 0.6rem; border-top: 1px solid var(--line); } }
</style>
