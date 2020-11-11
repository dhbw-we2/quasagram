<template>
  <q-layout view="lHh Lpr lFf">
    <q-header
      bordered
      class="bg-white text-grey-10"
    >
      <q-toolbar class="constrain">
        <q-btn v-if="isLoggedIn"
          class="large-screen-only q-mr-sm"
          dense
          flat
          icon="eva-camera-outline"
          round
          size="18px"
          to="/post"
        />
        <q-separator
          class="large-screen-only"
          spaced
          vertical
        />
        <q-toolbar-title class="text-grand-hotel text-bold">
          Quasagram
        </q-toolbar-title>
        <q-btn
          class="large-screen-only"
          dense
          flat
          icon="eva-home-outline"
          round
          to="/"
        />
        <q-separator
          class="large-screen-only"
          spaced
          vertical
        />

        <q-btn v-if="!isLoggedIn"
               class="large-screen-only"
               dense
               flat
               icon="eva-log-in-outline"
               round
               title="Login"
               to="/login"
        />
        <q-btn v-else
               class="large-screen-only"
               dense
               flat
               icon="eva-log-out-outline"
               round
               title="Logout"
               @click="logout"
        />
        <q-btn v-if="!isRegistered"
               class="large-screen-only"
               dense
               flat
               icon="eva-person-add-outline"
               round
               title="Register"
               to="/register"
        />
      </q-toolbar>
    </q-header>

    <q-footer
      bordered
      class="bg-white small-screen-only">
      <q-tabs
        active-color="primary"
        class="text-grey-10"
        indicator-color="transparent"
      >
        <q-route-tab
          icon="eva-home-outline"
          to="/"
        />
        <q-route-tab v-if="isLoggedIn"
          icon="eva-camera-outline"
          to="/post"
        />
        <q-route-tab v-else
          icon="eva-log-in-outline"
          to="/login"
        />
        <q-tab v-if="isLoggedIn"
          icon="eva-log-out-outline"
          @click="logout"
        />
      </q-tabs>
    </q-footer>

      <q-page-container class="bg-image">
        <router-view
          @user-logged-in="onLogin"
          @user-registered="onRegister"/>
      </q-page-container>
  </q-layout>
</template>

<script>
import CONST from "boot/constants";
import {auth, UID} from 'boot/firebase'

export default {
  name: 'MainLayout',

  data() {
    return {
      isLoggedIn: false,
      isRegisteredData: false,
    }
  },
  computed: {
    isRegistered: function () {
      const registered = localStorage.getItem(CONST.REGISTERED)
      const result = registered ? JSON.parse(registered.toLowerCase()) : false
      return this.isRegisteredData || result
    }
  },
  methods: {
    logout() {
      auth.signOut()
        .then(() => {
          this.$q.notify({message: 'You logged out successfully'})
          setTimeout(() => {
            this.isLoggedIn = false
            if (this.$router.currentRoute.path != '/login')
              this.$router.push('/login')
          }, 1000)
        })
        .catch((error) => {
          this.$q.dialog({title: error.code, message: error.message})
        })
    },
    onLogin(newUID) {
      if (newUID)
        this.isLoggedIn = true
    },
    onRegister() {
      this.isRegisteredData = true
    }

  },
  created() {
    this.onLogin(UID)
  }
}
</script>

<style lang="sass">
.q-toolbar
  @media (min-width: $breakpoint-sm-min)
    height: 77px

.q-toolbar__title
  font-size: 30px
  @media (max-width: $breakpoint-xs-max)
    text-align: center

.q-toolbar .q-btn
  font-size: 18px

.q-footer
  .q-tab__icon
    font-size: 30px
</style>
