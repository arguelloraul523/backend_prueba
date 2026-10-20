<template>
  <div class="page">
    <PageHead eyebrow="Control de acceso" title="Accesos" lede="Solo quien ya inició sesión puede crear cuentas nuevas para otras personas del centro." />

    <div class="cols">
      <section class="form">
        <p class="eyebrow">Nueva cuenta</p>
        <h2 class="h2">Crear acceso</h2>

        <Campo label="Nombre completo"><q-input v-model="nombre" outlined dense placeholder="Docente Prueba" autocomplete="off" @keyup.enter="crear" /></Campo>
        <Campo label="Correo electrónico"><q-input v-model="email" outlined dense placeholder="docente@sena.edu.co" autocomplete="off" @keyup.enter="crear" /></Campo>
        <Campo label="Contraseña" hint="Mínimo 6 caracteres.">
          <q-input v-model="password" outlined dense :type="ver ? 'text' : 'password'" autocomplete="new-password" @keyup.enter="crear">
            <template #append><q-btn flat dense round no-caps :icon="ver ? 'o_visibility_off' : 'o_visibility'" aria-label="Mostrar contraseña" @click="ver = !ver" /></template>
          </q-input>
        </Campo>
        <Campo label="Repite la contraseña">
          <q-input v-model="repetir" outlined dense :type="ver ? 'text' : 'password'" autocomplete="new-password" @keyup.enter="crear" />
        </Campo>

        <q-btn unelevated no-caps class="btn btn--solid go" :loading="guardando" label="Crear acceso" icon-right="o_arrow_forward" @click="crear" />
      </section>

      <aside class="side">
        <p class="eyebrow">Sesión actual</p>
        <div class="me">
          <Avatar :name="auth.usuario?.nombre || 'U'" seed="usuario" />
          <div>
            <strong>{{ titleCase(auth.usuario?.nombre || "") }}</strong>
            <span class="mono">{{ auth.usuario?.email }}</span>
          </div>
          <span class="pill">{{ auth.usuario?.rol }}</span>
        </div>
        <p class="note">La persona nueva podrá iniciar sesión de inmediato con el correo y la contraseña que definas. Por seguridad, la API no permite listar ni ver contraseñas de otras cuentas.</p>
      </aside>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import PageHead from "@/components/PageHead.vue";
import Campo from "@/components/Campo.vue";
import Avatar from "@/components/Avatar.vue";
import { useAuthStore } from "@/stores/auth";
import { authService } from "@/services/auth.service";
import { alerta, problemas, regexEmail } from "@/utils/alerta";
import { titleCase } from "@/utils/format";

const auth = useAuthStore();
const nombre = ref("");
const email = ref("");
const password = ref("");
const repetir = ref("");
const ver = ref(false);
const guardando = ref(false);

async function crear() {
  if (guardando.value) return;
  const lista = problemas([
    [!nombre.value.trim(), "El nombre es obligatorio."],
    [!email.value.trim(), "El correo es obligatorio."],
    [email.value.trim() && !regexEmail.test(email.value.trim()), "El correo no tiene un formato válido."],
    [!password.value, "La contraseña es obligatoria."],
    [password.value && password.value.length < 6, "La contraseña debe tener al menos 6 caracteres."],
    [password.value && repetir.value !== password.value, "Las contraseñas no coinciden."],
  ]);
  if (lista.length) return alerta.aviso("Revisa el formulario", lista);

  guardando.value = true;
  try {
    const { data } = await authService.registrar({ nombre: nombre.value.trim(), email: email.value.trim(), password: password.value });
    nombre.value = email.value = password.value = repetir.value = "";
    alerta.ok(data.msg);
  } catch (e) {
    alerta.errorApi(e, "No se pudo crear el acceso");
  } finally {
    guardando.value = false;
  }
}
</script>

<style scoped lang="scss">
.cols { display: grid; grid-template-columns: minmax(0, 28rem) minmax(0, 1fr); gap: 4rem; align-items: start; }
.form { display: grid; gap: 1.1rem; .h2 { font-size: 2rem; font-weight: 300; margin-top: -0.5rem; } }
.go { margin-top: 0.4rem; min-height: 2.9rem; }
.side { display: grid; gap: 1rem; padding: 1.6rem; border: 1px solid var(--line-strong); background: var(--card); box-shadow: var(--shadow); }
.me { display: flex; align-items: center; gap: 0.9rem; flex-wrap: wrap; > div { display: grid; flex: 1; min-width: 0; strong { font-family: var(--font-display); font-weight: 400; font-size: 1.2rem; } span { font-size: 0.74rem; color: var(--ink-3); overflow: hidden; text-overflow: ellipsis; } } }
.note { margin: 0; color: var(--ink-2); font-size: 0.9rem; border-top: 1px dashed var(--line-strong); padding-top: 1rem; }
@media (max-width: 899px) { .cols { grid-template-columns: 1fr; gap: 2rem; } }
</style>
