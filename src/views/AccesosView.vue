<template>
  <div class="page">
    <PageHead eyebrow="Control de acceso" title="Accesos" lede="Historial de las cuentas que pueden iniciar sesión. Aquí las creas, las editas y las activas o desactivas.">
      <q-btn unelevated no-caps class="btn btn--solid" icon="o_add" label="Nuevo acceso" @click="o.openUsuario()" />
    </PageHead>

    <div class="bar">
      <q-input v-model="q" outlined dense clearable placeholder="Buscar por nombre o correo…" class="bar__q" autocomplete="off">
        <template #prepend><q-icon name="o_search" /></template>
      </q-input>
      <q-btn-toggle v-model="estado" unelevated no-caps class="seg" toggle-color="primary" :options="[{ label: 'Todos', value: 'todos' }, { label: 'Activos', value: 'activos' }, { label: 'Inactivos', value: 'inactivos' }]" />
    </div>

    <p v-if="usuarios.modoLocal" class="nota mono">Historial local: tu servidor solo permite iniciar sesión y registrar. Aquí se listan las cuentas creadas desde este navegador; editar y activar/desactivar requieren rutas nuevas en el backend.</p>

    <p class="count mono">{{ lista.length }} {{ lista.length === 1 ? "cuenta" : "cuentas" }}<template v-if="paginas > 1"> · página {{ pagina }} de {{ paginas }}</template></p>

    <div v-if="usuarios.loading && !usuarios.loaded" class="skel"><q-skeleton v-for="n in 5" :key="n" height="3.6rem" square /></div>

    <template v-else-if="pagina_items.length">
      <div class="rows">
        <div class="rows__head eyebrow"><span>Cuenta</span><span>Rol</span><span>Creada</span><span>Estado</span><span /></div>
        <div v-for="(u, i) in pagina_items" :key="u._id" class="rows__row" :class="{ off: u.status !== 0 }" :style="{ animation: 'rise .35s both', animationDelay: i * 25 + 'ms' }">
          <span class="rows__who">
            <Avatar :name="u.nombre" seed="usuario" />
            <span>
              <strong>{{ titleCase(u.nombre) }}<em v-if="esYo(u)" class="yo mono">Tú</em></strong>
              <small class="mono">{{ u.email }}</small>
            </span>
          </span>
          <span class="mono rol">{{ u.rol }}</span>
          <span class="rows__date" :title="relativeTime(u.createdAt)"><span class="mono">{{ fmtShortDate(u.createdAt) }}</span></span>
          <span><span class="pill" :class="{ 'pill--off': u.status !== 0 }">{{ u.status === 0 ? "Activo" : "Inactivo" }}</span></span>
          <span class="rows__acts">
            <q-btn flat no-caps class="btn btn--icon" icon="o_edit" aria-label="Editar" @click="editar(u)"><q-tooltip>Editar</q-tooltip></q-btn>
            <span class="rows__tog">
              <q-btn flat no-caps class="btn btn--icon" :disable="esYo(u) && u.status === 0" :icon="u.status === 0 ? 'o_toggle_on' : 'o_toggle_off'" :aria-label="u.status === 0 ? 'Desactivar' : 'Activar'" @click="cambiar(u)" />
              <q-tooltip>{{ esYo(u) && u.status === 0 ? "No puedes desactivar tu propia cuenta" : u.status === 0 ? "Desactivar" : "Activar" }}</q-tooltip>
            </span>
          </span>
        </div>
      </div>

      <div v-if="paginas > 1" class="pager"><q-pagination v-model="pagina" :max="paginas" :max-pages="7" direction-links boundary-links flat /></div>
    </template>

    <div v-else class="empty">
      <p class="display">Sin <em>resultados.</em></p>
      <p class="lede">{{ usuarios.items.length ? "Prueba con otra búsqueda o cambia el filtro de estado." : "Aún no hay cuentas. Crea la primera." }}</p>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from "vue";
import PageHead from "@/components/PageHead.vue";
import Avatar from "@/components/Avatar.vue";
import { useAuthStore } from "@/stores/auth";
import { useUsuariosStore } from "@/stores/usuarios";
import { useOverlaysStore } from "@/stores/overlays";
import { alerta } from "@/utils/alerta";
import { fmtShortDate, norm, relativeTime, titleCase } from "@/utils/format";

const auth = useAuthStore();
const usuarios = useUsuariosStore();
const o = useOverlaysStore();

const q = ref("");
const estado = ref("todos");
const pagina = ref(1);
const POR_PAGINA = 10;

const esYo = (u) => u._id === auth.usuario?._id;

// Siempre se vuelve a pedir el historial al entrar, por si cambió desde otro equipo.
onMounted(async () => {
  try {
    await usuarios.fetch(true);
    if (usuarios.modoLocal && auth.usuario) usuarios.recordar(auth.usuario);
  } catch (e) {
    if (e.response?.status !== 401) alerta.errorApi(e, "No se pudo cargar el historial de accesos");
  }
});

const lista = computed(() => {
  const t = norm(q.value || "");
  return usuarios.items.filter((u) => {
    if (estado.value === "activos" && u.status !== 0) return false;
    if (estado.value === "inactivos" && u.status === 0) return false;
    return !t || norm(u.nombre).includes(t) || norm(u.email).includes(t);
  });
});

const paginas = computed(() => Math.max(1, Math.ceil(lista.value.length / POR_PAGINA)));
const pagina_items = computed(() => lista.value.slice((pagina.value - 1) * POR_PAGINA, pagina.value * POR_PAGINA));

watch([q, estado], () => (pagina.value = 1));
watch(paginas, (n) => { if (pagina.value > n) pagina.value = n; });

const SIN_RUTAS = ["El backend actual solo tiene login y registro.", "Para editar o activar/desactivar cuentas hay que agregar esas rutas en el backend."];

function editar(u) {
  if (usuarios.modoLocal) return alerta.aviso("No disponible con este backend", SIN_RUTAS);
  o.openUsuario(u);
}

async function cambiar(u) {
  if (usuarios.modoLocal) return alerta.aviso("No disponible con este backend", SIN_RUTAS);
  const activar = u.status !== 0;
  const ok = await alerta.confirmar({
    titulo: activar ? "¿Activar este acceso?" : "¿Desactivar este acceso?",
    texto: activar
      ? `${titleCase(u.nombre)} podrá volver a iniciar sesión.`
      : `${titleCase(u.nombre)} ya no podrá iniciar sesión. El registro no se borra y puedes activarlo de nuevo.`,
    boton: activar ? "Activar" : "Desactivar",
    peligro: !activar,
  });
  if (!ok) return;
  try {
    alerta.ok(await usuarios.cambiarEstado(u));
  } catch (e) {
    alerta.errorApi(e, "No se pudo cambiar el estado");
  }
}
</script>

<style scoped lang="scss">
.bar { display: flex; gap: 0.8rem; flex-wrap: wrap; align-items: center; &__q { flex: 1; min-width: 14rem; max-width: 24rem; } }
.count { font-size: 0.72rem; color: var(--ink-3); margin: 1rem 0 0.9rem; }
.nota { font-size: 0.72rem; color: var(--ink-2); margin: 1rem 0 0; padding: 0.6rem 0.9rem; border: 1px dashed var(--line-strong); background: var(--paper-2); }
.skel { display: grid; gap: 0.5rem; }

.rows { border: 1px solid var(--line-strong); background: var(--card); overflow-x: auto;
  &__head, &__row { display: grid; grid-template-columns: minmax(16rem, 1.8fr) 6rem 8.5rem 6.5rem 6rem; gap: 1rem; align-items: center; padding: 0.65rem 1.1rem; min-width: 46rem; }
  &__head { border-bottom: 1px solid var(--line-strong); background: var(--paper-2); }
  &__row { border-bottom: 1px solid var(--line); &:last-child { border-bottom: 0; } &:hover { background: var(--accent-soft); } &.off { opacity: 0.6; } }
  &__who { display: flex; align-items: center; gap: 0.8rem; min-width: 0; > span { display: grid; min-width: 0; } strong { font-size: 0.9rem; font-weight: 600; } small { font-size: 0.7rem; color: var(--ink-3); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; } }
  &__date { font-size: 0.78rem; color: var(--ink-2); }
  &__acts { display: flex; justify-content: flex-end; }
  &__tog { display: inline-flex; } }
.rol { font-size: 0.72rem; letter-spacing: 0.08em; color: var(--ink-2); }
.yo { margin-left: 0.5rem; padding: 0.05rem 0.4rem; font-size: 0.6rem; font-style: normal; font-weight: 500; letter-spacing: 0.1em; text-transform: uppercase; color: var(--ink); background: var(--accent-soft); border: 1px solid var(--accent); border-radius: 99px; vertical-align: middle; }

.pager { display: flex; justify-content: center; margin-top: 2rem; }
.empty { padding: 4rem 0; display: grid; gap: 1rem; justify-items: start; }
</style>
