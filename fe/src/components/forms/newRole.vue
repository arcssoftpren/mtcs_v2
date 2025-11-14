<template>
  <v-row>
    <v-col :cols="item.col" v-for="(item, index) in structure" :key="index">
      <v-text-field
        :error-messages="validate[index].$errors.map((error) => error.$message)"
        class="my-2"
        v-if="item.type == 'text'"
        variant="outlined"
        rounded="pill"
        density="compact"
        :type="item.type"
        :label="item.label"
        v-model="formData[index]"
      />
      <v-autocomplete
        :error-messages="validate[index].$errors.map((error) => error.$message)"
        :items="store.pages.filter((page) => page.type === 'menu')"
        item-title="name"
        item-value="path"
        class="my-2"
        v-if="item.type == 'select'"
        variant="outlined"
        rounded="pill"
        density="compact"
        :label="item.label"
        v-model="formData[index]"
      />
      <v-card v-if="item.type == 'checkbox'">
        <template #title> Access Rights </template>
        <template #subtitle> Select the access rights for this role </template>
        <template #text>
          <v-row>
            <v-col v-for="(type, tIndex) in ['menu', 'setup']" :key="tIndex">
              <v-divider>
                <div class="text-uppercase">{{ type }}</div>
              </v-divider>
              <v-checkbox-btn
                v-for="(right, rIndex) in store.pages.filter(
                  (page) => page.type == type
                )"
                :label="right.name"
                :key="right.id"
                v-model="formData.accessRights"
                :value="right.id"
              />
            </v-col>
          </v-row>
        </template>
      </v-card>
    </v-col>
    <v-col cols="12">
      <v-divider></v-divider>
    </v-col>
    <v-col cols="12">
      <v-btn @click="submit" variant="outlined" rounded="pill" block
        >Create Role</v-btn
      >
    </v-col>
  </v-row>
</template>
<script setup>
import { useAppStore } from '@/stores/app';
import useVuelidate from '@vuelidate/core';
import { helpers, required } from '@vuelidate/validators';

const props = defineProps(['closeMe']);
const store = useAppStore();
const formData = reactive({
  roleName: '',
  accessRights: [],
  homePage: '',
});
const structure = {
  roleName: {
    label: 'Role Name',
    type: 'text',
    col: 6,
  },
  homePage: {
    label: 'Home Page',
    type: 'select',
    col: 6,
  },
  accessRights: {
    label: 'Access Rights',
    type: 'checkbox',
    col: 12,
  },
};
const rules = {
  roleName: {
    required,
  },
  homePage: {
    required,
  },
};

const addHpToAccess = () => {
  const pageId = store.pages.find(
    (page) => page.path === formData.homePage
  )?.id;
  if (pageId && !formData.accessRights.includes(pageId)) {
    formData.accessRights.push(pageId);
  }
};

const validate = useVuelidate(rules, formData);
const submit = async () => {
  try {
    const valid = await validate.value.$validate();
    if (!valid)
      throw {
        title: 'Validation Error',
        text: 'Please fill in all required fields.',
        icon: 'error',
      };
    addHpToAccess();

    formData.accessRights = JSON.stringify(formData.accessRights);

    await store.ajax(formData, '/auth/addrole', 'POST');
    props.closeMe();
  } catch (error) {
    store.swal.fire(error);
    store.preload = false;
  }
};
</script>
