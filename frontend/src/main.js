import { createApp, watch } from "vue";
import { createPinia } from "pinia";
import piniaPluginPersistedstate from "pinia-plugin-persistedstate";
import { Quasar, Dark } from "quasar";
import langEs from "quasar/lang/es";
import iconSet from "quasar/icon-set/material-icons-outlined";

import "@fontsource-variable/fraunces/opsz.css";
import "@fontsource-variable/fraunces/opsz-italic.css";
import "@fontsource-variable/hanken-grotesk";
import "@fontsource/jetbrains-mono/400.css";
import "@fontsource/jetbrains-mono/500.css";
import "@quasar/extras/material-icons-outlined/material-icons-outlined.css";
import "quasar/src/css/index.sass";
import "./css/app.scss";

import App from "./App.vue";
import router from "./router";
import { setupInterceptors } from "./services/api";
import { useAuthStore } from "./stores/auth";
import { useUiStore } from "./stores/ui";
import { alerta } from "./utils/alerta";

const pinia = createPinia();
pinia.use(piniaPluginPersistedstate);

const app = createApp(App);
app.use(pinia);
app.use(router);
app.use(Quasar, { plugins: { Dark }, lang: langEs, iconSet });

const auth = useAuthStore();
const ui = useUiStore();

// Axios <-> store/router, conectados sin importarse entre sí.
setupInterceptors({
  getToken: () => auth.token,
  onUnauthorized: () => {
    if (!auth.isAuth) return;
    const destino = router.currentRoute.value.fullPath;
    auth.logout();
    router.replace({ name: "login", query: destino !== "/" ? { redirect: destino } : {} });
    alerta.aviso("Tu sesión terminó", "Inicia sesión de nuevo para continuar.");
  },
});

// Tema claro/oscuro persistido.
watch(() => ui.theme, (t) => Dark.set(t === "dark"), { immediate: true });

app.mount("#app");
