<template>
  <q-layout view="hHh lpr fFf" class="shell">
    <q-header class="top">
      <div class="top__in">
        <router-link to="/" class="top__brand" aria-label="Cat, ir al panorama">
          <BrandMark />
          <span class="top__word">
            <b>Cat</b>
            <small class="eyebrow">Centro de formación · SENA</small>
          </span>
        </router-link>

        <nav class="top__nav" aria-label="Principal">
          <router-link v-for="l in links" :key="l.to" :to="l.to" class="nav" active-class="nav--on" exact-active-class="nav--on">
            {{ l.label }}
          </router-link>
        </nav>

        <div class="top__tools">
          <q-btn flat no-caps class="btn btn--icon" :icon="ui.theme === 'dark' ? 'o_light_mode' : 'o_dark_mode'" @click="ui.toggleTheme">
            <q-tooltip>{{ ui.theme === "dark" ? "Modo claro" : "Modo oscuro" }}</q-tooltip>
          </q-btn>

          <q-btn flat no-caps class="user">
            <Avatar :name="auth.usuario?.nombre || 'U'" seed="usuario" />
            <span class="user__txt">
              <b>{{ titleCase(auth.primerNombre) }}</b>
              <small class="mono">{{ auth.usuario?.rol }}</small>
            </span>
            <q-menu anchor="bottom right" self="top right" :offset="[0, 8]">
              <div class="umenu">
                <p class="eyebrow">Sesión activa</p>
                <strong>{{ titleCase(auth.usuario?.nombre || "") }}</strong>
                <span class="mono">{{ auth.usuario?.email }}</span>
                <q-separator class="umenu__sep" />
                <q-btn v-close-popup flat no-caps class="btn btn--ghost" icon="o_logout" label="Cerrar sesión" @click="salir" />
              </div>
            </q-menu>
          </q-btn>
        </div>
      </div>
      <q-linear-progress v-if="cursos.loading || aprendices.loading" indeterminate class="top__bar" color="secondary" />
    </q-header>

    <q-page-container>
      <q-page>
        <router-view v-slot="{ Component, route }">
          <transition name="page" mode="out-in">
            <component :is="Component" :key="route.path" />
          </transition>
        </router-view>
      </q-page>
    </q-page-container>

    <!-- Navegación inferior en pantallas pequeñas -->
    <q-footer v-if="$q.screen.lt.md" class="dock">
      <router-link v-for="l in links" :key="l.to" :to="l.to" class="dock__item" active-class="dock__item--on" exact-active-class="dock__item--on">
        <q-icon :name="l.icon" size="1.35rem" />
        <span>{{ l.label }}</span>
      </router-link>
    </q-footer>

    <CursoForm />
    <AprendizForm />
    <RosterPanel />
    <UsuarioForm />
  </q-layout>
</template>

<script setup>
import { onMounted } from "vue";
import { useRouter } from "vue-router";
import BrandMark from "@/components/BrandMark.vue";
import Avatar from "@/components/Avatar.vue";
import CursoForm from "@/components/CursoForm.vue";
import AprendizForm from "@/components/AprendizForm.vue";
import RosterPanel from "@/components/RosterPanel.vue";
import UsuarioForm from "@/components/UsuarioForm.vue";
import { useAuthStore } from "@/stores/auth";
import { useCursosStore } from "@/stores/cursos";
import { useAprendicesStore } from "@/stores/aprendices";
import { useUiStore } from "@/stores/ui";
import { alerta } from "@/utils/alerta";
import { titleCase } from "@/utils/format";

const router = useRouter();
const auth = useAuthStore();
const cursos = useCursosStore();
const aprendices = useAprendicesStore();
const ui = useUiStore();

const links = [
  { to: "/", label: "Panorama", icon: "o_space_dashboard" },
  { to: "/cursos", label: "Cursos", icon: "o_menu_book" },
  { to: "/aprendices", label: "Aprendices", icon: "o_groups" },
  { to: "/accesos", label: "Accesos", icon: "o_key" },
];

onMounted(async () => {
  try {
    await Promise.all([cursos.fetch(), aprendices.fetch()]);
  } catch (e) {
    if (e.response?.status !== 401) alerta.errorApi(e, "No se pudieron cargar los datos");
  }
});

async function salir() {
  const ok = await alerta.confirmar({ titulo: "¿Cerrar sesión?", texto: "Tendrás que iniciar sesión de nuevo para volver a entrar.", boton: "Cerrar sesión" });
  if (!ok) return;
  auth.logout();
  router.replace({ name: "login" });
}
</script>

<style scoped lang="scss">
.shell { background: transparent; }
.top { background: color-mix(in srgb, var(--paper) 88%, transparent); backdrop-filter: blur(12px); color: var(--ink); border-bottom: 1px solid var(--line-strong);
  &__in { max-width: 1240px; margin: 0 auto; padding: 0.7rem var(--gutter); display: flex; align-items: center; gap: 2rem; }
  &__brand { display: flex; align-items: center; gap: 0.8rem; }
  &__word { display: grid; line-height: 1.1; b { font-family: var(--font-display); font-weight: 500; font-size: 1.45rem; letter-spacing: -0.02em; } small { font-size: 0.56rem; } }
  &__nav { display: flex; gap: 0.2rem; margin-left: auto; }
  &__tools { display: flex; align-items: center; gap: 0.4rem; }
  &__bar { position: absolute; bottom: -1px; left: 0; right: 0; height: 2px; } }
.nav { position: relative; padding: 0.55rem 0.9rem; font-family: var(--font-mono); font-size: 0.72rem; letter-spacing: 0.1em; text-transform: uppercase; color: var(--ink-2); transition: color 0.2s;
  &::after { content: ""; position: absolute; left: 0.9rem; right: 0.9rem; bottom: 0.2rem; height: 2px; background: var(--accent); transform: scaleX(0); transform-origin: left; transition: transform 0.28s cubic-bezier(0.22, 1, 0.36, 1); }
  &:hover { color: var(--ink); }
  &--on { color: var(--ink); &::after { transform: scaleX(1); } } }
.user { padding: 0.2rem 0.4rem 0.2rem 0.2rem; border-radius: 99px; :deep(.q-btn__content) { gap: 0.6rem; flex-wrap: nowrap; }
  &__txt { display: grid; text-align: left; line-height: 1.1; b { font-size: 0.82rem; font-weight: 600; } small { font-size: 0.6rem; color: var(--ink-3); letter-spacing: 0.1em; } } }
.umenu { display: grid; gap: 0.3rem; padding: 1rem; min-width: 15rem; strong { font-family: var(--font-display); font-size: 1.2rem; font-weight: 400; } span { font-size: 0.74rem; color: var(--ink-3); } &__sep { margin: 0.6rem 0; } }
.dock { display: grid; grid-template-columns: repeat(4, 1fr); background: var(--paper); color: var(--ink); border-top: 1px solid var(--line-strong); padding-bottom: env(safe-area-inset-bottom);
  &__item { display: grid; justify-items: center; gap: 0.1rem; padding: 0.55rem 0; font-family: var(--font-mono); font-size: 0.58rem; letter-spacing: 0.08em; text-transform: uppercase; color: var(--ink-3); &--on { color: var(--accent); } } }

@media (max-width: 1023px) {
  .top__nav { display: none; }
  .top__tools { margin-left: auto; }
  .user__txt { display: none; }
}
</style>
