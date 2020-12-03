<template>
  <q-page class="constrain-more q-pa-md">
    <q-card class="shadow-10 text-center">
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
    </q-card>
  </q-page>
</template>

<script>
import {uid} from 'quasar'

require('md-gum-polyfill')
import {db, auth, storage} from 'boot/firebase'

/**
 * Page to create a new photo posting
 */
export default {
  name: 'Camera',
  data() {
    return {
      /** object containing current posting */
      post: {
        id: uid(),
        caption: '',
        location: '',
        photo: null,
        date: Date.now()
      },
      /** flag to check if image was captured by device camera */
      imageCaptured: false,
      /**
       * container for current photo snapshot
       * @type {File[]}
       * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/File |File API}
       */
      imageUpload: [],
      /** flag to check if user device has a camera */
      hasCameraSupport: true,
      /** flag to display a wait icon while user location is loading */
      locationLoading: false
    }
  },
  computed: {
    /**
     * Checks if user device has GPS support
     * @returns {boolean} geolocationSupport
     */
    locationSupported() {
      if ('geolocation' in navigator) return true
      return false
    }
  },
  methods: {
    /**
     * Streams live stream to 'video' element
     */
    initCamera() {
      navigator.mediaDevices.getUserMedia({
        video: true
      }).then(stream => {
        this.$refs.video.srcObject = stream
      }).catch(error => {
        this.hasCameraSupport = false
      })
    },

    /**
     * Captures an image from the camera and draws it on canvas
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/HTML/Element/canvas |Canvas}
     */
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

    /**
     * Draws an uploaded file on canvas
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/FileReader |FileReader}
     * @param {File} file
     */
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

    /**
     * Stops all video tracks/streams
     */
    disableCamera() {
      if (this.$refs.video.srcObject) {
        this.$refs.video.srcObject.getVideoTracks().forEach(track => {
          track.stop()
        })
      }
    },

    /**
     * Converts a base64 encoded image to a Blob
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Blob |Blob}
     * @param dataURI
     * @returns {Blob} imagePixels
     */
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


    /**
     * Triggers native position tracking
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Geolocation/getCurrentPosition |Geolocation}
     */
    getLocation() {
      this.locationLoading = true
      navigator.geolocation.getCurrentPosition(position => {
        this.getCityAndCountry(position)
      }, err => {
        this.locationError()
      }, {timeout: 7000})
    },

    /**
     * Calls webservice to identify current city
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/GeolocationPosition |GeolocationPosition}
     * @see {@link https://geocode.xyz |Geocoding service}
     * @param {GeolocationPosition} position
     */
    getCityAndCountry(position) {
      let apiUrl = `https://geocode.xyz/${position.coords.latitude},${position.coords.longitude}?json=1`
      this.$axios.get(apiUrl).then(result => {
        this.locationSuccess(result)
      }).catch(err => {
        this.locationError()
      })
    },

    /**
     * Fills post.city & country from GeoCode result
     * @param {JSON} result
     * @see {@link https://geocode.xyz/api | GeoCode API}
     */
    locationSuccess(result) {
      this.post.location = result.data.city
      if (result.data.country) {
        this.post.location += `, ${result.data.country}`
      }
      this.locationLoading = false
    },

    /**
     * Shows an error message if geolocation can't be parsed
     */
    locationError() {
      this.$q.dialog({
        title: 'Error',
        message: 'Could not find your location.'
      })
      this.locationLoading = false
    },

    /**
     * Uploads the selected image to Firestorage
     */
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

    /**
     * Creates a new doc in 'posts' collection
     * @param {URL} imageURL - image URL on Firebase storage
     * @param {Object} post - the new user posting
     */
    createPost(imageURL, post) {
      db.collection('posts').doc().set({
        id: post.id,
        caption: post.caption,
        location: post.location,
        date: parseInt(post.date),
        userId: auth.currentUser.uid,
        imageUrl: `https://firebasestorage.googleapis.com/v0/b/${imageURL.bucket}/o/${encodeURIComponent(imageURL.path)}?alt=media&token=${post.id}`
      }).then(() => {
        this.$router.push('/')
        this.$q.notify({message: 'Post created!', actions: [{label: 'Dismiss', color: 'white'}]})
      }).catch(err => {
        this.$q.dialog({title: 'Error generating post', message: err.message})
      })
    }
  },

  /**
   * If user isn't authorized, shows an error message and redirects to start page
   */
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

  /**
   * Disables the device camera before leaving this page
   */
  beforeDestroy() {
    if (this.hasCameraSupport) {
      this.disableCamera()
    }
  }
}
</script>

<style lang="sass">
.camera-frame
  border-radius: 20px
</style>
