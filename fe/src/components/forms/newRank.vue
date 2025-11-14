<template>
  <v-row>
    <v-col cols="12">
      <v-text-field
        class="mt-2"
        variant="outlined"
        rounded="pill"
        density="compact"
        label="Rank Name"
        v-model="formData.label"
        hide-details
        :error-messages="validate.label.$errors.map((e) => e.$message)"
      />
    </v-col>
    <v-col cols="12">
      <v-divider>Headers</v-divider>
    </v-col>
    <v-col cols="4" v-for="(item, index) in headers" :key="index">
      <v-checkbox-btn
        :value="item.id"
        v-model="formData.headers"
        :label="item.label"
      ></v-checkbox-btn>
    </v-col>
    <v-col cols="12">
      <p v-if="validate.headers.$errors.length > 0" class="text-error">
        Please select at least one header.
      </p>
      <v-divider></v-divider>
    </v-col>

    <v-col cols="12">
      <v-checkbox-btn v-model="allSelected" label="Select All"></v-checkbox-btn>
    </v-col>
    <v-col cols="12">
      <v-divider></v-divider>
    </v-col>
    <v-col cols="12">
      <v-btn variant="outlined" rounded="pill" block @click="submit"
        >Submit</v-btn
      >
    </v-col>
  </v-row>
</template>
<script setup>
import { useAppStore } from '@/stores/app';
import useVuelidate from '@vuelidate/core';
import { helpers, required } from '@vuelidate/validators';

const props = defineProps(['rankData']);
const emits = defineEmits(['refresh']);

const store = useAppStore();
const formData = reactive({
  id: props.rankData.id ? props.rankData.id : '',
  label: props.rankData.label ? props.rankData.label : '',
  headers: props.rankData.headers ? props.rankData.headers : [],
});
const headers = ref([]);
const allSelected = ref(false);
const structure = {};
const rules = {
  label: { required },
  headers: { required },
};
const validate = useVuelidate(rules, formData);
const submit = async () => {
  try {
    const valid = await validate.value.$validate();
    if (!valid)
      throw {
        title: 'Validation Error',
        text: 'Please fill in all required fields.',
        icon: 'error',
      };
    store.preload = true;
    formData.headers = JSON.stringify(formData.headers);

    store
      .ajax(formData, '/tools/createrank', 'post')
      .then((response) => {
        store.swal.fire({
          title: 'Success',
          text: response.message,
          icon: 'success',
        });
        emits('refresh');
      })
      .catch((error) => {
        store.swal.fire({
          title: 'Error',
          text: error.message,
          icon: 'error',
        });
      })
      .finally(() => {
        store.preload = false;
        emits('refresh');
      });
  } catch (error) {
    store.swal.fire(error);
  }
};

watch(allSelected, (newValue) => {
  if (newValue) {
    formData.headers = headers.value.map((item) => item.id);
  } else {
    formData.headers = [];
  }
});

const load = async () => {
  try {
    headers.value = await store.ajax({}, '/tools/getheaders', 'post');
    allSelected.value = headers.value.length === formData.headers.length;

    store.preload = false;
  } catch (error) {}
};

onMounted(() => {
  load();
});
</script>
