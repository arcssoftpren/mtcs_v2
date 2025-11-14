<template>
  <v-data-table :items="roles" :search="search">
    <template #top>
      <v-toolbar color="transparent">
        <v-toolbar-title> ROLES </v-toolbar-title>
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
      <tr class="text-uppercase">
        <th class="text-center">No</th>
        <th>Role Name</th>
        <th>Home Page</th>
        <th class="text-center">Actions</th>
      </tr>
    </template>
    <template #item="{ item, index }">
      <tr class="text-uppercase" :key="item.roleId">
        <td class="text-center">{{ index + 1 }}</td>
        <td>{{ item.roleName }}</td>
        <td>{{ item.homePage }}</td>
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
  </v-data-table>
  <div>
    <v-dialog
      v-model="dialog"
      scrollable
      persistent
      :overlay="false"
      max-width="600"
      transition="dialog-transition"
    >
      <v-card>
        <template #append>
          <v-btn flat="" @click="dialog = false" icon class="mt-2 ms-2">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </template>
        <template #prepend v-if="dialogData.key === 'delete'">
          <v-icon color="warning" size="50">mdi-help</v-icon>
        </template>
        <template #title>{{ dialogData.title }}</template>
        <template #subtitle>{{ dialogData.subtitle }}</template>
        <template #text>
          <div v-if="dialogData.key === 'new'">
            <newRole
              :close-me="
                () => {
                  dialog = false;
                }
              "
            />
          </div>
          <div v-if="dialogData.key === 'edit'">
            <editRole
              :role="selected"
              :close-me="
                () => {
                  dialog = false;
                }
              "
            />
          </div>
          <div v-if="dialogData.key === 'delete'" class="w-100">
            <div class="text-center w-100 text-uppercase text-h5">
              Delete {{ selected.roleName }} Role ?
            </div>
            <v-divider class="my-2"></v-divider>
            <v-row>
              <v-col cols="6">
                <v-btn
                  @click="dialog = false"
                  prepend-icon="mdi-close"
                  variant="outlined"
                  rounded="pill"
                  block
                  >Cancel</v-btn
                >
              </v-col>
              <v-col>
                <v-btn
                  @click="deleteRole"
                  variant="outlined"
                  rounded="pill"
                  block
                  color="error"
                  prepend-icon="mdi-delete"
                  >Delete</v-btn
                >
              </v-col>
            </v-row>
          </div>
          <!-- content -->
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
const selected = ref(null);
const roles = ref([]);
const dialogData = reactive({
  key: '',
  title: '',
  subtitle: '',
});

const openDialog = (key, item) => {
  dialogData.key = key;
  switch (key) {
    case 'new':
      dialogData.title = 'Create Role';
      dialogData.subtitle = 'Fill in the details to create a new role.';
      break;
    case 'edit':
      dialogData.title = 'Edit Role';
      dialogData.subtitle = 'Modify the details of the role.';
      selected.value = item;
      break;
    case 'delete':
      dialogData.title = 'Delete Role';
      dialogData.subtitle = 'Are you sure you want to delete this role?';
      selected.value = item;
      break;
    default:
      return;
  }
  dialog.value = true;
};

watch(dialog, (e) => {
  if (!e) refresh();
});

const refresh = async () => {
  roles.value = await store.ajax({}, '/auth/getroles', 'POST');
  setTimeout(() => {
    store.preload = false;
  }, 500);
};

const deleteRole = async () => {
  const roleId = selected.value.roleId;
  await store.ajax({ roleId }, '/auth/deleterole', 'POST');
  dialog.value = false;
};

onBeforeMount(() => {
  refresh();
});

onMounted(() => {
  store.preload = false;
});
</script>
