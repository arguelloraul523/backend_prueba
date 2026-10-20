<template>
  <div class="page">
    <PageHead eyebrow="Registro de aprendices" title="Aprendices" lede="Busca por nombre, documento o correo y filtra por curso.">
      <q-btn unelevated no-caps class="btn btn--solid" icon="o_add" label="Nuevo aprendiz" @click="o.openAprendiz()" />
    </PageHead>

    <div class="bar">
      <q-input v-model="q" outlined dense clearable placeholder="Nombre, documento o correo…" class="bar__q" autocomplete="off">
        <template #prepend><q-icon name="o_search" /></template>
      </q-input>
      <q-select v-model="cursoId" outlined dense clearable emit-value map-options :options="opcionesCurso" placeholder="Todos los cursos" class="bar__c" no-error-icon />
      <q-btn-toggle v-model="estado" unelevated no-caps class="seg" toggle-color="primary" :options="[{ label: 'Todos', value: 'todos' }, { label: 'Activos', value: 'activos' }, { label: 'Inactivos', value: 'inactivos' }]" />
      <q-btn-toggle v-model="ui.aprendicesLayout" unelevated no-caps class="seg bar__lay" toggle-color="primary" :options="[{ icon: 'o_badge', value: 'carnets' }, { icon: 'o_table_rows', value: 'tabla' }]" />
    </div>

    <p class="count mono">{{ lista.length }} {{ lista.length === 1 ? "aprendiz" : "aprendices" }}<template v-if="paginas > 1"> · página {{ pagina }} de {{ paginas }}</template></p>

    <div v-if="aprendices.loading && !aprendices.loaded" class="grid"><q-skeleton v-for="n in 8" :key="n" height="16rem" square /></div>

    <template v-else-if="pagina_items.length">
      <div v-if="ui.aprendicesLayout === 'carnets'" class="grid">
        <AprendizCarnet v-for="(a, i) in pagina_items" :key="a._id" :aprendiz="a" :style="{ animation: 'rise .4s both', animationDelay: i * 30 + 'ms' }" @edit="o.openAprendiz(a)" @toggle="cambiar(a)" />
      </div>

      <div v-else class="rows">
        <div class="rows__head eyebrow"><span>Aprendiz</span><span>Documento</span><span>Curso</span><span>Estado</span><span /></div>
        <div v-for="a in pagina_items" :key="a._id" class="rows__row" :class="{ off: a.status !== 0 }">
          <span class="rows__who"><Avatar :name="a.nombre" :seed="a.curso?.codigo" /><span><strong>{{ titleCase(a.nombre) }}</strong><small class="mono">{{ a.email }}</small></span></span>
          <span class="mono">{{ a.documento }}</span>
          <span><CursoTag v-if="a.curso" :curso="a.curso" solo-codigo /></span>
          <span><span class="pill" :class="{ 'pill--off': a.status !== 0 }">{{ a.status === 0 ? "Activo" : "Inactivo" }}</span></span>
          <span class="rows__acts">
            <q-btn flat no-caps class="btn btn--icon" icon="o_edit" @click="o.openAprendiz(a)"><q-tooltip>Editar</q-tooltip></q-btn>
            <q-btn flat no-caps class="btn btn--icon" :icon="a.status === 0 ? 'o_person_off' : 'o_person_add'" @click="cambiar(a)"><q-tooltip>{{ a.status === 0 ? "Desactivar" : "Activar" }}</q-tooltip></q-btn>
          </span>
        </div>
      </div>

      <div v-if="paginas > 1" class="pager"><q-pagination v-model="pagina" :max="paginas" :max-pages="7" direction-links boundary-links flat /></div>
    </template>

    <div v-else class="empty">
      <p class="display">Sin <em>resultados.</em></p>
      <p class="lede">{{ aprendices.items.length ? "Prueba con otra búsqueda o quita algún filtro." : "Aún no hay aprendices. Registra el primero." }}</p>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from "vue";
import { useRoute } from "vue-router";
import PageHead from "@/components/PageHead.vue";
import Avatar from "@/components/Avatar.vue";
import CursoTag from "@/components/CursoTag.vue";
import AprendizCarnet from "@/components/AprendizCarnet.vue";
import { useCursosStore } from "@/stores/cursos";
import { useAprendicesStore } from "@/stores/aprendices";
import { useOverlaysStore } from "@/stores/overlays";
import { useUiStore } from "@/stores/ui";
import { alerta } from "@/utils/alerta";
import { norm, sentenceCase, titleCase } from "@/utils/format";

const route = useRoute();
const cursos = useCursosStore();
const aprendices = useAprendicesStore();
const o = useOverlaysStore();
const ui = useUiStore();

const q = ref("");
const cursoId = ref(typeof route.query.curso === "string" ? route.query.curso : null); // viene del Panorama
const estado = ref("todos");
const pagina = ref(1);

const opcionesCurso = computed(() => cursos.items.map((c) => ({ label: `${sentenceCase(c.nombre)} · ${c.codigo}`, value: c._id })));

const lista = computed(() => {
  const t = norm(q.value || "");
  return aprendices.items.filter((a) => {
    if (estado.value === "activos" && a.status !== 0) return false;
    if (estado.value === "inactivos" && a.status === 0) return false;
    if (cursoId.value && a.curso?._id !== cursoId.value) return false;
    return !t || norm(a.nombre).includes(t) || norm(a.documento).includes(t) || norm(a.email).includes(t);
  });
});

const porPagina = computed(() => (ui.aprendicesLayout === "carnets" ? 12 : 15));
const paginas = computed(() => Math.max(1, Math.ceil(lista.value.length / porPagina.value)));
const pagina_items = computed(() => lista.value.slice((pagina.value - 1) * porPagina.value, pagina.value * porPagina.value));

watch([q, cursoId, estado, () => ui.aprendicesLayout], () => (pagina.value = 1));
watch(paginas, (n) => { if (pagina.value > n) pagina.value = n; });

async function cambiar(a) {
  const activar = a.status !== 0;
  const ok = await alerta.confirmar({
    titulo: activar ? "¿Activar aprendiz?" : "¿Desactivar aprendiz?",
    texto: `${titleCase(a.nombre)} ${activar ? "volverá a figurar como activo." : "quedará como inactivo (no se borra el registro)."}`,
    boton: activar ? "Activar" : "Desactivar",
    peligro: !activar,
  });
  if (!ok) return;
  try {
    alerta.ok(await aprendices.cambiarEstado(a));
  } catch (e) {
    alerta.errorApi(e, "No se pudo cambiar el estado");
  }
}
</script>

<style scoped lang="scss">
.bar { display: flex; gap: 0.8rem; flex-wrap: wrap; align-items: center; &__q { flex: 1; min-width: 14rem; max-width: 22rem; } &__c { min-width: 15rem; max-width: 20rem; flex: 1; } &__lay { margin-left: auto; } }
.count { font-size: 0.72rem; color: var(--ink-3); margin: 1rem 0 0.9rem; }
.grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(17rem, 1fr)); gap: 1.3rem; }

.rows { border: 1px solid var(--line-strong); background: var(--card); overflow-x: auto;
  &__head, &__row { display: grid; grid-template-columns: minmax(16rem, 1.6fr) 8rem minmax(9rem, 1fr) 6.5rem 5rem; gap: 1rem; align-items: center; padding: 0.65rem 1.1rem; min-width: 46rem; }
  &__head { border-bottom: 1px solid var(--line-strong); background: var(--paper-2); }
  &__row { border-bottom: 1px solid var(--line); &:last-child { border-bottom: 0; } &:hover { background: var(--accent-soft); } &.off { opacity: 0.6; } }
  &__who { display: flex; align-items: center; gap: 0.8rem; min-width: 0; > span { display: grid; min-width: 0; } strong { font-size: 0.9rem; font-weight: 600; } small { font-size: 0.7rem; color: var(--ink-3); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; } }
  &__acts { display: flex; justify-content: flex-end; } }

.pager { display: flex; justify-content: center; margin-top: 2rem; }
.empty { padding: 4rem 0; display: grid; gap: 1rem; justify-items: start; }
@media (max-width: 599px) { .bar__lay { display: none; } }
</style>
