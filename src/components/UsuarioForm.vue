<template>
  <SlidePanel v-model="abierto" centrado :eyebrow="editando ? 'Editar acceso' : 'Nuevo acceso'" :title="editando ? 'Editar cuenta' : 'Crear cuenta'">
    <Campo label="Nombre completo" hint="Se guarda en mayúsculas.">
      <q-input v-model="nombre" outlined dense placeholder="Docente Prueba" autocomplete="off" @keyup.enter="guardar" />
    </Campo>
    <Campo label="Correo electrónico" hint="Con este correo iniciará sesión. Debe ser único.">
      <q-input v-model="email" outlined dense placeholder="docente@sena.edu.co" autocomplete="off" @keyup.enter="guardar" />
    </Campo>
    <Campo :label="editando ? 'Contraseña nueva' : 'Contraseña'" :hint="editando ? 'Déjala vacía para conservar la actual. Si escribes una, mínimo 6 caracteres.' : 'Mínimo 6 caracteres.'">
      <q-input v-model="password" outlined dense :type="ver ? 'text' : 'password'" autocomplete="new-password" @keyup.enter="guardar">
        <template #append>
          <q-btn flat dense round no-caps :icon="ver ? 'o_visibility_off' : 'o_visibility'" aria-label="Mostrar contraseña" @click="ver = !ver" />
        </template>
      </q-input>
    </Campo>
    <Campo v-if="!editando || password" label="Repite la contraseña">
      <q-input v-model="repetir" outlined dense :type="ver ? 'text' : 'password'" autocomplete="new-password" @keyup.enter="guardar" />
    </Campo>

    <template #footer>
      <q-btn flat no-caps class="btn btn--ghost" label="Cancelar" @click="abierto = false" />
      <q-btn unelevated no-caps class="btn btn--solid" :loading="guardando" :label="editando ? 'Guardar cambios' : 'Crear acceso'" @click="guardar" />
    </template>
  </SlidePanel>
</template>

<script setup>
import { computed, ref, watch } from "vue";
import SlidePanel from "./SlidePanel.vue";
import Campo from "./Campo.vue";
import { useOverlaysStore } from "@/stores/overlays";
import { useUsuariosStore } from "@/stores/usuarios";
import { useAuthStore } from "@/stores/auth";
import { alerta, problemas, regexEmail } from "@/utils/alerta";

const o = useOverlaysStore();
const usuarios = useUsuariosStore();
const auth = useAuthStore();

const abierto = computed({ get: () => o.usuarioForm.open, set: (v) => (o.usuarioForm.open = v) });
const editando = computed(() => !!o.usuarioForm.item);

const nombre = ref("");
const email = ref("");
const password = ref("");
const repetir = ref("");
const ver = ref(false);
const guardando = ref(false);

watch(abierto, (open) => {
  if (!open) return;
  const u = o.usuarioForm.item;
  nombre.value = u?.nombre || "";
  email.value = u?.email || "";
  password.value = "";
  repetir.value = "";
  ver.value = false;
});

async function guardar() {
  if (guardando.value) return;
  // Validaciones: solo con SweetAlert (sin atributos HTML de validación).
  const lista = problemas([
    [!nombre.value.trim(), "El nombre es obligatorio."],
    [!email.value.trim(), "El correo es obligatorio."],
    [email.value.trim() && !regexEmail.test(email.value.trim()), "El correo no tiene un formato válido."],
    [!editando.value && !password.value, "La contraseña es obligatoria."],
    [password.value && password.value.length < 6, "La contraseña debe tener al menos 6 caracteres."],
    [password.value && repetir.value !== password.value, "Las contraseñas no coinciden."],
  ]);
  if (lista.length) return alerta.aviso("Revisa el formulario", lista);

  const id = o.usuarioForm.item?._id;
  const payload = { nombre: nombre.value.trim(), email: email.value.trim() };
  if (password.value) payload.password = password.value;

  guardando.value = true;
  try {
    const msg = await usuarios.guardar(id, payload);
    // Si la persona editó su propia cuenta, se refresca el nombre que se ve en la cabecera.
    if (id && id === auth.usuario?._id) {
      const yo = usuarios.items.find((u) => u._id === id);
      if (yo) auth.usuario = yo;
    }
    abierto.value = false;
    alerta.ok(msg);
  } catch (e) {
    alerta.errorApi(e, editando.value ? "No se pudo actualizar el acceso" : "No se pudo crear el acceso");
  } finally {
    guardando.value = false;
  }
}
</script>
