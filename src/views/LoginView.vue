<template>
  <main class="login">
    <section class="login__art" aria-hidden="true">
      <svg class="rings" viewBox="0 0 400 400">
        <g fill="none" stroke="currentColor" stroke-width="1">
          <circle v-for="r in 9" :key="r" cx="200" cy="200" :r="r * 21" :stroke-dasharray="`${r * 17} ${r * 9}`" :style="{ animationDuration: 40 + r * 8 + 's', animationDirection: r % 2 ? 'normal' : 'reverse' }" />
        </g>
        <circle cx="200" cy="200" r="5" fill="var(--sena)" />
      </svg>
      <div class="login__copy">
        <p class="eyebrow">Centro de formación · SENA</p>
        <h1 class="display">Quién aprende <em>qué,</em> y dónde.</h1>
        <p class="lede">Cursos, aprendices y accesos del centro, en un solo registro claro.</p>
      </div>
      <p class="eyebrow login__foot">Cat · v1.0</p>
    </section>

    <section class="login__form">
      <div class="card">
        <BrandMark class="card__logo" />
        <p class="eyebrow">Acceso restringido</p>
        <h2 class="h2 card__title">Iniciar sesión</h2>
        <p class="card__sub">Entra con la cuenta que te asignaron en el centro.</p>

        <Campo label="Correo electrónico">
          <q-input v-model="email" outlined dense placeholder="nombre@sena.edu.co" autocomplete="username" @keyup.enter="entrar" />
        </Campo>
        <Campo label="Contraseña">
          <q-input v-model="password" outlined dense :type="ver ? 'text' : 'password'" placeholder="••••••" autocomplete="current-password" @keyup.enter="entrar">
            <template #append>
              <q-btn flat dense round no-caps :icon="ver ? 'o_visibility_off' : 'o_visibility'" aria-label="Mostrar contraseña" @click="ver = !ver" />
            </template>
          </q-input>
        </Campo>

        <q-btn unelevated no-caps class="btn btn--solid card__go" :loading="entrando" label="Entrar" icon-right="o_arrow_forward" @click="entrar" />
      </div>
    </section>
  </main>
</template>

<script setup>
import { ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import BrandMark from "@/components/BrandMark.vue";
import Campo from "@/components/Campo.vue";
import { useAuthStore } from "@/stores/auth";
import { alerta, problemas, regexEmail } from "@/utils/alerta";

const route = useRoute();
const router = useRouter();
const auth = useAuthStore();

const email = ref("");
const password = ref("");
const ver = ref(false);
const entrando = ref(false);

async function entrar() {
  if (entrando.value) return;
  const lista = problemas([
    [!email.value.trim(), "Escribe tu correo."],
    [email.value.trim() && !regexEmail.test(email.value.trim()), "El correo no tiene un formato válido."],
    [!password.value, "Escribe tu contraseña."],
  ]);
  if (lista.length) return alerta.aviso("Revisa tus datos", lista);

  entrando.value = true;
  try {
    await auth.login({ email: email.value.trim(), password: password.value });
    await router.replace(typeof route.query.redirect === "string" ? route.query.redirect : "/");
    alerta.ok(`Bienvenido, ${auth.primerNombre.toLowerCase()}`);
  } catch (e) {
    alerta.errorApi(e, "No pudimos iniciar sesión");
  } finally {
    entrando.value = false;
  }
}
</script>

<style scoped lang="scss">
.login { min-height: 100vh; display: grid; grid-template-columns: 1.15fr 1fr; }
.login__art { position: relative; overflow: hidden; padding: 2.5rem var(--gutter); display: flex; flex-direction: column; justify-content: flex-end; gap: 1.2rem; background: var(--paper-2); border-right: 1px solid var(--line-strong); }
.rings { position: absolute; right: -14%; top: -8%; width: min(46rem, 90%); color: var(--ink); opacity: 0.22; circle { transform-origin: 200px 200px; animation: spin linear infinite; } }
.login__copy { position: relative; display: grid; gap: 1.2rem; .display { max-width: 11ch; } }
.login__foot { position: relative; }
.login__form { display: grid; place-items: center; padding: 2rem var(--gutter); }
.card { width: min(26rem, 100%); display: grid; gap: 1.1rem;
  &__logo { width: 3.4rem; margin-bottom: 0.6rem; }
  &__title { font-size: 2.2rem; font-weight: 300; margin-top: -0.4rem; }
  &__sub { color: var(--ink-2); margin: -0.3rem 0 0.4rem; }
  &__go { margin-top: 0.4rem; min-height: 2.9rem; } }

@media (max-width: 899px) {
  .login { grid-template-columns: 1fr; }
  .login__art { min-height: 15rem; padding-top: 2rem; border-right: 0; border-bottom: 1px solid var(--line-strong); .lede, .login__foot { display: none; } .display { font-size: 2.3rem; } }
  .rings { width: 22rem; right: -8rem; top: -6rem; }
}
</style>
