<template>
  <v-list nav="">
    <v-list-item
      color="primary"
      @click="
        () => {
          store.goto(item.path);
          closeDrawer();
        }
      "
      :active="store.page.path === item.path"
      v-for="(item, index) in store.pages.filter(
        (page) => page.type === 'setup'
      )"
      :key="index"
      v-show="rights.includes(item.id)"
    >
      <template #title>
        <div class="text-uppercase">{{ item.name }}</div>
      </template>
      <template #prepend>
        <v-icon size="30">{{ item.icon }}</v-icon>
      </template>
      <template #subtitle>{{ item.desc }}</template>
    </v-list-item>
  </v-list>
</template>
<script setup>
import { useAppStore } from '@/stores/app';

const props = defineProps(['closeDrawer']);
const store = useAppStore();
const rights = ref([]);

onMounted(() => {
  store
    .ajax({ userId: store.userData.userId }, '/auth', 'POST')
    .then(async (userData) => {
      store.userData = userData;
      rights.value = JSON.parse(userData.accessRights);
    });
});
</script>
