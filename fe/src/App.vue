<template>
  <v-app :theme="store.theme">
    <router-view />
  </v-app>
  <div class="themeChanger">
    <v-btn
      size="small"
      flat
      icon
      @click="store.theme = store.theme === 'light' ? 'dark' : 'light'"
    >
      <v-icon>mdi-theme-light-dark</v-icon>
    </v-btn>
  </div>
  <v-dialog
    v-model="store.preload"
    scrollable
    fullscreen
    persistent
    :overlay="false"
    transition="dialog-transition"
  >
    <v-card :theme="store.theme">
      <div class="w-100 h-100 d-flex justify-center align-center">
        <v-progress-circular
          indeterminate
          color="primary"
          size="400"
          width="20"
        >
          <v-img width="200" src="@/assets/softpren.png"></v-img>
        </v-progress-circular>
      </div>
    </v-card>
  </v-dialog>
</template>
<style scoped>
.themeChanger {
  position: fixed;
  bottom: 10px;
  right: 10px;
  z-index: 1000;
}
</style>
<script setup>
import { useAppStore } from './stores/app';

//
const store = useAppStore();
</script>
