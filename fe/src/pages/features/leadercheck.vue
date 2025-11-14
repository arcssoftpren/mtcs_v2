<style scoped>
.myTable {
  width: 100%;
}

.myTable2 {
  width: 100%;
  border-collapse: collapse;
}

.myTable2 tbody tr td {
  border: solid 1px #000000 !important;
  text-align: center;
}

.myTable tbody tr td,
.myTable tfoot tr td {
  padding: 5px;
  border: solid 1px #e0e0e0;
}

.myTable thead tr th {
  padding: 5px;
  position: sticky;
  background: rgb(255, 255, 255);
  border: solid 1px #000000;
}

.myTable tfoot tr td {
  padding: 5px;
  position: sticky;
  background: rgb(255, 255, 255);
  border: solid 1px #000000;
  bottom: 3px;
}
</style>
<template>
  <div class="w-100">
    <v-data-table :items="inspections" :search="search">
      <template #top>
        <v-row>
          <v-col cols="4" offset="8">
            <v-text-field
              variant="outlined"
              rounded="pill"
              density="compact"
              label="Search"
              prepend-inner-icon="mdi-magnify"
              v-model="search"
            />
          </v-col>
        </v-row>
      </template>
      <template #headers>
        <tr>
          <th class="text-center">Tools</th>
          <th class="text-center">Location</th>
          <th class="text-center">Action</th>
        </tr>
      </template>
      <template #item="{ item }">
        <tr>
          <td class="pa-5">
            <v-card>
              <template #title>{{ item.regisNo }}</template>
              <template #subtitle>{{ item.equipmentName }}</template>
            </v-card>
          </td>
          <td class="text-center">{{ item.location }}</td>
          <td class="text-center">
            <v-btn
              @click="openDialog('check', item)"
              color="primary"
              variant="outlined"
              rounded="pill"
              block
              >Confirm Now</v-btn
            >
          </td>
        </tr>
      </template>
    </v-data-table>
    <v-dialog
      v-model="dialog"
      scrollable
      persistent
      fullscreen=""
      :overlay="false"
      transition="dialog-transition"
    >
      <v-card>
        <template #append>
          <v-btn
            @click="dialog = false"
            density="compact"
            flat
            icon
            class="mt-2 ms-2"
          >
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </template>
        <template #title>{{ dialogData.title }}</template>
        <template #subtitle>{{ dialogData.subtitle }}</template>
        <!-- content -->
        <v-card-text class="pb-0">
          <div style="border: solid 1px #e0e0e0">
            <table class="w-100 myTable">
              <thead>
                <tr style="top: 3px; position: sticky; z-index: 200">
                  <td colspan="10" height="226" class="bg-white">
                    <table class="myTable2" height="200">
                      <tbody>
                        <tr>
                          <td rowspan="4" width="160" class="text-center">
                            <v-img
                              width="215"
                              :src="
                                toolImage == null ? defaultImage : toolImage
                              "
                            ></v-img>
                          </td>
                          <th colspan="4">LEADER WEEKLY CHECK</th>
                        </tr>
                        <tr>
                          <th>Tool Name</th>
                          <td>{{ selected.equipmentName }}</td>
                          <th>Register Number</th>
                          <td>{{ selected.regisNo }}</td>
                        </tr>
                        <tr>
                          <th>Location</th>
                          <td>{{ selected.location }}</td>
                          <th>Check Period</th>
                          <td>
                            {{ moment(selected.dates[0]).format('DD/MM/YYYY') }}
                            ~
                            {{
                              moment(
                                selected.dates[selected.dates.length - 1]
                              ).format('DD/MM/YYYY')
                            }}
                          </td>
                        </tr>
                        <tr>
                          <th>Inspector</th>
                          <td colspan="2">{{ store.userData.userName }}</td>
                          <td>
                            <v-btn
                              variant="flat"
                              color="primary"
                              rounded="pill"
                              @click="signReport"
                              prepend-icon="mdi-draw"
                            >
                              Sign Now
                            </v-btn>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </td>
                </tr>
                <tr style="top: 232px; position: sticky; z-index: 200">
                  <th class="text-center" rowspan="2">No</th>
                  <th class="text-center" rowspan="2">Item Check</th>
                  <th class="text-center" rowspan="2">Methods</th>
                  <th :colspan="selected.dates.length" class="text-center">
                    Date
                  </th>
                </tr>
                <tr style="top: 270px; position: sticky; z-index: 200">
                  <th
                    class="text-center"
                    v-for="date in selected.dates"
                    :key="date"
                  >
                    {{ moment(date).format('DD/MM') }}
                  </th>
                </tr>
              </thead>
              <tbody>
                <template
                  v-for="(insItem, insIndex) in selected.inspectionItems"
                  :key="insIndex"
                >
                  <tr
                    v-for="(method, methodIndex) in insItem.methods"
                    :key="methodIndex"
                  >
                    <td
                      class="text-center"
                      v-if="methodIndex == 0"
                      :rowspan="insItem.methods.length"
                    >
                      {{ insItem.imageNumber }}
                    </td>
                    <td
                      v-if="methodIndex == 0"
                      :rowspan="insItem.methods.length"
                    >
                      {{ insItem.label }}
                    </td>
                    <td>{{ method.label }}</td>
                    <td
                      :class="`text-center text-h6 ${result.libur !== null || result.weekEnd ? 'bg-pink-lighten-5' : ''}`"
                      v-for="(result, resultIndex) in selected.inspectionData"
                      :key="resultIndex"
                    >
                      <div v-if="result.inspection">
                        <div
                          class="text-error"
                          v-if="result.inspection.status == 'unchecked'"
                        >
                          NC
                        </div>
                        <div v-else>
                          <div
                            v-if="
                              result.inspection.inspectionItems
                                .find((item) => item.id == insItem.id)
                                .methods.find((m) => m.id == method.id)
                                .logicType.inputType == 'buttonToggle'
                            "
                          >
                            <div
                              v-if="
                                result.inspection.inspectionItems
                                  .find((item) => item.id == insItem.id)
                                  .methods.find((m) => m.id == method.id)
                                  .judgement
                              "
                            >
                              <v-icon color="success"
                                >mdi-circle-outline</v-icon
                              >
                            </div>
                            <div v-else>
                              <v-icon color="error">mdi-close</v-icon>
                            </div>
                          </div>
                          <div
                            v-else
                            :class="
                              result.inspection.inspectionItems
                                .find((item) => item.id == insItem.id)
                                .methods.find((m) => m.id == method.id)
                                .judgement
                                ? 'text-success'
                                : 'text-error'
                            "
                          >
                            {{
                              result.inspection.inspectionItems
                                .find((item) => item.id == insItem.id)
                                .methods.find((m) => m.id == method.id).input
                            }}
                          </div>
                        </div>
                      </div>
                      <div v-else>-</div>
                    </td>
                  </tr>
                </template>
              </tbody>
              <tfoot>
                <tr>
                  <td colspan="3" class="text-center">Operator</td>
                  <td
                    :class="`text-center  ${result.libur !== null || result.weekEnd ? 'bg-pink-lighten-5' : ''}`"
                    v-for="(result, resultIndex) in selected.inspectionData"
                    :key="resultIndex"
                  >
                    <div v-if="result.inspection">
                      {{ result.inspection.inspector.userName }}
                    </div>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </v-card-text>
      </v-card>
    </v-dialog>
    <v-dialog
      v-model="confirmDialog"
      scrollable
      persistent
      :overlay="false"
      max-width="500px"
      transition="dialog-transition"
    >
      <v-card class="text-center">
        <v-card-text>
          <div class="text-h5">Confirm Sign</div>
          <p>Are you sure you want to sign this report</p>
          <v-icon color="warning" size="100">mdi-help</v-icon>
          <div class="mt-4">
            <v-btn color="primary" @click="signConfirmation">Yes</v-btn>
            <v-btn text @click="confirmDialog = false">No</v-btn>
          </div>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>
<script setup>
import { useAppStore } from '@/stores/app';
import moment from 'moment';

import defaultImage from '@/assets/defaultDesign.png';
const store = useAppStore();
const dialog = ref(false);
const selected = ref(null);
const search = ref('');
const inspections = ref([]);
const dialogData = reactive({
  key: '',
  title: '',
  subtitle: '',
});
const toolImage = ref(null);
const confirmDialog = ref(false);
const confirmYesBtn = ref(null);

const openDialog = (key, item) => {
  dialogData.key = key;
  switch (key) {
    case 'check':
      dialogData.title = 'Weekly Check';
      dialogData.subtitle = 'Please check the inspection items';
      selected.value = item;

      store
        .ajax({ toolId: selected.value.toolId }, '/tools/images', 'post')
        .then((res) => {
          if (res) {
            toolImage.value = res;
          } else {
            toolImage.value = defaultImage;
          }
          store.preload = false;
        });
      break;
    case 'open':
      selected.value = item;
      break;
  }
  dialog.value = true;
};

const refresh = async () => {
  inspections.value = await store.ajax(
    { func: 'unchecked' },
    '/inspections/reports',
    'post'
  );

  confirmDialog.value = false;
  dialog.value = false;
  setTimeout(() => {
    store.preload = false;
  }, 1000);
};

const signConfirmation = async () => {
  selected.value.inspector = {
    userName: store.userData.userName,
    userId: store.userData.userId,
  };
  await store.ajax(selected.value, '/inspections/reports/confirm', 'post');
  refresh();
};

const signReport = async () => {
  try {
    confirmDialog.value = true;
  } catch (error) {
    console.log(error);
  }
};

onMounted(() => {
  // el.addEventListener('click', () => {
  //   confirmDialog.value = false;
  //   callBack();
  // });
});

onBeforeMount(() => {
  refresh();
});
</script>
