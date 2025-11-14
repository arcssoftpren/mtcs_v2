<template>
  <v-app-bar density="compact">
    <template #prepend>
      <v-btn @click="menuDrawer = !menuDrawer" size="small" flat icon>
        <v-icon>mdi-menu</v-icon>
      </v-btn>
    </template>

    <template #append>
      <v-btn @click="setupDrawer = !setupDrawer" size="small" flat icon>
        <v-icon>mdi-cog</v-icon>
      </v-btn>
    </template>
  </v-app-bar>

  <v-navigation-drawer
    color="grey-lighten-4"
    width="300"
    permanent=""
    v-model="menuDrawer"
    app
  >
    <template #title>
      <span>Menu</span>
    </template>
    <template #prepend>
      <v-list>
        <v-list-item>
          <v-card>
            <template #text>
              <v-row>
                <v-col cols="3">
                  <div class="d-flex align-center justify-center w-100 h-100">
                    <v-img src="@/assets/softpren.png"></v-img>
                  </div>
                </v-col>
                <v-col cols="9">
                  <h1 class="text-h6">Welcome</h1>
                  <strong>{{ store.userData.userName }}</strong>
                  <v-divider></v-divider>
                  <div>{{ store.userData.roleName }}</div>
                </v-col>
              </v-row>
            </template>
          </v-card>
        </v-list-item>
        <v-list-item>
          <template #title>
            <v-divider>FEATURES</v-divider>
          </template>
        </v-list-item>
      </v-list>
    </template>
    <template #append>
      <v-list>
        <v-list-item
          base-color="error"
          @click="logoutDialog = true"
          color="error"
        >
          <template #title> Log Out </template>
          <template #subtitle> Logout from the application </template>
          <template #prepend>
            <v-icon size="25">mdi-logout</v-icon>
          </template>
        </v-list-item>
      </v-list>
    </template>

    <template #default>
      <FeatureMenu
        :close-drawer="
          () => {
            menuDrawer = false;
          }
        "
      />
    </template>
  </v-navigation-drawer>
  <v-navigation-drawer
    color="grey-lighten-4"
    width="300"
    v-model="setupDrawer"
    temporary=""
    location="right"
    app
  >
    <template #prepend>
      <v-list>
        <v-list-item>
          <template #title>
            <v-divider>SETUP MENU</v-divider>
          </template>
        </v-list-item>
      </v-list>
    </template>
    <template #default>
      <setupMenu
        :close-drawer="
          () => {
            setupDrawer = false;
          }
        "
      />
    </template>
  </v-navigation-drawer>
  <v-main>
    <v-container fluid class="fill-height">
      <v-card class="fill-height w-100">
        <template #title>{{ store.page.name }}</template>
        <template #prepend>
          <v-icon size="50">{{ store.page.icon }}</v-icon>
        </template>
        <template #subtitle>{{ store.page.desc }}</template>
        <v-card-text class="fill-height">
          <v-divider class="mb-5"></v-divider>
          <router-view />
        </v-card-text>
      </v-card>
    </v-container>
  </v-main>
  <v-dialog
    v-model="logoutDialog"
    scrollable
    persistent
    :overlay="false"
    max-width="500px"
    transition="dialog-transition"
  >
    <v-card class="text-center">
      <template #title>
        <h2>Log Out</h2>
      </template>
      <template #text>
        <div class="w-100 text-center">
          <v-icon color="warning" size="100">mdi-help</v-icon>
        </div>
        <div class="mt-5">Are you sure you want to log out?</div>
        <v-divider class="my-5"></v-divider>
        <v-row>
          <v-col cols="6">
            <v-btn
              @click="logoutDialog = false"
              prepend-icon="mdi-cancel"
              variant="outlined"
              rounded="pill"
              block
              >Cancel</v-btn
            >
          </v-col>
          <v-col cols="6">
            <v-btn
              @click="store.logOut()"
              prepend-icon="mdi-logout"
              variant="outlined"
              rounded="pill"
              block
              color="error"
              >Log Out</v-btn
            >
          </v-col>
        </v-row>
      </template>
    </v-card>
  </v-dialog>
</template>

<script setup>
import FeatureMenu from '@/components/menus/featureMenu.vue';
import router from '@/router';
import { useAppStore } from '@/stores/app';
const menuDrawer = ref(false);
const setupDrawer = ref(false);

//

const store = useAppStore();
const logoutDialog = ref(false);

onBeforeMount(() => {
  if (!store.loged) {
    router.push('/');
  }
});
</script>
