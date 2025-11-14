<template>
  <div>
    <v-data-table :items="reports" class="elevation-1">
      <template #headers>
        <tr>
          <th>Equipment Name</th>
          <th>Registration No</th>
          <th>Location</th>
          <th class="text-center">Actions</th>
        </tr>
      </template>
      <template #item="{ item }">
        <tr>
          <td>{{ item.equipmentName }}</td>
          <td>{{ item.regisNo }}</td>
          <td>{{ item.location }}</td>
          <td>
            <v-btn
              @click="openDialog('open', item)"
              variant="outlined"
              rounded="pill"
              block
              >Review</v-btn
            >
          </td>
        </tr>
      </template>
    </v-data-table>
    <v-dialog
      v-model="dialog"
      scrollable
      persistent
      :overlay="false"
      fullscreen=""
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
        <template #title>SPV Confirmation</template>
        <template #subtitle>Please confirm all item in the report</template>
        <template #text>
          <!-- content -->
          <pdf-viewer :inspection="selected"></pdf-viewer>
          <!-- <spvcheck-comp :inspection="selected"></spvcheck-comp> -->
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
const reports = ref([]);
const dialogData = reactive({
  key: '',
  title: '',
  subtitle: '',
});

const openDialog = (key, item) => {
  switch (key) {
    case 'open':
      selected.value = item;
      console.log(item);
      break;
    case 'delete':
      selected.value = item;
      return;
  }
  dialog.value = true;
};

const refresh = async () => {
  reports.value = await store.ajax({}, '/inspections/reports/spv', 'post');
  store.preload = false;
};

onBeforeMount(() => {
  refresh();
});
</script>
