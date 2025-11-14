<template>
  <div class="w-100">
    <v-autocomplete
      class="mt-2"
      :items="logics"
      item-title="label"
      :item-value="(item) => item"
      label="Logic Type"
      variant="outlined"
      rounded="pill"
      density="compact"
      v-model="formData.logic"
    />
    <v-textarea
      class="mt-2"
      variant="outlined"
      v-model="formData.label"
      label="Inspection Item"
    >
    </v-textarea>
    <div class="w-100" v-if="formData.logic != null">
      <v-divider>STANDARD</v-divider>

      <v-row class="mt-2">
        <v-col cols="10">
          <v-row>
            <v-col
              :cols="12 / formData.standardArr.length"
              v-for="(item, index) in formData.standardArr"
              :key="index"
            >
              <v-text-field
                hide-spin-buttons=""
                hide-details=""
                @keyup="formData.generateStandard()"
                v-if="formData.dataType != 'boolean'"
                variant="outlined"
                rounded="pill"
                density="compact"
                :type="formData.dataType"
                v-model="formData.standardArr[index]"
                :label="formData.standardLabel[index]?.label"
              />

              <v-text-field
                hide-spin-buttons=""
                hide-details=""
                @keyup="formData.generateStandard()"
                v-else
                model-value="OK"
                readonly
                variant="outlined"
                rounded="pill"
                density="compact"
                :type="formData.dataType"
                v-model="formData.standardArr[index]"
                :label="formData.standardLabel[index]?.label"
              />
            </v-col>
          </v-row>
        </v-col>
        <v-col cols="2">
          <v-text-field
            @keyup="formData.generateStandard()"
            label="Unit"
            variant="outlined"
            rounded="pill"
            density="compact"
            v-model="formData.unit"
          />
        </v-col>
      </v-row>
      <v-row class="mt-2">
        <v-col cols="12">
          <v-divider>STANDARD VIEW</v-divider>
        </v-col>
        <v-col cols="12">
          <v-sheet class="text-center pa-5" style="border: 1px solid black">
            {{ formData.standard }}
          </v-sheet>
        </v-col>
      </v-row>
    </div>
    <div class="w-100 my-5">
      <v-divider></v-divider>
    </div>
    <div class="w-100">
      <v-btn
        :disabled="!formData.validate()"
        @click="submit"
        variant="outlined"
        rounded="pill"
        block
        >add</v-btn
      >
    </div>
  </div>
</template>
<script setup>
import { InsItem } from '@/assets/helpers.js';
import { useAppStore } from '@/stores/app';

const store = useAppStore();
const emits = defineEmits(['addItem']);

const formData = reactive(new InsItem());
const logics = ref([]);

onBeforeMount(() => {
  store.ajax({}, '/tools/getlogics', 'post').then((res) => {
    logics.value = res;
    store.preload = false;
  });
});

watch(
  () => formData.logic,
  (newVal) => {
    if (newVal) {
      formData.selectLogic(newVal);
    }
  }
);

const submit = () => {
  if (formData.validate()) {
    const data = formData.generateToolItem();
    emits('addItem', { ...toRaw(data) });
  }
};
</script>
