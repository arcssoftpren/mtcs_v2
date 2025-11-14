<template>
  <div class="w-100 fill-height">
    <v-card class="fill-height">
      <v-tabs align-tabs="end" color="primary" v-model="tab">
        <v-tab
          :color="
            validate.inspectionItems.$errors.length > 0 && index == 1
              ? 'error'
              : 'primary'
          "
          v-for="(tab, index) in tabs"
          :key="index"
          :value="index"
        >
          <div
            v-if="index == 1"
            :class="
              validate.inspectionItems.$errors.length > 0 ? 'text-error' : ''
            "
          >
            {{ tab }}
          </div>
          <div v-else>{{ tab }}</div>
        </v-tab>
      </v-tabs>
      <v-card-text>
        <v-container fluid class="h-100">
          <v-tabs-window v-model="tab" class="fill-height">
            <v-tabs-window-item :value="0">
              <v-container fluid rounded="lg" class="fill-height">
                <v-row>
                  <v-col cols="3">
                    <v-card ref="imageCard">
                      <template #title>Tool Image</template>
                      <template #append>
                        <v-btn flat icon @click="triggerInput">
                          <v-icon>mdi-upload</v-icon>
                        </v-btn>
                      </template>
                      <template #text>
                        <v-img
                          height="350"
                          ref="imageRef"
                          :src="image || defaultImage"
                        />
                      </template>
                    </v-card>
                  </v-col>
                  <v-col cols="9">
                    <v-card ref="dataRef">
                      <template #title>Tool Data</template>
                      <template #subtitle>
                        All Data in this section is required.
                      </template>

                      <template #append>
                        <v-btn-toggle
                          mandatory
                          variant="tonal"
                          density="compact"
                          rounded="pill"
                          v-model="formData.rank"
                        >
                          <v-btn
                            :value="item"
                            color="primary"
                            v-for="(item, index) in ranks"
                            :key="index"
                            >{{ item.label }}</v-btn
                          >
                        </v-btn-toggle>
                      </template>
                      <template #text>
                        <v-row class="">
                          <v-col cols="12">
                            <v-divider></v-divider>
                          </v-col>
                          <v-col cols="12">
                            <v-row>
                              <v-col
                                :cols="index == 4 ? 12 : 6"
                                v-for="(item, index) in sections[0]"
                                :key="index"
                              >
                                <v-text-field
                                  :error-messages="
                                    validate[item.header_key].$errors.map(
                                      (e) => e.$message
                                    )
                                  "
                                  v-if="item.objectType !== 'select'"
                                  variant="outlined"
                                  rounded="pill"
                                  density="compact"
                                  :label="item.label"
                                  :type="item.objectType"
                                  v-model="formData.headerData[item.header_key]"
                                />

                                <v-autocomplete
                                  v-else
                                  :error-messages="
                                    validate[item.header_key].$errors.map(
                                      (e) => e.$message
                                    )
                                  "
                                  variant="outlined"
                                  rounded="pill"
                                  density="compact"
                                  :label="item.label"
                                  v-model="formData.headerData[item.header_key]"
                                  :items="types"
                                  item-title="label"
                                  :item-value="(item) => item"
                                />
                              </v-col>
                              <v-col cols="12">
                                <v-file-input
                                  :error-messages="
                                    validate.imageFile.$errors.map(
                                      (e) => e.$message
                                    )
                                  "
                                  prepend-icon=""
                                  prepend-inner-icon="mdi-image"
                                  v-model="imageFile"
                                  variant="outlined"
                                  rounded="pill"
                                  density="compact"
                                  accept="image/*"
                                  ref="imageFileInput"
                                />
                              </v-col>
                            </v-row>
                          </v-col>
                        </v-row>
                      </template>
                    </v-card>
                  </v-col>
                </v-row>
              </v-container>
            </v-tabs-window-item>
            <v-tabs-window-item :value="2">
              <v-container fluid rounded="lg" class="fill-height">
                <v-card class="w-100 fill-height">
                  <template #title>Advanced Data</template>
                  <v-card-text>
                    <v-row>
                      <v-col cols="12">
                        <v-divider></v-divider>
                      </v-col>
                      <v-col cols="12">
                        <v-row>
                          <v-col
                            cols="6"
                            v-for="(item, index) in sections[1]"
                            :key="index"
                          >
                            <v-text-field
                              v-if="item.objectType !== 'select'"
                              variant="outlined"
                              rounded="pill"
                              density="compact"
                              :label="item.label"
                              :type="item.objectType"
                              v-model="formData.headerData[item.header_key]"
                            />
                          </v-col>
                        </v-row>
                      </v-col>
                    </v-row>
                  </v-card-text>
                </v-card>
              </v-container>
            </v-tabs-window-item>
            <v-tabs-window-item :value="1">
              <v-container fluid rounded="lg" class="fill-height">
                <v-card class="w-100">
                  <template #title>Tool's Inspection Data</template>
                  <template #append>
                    <v-btn
                      variant="outlined"
                      rounded="pill"
                      block
                      prepend-icon="mdi-plus"
                      @click="openDialog('new')"
                      >New Item</v-btn
                    >
                  </template>
                  <template #text>
                    <v-row>
                      <v-col cols="3">
                        <v-card>
                          <template #title>Tool Image</template>
                          <template #append>
                            <v-btn flat icon @click="triggerInput">
                              <v-icon>mdi-upload</v-icon>
                            </v-btn>
                          </template>
                          <template #text>
                            <v-img height="100%" :src="image || defaultImage" />
                          </template>
                        </v-card>
                      </v-col>
                      <v-col cols="9">
                        <v-table>
                          <thead>
                            <tr>
                              <th class="text-center">Number in Image</th>
                              <th>Label</th>
                              <th>Inspection Methods</th>
                              <th class="text-center">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr
                              v-for="(item, index) in formData.inspectionItems"
                              :key="index"
                            >
                              <td class="text-center">
                                {{ item.imageNumber }}
                              </td>
                              <td>{{ item.label }}</td>
                              <td>
                                <v-list>
                                  <v-list-item
                                    v-for="(it, id) in item.methods"
                                    :key="id"
                                  >
                                    <template #title>{{ it.label }}</template>
                                    <template #subtitle
                                      >Standard:
                                      {{ it.standardString }}</template
                                    >
                                  </v-list-item>
                                </v-list>
                              </td>
                              <td class="text-center">
                                <v-btn-group mandatory>
                                  <v-btn @click="moveUp(item)" icon>
                                    <v-icon color="success"
                                      >mdi-arrow-up</v-icon
                                    >
                                  </v-btn>
                                  <v-btn @click="openDialog('edit', item)" icon>
                                    <v-icon size="small" color="primary"
                                      >mdi-pencil</v-icon
                                    >
                                  </v-btn>
                                  <v-btn icon>
                                    <v-icon
                                      @click="
                                        formData.removeInspectionItem(item)
                                      "
                                      color="error"
                                      >mdi-delete</v-icon
                                    >
                                  </v-btn>
                                  <v-btn @click="moveDown(item)" icon>
                                    <v-icon color="success"
                                      >mdi-arrow-down</v-icon
                                    >
                                  </v-btn>
                                </v-btn-group>
                              </td>
                            </tr>
                          </tbody>
                        </v-table>
                      </v-col>
                    </v-row>
                  </template>
                </v-card>
              </v-container>
            </v-tabs-window-item>
          </v-tabs-window>
        </v-container>
      </v-card-text>
      <v-card-actions>
        <v-btn @click="submit" variant="outlined" rounded="pill" block>
          Save
        </v-btn>
      </v-card-actions>
    </v-card>
    <v-dialog
      v-model="dialog"
      scrollable
      persistent
      :overlay="false"
      max-width="900px"
      transition="dialog-transition"
    >
      <v-card>
        <template #append>
          <v-btn
            @click="dialog = false"
            density="compact"
            variant="outlined"
            icon
            class="mt-2 ms-2"
          >
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </template>
        <template #title>{{ dialogData.title }}</template>
        <template #subtitle>{{ dialogData.subtitle }}</template>
        <template #text>
          <!-- content -->
          <newInsItem
            :item-data="dialogData.key === 'edit' ? selected : null"
            @add-item="addInsItem"
            @edit-item="editInsItem"
          ></newInsItem>
        </template>
      </v-card>
    </v-dialog>
  </div>
</template>
<script setup>
import { useAppStore } from '@/stores/app';
import useVuelidate from '@vuelidate/core';
import { required } from '@vuelidate/validators';
import defaultImage from '@/assets/defaultDesign.png';
import { Tool } from '@/assets/helpers_2.js';

const emits = defineEmits(['addTool', 'editTool']);
const props = defineProps(['toolData']);

const tabs = ['General', 'Inspection Data', 'Advanced'];
const tab = ref(0);
const image = ref(null);
const selected = ref(null);
const dialogData = reactive({
  key: '',
  title: '',
  subtitle: '',
});

const imageFileInput = ref(null);

const sections = ref([]);

const store = useAppStore();
const formData = reactive(new Tool());
const imageRef = ref(null);
const imageCard = ref(null);
const imageFile = ref(null);
const dataRef = ref(null);
const dialog = ref(false);
const headers = ref([]);
const types = ref([]);
const ranks = ref([]);
const validate = useVuelidate(
  {
    equipmentName: { required },
    regisNo: { required },
    type: { required },
    place: { required },
    registrationDate: { required },
    inspectionItems: { required },
    imageFile: { required },
  },
  {
    equipmentName: computed(() => formData.headerData.equipmentName),
    regisNo: computed(() => formData.headerData.regisNo),
    type: computed(() => formData.headerData.type),
    place: computed(() => formData.headerData.place),
    registrationDate: computed(() => formData.headerData.registrationDate),
    inspectionItems: computed(() => formData.inspectionItems),
    imageFile: computed(() => imageFile.value),
  }
);

const submit = async () => {
  try {
    const valid = await validate.value.$validate();

    if (!valid) {
      if (validate.value.inspectionItems.$errors.length > 0) {
        throw {
          title: 'Validation Error',
          text: 'Please add at least 1 inspection item.',
          icon: 'error',
        };
      } else {
        throw {
          title: 'Validation Error',
          text: 'Please fix the errors in the form.',
          icon: 'error',
        };
      }
    }

    let fd = new FormData();
    fd.append('data', JSON.stringify(formData.generateData()));
    fd.append('file', imageFile.value);

    emits('addTool', fd);
  } catch (error) {
    store.swal.fire(error);
  }
};

const openDialog = (key, item) => {
  dialogData.key = key;
  switch (key) {
    case 'new':
      dialogData.title = 'New Inspection Item';
      dialogData.subtitle = 'Please fill all required fields.';
      break;
    case 'edit':
      dialogData.title = 'Edit Inspection Item';
      dialogData.subtitle = 'Please fill all required fields.';
      selected.value = item;
      break;
    case 'delete':
      selected.value = item;
      return;
  }
  dialog.value = true;
};

const addInsItem = (data) => {
  formData.addInspectionItem(data);
  dialog.value = false;
};

const editInsItem = (data) => {
  let old = formData.inspectionItems.findIndex(
    (item) => item == selected.value
  );
  formData.inspectionItems[old] = data;
  dialog.value = false;
};

const moveUp = (item) => {
  const old = formData.inspectionItems.findIndex((i) => i == item);
  if (old > 0) {
    formData.inspectionItems[old] = formData.inspectionItems[old - 1];
    formData.inspectionItems[old - 1] = item;
  }
};

const moveDown = (item) => {
  const old = formData.inspectionItems.findIndex((i) => i == item);
  if (old < formData.inspectionItems.length - 1) {
    formData.inspectionItems[old] = formData.inspectionItems[old + 1];
    formData.inspectionItems[old + 1] = item;
  }
};

watch(
  () => formData.rank,
  (newVal) => {
    sections.value = formData.init(newVal, headers.value);
  }
);

watch(imageFile, async (newVal) => {
  if (newVal) {
    image.value = await store.fileToDataURL(newVal);
  } else {
    image.value = null;
  }
  if (tab.value === 0) {
    setTimeout(() => {
      syncHeight();
    }, 500);
  }
});

const load = async () => {
  types.value = await store.ajax({}, '/tools/gettypes', 'post');
  headers.value = await store.ajax({}, '/tools/getheaders', 'post');
  ranks.value = await store.ajax({}, '/tools/getranks', 'post');
  if (props.toolData != null) {
    formData.setFromObj(props.toolData);
    let image = await store.ajax(
      { toolId: props.toolData.toolId },
      '/tools/images',
      'post'
    );

    imageFile.value = store.dataUrlToFile(
      image,
      `${props.toolData.toolId}_image.png`
    );
  } else {
    formData.init(ranks.value[0], headers.value);
  }
  store.preload = false;
};

onMounted(() => {
  load();
  setTimeout(() => {
    syncHeight();
  }, 500);
});

const triggerInput = () => {
  imageFileInput.value.click();
};

function syncHeight() {
  const imgCrd = imageCard.value?.$el;
  const dataCard = dataRef.value?.$el;
  if (imgCrd && dataCard) {
    imgCrd.style.height = `${dataCard.offsetHeight}px`;
  }
}
</script>
