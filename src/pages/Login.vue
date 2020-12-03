<template>
  <q-page>
    <div class="row">
      <div class="col-lg-3 col-md-4 col-sm-6 col-xs-10 absolute-center">
        <q-card class="shadow-10 text-center">
          <q-card-section>
            <p class="text-h3 text-grand-hotel text-bold">Login</p>
            <p class="text-body1">Please enter your credentials</p>
            <div class="row justify-center">
              <q-form autocomplete="off" class="col-11">
                <q-input
                  v-model="email"
                  clearable
                  dense
                  hint="Email address"
                  type="email"
                >
                  <template v-slot:append>
                    <q-icon name="email"/>
                  </template>
                </q-input>
                <q-input v-model="password"
                         :rules="[rulePwd]"
                         :type="isPwd ? 'password' : 'text'"
                         clearable
                         dense
                         hint="Password (min. 6 characters)"
                         type="password"
                >
                  <template v-slot:append>
                    <q-icon
                      :name="isPwd ? 'visibility_off' : 'visibility'"
                      class="cursor-pointer"
                      @click="isPwd = !isPwd"
                    />
                  </template>
                </q-input>
              </q-form>
            </div>
          </q-card-section>
          <q-card-actions align="center">
            <q-btn
              :disable="!email||!password||password.length<6"
              color="primary"
              label="Login"
              rounded
              @click="login()"
            />
          </q-card-actions>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script>
import CONST from 'boot/constants'
import {auth} from 'boot/firebase'

/**
 * Login page to sign in a registered user on Firebase
 */
export default {
  name: 'Login',
  data() {
    return {
      /** Toggles visibility of password field */
      isPwd: true,
      /** User's email address */
      email: null,
      /** User's password */
      password: null
    }
  },
  methods: {
    /**
     * Firebase sign-in with email & password and forward to start page
     * @emits user-logged-in
     * @property {string} uid - the user's UniqueID
     */
    login() {
      auth.signInWithEmailAndPassword(this.email, this.password).then(credentials => {
        this.$q.notify({message: 'User successfully logged in'})
        this.$emit(CONST.LOGIN, credentials.user.uid)
        // waits 500ms to allow MainLayout to react to login-event
        setTimeout(() => { this.$router.push({path: '/'}) }, 500)

      }).catch(error => {
        this.$q.dialog({title: 'Error', message: error.message})
      })
    },

    /**
     * Validation rule for password: minimum of 6 characters
     * @param {string} password - password entered by user
     * @returns {string} error message
     */
    rulePwd(password) {
      if (!password || password.length < 6) {
        return 'Enter at least 6 characters'
      }
    }
  }
}
</script>

<style lang="sass">
</style>
