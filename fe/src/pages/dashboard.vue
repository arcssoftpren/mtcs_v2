<template>tst</template>
<script setup>
import { useAppStore } from '@/stores/app';

const store = useAppStore();
onMounted(() => {
  store.preload = false;
});
</script>
