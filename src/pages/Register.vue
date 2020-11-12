<template>
  <q-page class="constrain-more q-pa-md">
    <q-card class="shadow-10 text-center">
      <div class="text-center q-pa-md">
        <h3 class="text-grand-hotel text-bold">Register new user</h3>
        <p class="text-body1">Please fill in the following fields<br/>
          to register a new Quasagram user</p>
        <q-form autocomplete="off"
                class="q-gutter-y-md col-md-6"
                @reset="onReset">
          <q-uploader
            :factory="uploadImage"
            accept="image/*"
            auto-upload
            class="full-width"
            color="info"
            label="Choose a profile image"
            max-file-size="204800"
            ref="uploader"
          />
          <q-input
            v-model="nickname"
            :rules="[ruleNickname]"
            clearable
            dense
            hint="Nickname"
          />
          <q-input
            v-model="email"
            :rules="[ruleEmail]"
            clearable
            dense
            hint="Email address"
            type="email"
          >
            <template v-slot:append>
              <q-icon name="email"/>
            </template>
          </q-input>
          <q-input
            v-model="password"
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
          <q-input
            v-model="passwordRepeat"
            :rules="[rulePwdRepeat]"
            dense
            hint="Repeat password"
            type="password"
          />
          <q-btn color="primary" flat label="Reset" rounded type="reset"/>
          &nbsp;
          <!--            :disable="step<4"-->
          <q-btn
            color="primary"
            label="Register new user"
            rounded
            @click="registerUser"
          />
        </q-form>
      </div>
    </q-card>
  </q-page>
</template>

<script>
import CONST from 'boot/constants'
import {db, auth, storage} from 'boot/firebase'

export default {
  name: 'Register',
  data() {
    return {
      step: 0,
      isPwd: true,
      image: null,
      imageUrl: null,
      nickname: null,
      email: null,
      password: null,
      passwordRepeat: null
    }
  },
  methods: {
    uploadImage(files) {
      this.$q.loading.show()
      this.image = files[0]
      let imageRef = storage.child('users/' + this.image.name)
      imageRef.put(this.image).then(async snapshot => {
        this.imageUrl = await snapshot.ref.getDownloadURL()
      }).catch(error => {
        this.$q.dialog({title: 'Error uploading profile image', message: error.message})
      }).finally(() => this.$q.loading.hide())
    },
    registerUser() {
      auth.createUserWithEmailAndPassword(this.email, this.password).then(async userCredentials => {
        this.createUser(userCredentials.user.uid)
      }).catch(error => {
        this.$q.dialog({title: 'Error registering user', message: error.message})
      })
    },
    async createUser(userId) {
      const userRef = await db.collection('users').where('userId', '==', userId).get()
      if (userRef.empty) {
        db.collection('users').doc().set({
          userId: userId,
          nickname: this.nickname,
          nickname_lower: this.nickname.toLowerCase(),
          image: this.imageUrl
        }).then(() => {
          localStorage.setItem(CONST.REGISTERED, true)
          this.$q.dialog({title: 'Success', message: 'User registered'})
          this.$emit(CONST.REGISTERED)
          this.$router.push('/')
        }).catch(error => {
          this.$q.dialog({title: 'Error generating user data', message: error.message})
        })
      } else {
        this.$q.dialog({title: 'Error', message: 'User already exists'})
      }
    },
    onReset() {
      this.$refs.uploader.reset()
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
      if (!pwd || pwd.length < 6) {
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
