<template>
  <v-list nav="">
    <v-list-item
      rounded="pill"
      color="primary"
      @click="
        () => {
          store.goto(item.path);
          closeDrawer();
        }
      "
      :active="store.page.path === item.path"
      v-for="(item, index) in store.pages.filter(
        (page) => page.type === 'menu'
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
      <template #append>
        <v-badge
          v-if="
            item.path == '/features/operatorinspection' && count.unchecked > 0
          "
          location="top right"
          color="warning"
          :content="count.unchecked"
        >
          <v-icon icon="mdi-bell" color="error"></v-icon>
        </v-badge>
        <v-badge
          v-if="item.path == '/features/leadercheck' && count.checked > 0"
          location="top right"
          color="warning"
          :content="count.checked"
        >
          <v-icon icon="mdi-bell" color="error"></v-icon>
        </v-badge>
      </template>
    </v-list-item>
  </v-list>
</template>
<script setup>
import { useAppStore } from '@/stores/app';

const props = defineProps(['closeDrawer']);
const store = useAppStore();
const rights = ref([]);

const count = reactive({
  unchecked: 0,
  checked: 0,
  reviewed: 0,
  approved: 0,
  abnormal: 0,
});

onBeforeMount(() => {
  store
    .ajax({ userId: store.userData.userId }, '/auth', 'POST')
    .then((userData) => {
      store.userData = userData;
      rights.value = JSON.parse(userData.accessRights);
      refresh();
    });
});

const refresh = async () => {
  count.unchecked = (
    await store.ajax({ func: 'unchecked' }, '/inspections', 'post')
  ).length;
};

watch(
  () => store.inspectionRefresh,
  () => {
    refresh();
  }
);

onMounted(() => {
  setTimeout(() => {
    store.preload = false;
  }, 1000);
});
</script>
