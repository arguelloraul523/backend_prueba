<template>
  <div class="page">
    <PageHead eyebrow="Catálogo de formación" title="Cursos" lede="Cada programa con su código, su duración y los aprendices que lo cursan.">
      <q-btn unelevated no-caps class="btn btn--solid" icon="o_add" label="Nuevo curso" @click="o.openCurso()" />
    </PageHead>

    <div class="bar">
      <q-input v-model="q" outlined dense clearable placeholder="Buscar por nombre o código…" class="bar__q" autocomplete="off">
        <template #prepend><q-icon name="o_search" /></template>
      </q-input>
      <q-btn-toggle v-model="estado" unelevated no-caps class="seg" toggle-color="primary" :options="[{ label: 'Todos', value: 'todos' }, { label: 'Activos', value: 'activos' }, { label: 'Inactivos', value: 'inactivos' }]" />
      <q-btn-toggle v-model="ui.cursosLayout" unelevated no-caps class="seg bar__lay" toggle-color="primary" :options="[{ icon: 'o_grid_view', value: 'fichas' }, { icon: 'o_view_list', value: 'lista' }]" />
    </div>

    <p class="count mono">{{ lista.length }} {{ lista.length === 1 ? "curso" : "cursos" }}</p>

    <div v-if="cursos.loading && !cursos.loaded" class="grid">
      <q-skeleton v-for="n in 6" :key="n" height="14rem" square />
    </div>

    <template v-else-if="lista.length">
      <div v-if="ui.cursosLayout === 'fichas'" class="grid">
        <CursoFicha v-for="(c, i) in lista" :key="c._id" :curso="c" :aprendices="aprendices.porCurso.get(c._id)?.length || 0" :max-horas="cursos.maxHoras" :style="{ animation: 'rise .45s both', animationDelay: i * 40 + 'ms' }" @roster="o.openRoster(c)" @edit="o.openCurso(c)" @toggle="cambiar(c)" />
      </div>

      <div v-else class="rows">
        <div class="rows__head eyebrow"><span>Código</span><span>Programa</span><span class="r">Horas</span><span class="r">Aprendices</span><span>Estado</span><span /></div>
        <div v-for="c in lista" :key="c._id" class="rows__row" :class="{ off: c.status !== 0 }">
          <span class="mono"><CursoTag :curso="c" solo-codigo /></span>
          <strong>{{ sentenceCase(c.nombre) }}</strong>
          <span class="r mono">{{ fmtNumber(c.duracion) }}</span>
          <button class="r rows__n mono" @click="o.openRoster(c)">{{ aprendices.porCurso.get(c._id)?.length || 0 }}</button>
          <span><span class="pill" :class="{ 'pill--off': c.status !== 0 }">{{ c.status === 0 ? "Activo" : "Inactivo" }}</span></span>
          <span class="rows__acts">
            <q-btn flat no-caps class="btn btn--icon" icon="o_edit" @click="o.openCurso(c)"><q-tooltip>Editar</q-tooltip></q-btn>
            <q-btn flat no-caps class="btn btn--icon" :icon="c.status === 0 ? 'o_toggle_on' : 'o_toggle_off'" @click="cambiar(c)"><q-tooltip>{{ c.status === 0 ? "Desactivar" : "Activar" }}</q-tooltip></q-btn>
          </span>
        </div>
      </div>
    </template>

    <div v-else class="empty">
      <p class="display">Sin <em>resultados.</em></p>
      <p class="lede">{{ cursos.items.length ? "Prueba con otra búsqueda o cambia el filtro de estado." : "Aún no hay cursos. Registra el primero." }}</p>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from "vue";
import PageHead from "@/components/PageHead.vue";
import CursoFicha from "@/components/CursoFicha.vue";
import CursoTag from "@/components/CursoTag.vue";
import { useCursosStore } from "@/stores/cursos";
import { useAprendicesStore } from "@/stores/aprendices";
import { useOverlaysStore } from "@/stores/overlays";
import { useUiStore } from "@/stores/ui";
import { alerta } from "@/utils/alerta";
import { fmtNumber, norm, sentenceCase } from "@/utils/format";

const cursos = useCursosStore();
const aprendices = useAprendicesStore();
const o = useOverlaysStore();
const ui = useUiStore();

const q = ref("");
const estado = ref("todos");

const lista = computed(() => {
  const t = norm(q.value || "");
  return cursos.items.filter((c) => {
    if (estado.value === "activos" && c.status !== 0) return false;
    if (estado.value === "inactivos" && c.status === 0) return false;
    return !t || norm(c.nombre).includes(t) || norm(c.codigo).includes(t);
  });
});

async function cambiar(c) {
  const activar = c.status !== 0;
  const n = aprendices.porCurso.get(c._id)?.length || 0;
  const ok = await alerta.confirmar({
    titulo: activar ? "¿Activar este curso?" : "¿Desactivar este curso?",
    texto: activar ? `${sentenceCase(c.nombre)} volverá a estar disponible.` : `${sentenceCase(c.nombre)} dejará de aparecer al registrar aprendices.${n ? ` Tiene ${n} aprendices activos.` : ""}`,
    boton: activar ? "Activar" : "Desactivar",
    peligro: !activar,
  });
  if (!ok) return;
  try {
    alerta.ok(await cursos.cambiarEstado(c));
  } catch (e) {
    alerta.errorApi(e, "No se pudo cambiar el estado");
  }
}
</script>

<style scoped lang="scss">
.bar { display: flex; gap: 0.8rem; flex-wrap: wrap; align-items: center; &__q { flex: 1; min-width: 14rem; max-width: 24rem; } &__lay { margin-left: auto; } }
.count { font-size: 0.72rem; color: var(--ink-3); margin: 1rem 0 0.4rem; }
.grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(18.5rem, 1fr)); gap: 0.6rem 1.6rem; padding-top: 0.4rem; }

.rows { border: 1px solid var(--line-strong); background: var(--card); overflow-x: auto;
  &__head, &__row { display: grid; grid-template-columns: 11rem minmax(14rem, 1fr) 5rem 6rem 6.5rem 5rem; gap: 1rem; align-items: center; padding: 0.75rem 1.1rem; min-width: 52rem; }
  &__head { border-bottom: 1px solid var(--line-strong); background: var(--paper-2); }
  &__row { border-bottom: 1px solid var(--line); animation: rise 0.4s both; &:last-child { border-bottom: 0; } &:hover { background: var(--accent-soft); } &.off { opacity: 0.6; } strong { font-weight: 600; font-size: 0.92rem; } }
  &__n { background: none; border: 0; cursor: pointer; font-size: 0.85rem; &:hover { color: var(--accent); text-decoration: underline; } }
  &__acts { display: flex; justify-content: flex-end; } }
.r { text-align: right; }

.empty { padding: 4rem 0; display: grid; gap: 1rem; justify-items: start; }
@media (max-width: 599px) { .bar__lay { display: none; } }
</style>
