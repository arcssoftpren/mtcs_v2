<template>
  <div class="w-100">
    <v-data-table :items="tools" :search="search" class="elevation-1">
      <template #top>
        <v-toolbar color="transparent">
          <v-toolbar-title> Tools List </v-toolbar-title>
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
      <template #headers>
        <tr>
          <th class="text-center">NO</th>
          <th>Tool Name</th>
          <th>Registration Number</th>
          <th>Location</th>
          <th>Rank</th>
          <th class="text-center">Status</th>
          <th class="text-center">Actions</th>
        </tr>
      </template>
      <template #item="{ item, index }">
        <tr>
          <td class="text-center">{{ item.no }}</td>
          <td>{{ item.equipmentName }}</td>
          <td>{{ item.regisNo }}</td>
          <td>{{ item.place }}</td>
          <td>{{ item.rank }}</td>
          <td
            :class="`text-center text-capitalize ${item.status == 'active' ? 'text-success' : 'text-danger'}`"
          >
            {{ item.status }}
          </td>
          <td class="text-center">
            <v-btn-group mandatory>
              <v-btn @click="openDialog('edit', rawTools[index])" icon>
                <v-icon color="primary" size="small">mdi-pencil</v-icon>
              </v-btn>
              <v-btn @click="openDialog('delete', rawTools[index])" icon>
                <v-icon color="error" size="small">mdi-delete</v-icon>
              </v-btn>
            </v-btn-group>
          </td>
        </tr>
      </template>
    </v-data-table>
    <v-dialog
      v-model="dialog"
      scrollable
      persistent
      :overlay="false"
      :max-width="dialogData.key == 'delete' ? '500' : ''"
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
          <h1 class="text-h4">Delete Tool</h1>
        </template>
        <template v-if="dialogData.key != 'delete'" #subtitle>{{
          dialogData.subtitle
        }}</template>
        <template #text>
          <!-- content -->
          <newTool
            v-if="dialogData.key !== 'delete'"
            @add-tool="addTool"
            @edit-tool="editTool"
            :tool-data="dialogData.key === 'edit' ? selected : null"
          />

          <div v-if="dialogData.key == 'delete'" class="w-100">
            <h1 class="text-h6">
              Are you sure you want to delete <br />
              {{ selected.headerData.equipmentName }}
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
                  @click="deleteTool"
                  >delete</v-btn
                >
              </v-col>
            </v-row>
          </div>
        </template>
      </v-card>
    </v-dialog>
  </div>
</template>
<script setup>
import { useAppStore } from '@/stores/app';

const store = useAppStore();
const dialog = ref(false);
const selected = ref(null);
const tools = ref([]);
const search = ref('');
const rawTools = ref([]);
const dialogData = reactive({
  key: '',
  title: '',
  subtitle: '',
});

const openDialog = (key, item) => {
  dialogData.key = key;
  switch (key) {
    case 'new':
      dialogData.title = 'New Tool';
      dialogData.subtitle = 'Please fill all required fields.';
      break;
    case 'edit':
      dialogData.title = 'Edit Tool';
      dialogData.subtitle = 'Please fill all required fields.';
      selected.value = item;
      break;
    case 'delete':
      selected.value = item;
      break;
  }
  dialog.value = true;
};

watch(dialog, (e) => {
  if (!e) refresh();
});

const refresh = async () => {
  rawTools.value = await store.ajax({}, '/tools', 'get');
  tools.value = rawTools.value.map((tool, index) => {
    return {
      no: tool.no,
      regisNo: tool.headerData.regisNo,
      equipmentName: tool.headerData.equipmentName,
      rank: tool.rank.label,
      place: tool.headerData.place,
      status: tool.status,
    };
  });

  store.preload = false;
};

const addTool = async (data) => {
  try {
    await store.ajax(data, '/tools/add', 'post');
    store.swal.fire('Success', 'Tool added successfully', 'success');
    dialog.value = false;
  } catch (error) {
    store.swal.fire(error);
  }
};

const editTool = async (data) => {
  try {
    await store.ajax(data, '/tools/edit', 'post');
    store.swal.fire('Success', 'Tool edited successfully', 'success');
    dialog.value = false;
  } catch (error) {
    store.swal.fire(error);
  }
};

const deleteTool = async () => {
  try {
    await store.ajax(
      { toolId: selected.value.toolId },
      '/tools/delete',
      'post'
    );
    store.swal.fire('Success', 'Tool deleted successfully', 'success');
    dialog.value = false;
  } catch (error) {
    store.swal.fire(error);
  }
};

onBeforeMount(() => {
  refresh();
});
</script>
