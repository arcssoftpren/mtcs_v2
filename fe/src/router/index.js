/**
 * router/index.ts
 *
 * Automatic routes for `./src/pages/*.vue`
 */

// Composables
import { createRouter, createWebHistory } from 'vue-router/auto';
import { setupLayouts } from 'virtual:generated-layouts';
import { routes } from 'vue-router/auto-routes';
routes.forEach((route) => {
  if (route.path != '/') {
    route.meta = { ...(route.meta || {}), layout: 'dashboard' };
  }
});

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: setupLayouts(routes),
});

// Workaround for https://github.com/vitejs/vite/issues/11804
router.onError((err, to) => {
  if (err?.message?.includes?.('Failed to fetch dynamically imported module')) {
    if (!localStorage.getItem('vuetify:dynamic-reload')) {
      console.log('Reloading page to fix dynamic import error');
      localStorage.setItem('vuetify:dynamic-reload', 'true');
      location.assign(to.fullPath);
    } else {
      console.error('Dynamic import error, reloading page did not fix it', err);
    }
  } else {
    console.error(err);
  }
});

router.isReady().then(() => {
  localStorage.removeItem('vuetify:dynamic-reload');
});

export default router;

import { useAppStore } from '@/stores/app';

router.beforeEach((to, from) => {
  const store = useAppStore();

  if (store.loged) {
    if (to.matched.length < 1) {
      router.push(from.fullPath);
    } else {
      const page = store.pages.find((p) => p.path === to.fullPath);
      store.page = page;
    }
  } else {
    if (to.path !== '/') {
      router.push('/');
    }
  }
});
