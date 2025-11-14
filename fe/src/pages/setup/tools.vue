<template>
  <v-card>
    <v-tabs align-tabs="start" v-model="tab" color="primary">
      <v-tab :value="index" v-for="(tab, index) in tabs" :key="index">
        <template #default>{{ tab.title }}</template>
      </v-tab>
    </v-tabs>
    <v-card-text>
      <v-container fluid>
        <v-tabs-window v-model="tab" class="fill-height">
          <v-tabs-window-item
            v-for="(tab, index) in tabs"
            :key="index"
            :value="index"
          >
            <v-container fluid rounded="lg" class="fill-height">
              <component :is="tab.component"></component>
            </v-container>
          </v-tabs-window-item>
        </v-tabs-window>
      </v-container>
    </v-card-text>
  </v-card>
</template>
<script setup>
import { useAppStore } from '@/stores/app';

const store = useAppStore();
const tab = ref(0);
const tabs = [
  {
    title: 'Tool List',
    content: 'Content for Tool List',
    component: defineAsyncComponent(
      () => import('@/components/tabs/toolList.vue')
    ),
  },
  {
    title: 'Type Settings',
    content: 'Content for Type Settings',
    component: defineAsyncComponent(
      () => import('@/components/tabs/typeSetup.vue')
    ),
  },
  {
    title: 'Tool Ranks',
    content: 'Content for Tool Ranks',
    component: defineAsyncComponent(
      () => import('@/components/tabs/toolRank.vue')
    ),
  },
  {
    title: 'Header Settings',
    content: 'Content for Header Settings',
    component: defineAsyncComponent(
      () => import('@/components/tabs/headerSetup.vue')
    ),
  },
];

onMounted(() => {
  store.preload = false;
});
</script>
