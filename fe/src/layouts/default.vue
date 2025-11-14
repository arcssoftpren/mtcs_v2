<template>
  <v-main>
    <v-container class="d-flex w-100 fill-height align-center justify-center">
      <router-view />
    </v-container>
  </v-main>
</template>

<script setup>
import router from '@/router';
import { useAppStore } from '@/stores/app';

//

const store = useAppStore();

onBeforeMount(() => {
  if (store.loged) {
    const userData = store.userData;
    router.push(userData.homePage);
  }
});
</script>
