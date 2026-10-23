<template>
  <SlidePanel v-model="abierto" centrado :eyebrow="o.aprendizForm.item ? 'Editar ficha' : 'Nueva ficha'" :title="o.aprendizForm.item ? 'Editar aprendiz' : 'Nuevo aprendiz'">
    <Campo label="Documento" hint="Solo números, entre 5 y 15 dígitos.">
      <q-input v-model="documento" outlined dense class="mono-input" inputmode="numeric" placeholder="1098765432" autocomplete="off" @update:model-value="soloNumeros" @keyup.enter="guardar" />
    </Campo>
    <Campo label="Nombre completo">
      <q-input v-model="nombre" outlined dense placeholder="Ana María Gómez" autocomplete="off" @keyup.enter="guardar" />
    </Campo>
    <Campo label="Correo electrónico">
      <q-input v-model="email" outlined dense placeholder="ana@sena.edu.co" autocomplete="off" @keyup.enter="guardar" />
    </Campo>
    <Campo label="Curso" hint="Solo aparecen los cursos activos.">
      <q-select v-model="curso" outlined dense emit-value map-options :options="opciones" placeholder="Selecciona un curso" no-error-icon />
    </Campo>

    <template #footer>
      <q-btn flat no-caps class="btn btn--ghost" label="Cancelar" @click="abierto = false" />
      <q-btn unelevated no-caps class="btn btn--solid" :loading="guardando" :label="o.aprendizForm.item ? 'Guardar cambios' : 'Registrar aprendiz'" @click="guardar" />
    </template>
  </SlidePanel>
</template>

<script setup>
import { computed, ref, watch } from "vue";
import SlidePanel from "./SlidePanel.vue";
import Campo from "./Campo.vue";
import { useOverlaysStore } from "@/stores/overlays";
import { useCursosStore } from "@/stores/cursos";
import { useAprendicesStore } from "@/stores/aprendices";
import { alerta, problemas, regexEmail } from "@/utils/alerta";
import { sentenceCase } from "@/utils/format";

const o = useOverlaysStore();
const cursos = useCursosStore();
const aprendices = useAprendicesStore();

const abierto = computed({ get: () => o.aprendizForm.open, set: (v) => (o.aprendizForm.open = v) });
const documento = ref("");
const nombre = ref("");
const email = ref("");
const curso = ref(null);
const guardando = ref(false);

// Cursos activos; al editar se conserva el curso actual aunque esté inactivo.
const opciones = computed(() => {
  const actual = o.aprendizForm.item?.curso?._id;
  return cursos.items
    .filter((c) => c.status === 0 || c._id === actual)
    .map((c) => ({ label: `${sentenceCase(c.nombre)} · ${c.codigo}`, value: c._id }));
});

watch(abierto, async (open) => {
  if (!open) return;
  await cursos.fetch();
  const a = o.aprendizForm.item;
  documento.value = a?.documento || "";
  nombre.value = a?.nombre || "";
  email.value = a?.email || "";
  curso.value = a?.curso?._id || o.aprendizForm.cursoId || null;
});

const soloNumeros = (v) => (documento.value = String(v ?? "").replace(/\D/g, ""));

async function guardar() {
  const doc = documento.value.trim();
  const lista = problemas([
    [!doc, "El documento es obligatorio."],
    [doc && !/^\d{5,15}$/.test(doc), "El documento debe tener entre 5 y 15 dígitos."],
    [!nombre.value.trim(), "El nombre es obligatorio."],
    [nombre.value.trim() && nombre.value.trim().length < 3, "El nombre es demasiado corto."],
    [!email.value.trim(), "El correo es obligatorio."],
    [email.value.trim() && !regexEmail.test(email.value.trim()), "El correo no tiene un formato válido."],
    [!curso.value, "Elige el curso del aprendiz."],
  ]);
  if (lista.length) return alerta.aviso("Revisa el formulario", lista);

  guardando.value = true;
  try {
    const msg = await aprendices.guardar(o.aprendizForm.item?._id, {
      documento: doc,
      nombre: nombre.value.trim(),
      email: email.value.trim(),
      curso: curso.value,
    });
    abierto.value = false;
    alerta.ok(msg);
  } catch (e) {
    alerta.errorApi(e, "No se pudo guardar el aprendiz");
  } finally {
    guardando.value = false;
  }
}
</script>
