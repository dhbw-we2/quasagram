<template>
  <q-page class="constrain-more q-pa-md">
    <div class="text-center q-pa-md">
      <h3 class="text-grand-hotel text-bold">Register new user</h3>
      <p class="text-body1">Please fill in the following fields<br/>
        to register a new Quasagram user</p>
      <q-form class="q-gutter-y-md col-md-6"
              autocomplete="off"
              @reset="onReset">
        <q-input
          v-model="nickname"
          hint="Nickname"
          clearable
          :rules="[ruleNickname]"
        />
        <q-input
          v-model="email"
          type="email"
          hint="Email address"
          clearable
          :rules="[ruleEmail]"
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
        <q-input type="password"
                 v-model="passwordRepeat"
                 hint="Repeat password"
                 :rules="[rulePwdRepeat]"
        />
        <q-btn label="Reset" type="reset" color="primary" flat rounded/>
        &nbsp;
        <q-btn
          @click="registerUser()"
          :disable="step<4"
          color="primary"
          label="Register new user"
          rounded
        />
      </q-form>
    </div>
  </q-page>
</template>

<script>
import CONST from 'boot/constants'
import {db, auth} from 'boot/firebase'

export default {
  name: 'Register',
  data() {
    return {
      step: 0,
      isPwd: true,
      nickname: null,
      email: null,
      password: null,
      passwordRepeat: null
    }
  },
  methods: {
    registerUser() {
      auth.createUserWithEmailAndPassword(this.email, this.password).then(userCredentials => {
          this.createUserinDB(userCredentials.user.uid)
        }).catch(error => {
          this.$q.dialog({title: 'Error registering user', message: error.message})
      })
    },
    async createUserinDB(userId) {
      const userRef = await db.collection('users').where('userId', '==', userId).get()
      if (userRef.empty) {
        db.collection('users').doc().set({
          userId: userId,
          nickname: this.nickname,
          nickname_lower: this.nickname.toLowerCase()
        }).then(() => {
          localStorage.setItem(CONST.REGISTERED, true)
          this.$q.dialog({ title: 'Success', message: 'User registered' })
          this.$emit(CONST.REGISTERED)
          this.$router.push('/')
        }).catch(error => {
          this.$q.dialog({ title: 'Error generating user data', message: error.message })
        })
      } else {
        this.$q.dialog({ title: 'Error', message: 'User already exists' })
      }
    },
    onReset() {
      this.nickname = null
      this.email = null
      this.password = null
      this.passwordRepeat = null
    },
    async ruleNickname(nickname) {
      if (!nickname) return 'Please enter a nickname...'
      const search = nickname.toLowerCase()
      const snapshot = await db.collection('users').where('nickname_lower', '==', search).get()
      if (!snapshot.empty) {
        this.step = 0
        return 'Nickname is not available!'
      }
      this.step = 1
    },
    ruleEmail(email) {
      const emailPattern = /^(?=[a-zA-Z0-9@._%+-]{6,254}$)[a-zA-Z0-9._%+-]{1,64}@(?:[a-zA-Z0-9-]{1,63}\.){1,8}[a-zA-Z]{2,63}$/
      if (!emailPattern.test(email)) {
        this.step = 1
        return 'Invalid email address'
      }
      this.step = 2
    },
    rulePwd(pwd) {
      if(!pwd || pwd.length < 6) {
        this.step = 2
        return 'Enter at least 6 characters'
      }
      this.step = 3
    },
    rulePwdRepeat(pwd) {
      if (!pwd || pwd != this.password) {
        this.step = 3
        return 'Passwords must match'

      }
      this.step = 4
    }
  }
}
</script>

<style lang="sass">
</style>
