<template>
  <div>
    <v-data-table :items="users" :search="search">
      <template #top>
        <v-toolbar color="transparent">
          <v-toolbar-title> USERS </v-toolbar-title>
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
          <th>User NIK</th>
          <th>Name</th>
          <th>Role</th>
          <th class="text-center">Actions</th>
        </tr>
      </template>
      <template #item="{ item, index }">
        <tr class="text-uppercase">
          <td class="text-center">{{ index + 1 }}</td>
          <td>{{ item.userNik }}</td>
          <td>{{ item.userName }}</td>
          <td>{{ item.roleName }}</td>
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
    <v-dialog
      v-model="dialog"
      scrollable
      persistent
      :overlay="false"
      max-width="800"
      transition="dialog-transition"
    >
      <v-card v-if="dialogData.key == 'delete'" class="text-center">
        <template #title>
          <h2>Delete {{ selected.userName }}'s Account</h2>
        </template>
        <template #text>
          <div class="w-100 text-center">
            <v-icon color="warning" size="100">mdi-help</v-icon>
          </div>
          <div class="mt-5">
            Are you sure you want to delete {{ selected.userName }}'s account?
          </div>
          <v-divider class="my-5"></v-divider>
          <v-row>
            <v-col cols="6">
              <v-btn
                @click="dialog = false"
                prepend-icon="mdi-cancel"
                variant="outlined"
                rounded="pill"
                block
                >Cancel</v-btn
              >
            </v-col>
            <v-col cols="6">
              <v-btn
                @click="deleteUser(selected.userId)"
                prepend-icon="mdi-delete"
                variant="outlined"
                rounded="pill"
                block
                color="error"
                >Delete</v-btn
              >
            </v-col>
          </v-row>
        </template>
      </v-card>
      <v-card v-else>
        <template #append>
          <v-btn @click="dialog = false" flat icon class="mt-2 ms-2">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </template>
        <template #title>{{ dialogData.title }}</template>
        <template #subtitle>{{ dialogData.subtitle }}</template>
        <template #text>
          <div v-if="dialogData.key == 'new'">
            <newUser
              :close-me="
                () => {
                  dialog = false;
                }
              "
            />
          </div>
          <div v-if="dialogData.key == 'edit'">
            <editUser
              :close-me="
                () => {
                  dialog = false;
                }
              "
              :user="selected"
            />
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
const users = ref([]);
const dialogData = reactive({
  key: '',
  title: '',
  subtitle: '',
});

const openDialog = (key, item) => {
  dialogData.key = key;
  switch (key) {
    case 'new':
      dialogData.title = 'Create User';
      dialogData.subtitle = 'Fill in the details to create a new user.';
      break;
    case 'edit':
      dialogData.title = 'Edit User';
      dialogData.subtitle = 'Modify the details of the user.';
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
  users.value = await store.ajax({}, '/auth/getusers', 'post');
  store.preload = false;
};

const deleteUser = async (userId) => {
  await store.ajax({ userId }, '/auth/deleteuser', 'post');
  store.swal.fire({
    title: 'User Deleted',
    text: 'The user has been successfully deleted.',
    icon: 'success',
  });
  dialog.value = false;
};

onMounted(() => {
  refresh();
});
</script>
