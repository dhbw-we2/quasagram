<template>
  <q-page class="constrain-more q-pa-md">
    <div class="text-center q-pa-md">
      <h3 class="text-grand-hotel text-bold">Login</h3>
      <p class="text-body1">Please enter your credentials</p>
      <q-form class="q-gutter-y-md col-md-6"
              autocomplete="off">
        <q-input
          v-model="email"
          type="email"
          hint="Email address"
          clearable
        >
          <template v-slot:append>
            <q-icon name="email"/>
          </template>
        </q-input>
        <q-input type="password"
          v-model="password"
          :type="isPwd ? 'password' : 'text'"
          hint="Password (min. 6 characters)"
          clearable
          :rules="[rulePwd]"
        >
          <template v-slot:append>
            <q-icon
              :name="isPwd ? 'visibility_off' : 'visibility'"
              class="cursor-pointer"
              @click="isPwd = !isPwd"
            />
          </template>
        </q-input>
        <q-btn
          :disable="!email||!password||password.length<6"
          @click="login()"
          color="primary"
          label="Login"
          rounded
        />
      </q-form>
    </div>
  </q-page>
</template>

<script>
import CONST from 'boot/constants'
import {auth} from 'boot/firebase'

export default {
  name: 'Register',
  data() {
    return {
      isPwd: true,
      email: null,
      password: null
    }
  },
  methods: {
    login() {
      auth.signInWithEmailAndPassword(this.email, this.password).then(credentials => {
        sessionStorage.setItem(CONST.LOGIN, true)
        this.$q.notify({message: 'User successfully logged in'})
        this.$emit(CONST.LOGIN, credentials.user.uid)
        this.$router.push({
          path: '/', params: {userId: credentials.user.uid}
        })
      }).catch(error => {
        this.$q.dialog({title: 'Error', message: error.message})
      })
    },
    rulePwd(pwd) {
      if(!pwd || pwd.length < 6) {
        return 'Enter at least 6 characters'
      }
    }
  }
}
</script>

<style lang="sass">
</style>
