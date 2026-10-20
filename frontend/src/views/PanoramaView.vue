<template>
  <div class="page">
    <PageHead :eyebrow="fecha">
      <template #title>{{ saludo() }}, <em>{{ titleCase(auth.primerNombre) }}.</em></template>
      <q-btn unelevated no-caps class="btn btn--ghost" icon="o_menu_book" label="Cursos" to="/cursos" />
      <q-btn unelevated no-caps class="btn btn--solid" icon="o_groups" label="Aprendices" to="/aprendices" />
    </PageHead>

    <!-- Cifras -->
    <section class="ledger" aria-label="Cifras del centro">
      <article v-for="(s, i) in cifras" :key="s.label" class="stat" :style="{ '--i': i }">
        <p class="eyebrow">{{ s.label }}</p>
        <q-skeleton v-if="cargando" type="text" width="5rem" height="3.2rem" />
        <p v-else class="stat__n">{{ s.value }}</p>
        <p class="stat__note">{{ s.note }}</p>
      </article>
    </section>

    <div class="cols">
      <!-- Distribución por curso -->
      <section>
        <div class="sec"><h2 class="h2">Aprendices por curso</h2><span class="eyebrow">Solo activos</span></div>
        <ul v-if="distribucion.length" class="dist">
          <li v-for="(d, i) in distribucion" :key="d.curso._id" :style="{ '--i': i, '--h': hueOf(d.curso.codigo) }">
            <router-link :to="{ name: 'aprendices', query: { curso: d.curso._id } }" class="dist__row">
              <span class="dist__top">
                <i class="dist__dot" />
                <span class="dist__name">{{ sentenceCase(d.curso.nombre) }}</span>
                <span class="dist__code mono">{{ d.curso.codigo }}</span>
                <b class="dist__n mono">{{ d.n }}</b>
              </span>
              <span class="dist__track"><i :style="{ width: d.n ? Math.max(3, (d.n / maxN) * 100) + '%' : '0%' }" /></span>
            </router-link>
          </li>
        </ul>
        <p v-else-if="!cargando" class="vacio">Aún no hay cursos activos. Crea el primero para empezar.</p>
      </section>

      <!-- Últimos registros -->
      <section>
        <div class="sec"><h2 class="h2">Últimos registros</h2><router-link to="/aprendices" class="eyebrow link">Ver todos →</router-link></div>
        <ul v-if="recientes.length" class="rec">
          <li v-for="(a, i) in recientes" :key="a._id" :style="{ '--i': i }">
            <Avatar :name="a.nombre" :seed="a.curso?.codigo" />
            <div class="rec__txt">
              <strong>{{ titleCase(a.nombre) }}</strong>
              <CursoTag v-if="a.curso" :curso="a.curso" solo-codigo />
            </div>
            <span class="rec__t mono">{{ relativeTime(a.createdAt) }}</span>
          </li>
        </ul>
        <p v-else-if="!cargando" class="vacio">Todavía no hay aprendices registrados.</p>
      </section>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import PageHead from "@/components/PageHead.vue";
import Avatar from "@/components/Avatar.vue";
import CursoTag from "@/components/CursoTag.vue";
import { useAuthStore } from "@/stores/auth";
import { useCursosStore } from "@/stores/cursos";
import { useAprendicesStore } from "@/stores/aprendices";
import { useOverlaysStore } from "@/stores/overlays";
import { fmtDate, fmtNumber, hueOf, relativeTime, saludo, sentenceCase, titleCase } from "@/utils/format";

const auth = useAuthStore();
const cursos = useCursosStore();
const aprendices = useAprendicesStore();
const o = useOverlaysStore();

const fecha = fmtDate();
const cargando = computed(() => !cursos.loaded || !aprendices.loaded);

const cifras = computed(() => {
  const ca = cursos.activos.length;
  const aa = aprendices.activos.length;
  const horas = cursos.activos.reduce((t, c) => t + (c.duracion || 0), 0);
  return [
    { label: "Cursos activos", value: fmtNumber(ca), note: `${cursos.items.length - ca} inactivos` },
    { label: "Aprendices activos", value: fmtNumber(aa), note: `${aprendices.items.length - aa} inactivos` },
    { label: "Horas de formación", value: fmtNumber(horas), note: "Suma de cursos activos" },
    { label: "Promedio por curso", value: ca ? (aa / ca).toFixed(1).replace(".", ",") : "0", note: "Aprendices por curso" },
  ];
});

const distribucion = computed(() =>
  cursos.activos.map((curso) => ({ curso, n: aprendices.porCurso.get(curso._id)?.length || 0 })).sort((a, b) => b.n - a.n)
);
const maxN = computed(() => Math.max(1, ...distribucion.value.map((d) => d.n)));
const recientes = computed(() => aprendices.items.slice(0, 7));
</script>

<style scoped lang="scss">
.ledger { display: grid; grid-template-columns: repeat(4, 1fr); border: 1px solid var(--line-strong); background: var(--card); margin-bottom: 2.6rem; }
.stat { padding: 1.2rem 1.3rem 1.3rem; border-right: 1px solid var(--line); animation: rise 0.5s both; animation-delay: calc(var(--i) * 70ms);
  &:last-child { border-right: 0; }
  &__n { font-family: var(--font-display); font-weight: 300; font-size: clamp(2.4rem, 4vw, 3.6rem); line-height: 1.1; letter-spacing: -0.03em; margin: 0.3rem 0 0.1rem; font-variant-numeric: lining-nums tabular-nums; }
  &__note { margin: 0; font-size: 0.78rem; color: var(--ink-3); } }

.cols { display: grid; grid-template-columns: 1.25fr 1fr; gap: 3rem; }
.sec { display: flex; justify-content: space-between; align-items: baseline; padding-bottom: 0.7rem; border-bottom: 1px solid var(--line-strong); margin-bottom: 0.4rem; }
.link:hover { color: var(--accent); }
.vacio { color: var(--ink-3); padding: 1.5rem 0; }

.dist { list-style: none; margin: 0; padding: 0;
  li { animation: rise 0.45s both; animation-delay: calc(var(--i) * 45ms); }
  &__row { display: grid; gap: 0.5rem; padding: 0.85rem 0; border-bottom: 1px solid var(--line); &:hover .dist__n { color: var(--accent); } &:hover .dist__track i { filter: brightness(1.08); } }
  &__top { display: flex; align-items: baseline; gap: 0.6rem; min-width: 0; }
  &__dot { flex: none; width: 0.55rem; height: 0.55rem; border-radius: 50%; background: hsl(var(--h) 62% var(--hl)); align-self: center; }
  &__name { flex: 1; min-width: 0; font-size: 0.9rem; font-weight: 500; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  &__code { flex: none; font-size: 0.7rem; color: var(--ink-3); white-space: nowrap; }
  &__n { flex: none; min-width: 1.8rem; text-align: right; font-size: 0.9rem; font-weight: 500; color: var(--ink); transition: color 0.2s; }
  /* el fondo de la barra se calcula con la tinta: se ve igual de bien en claro y en noche */
  &__track { height: 0.6rem; border-radius: 99px; overflow: hidden; background: color-mix(in srgb, var(--ink) 11%, transparent); box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--ink) 8%, transparent);
    i { display: block; height: 100%; border-radius: 99px; background: hsl(var(--h) 62% var(--hl)); transition: width 0.9s cubic-bezier(0.22, 1, 0.36, 1); } } }

.rec { list-style: none; margin: 0; padding: 0;
  li { display: flex; align-items: center; gap: 0.8rem; padding: 0.7rem 0; border-bottom: 1px solid var(--line); animation: rise 0.45s both; animation-delay: calc(var(--i) * 45ms); }
  &__txt { flex: 1; min-width: 0; display: grid; gap: 0.1rem; strong { font-size: 0.92rem; font-weight: 600; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; } }
  &__t { font-size: 0.66rem; color: var(--ink-3); white-space: nowrap; } }

@media (max-width: 1023px) { .cols { grid-template-columns: 1fr; gap: 2.2rem; } .ledger { grid-template-columns: repeat(2, 1fr); .stat:nth-child(2) { border-right: 0; } .stat:nth-child(-n + 2) { border-bottom: 1px solid var(--line); } } }
</style>
