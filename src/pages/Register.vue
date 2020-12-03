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
            ref="uploader"
            :factory="uploadImage"
            accept="image/*"
            auto-upload
            class="full-width"
            color="info"
            label="Choose a profile image"
            max-file-size="204800"
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
          <q-btn
            :disable="step<4"
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

/**
 * Page to register a new user on Firebase
 */
export default {
  name: 'Register',
  data() {
    return {
      /** Validation steps 1 to 4 */
      step: 0,
      /** Toggles visibility of password field */
      isPwd: true,
      /**
       * Placeholder for user profile image
       * @type {File}
       * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/File |File API}
       */
      image: null,
      /** Firestore url of profile image */
      imageUrl: null,
      /** User nickname, must be unique */
      nickname: null,
      /** User email address */
      email: null,
      /** User password */
      password: null,
      /** Repeated password, to avoid typos */
      passwordRepeat: null
    }
  },
  methods: {
    /**
     * Uploads selected user image to Firestore and stores url in 'imageUrl'
     * @param {File[]} files - Array of Files selected by user
     * @see 'imageUrl' for further information
     */
    uploadImage(files) {
      this.$q.loading.show()
      this.image = files[0]
      let imageRef = storage.child('users/' + this.image.name)
      imageRef.put(this.image).then(async snapshot => {
        this.imageUrl = await snapshot.ref.getDownloadURL()
      }).catch(error => {
        this.$q.dialog({title: 'Error uploading profile image', message: error.message})
      }).finally(this.$q.loading.hide())
    },

    /**
     * Creates a new user on Firebase Authentication
     */
    registerUser() {
      auth.createUserWithEmailAndPassword(this.email, this.password).then(async userCredentials => {
        // TODO: set displayName, photoUrl, etc.
        this.createUser(userCredentials.user.uid)
      }).catch(error => {
        this.$q.dialog({title: 'Error registering user', message: error.message})
      })
    },

    /**
     * Creates a new user document in Firestore
     * @async waits for userId lookup in 'users' collection
     * @param {string} userId - the userId returned by Firebase Authentication
     * @returns {Promise<void>}
     */
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
          this.$emit(CONST.LOGIN)
          this.$router.push('/')
        }).catch(error => {
          this.$q.dialog({title: 'Error generating user data', message: error.message})
        })
      } else {
        this.$q.dialog({title: 'Error', message: 'User already exists'})
      }
    },

    /**
     * Resets the register form
     */
    onReset() {
      // TODO: delete image on firestore
      this.$refs.uploader.reset()
      this.nickname = null
      this.email = null
      this.password = null
      this.passwordRepeat = null
    },

    /**
     * Checks if this nickname already exists on Firestore
     * @async waits for nickname lookup in 'users' collection
     * @param {string} nickname - a unique user nickname
     * @returns {Promise<string>} errorMessage
     */
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

    /**
     * Checks if email field has a valid format
     * @param {string} email
     * @returns {string} errorMessage
     */
    ruleEmail(email) {
      const emailPattern = /^(?=[a-zA-Z0-9@._%+-]{6,254}$)[a-zA-Z0-9._%+-]{1,64}@(?:[a-zA-Z0-9-]{1,63}\.){1,8}[a-zA-Z]{2,63}$/
      if (!emailPattern.test(email)) {
        this.step = 1
        return 'Invalid email address'
      }
      this.step = 2
    },

    /**
     * Checks if password contains at least 6 characters
     * @param {string} password
     * @returns {string} errorMessage
     */
    rulePwd(password) {
      if (!password || password.length < 6) {
        this.step = 2
        return 'Enter at least 6 characters'
      }
      this.step = 3
    },

    /**
     * Checks if user repeated the password correctly
     * @param {string} passwordRepeat
     * @returns {string} errorMessage
     */
    rulePwdRepeat(passwordRepeat) {
      if (!passwordRepeat || passwordRepeat != this.password) {
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
