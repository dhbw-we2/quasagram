<template>
  <q-page>
    <div class="row justify-center">
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
        this.$q.notify({message: 'User successfully logged in'})
        this.$emit(CONST.LOGIN, credentials.user.uid)
        this.$router.push({path: '/'})
      }).catch(error => {
        this.$q.dialog({title: 'Error', message: error.message})
      })
    },
    rulePwd(pwd) {
      if (!pwd || pwd.length < 6) {
        return 'Enter at least 6 characters'
      }
    }
  }
}
</script>

<style lang="css">
</style>
