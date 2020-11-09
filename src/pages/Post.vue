<template>
  <q-page class="constrain-more q-pa-md">
    <div class="camera-frame q-pa-md">
      <video
        v-show="!imageCaptured"
        ref="video"
        autoplay
        class="full-width"
      />
      <canvas
        v-show="imageCaptured"
        ref="canvas"
        class="full-width"
        height="240"
      />
    </div>
    <div class="text-center q-pa-md">
      <q-btn v-if="hasCameraSupport"
             :disable="imageCaptured"
             color="grey-10"
             icon="eva-camera"
             round
             size="lg"
             @click="captureImage"
      />
      <q-file v-else
              v-model="imageUpload"
              accept="image/*"
              label="Choose an image"
              outlined
              @input="captureImageFallback"
      >
        <template v-slot:prepend>
          <q-icon name="eva-attach-outline"/>
        </template>
      </q-file>
      <div class="row justify-center q-ma-md">
        <q-input
          v-model="post.caption"
          class="col col-sm-6"
          dense
          label="Caption *"
        />
      </div>
      <div class="row justify-center q-ma-md">
        <q-input
          v-model="post.location"
          :loading="locationLoading"
          class="col col-sm-6"
          dense
          label="Location"
        >
          <template v-slot:append>
            <q-btn
              v-if="!locationLoading && locationSupported"
              dense
              flat
              icon="eva-navigation-2-outline"
              round
              @click="getLocation"
            />
          </template>
        </q-input>
      </div>
      <div class="row justify-center q-mt-lg">
        <q-btn
          :disable="!post.caption || !post.photo"
          color="primary"
          label="Post Image"
          rounded
          unelevated
          @click="uploadImage()"
        />
      </div>
    </div>
  </q-page>
</template>

<script>
import {uid} from 'quasar'

require('md-gum-polyfill')
import {db, auth, storage} from 'boot/firebase'

export default {
  name: 'Camera',
  data() {
    return {
      post: {
        id: uid(),
        caption: '',
        location: '',
        photo: null,
        date: Date.now()
      },
      imageCaptured: false,
      imageUpload: [],
      hasCameraSupport: true,
      locationLoading: false
    }
  },
  computed: {
    locationSupported() {
      if ('geolocation' in navigator) return true
      return false
    }
  },
  methods: {
    initCamera() {
      navigator.mediaDevices.getUserMedia({
        video: true
      }).then(stream => {
        this.$refs.video.srcObject = stream
      }).catch(error => {
        this.hasCameraSupport = false
      })
    },
    captureImage() {
      let video = this.$refs.video
      let canvas = this.$refs.canvas
      canvas.width = video.getBoundingClientRect().width
      canvas.height = video.getBoundingClientRect().height
      let context = canvas.getContext('2d')
      context.drawImage(video, 0, 0, canvas.width, canvas.height)
      this.imageCaptured = true
      this.post.photo = this.dataURItoBlob(canvas.toDataURL())
      this.disableCamera()
    },
    captureImageFallback(file) {
      this.post.photo = file

      let canvas = this.$refs.canvas
      let context = canvas.getContext('2d')

      var reader = new FileReader()
      reader.onload = event => {
        var img = new Image()
        img.onload = () => {
          canvas.width = img.width
          canvas.height = img.height
          context.drawImage(img, 0, 0)
          this.imageCaptured = true
        }
        img.src = event.target.result
      }
      reader.readAsDataURL(file)
    },
    disableCamera() {
      if (this.$refs.video.srcObject) {
        this.$refs.video.srcObject.getVideoTracks().forEach(track => {
          track.stop()
        })
      }
    },
    dataURItoBlob(dataURI) {
      // convert base64 to raw binary data held in a string
      // doesn't handle URLEncoded DataURIs - see SO answer #6850276 for code that does this
      var byteString = atob(dataURI.split(',')[1]);

      // separate out the mime component
      var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0]

      // write the bytes of the string to an ArrayBuffer
      var ab = new ArrayBuffer(byteString.length);

      // create a view into the buffer
      var ia = new Uint8Array(ab);

      // set the bytes of the buffer to the correct values
      for (var i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
      }

      // write the ArrayBuffer to a blob, and you're done
      var blob = new Blob([ab], {type: mimeString});
      return blob;

    },
    getLocation() {
      this.locationLoading = true
      navigator.geolocation.getCurrentPosition(position => {
        this.getCityAndCountry(position)
      }, err => {
        this.locationError()
      }, {timeout: 7000})
    },
    getCityAndCountry(position) {
      let apiUrl = `https://geocode.xyz/${position.coords.latitude},${position.coords.longitude}?json=1`
      this.$axios.get(apiUrl).then(result => {
        this.locationSuccess(result)
      }).catch(err => {
        this.locationError()
      })
    },
    locationSuccess(result) {
      this.post.location = result.data.city
      if (result.data.country) {
        this.post.location += `, ${result.data.country}`
      }
      this.locationLoading = false
    },
    locationError() {
      this.$q.dialog({
        title: 'Error',
        message: 'Could not find your location.'
      })
      this.locationLoading = false
    },
    uploadImage() {
      if (!auth.currentUser) return
      this.$q.loading.show()
      const fileName = this.post.photo.name || this.post.id + '.png'
      let imageRef = storage.child('posts/' + fileName)
      imageRef.put(this.post.photo).then((snapshot) => {
        this.createPost(snapshot.ref.location, this.post)
      }).catch(err => {
        this.$q.dialog({title: 'Error uploading image', message: err.message})
      })
      this.$q.loading.hide()
    },
    createPost(file, post) {
      db.collection('posts').doc(post.id).set({
        id: post.id,
        caption: post.caption,
        location: post.location,
        date: parseInt(post.date),
        userId: auth.currentUser.uid,
        imageUrl: `https://firebasestorage.googleapis.com/v0/b/${file.bucket}/o/${encodeURIComponent(file.path)}?alt=media&token=${post.id}`
      }).then(() => {
        this.$router.push('/')
        this.$q.notify({message: 'Post created!', actions: [{label: 'Dismiss', color: 'white'}]})
      }).catch(err => {
        this.$q.dialog({title: 'Error generating post', message: err.message})
      })
    }
  },
  mounted() {
    if (!auth.currentUser) {
      this.$q.dialog({title: 'Unauthorized', message: 'Your are not logged in'})
      setTimeout(() => {
        this.$router.push('/')
      }, 1000)
      return
    }
    this.initCamera()
  },
  beforeDestroy() {
    if (this.hasCameraSupport) {
      this.disableCamera()
    }
  }
}
</script>

<style lang="sass">
.camera-frame
  border: 2px solid $grey-10
  border-radius: 10px
</style>