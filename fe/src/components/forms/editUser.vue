<template>
  <v-row class="mt-2">
    <v-col
      class="py-0"
      :cols="item.col"
      v-for="(item, index) in structure"
      :key="index"
    >
      <v-text-field
        :error-messages="validate[index].$errors.map((error) => error.$message)"
        class="my-2"
        v-if="item.type() != 'select' && item.type() != 'file'"
        variant="outlined"
        rounded="pill"
        density="compact"
        :type="item.type()"
        :label="item.label"
        v-model="formData[index]"
        :hint="item.hint"
      />
      <v-autocomplete
        :items="roles"
        item-title="roleName"
        item-value="roleId"
        :error-messages="validate[index].$errors.map((error) => error.$message)"
        v-if="item.type() == 'select'"
        variant="outlined"
        rounded="pill"
        density="compact"
        :type="item.type()"
        :label="item.label"
        v-model="formData[index]"
        :hint="item.hint"
      />

      <v-checkbox-btn
        v-if="index == 'userPassword'"
        label="Show Password"
        v-model="showPassword"
      ></v-checkbox-btn>

      <v-card v-if="index == 'signFile'">
        <template #title>Signature File</template>
        <template #text>
          <v-img
            :src="signFile ? signFile : defaultSign"
            height="200"
            contain
          ></v-img>
          <v-divider class="my-2"></v-divider>

          <v-file-input
            :error-messages="
              validate[index].$errors.map((error) => error.$message)
            "
            prepend-icon=""
            prepend-inner-icon="mdi-draw"
            v-if="item.type() == 'file'"
            variant="outlined"
            rounded="pill"
            density="compact"
            :label="item.label"
            v-model="formData[index]"
            accept="image/*"
          />
        </template>
      </v-card>
    </v-col>
    <v-col cols="12">
      <v-divider></v-divider>
    </v-col>
    <v-col cols="12">
      <v-btn @click="submit" variant="outlined" rounded="pill" block
        >Edit</v-btn
      >
    </v-col>
  </v-row>
</template>
<script setup>
import { useAppStore } from '@/stores/app';
import useVuelidate from '@vuelidate/core';
import { helpers, required } from '@vuelidate/validators';
import defaultSign from '@/assets/defaultSign.png';

const store = useAppStore();
const props = defineProps({
  closeMe: {
    type: Function,
    required: true,
  },
  user: {
    type: Object,
    required: true,
  },
});
const signFile = ref('');
const roles = ref([]);
const formData = reactive({
  userId: props.user.userId,
  userName: props.user.userName,
  userNik: props.user.userNik,
  userPassword: '',
  confirmPassword: '',
  roleId: props.user.roleId,
  signFile: null,
});

watch(
  () => formData.signFile,
  (file) => {
    if (file) {
      store.fileToDataURL(file).then((dataUrl) => {
        signFile.value = dataUrl;
      });
    } else {
      signFile.value = defaultSign;
    }
  }
);

const showPassword = ref(false);
const structure = {
  userName: {
    label: 'User Name',
    type: () => 'text',
    hint: 'Enter new user full name',
    col: 6,
  },
  userNik: {
    label: 'User NIK',
    type: () => 'text',
    hint: 'Enter new user NIK',
    col: 6,
  },
  roleId: {
    label: 'Role',
    type: () => 'select',
    hint: 'Select new user role',
    col: 12,
  },
  userPassword: {
    label: 'User Password',
    type: () => (showPassword.value ? 'text' : 'password'),
    hint: 'Enter new user password',
    col: 6,
  },
  confirmPassword: {
    label: 'Confirm Password',
    type: () => (showPassword.value ? 'text' : 'password'),
    hint: 'Confirm new user password',
    col: 6,
  },
  signFile: {
    label: 'Sign File',
    type: () => 'file',
    hint: 'Upload user sign file',
    col: 12,
  },
};
const rules = {
  userName: {
    required,
  },
  userNik: { required },
  userPassword: { req: () => true },
  confirmPassword: {
    sameAs: helpers.withMessage(
      'Passwords must match',
      (value) => value === formData.userPassword
    ),
  },
  roleId: { required },
  signFile: { required },
};
const validate = useVuelidate(rules, formData);
const submit = async () => {
  try {
    const valid = await validate.value.$validate();
    if (!valid)
      throw {
        title: 'Validation Error',
        text: 'Please fix the errors in the form',
        icon: 'error',
      };
    const fd = new FormData();
    for (const key in formData) {
      if (key != 'confirmPassword') {
        fd.append(key, formData[key]);
      }
    }

    await store.ajax(fd, '/auth/edituser', 'POST');
    store.swal.fire({
      title: 'Success',
      text: 'User updated successfully',
      icon: 'success',
    });
    store.preload = false;
    props.closeMe();
  } catch (error) {
    store.swal.fire(error);
    store.preload = false;
  }
};

onMounted(() => {
  store.ajax({}, '/auth/getroles', 'POST').then((data) => {
    roles.value = data.filter((role) => role.roleId != 1);
    store.preload = false;
  });
  store
    .ajax({ userId: props.user.userId }, '/auth/getsignfile', 'POST')
    .then((data) => {
      signFile.value = data;
      formData.signFile = store.dataUrlToFile(
        data,
        `${props.user.userNik}_signature.png`
      );
    });
});
</script>
