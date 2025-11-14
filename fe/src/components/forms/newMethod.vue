<template>
  <v-row>
    <v-col cols="6">
      <v-autocomplete
        :items="logics"
        item-title="label"
        :item-value="(item) => item"
        variant="outlined"
        rounded="pill"
        density="compact"
        label="Logic Type"
        v-model="formData.logicType"
      />
      <v-textarea
        variant="outlined"
        rounded="lg"
        density="compact"
        label="Inspection Method"
        v-model="formData.label"
      />
    </v-col>
    <v-col cols="6">
      <v-row>
        <v-col cols="12">
          <v-text-field
            variant="outlined"
            rounded="pill"
            density="compact"
            label="Unit"
            hide-details
            type="text"
            v-model="formData.unit"
            hide-spin-buttons
          />
        </v-col>
        <v-col cols="12">
          <v-divider>Logic Description</v-divider>
          <p>{{ formData.logicType?.description }}</p>
        </v-col>
      </v-row>
    </v-col>
    <v-col cols="12">
      <v-divider>Standard</v-divider>
    </v-col>
    <v-col cols="12" v-if="formData.logicType != {}">
      <v-row>
        <v-col
          :cols="12 / formData.standard.length"
          v-for="(item, index) in formData.standard"
          :key="index"
        >
          <v-text-field
            :readonly="formData.logicType?.id === 1"
            hide-spin-buttons
            hide-details
            variant="outlined"
            rounded="pill"
            density="compact"
            v-model="formData.standard[index]"
            :type="formData.dataType"
            :label="formData.standardMeta[index]?.label"
          >
            <template
              #prepend-inner
              v-if="formData.dataType == 'number' && formData.logicType != {}"
            >
              {{ formData.standardMeta[index]?.operator }}
            </template>
          </v-text-field>
        </v-col>
        <v-col cols="12">
          <v-divider></v-divider>
        </v-col>
        <v-col cols="12">
          <v-btn
            :disabled="
              formData.logicType?.id == undefined ||
              !formData.standard.every((item) => item != '') ||
              formData.label == ''
            "
            variant="outlined"
            rounded="pill"
            block
            @click="submit"
            :text="methodData != null ? 'edit' : 'add'"
          ></v-btn>
        </v-col>
      </v-row>
    </v-col>
  </v-row>
</template>
<script setup>
import { InspectionMethod, standardMeta } from '@/assets/helpers_2';
import { useAppStore } from '@/stores/app';

const store = useAppStore();
const emits = defineEmits(['addMethod', 'editMethod']);
const props = defineProps(['methodData']);
const formData = reactive(new InspectionMethod());
const logics = ref([]);

watch(
  () => formData.logicType,
  (newValue) => {
    if (newValue) {
      formData.init(newValue);
    }
  }
);

onBeforeMount(() => {
  store.ajax({}, '/tools/getlogics', 'post').then((res) => {
    logics.value = res;
    store.preload = false;
    nextTick().then(() => {
      // Initialize formData with the first logic type

      if (props.methodData !== null) {
        formData.setFromObj(props.methodData);
      } else {
        if (logics.value.length > 0) {
          formData.logicType = logics.value[0];
        }
      }
    });
  });
});

const submit = () => {
  if (props.methodData == null) {
    emits('addMethod', { ...formData.genData() });
  } else {
    emits('editMethod', { ...formData.genData() });
  }
};
</script>
