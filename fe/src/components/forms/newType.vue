<template>
  <v-text-field
    variant="outlined"
    rounded="pill"
    density="compact"
    label="Type Name"
    class="my-2"
    v-model="formData.label"
  />
  <v-divider class="my-2"></v-divider>
  <v-btn
    :disabled="formData.label == ''"
    variant="outlined"
    rounded="pill"
    block
    @click="submit"
    >Create</v-btn
  >
</template>
<script setup>
import { useAppStore } from '@/stores/app';
import useVuelidate from '@vuelidate/core';
import { helpers, required } from '@vuelidate/validators';

const props = defineProps(['typeData']);
const emits = defineEmits(['refresh']);

const store = useAppStore();
const formData = reactive({
  id: props.typeData.id ? props.typeData.id : '',
  label: props.typeData.label ? props.typeData.label : '',
});
const submit = async () => {
  try {
    await store.ajax(formData, '/tools/createtype', 'post');
    emits('refresh');
  } catch (error) {
    console.log(error);
  }
};
</script>
