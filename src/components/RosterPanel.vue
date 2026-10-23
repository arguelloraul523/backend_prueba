<template>
  <SlidePanel v-model="abierto" eyebrow="Nómina del curso" :title="sentenceCase(curso?.nombre)">
    <div v-if="curso" class="head" :style="{ '--h': hueOf(curso.codigo) }">
      <span class="mono head__code">{{ curso.codigo }}</span>
      <span class="head__n"><b>{{ lista.length }}</b> aprendices activos</span>
    </div>

    <ul v-if="lista.length" class="roster">
      <li v-for="(a, i) in lista" :key="a._id" :style="{ '--i': i }">
        <Avatar :name="a.nombre" :seed="curso.codigo" />
        <div class="roster__txt">
          <strong>{{ titleCase(a.nombre) }}</strong>
          <span class="mono">{{ a.documento }} · {{ a.email }}</span>
        </div>
        <q-btn flat no-caps class="btn btn--icon" icon="o_edit" @click="editar(a)"><q-tooltip>Editar</q-tooltip></q-btn>
      </li>
    </ul>
    <p v-else class="vacio">Este curso todavía no tiene aprendices activos.</p>

    <template #footer>
      <q-btn unelevated no-caps class="btn btn--solid" icon="o_add" label="Registrar aprendiz aquí" @click="nuevo" />
    </template>
  </SlidePanel>
</template>

<script setup>
import { computed } from "vue";
import SlidePanel from "./SlidePanel.vue";
import Avatar from "./Avatar.vue";
import { useOverlaysStore } from "@/stores/overlays";
import { useAprendicesStore } from "@/stores/aprendices";
import { hueOf, sentenceCase, titleCase } from "@/utils/format";

const o = useOverlaysStore();
const aprendices = useAprendicesStore();

const abierto = computed({ get: () => o.roster.open, set: (v) => (o.roster.open = v) });
const curso = computed(() => o.roster.curso);
const lista = computed(() => (curso.value ? aprendices.porCurso.get(curso.value._id) || [] : []));

const editar = (a) => { abierto.value = false; o.openAprendiz(a); };
const nuevo = () => { const id = curso.value._id; abierto.value = false; o.openAprendiz(null, id); };
</script>

<style scoped lang="scss">
.head { display: flex; justify-content: space-between; align-items: baseline; padding-bottom: 0.9rem; border-bottom: 2px solid hsl(var(--h) 60% var(--hl)); &__code { font-size: 0.8rem; color: var(--ink-2); } &__n { font-size: 0.85rem; color: var(--ink-2); b { font-family: var(--font-display); font-size: 1.6rem; font-weight: 400; color: var(--ink); margin-right: 0.2rem; } } }
.roster { list-style: none; margin: 0; padding: 0; display: grid;
  li { display: flex; align-items: center; gap: 0.8rem; padding: 0.7rem 0; border-bottom: 1px solid var(--line); animation: rise 0.4s both; animation-delay: calc(var(--i) * 25ms); }
  &__txt { flex: 1; min-width: 0; display: grid; strong { font-weight: 600; font-size: 0.92rem; } span { font-size: 0.72rem; color: var(--ink-3); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; } } }
.vacio { color: var(--ink-3); margin: 1rem 0; }
</style>
