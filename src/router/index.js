import { createRouter, createWebHashHistory } from "vue-router";
import { useAuthStore } from "@/stores/auth";

// Modo hash (#/cursos): el backend sirve public/index.html para cualquier ruta,
// pero el hash funciona igual con el frontend aparte (npm run dev) o servido por Express.
const router = createRouter({
  history: createWebHashHistory(),
  scrollBehavior: () => ({ top: 0 }),
  routes: [
    {
      path: "/login",
      name: "login",
      component: () => import("@/views/LoginView.vue"),
      meta: { public: true, title: "Acceso" },
    },
    {
      path: "/",
      component: () => import("@/layouts/MainLayout.vue"),
      meta: { auth: true },
      children: [
        { path: "", name: "panorama", component: () => import("@/views/PanoramaView.vue"), meta: { title: "Panorama" } },
        { path: "cursos", name: "cursos", component: () => import("@/views/CursosView.vue"), meta: { title: "Cursos" } },
        { path: "aprendices", name: "aprendices", component: () => import("@/views/AprendicesView.vue"), meta: { title: "Aprendices" } },
        { path: "accesos", name: "accesos", component: () => import("@/views/AccesosView.vue"), meta: { title: "Accesos" } },
      ],
    },
    { path: "/:pathMatch(.*)*", name: "404", component: () => import("@/views/NotFoundView.vue"), meta: { title: "No encontrado" } },
  ],
});

router.beforeEach((to) => {
  const auth = useAuthStore();
  if (to.meta.auth && !auth.isAuth) return { name: "login", query: to.fullPath !== "/" ? { redirect: to.fullPath } : {} };
  if (to.name === "login" && auth.isAuth) return { name: "panorama" };
});

router.afterEach((to) => {
  document.title = `${to.meta.title ? to.meta.title + " · " : ""}Cat`;
});

export default router;
