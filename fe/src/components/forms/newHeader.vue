<template>
  <div>
    <v-row>
      <v-col cols="12" v-for="(item, index) in structure" :key="index">
        <v-text-field
          class="mt-2"
          hide-details=""
          v-if="item.type === 'text'"
          variant="outlined"
          rounded="pill"
          density="compact"
          :type="item.type"
          :label="item.label"
          v-model="formData[index]"
          :error-messages="validate[index].$errors.map((e) => e.$message)"
        />

        <div v-else class="w-100 text-center">
          <v-divider> Object Type</v-divider>
          <v-btn-toggle
            variant="outlined"
            rounded="pill"
            mandatory=""
            density="compact"
            color="primary"
            class="w-100 mt-5 mb-2"
            v-model="formData[index]"
          >
            <v-btn
              class="w-50"
              v-for="(cb, cbindex) in objectType"
              :key="cbindex"
              :value="cb.value"
            >
              {{ cb.label }}
            </v-btn>
          </v-btn-toggle>
        </div>
      </v-col>
      <v-col cols="12">
        <v-divider></v-divider>
      </v-col>
      <v-col cols="12">
        <v-btn variant="outlined" rounded="pill" @click="submit" block
          >Create</v-btn
        >
      </v-col>
    </v-row>
  </div>
</template>
<script setup>
import { useAppStore } from '@/stores/app';
import useVuelidate from '@vuelidate/core';
import { helpers, required } from '@vuelidate/validators';

const emits = defineEmits(['refresh']);
const props = defineProps(['headerData']);

const objectType = [
  { label: 'Date', value: 'date' },
  { label: 'Text', value: 'text' },
];

const store = useAppStore();
const formData = reactive({
  id: props.headerData.id ? props.headerData.id : null,
  label: props.headerData.label ? props.headerData.label : '',
  objectType: props.headerData.objectType
    ? props.headerData.objectType
    : 'text',
});
const structure = {
  label: {
    label: 'Header Label',
    type: 'text',
  },
  objectType: {
    label: 'Header Type',
    type: 'select',
    options: objectType,
  },
};
const rules = {
  label: {
    required,
  },
  objectType: {
    required,
  },
};
const validate = useVuelidate(rules, formData);
const submit = async () => {
  try {
    const valid = await validate.value.$validate();
    if (!valid)
      throw {
        title: 'Validation Error',
        text: 'Please fill all required fields.',
        icon: 'error',
      };

    const response = await store.ajax(formData, '/tools/createheader', 'post');

    emits('refresh');
  } catch (error) {
    store.swal.fire(error);
  }
};
</script>
