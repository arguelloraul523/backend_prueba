<template>
  <SlidePanel v-model="abierto" centrado :eyebrow="o.cursoForm.item ? 'Editar ficha' : 'Nueva ficha'" :title="o.cursoForm.item ? 'Editar curso' : 'Nuevo curso'">
    <Campo label="Código" hint="Se guarda en mayúsculas. Debe ser único.">
      <q-input v-model="codigo" outlined dense class="mono-input" placeholder="ADSO-2874521" autocomplete="off" @keyup.enter="guardar" />
    </Campo>
    <Campo label="Nombre del programa">
      <q-input v-model="nombre" outlined dense placeholder="Análisis y desarrollo de software" autocomplete="off" @keyup.enter="guardar" />
    </Campo>
    <Campo label="Duración (horas)" hint="Solo números enteros mayores a 0.">
      <q-input v-model="duracion" outlined dense class="mono-input" inputmode="numeric" placeholder="2640" autocomplete="off" @update:model-value="soloNumeros" @keyup.enter="guardar" />
    </Campo>

    <template #footer>
      <q-btn flat no-caps class="btn btn--ghost" label="Cancelar" @click="abierto = false" />
      <q-btn unelevated no-caps class="btn btn--solid" :loading="guardando" :label="o.cursoForm.item ? 'Guardar cambios' : 'Registrar curso'" @click="guardar" />
    </template>
  </SlidePanel>
</template>

<script setup>
import { computed, ref, watch } from "vue";
import SlidePanel from "./SlidePanel.vue";
import Campo from "./Campo.vue";
import { useOverlaysStore } from "@/stores/overlays";
import { useCursosStore } from "@/stores/cursos";
import { alerta, problemas } from "@/utils/alerta";

const o = useOverlaysStore();
const cursos = useCursosStore();

const abierto = computed({ get: () => o.cursoForm.open, set: (v) => (o.cursoForm.open = v) });
const codigo = ref("");
const nombre = ref("");
const duracion = ref("");
const guardando = ref(false);

watch(abierto, (open) => {
  if (!open) return;
  const c = o.cursoForm.item;
  codigo.value = c?.codigo || "";
  nombre.value = c?.nombre || "";
  duracion.value = c ? String(c.duracion) : "";
});

const soloNumeros = (v) => (duracion.value = String(v ?? "").replace(/\D/g, ""));

async function guardar() {
  // Validaciones: solo con SweetAlert (sin atributos HTML de validación).
  const lista = problemas([
    [!codigo.value.trim(), "El código es obligatorio."],
    [codigo.value.trim() && !/^[A-Za-z0-9][A-Za-z0-9 _-]{1,29}$/.test(codigo.value.trim()), "El código solo puede tener letras, números, espacios, guiones y guion bajo (2 a 30 caracteres)."],
    [!nombre.value.trim(), "El nombre del programa es obligatorio."],
    [nombre.value.trim() && nombre.value.trim().length < 4, "El nombre es demasiado corto."],
    [!duracion.value, "La duración es obligatoria."],
    [duracion.value && Number(duracion.value) < 1, "La duración debe ser un número mayor a 0."],
  ]);
  if (lista.length) return alerta.aviso("Revisa el formulario", lista);

  guardando.value = true;
  try {
    const msg = await cursos.guardar(o.cursoForm.item?._id, {
      codigo: codigo.value.trim(),
      nombre: nombre.value.trim(),
      duracion: Number(duracion.value),
    });
    abierto.value = false;
    alerta.ok(msg);
  } catch (e) {
    alerta.errorApi(e, "No se pudo guardar el curso");
  } finally {
    guardando.value = false;
  }
}
</script>
