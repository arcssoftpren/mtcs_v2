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
      <template #headers></template>
      <template #item="{ item }">
        <tr>
          <td class="pa-5">
            <v-card>
              <template #title>{{ item.regisNo }}</template>
              <template #subtitle>{{ item.equipmentName }}</template>
              <template #text>
                <v-btn
                  @click="openDialog('check', item)"
                  color="primary"
                  variant="outlined"
                  rounded="pill"
                  block
                  >Check Now</v-btn
                >
              </template>
              <template #append>
                <v-btn
                  @click="openDialog('delete', item)"
                  variant="outlined"
                  rounded="pill"
                  block
                  prepend-icon="mdi-close-circle"
                >
                  Not Used
                </v-btn>
              </template>
            </v-card>
          </td>
        </tr>
      </template>
    </v-data-table>
    <v-dialog
      v-model="dialog"
      scrollable
      persistent
      :fullscreen="dialogData.key == 'check'"
      :overlay="false"
      :max-width="dialogData.key == 'delete' ? '500px' : ''"
      transition="dialog-transition"
    >
      <v-card :class="dialogData.key == 'delete' ? 'text-center' : ''">
        <template #append v-if="dialogData.key != 'delete'">
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
        <template v-if="dialogData.key != 'delete'" #title>{{
          dialogData.title
        }}</template>
        <template v-if="dialogData.key != 'delete'" #subtitle>{{
          dialogData.subtitle
        }}</template>

        <v-card-text class="pb-0">
          <dailyInspection
            v-if="dialogData.key == 'check'"
            @update-data="updateInspection"
            :inspection="selected"
          ></dailyInspection>
          <div v-else class="mb-5">
            <v-icon size="150" color="info">mdi-information</v-icon>
            <p class="text-h6">
              You are about to state <strong>{{ selected.regisNo }}</strong> as
              unused.
            </p>
            <v-row class="mt-2">
              <v-col cols="12">
                <v-divider></v-divider>
              </v-col>
              <v-col cols="6">
                <v-btn
                  @click="dialog = false"
                  variant="outlined"
                  rounded="pill"
                  block
                  >cancel</v-btn
                >
              </v-col>
              <v-col cols="6">
                <v-btn
                  @click="setUnused"
                  variant="outlined"
                  rounded="pill"
                  block
                  >confirm</v-btn
                >
              </v-col>
            </v-row>
          </div>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>
<script setup>
import { useAppStore } from '@/stores/app';

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

const openDialog = (key, item) => {
  dialogData.key = key;
  switch (key) {
    case 'check':
      dialogData.title = 'Daily Check';
      dialogData.subtitle = 'Please check the inspection items';
      selected.value = item;
      break;
    case 'delete':
      selected.value = item;
      break;
  }
  dialog.value = true;
};

const refresh = async () => {
  inspections.value = await store.ajax(
    { func: 'unchecked' },
    '/inspections',
    'post'
  );

  setTimeout(() => {
    dialog.value = false;
    store.preload = false;
  }, 1000);
};

const updateInspection = async (data) => {
  if (data.status == 'checked') {
    await store.ajax(data, '/inspections/update', 'post');
    refresh();
    store.inspectionRefresh++;
  } else {
    console.log(JSON.parse(data.inspectionItems));
  }
};

const setUnused = async () => {
  if (selected.value) {
    await store.ajax(
      { insId: selected.value.insId },
      '/inspections/delete',
      'post'
    );
    refresh();
  }
};

onBeforeMount(() => {
  refresh();
});
</script>
