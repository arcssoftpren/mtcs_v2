<template>
  <div class="w-100">
    <v-data-table :items="headers" :search="search" class="elevation-1">
      <template #headers>
        <tr>
          <th class="text-center">No</th>
          <th class="text-center">Label</th>
          <th class="text-center">Type</th>
          <th class="text-center">Actions</th>
        </tr>
      </template>
      <template #item="{ item, index }">
        <tr>
          <td class="text-center">{{ item.no }}</td>
          <td class="text-center">{{ item.label }}</td>
          <td class="text-center">{{ item.objectType }}</td>
          <td class="text-center">
            <v-btn-group density="compact">
              <v-btn @click="openDialog('edit', item)">
                <v-icon color="primary">mdi-pencil</v-icon>
              </v-btn>
              <v-btn @click="openDialog('delete', item)">
                <v-icon color="error">mdi-delete</v-icon>
              </v-btn>
            </v-btn-group>
          </td>
        </tr>
      </template>
      <template #top>
        <v-toolbar color="transparent">
          <v-toolbar-title> Headers </v-toolbar-title>
          <v-spacer />
          <v-text-field
            v-model="search"
            class="my-2"
            variant="outlined"
            rounded="pill"
            density="compact"
            label="Search"
            hide-details
            prepend-inner-icon="mdi-magnify"
          />
          <v-btn @click="openDialog('new')" icon>
            <v-icon>mdi-plus</v-icon>
          </v-btn>
        </v-toolbar>
      </template>
    </v-data-table>
    <v-dialog
      v-model="dialog"
      scrollable
      persistent
      :overlay="false"
      max-width="500px"
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
        <template v-else #title>
          <h1 class="text-h4">Delete Header</h1>
        </template>
        <template v-if="dialogData.key != 'delete'" #subtitle>{{
          dialogData.subtitle
        }}</template>
        <template #text>
          <!-- content -->
          <div v-if="dialogData.key == 'delete'">
            <h1 class="text-h6">
              Are you sure you want to delete <br />
              {{ selected.label }}
            </h1>
            <v-icon color="warning" size="100">mdi-help</v-icon>
            <v-row>
              <v-col cols="12">
                <p class="text-h6">This action cannot be undone.</p>
              </v-col>
              <v-col cols="12">
                <v-divider></v-divider>
              </v-col>
              <v-col cols="6">
                <v-btn
                  @click="dialog = false"
                  prepend-icon="mdi-cancel"
                  variant="outlined"
                  rounded="pill"
                  block
                  >cancel</v-btn
                >
              </v-col>
              <v-col cols="6">
                <v-btn
                  prepend-icon="mdi-delete"
                  color="error"
                  variant="outlined"
                  rounded="pill"
                  block
                  @click="deleteHeader"
                  >delete</v-btn
                >
              </v-col>
            </v-row>
          </div>
          <newHeader
            v-else
            :header-data="dialogData.key == 'edit' ? selected : {}"
            v-on:refresh="refresh"
          ></newHeader>
        </template>
      </v-card>
    </v-dialog>
  </div>
</template>
<script setup>
import { useAppStore } from '@/stores/app';

const store = useAppStore();
const search = ref('');
const dialog = ref(false);
const selected = ref({
  id: null,
  label: null,
  objectType: null,
});
const headers = ref([]);
const dialogData = reactive({
  key: '',
  title: '',
  subtitle: '',
});

const openDialog = (key, item) => {
  dialogData.key = key;
  switch (key) {
    case 'new':
      dialogData.title = 'New Header';
      dialogData.subtitle = 'Please fill all required fields.';
      break;
    case 'edit':
      selected.value = item;
      break;
    case 'delete':
      selected.value = item;
      dialogData.title = 'Delete Header';
      dialogData.subtitle = 'Are you sure you want to delete this header?';
      break;
  }
  dialog.value = true;
};

const refresh = async () => {
  headers.value = await store.ajax({}, '/tools/getheaders', 'post');

  dialog.value = false;
  store.preload = false;
};

onBeforeMount(() => {
  refresh();
});

const deleteHeader = async () => {
  await store.ajax({ id: selected.value.id }, '/tools/deleteheader', 'post');
  refresh();
};
</script>
