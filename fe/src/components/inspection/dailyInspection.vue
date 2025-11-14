<style scoped>
.myTable {
  border-collapse: collapse;
}
.myTable tr td,
.myTable tr th {
  border: solid 1px black;
  padding: 5px;
}
</style>
<template>
  <v-sheet
    class="position-sticky w-100 bg-white pa-5"
    style="top: 0px; z-index: 100; height: 350px"
  >
    <table class="myTable mb-5 w-100">
      <thead>
        <tr>
          <th class="text-start">Tool Name</th>
          <td>{{ formData.equipmentName }}</td>
          <th class="text-start">Inspector</th>
          <td>{{ store.userData.userName }}</td>
          <td
            rowspan="2"
            :class="`text-center text-h6 ${formData.getResult() ? 'bg-success' : 'bg-error'}`"
          >
            {{ formData.getResult() ? 'OK' : 'NG' }}
          </td>
        </tr>
        <tr>
          <th class="text-start">Registration Number</th>
          <td>{{ formData.regisNo }}</td>
          <td colspan="2" class="text-center">
            {{ moment().format('DD/MM/YYYY') }}
          </td>
        </tr>
      </thead>
    </table>
    <v-img height="220" :src="image == null ? defaultImage : image"></v-img>
  </v-sheet>
  <div class="w-100">
    <table class="w-100 myTable">
      <thead class="position-sticky bg-white" style="top: 350px; z-index: 100">
        <tr>
          <th class="text-center">Image Number</th>
          <th>Label</th>
          <th>Methods</th>
          <th>Result</th>
          <th class="text-center">Judgement</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(item, index) in formData.inspectionItems" :key="index">
          <td class="text-center">{{ item.imageNumber }}</td>
          <td>{{ item.label }}</td>
          <td>
            <v-list>
              <v-list-item
                v-for="(method, methodIndex) in item.methods"
                :key="methodIndex"
              >
                {{ method.label }}
              </v-list-item>
            </v-list>
          </td>
          <td class="text-center text-no-wrap" style="width: 200px">
            <v-list class="w-100">
              <v-list-item
                class="w-100"
                v-for="(method, methodIndex) in item.methods"
                :key="methodIndex"
              >
                <v-btn-toggle
                  density="compact"
                  variant="outlined"
                  @change="method.inspect()"
                  mandatory
                  v-model="method.input"
                  v-if="method.logicType.inputType == 'buttonToggle'"
                >
                  <v-btn color="success" value="OK">OK</v-btn>
                  <v-btn color="error" value="NG">NG</v-btn>
                </v-btn-toggle>
                <v-text-field
                  v-model="method.input"
                  @keyup="method.inspect()"
                  :type="method.dataType"
                  variant="outlined"
                  rounded="pill"
                  density="compact"
                  v-else
                  hide-details=""
                  hide-spin-buttons=""
                />
              </v-list-item>
            </v-list>
          </td>
          <td
            v-if="item.methods.every((method) => method.inspect())"
            :class="`text-h6 text-center text-success`"
          >
            OK
          </td>
          <td v-else :class="`text-h6 text-center text-error`">NG</td>
        </tr>
      </tbody>
    </table>
  </div>

  <div
    class="position-sticky w-100 bg-white d-flex align-center justify-center"
    style="bottom: 0px; z-index: 100; height: 70px"
  >
    <v-btn
      variant="flat"
      :color="formData.getResult() ? 'success' : 'error'"
      rounded="pill"
      block
      @click="save"
    >
      {{ formData.getResult() ? 'Save' : 'Report NG' }}
    </v-btn>
  </div>
</template>
<script setup>
import { InspectionReport } from '@/assets/helpers_2.js';
import { useAppStore } from '@/stores/app';
import defaultImage from '@/assets/defaultDesign.png';
import moment from 'moment';

const emits = defineEmits(['updateData']);
const props = defineProps(['inspection']);
const store = useAppStore();
const formData = reactive(new InspectionReport());
const image = ref(null);
formData.setFromObj(props.inspection);

const load = async () => {
  const toolId = formData.toolId;

  image.value = await store.ajax({ toolId }, '/tools/images', 'post');
  setTimeout(() => {
    store.preload = false;
  }, 1000);
};

const save = () => {
  formData.inspector.userId = store.userData.userId;
  formData.inspector.userName = store.userData.userName;

  let rawData = new InspectionReport();
  rawData.setFromObj({ ...toRaw(formData) });

  rawData.inspectionItems.forEach((item) => {
    item.methods = item.methods.map((method) => {
      return method.genData();
    });
  });
  emits('updateData', { ...rawData.genData() });
};

onBeforeMount(() => {
  load();
});
</script>
