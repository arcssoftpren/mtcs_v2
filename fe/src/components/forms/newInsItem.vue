<template>
  <v-row class="mt-2">
    <v-col cols="9">
      <v-text-field
        variant="outlined"
        rounded="pill"
        density="compact"
        v-model="formData.label"
        label="Point Check"
        hide-details=""
      />
    </v-col>
    <v-col cols="3">
      <v-text-field
        variant="outlined"
        rounded="pill"
        density="compact"
        label="Number in Image"
        type="number"
        v-model="formData.imageNumber"
        hide-spin-buttons=""
        hide-details=""
      />
    </v-col>
    <v-col cols="12">
      <v-divider>Methods</v-divider>
    </v-col>
    <v-col cols="12">
      <v-row>
        <v-col cols="12" class="text-end">
          <v-btn
            @click="openDialog('new')"
            variant="outlined"
            rounded="pill"
            density="compact"
          >
            Add Method
          </v-btn>
        </v-col>
      </v-row>
      <v-table>
        <thead>
          <tr>
            <th>Method Label</th>
            <th>Standard</th>
            <th>Logic Type</th>
            <th class="text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, index) in formData.methods" :key="index">
            <td>{{ item.label }}</td>
            <td>{{ item.standardString }}</td>
            <td>{{ item.logicType.label }}</td>
            <td class="text-center">
              <v-btn-group mandatory>
                <v-btn @click="moveUp(item)" icon>
                  <v-icon color="success">mdi-arrow-up</v-icon>
                </v-btn>
                <v-btn @click="openDialog('edit', item)" icon>
                  <v-icon size="small" color="primary">mdi-pencil</v-icon>
                </v-btn>
                <v-btn icon>
                  <v-icon @click="formData.removeMethod(item)" color="error"
                    >mdi-delete</v-icon
                  >
                </v-btn>
                <v-btn @click="moveDown(item)" icon>
                  <v-icon color="success">mdi-arrow-down</v-icon>
                </v-btn>
              </v-btn-group>
            </td>
          </tr>
        </tbody>
      </v-table>
    </v-col>
    <v-col cols="12">
      <v-divider></v-divider>
    </v-col>
    <v-col cols="12">
      <v-btn
        :disabled="formData.label === '' || formData.methods.length === 0"
        variant="outlined"
        rounded="pill"
        block
        @click="
          itemData == null
            ? emits('addItem', { ...formData.genData() })
            : emits('editItem', { ...formData.genData() })
        "
        >{{ itemData == null ? 'Add' : 'Edit' }} Inspection Item</v-btn
      >
    </v-col>
  </v-row>
  <v-dialog
    v-model="dialog"
    scrollable
    persistent
    :overlay="false"
    max-width="650px"
    transition="dialog-transition"
  >
    <v-card>
      <template #append>
        <v-btn
          @click="dialog = false"
          density="compact"
          flat=""
          icon
          class="mt-2 ms-2"
        >
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </template>
      <template #title>{{ dialogData.title }}</template>
      <template #subtitle>{{ dialogData.subtitle }}</template>
      <template #text>
        <div class="mt-2">
          <newMethod
            @add-method="addMethod"
            @edit-method="editMethod"
            :method-data="dialogData.key === 'edit' ? selected : null"
          ></newMethod>
        </div>
      </template>
    </v-card>
  </v-dialog>
</template>
<script setup>
import { InspectionItem } from '@/assets/helpers_2';

const emits = defineEmits(['addItem', 'editItem']);
const props = defineProps(['itemData']);
const formData = reactive(new InspectionItem());

if (props.itemData != null) {
  formData.setFromObj(props.itemData);
}

const dialog = ref(false);
const selected = ref(null);
const dialogData = reactive({
  key: '',
  title: '',
  subtitle: '',
});

const openDialog = (key, item) => {
  dialogData.key = key;
  switch (key) {
    case 'new':
      dialogData.title = 'New Inspection Method';
      dialogData.subtitle = 'Please fill all required fields.';
      break;
    case 'edit':
      dialogData.title = 'Edit Inspection Method';
      dialogData.subtitle = 'Please fill all required fields.';
      selected.value = item;
      break;
    case 'delete':
      selected.value = item;
      return;
  }
  dialog.value = true;
};

const addMethod = (data) => {
  formData.addMethod(data);
  dialog.value = false;
};

const editMethod = (data) => {
  let old = formData.methods.findIndex((item) => item == selected.value);
  formData.methods[old] = data;
  dialog.value = false;
};

const moveUp = (method) => {
  const old = formData.methods.findIndex((m) => m == method);
  if (old > 0) {
    formData.methods[old] = formData.methods[old - 1];
    formData.methods[old - 1] = method;
  }
};

const moveDown = (method) => {
  const old = formData.methods.findIndex((m) => m == method);
  if (old < formData.methods.length - 1) {
    formData.methods[old] = formData.methods[old + 1];
    formData.methods[old + 1] = method;
  }
};
</script>
