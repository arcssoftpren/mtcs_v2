<template>
  <v-card width="500" rounded="lg">
    <template #title> SOFTPREN MTCS LOGIN </template>
    <template #prepend>
      <v-img src="@/assets/softpren.png" width="50"></v-img>
    </template>
    <template #subtitle> Please enter your credentials. </template>
    <template #text>
      <v-row class="w-100">
        <v-col cols="12">
          <v-text-field
            v-for="(item, index) in structure"
            :key="index"
            variant="outlined"
            rounded="pill"
            density="compact"
            :type="item.type()"
            :label="item.label"
            v-model="formData[index]"
            :error-messages="
              validate[index].$errors.map((error) => error.$message)
            "
          />
        </v-col>
        <v-col cols="12">
          <v-checkbox-btn
            v-model="showPassword"
            label="Show Password"
          ></v-checkbox-btn>
        </v-col>
        <v-col cols="12">
          <v-divider></v-divider>
        </v-col>
        <v-col cols="12">
          <v-btn @click="submit" variant="outlined" rounded="pill" block
            >Login</v-btn
          >
        </v-col>
      </v-row>
    </template>
  </v-card>
</template>
<script setup>
import { useAppStore } from '@/stores/app';
import useVuelidate from '@vuelidate/core';
import { helpers, required } from '@vuelidate/validators';

const store = useAppStore();
const formData = reactive({
  userNik: '',
  userPassword: '',
});

const showPassword = ref(false);

const structure = {
  userNik: {
    label: 'User NIK',
    type: () => 'text',
  },
  userPassword: {
    label: 'Password',
    type: () => (showPassword.value ? 'text' : 'password'),
  },
};

const rules = {
  userNik: {
    req: helpers.withMessage('User NIK is required', required),
  },
  userPassword: {
    req: helpers.withMessage('Password is required', required),
  },
};

const validate = useVuelidate(rules, formData);

const submit = async () => {
  try {
    const valid = await validate.value.$validate();
    if (!valid)
      throw {
        title: 'Validation Error',
        text: 'Please check your input fields.',
        icon: 'error',
      };

    const userData = await store.ajax(formData, '/auth/login', 'POST');
    store.login(userData);
  } catch (error) {
    console.log(error);
    store.swal.fire(error);
    store.preload = false;
  }
};

onMounted(() => {
  store.preload = false;
});
</script>
