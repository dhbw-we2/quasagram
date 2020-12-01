<template>
  <q-page class="constrain q-pa-md">
    <div class="row q-col-gutter-lg">
      <div class="col-12 col-sm-8">
        <template v-if="isLoggedIn && !loadingPosts && posts.length">
          <q-card
            v-for="post in posts"
            :key="post.id"
            bordered
            class="shadow-10 card-post q-mb-md"
          >
            <q-item>
              <q-item-section avatar>
                <q-avatar>
                  <q-img :src="user.image" />
                </q-avatar>
              </q-item-section>

              <q-item-section>
                <q-item-label class="text-bold">{{post.userId}}</q-item-label>
                <q-item-label caption>
                  {{ post.location }}
                </q-item-label>
              </q-item-section>
            </q-item>

            <q-separator/>

            <q-img :src="post.imageUrl"
                   height="50%"
            />

            <q-card-section>
              <div>{{ post.caption }}</div>
              <div class="text-caption text-grey">{{ post.date | niceDate }}</div>
            </q-card-section>

          </q-card>
        </template>
        <template v-else-if="!isLoggedIn">
          <div class="absolute-center">
            <q-card class="shadow-10">
              <q-item>
                <q-item-section>
                  <h3 class="text-center text-grand-hotel text-bold">Login to see posts ...</h3>
                </q-item-section>
              </q-item>
            </q-card>
          </div>
        </template>
        <template v-else>
          <q-card class="shadow-10">
            <q-item>
              <q-item-section avatar>
                <q-skeleton animation="fade" size="40px" type="QAvatar"/>
              </q-item-section>

              <q-item-section>
                <q-item-label>
                  <q-skeleton animation="fade" type="text"/>
                </q-item-label>
                <q-item-label caption>
                  <q-skeleton animation="fade" type="text"/>
                </q-item-label>
              </q-item-section>
            </q-item>

            <q-skeleton animation="fade" height="200px" square/>

            <q-card-section>
              <q-skeleton animation="fade" class="text-subtitle2" type="text"/>
              <q-skeleton animation="fade" class="text-subtitle2" type="text" width="50%"/>
            </q-card-section>
          </q-card>
        </template>
      </div>

      <div v-if="isLoggedIn" class="col-4 large-screen-only">
        <q-card class="fixed">
          <q-card-section avatar>
            <q-item>
              <q-item-section avatar>
                <q-avatar>
                  <img :src="user.image">
                </q-avatar>
              </q-item-section>
              <q-item-section>
                <q-item-label class="text-bold">{{ user.nickname }}</q-item-label>
                <q-item-label caption>
                  {{user.email}}<br/>
                </q-item-label>
              </q-item-section>
            </q-item>
          </q-card-section>
        </q-card>
      </div>
    </div>

  </q-page>
</template>

<script>
import {date} from 'quasar'
import {db, auth, UID} from 'boot/firebase'

export default {
  name: 'Home',
  props: ['isLoggedIn'],
  data() {
    return {
      user: {},
      posts: [],
      loadingPosts: false
    }
  },
  methods: {
    getUser() {
      if (!UID) return
      db.collection('users')
        .where('userId', '==', UID).limit(1).get()
        .then(snapshot => {
          if (!snapshot.empty) {
            this.user = snapshot.docs[0].data()
            // this.user.image = 'https://avatars3.githubusercontent.com/u/13683277?s=460&u=a90a4b666d907370d387e5af56a6c6c5e295ee2b&v=4'
            if (auth.currentUser)
              this.user.email = auth.currentUser.email
          }
        }).catch(error => {
        this.$q.dialog({ title: error.code, message: error.message })
      })

    },
    getPosts() {
      if (!UID) {
        this.posts = []
        return
      }
      this.loadingPosts = true
      db.collection('posts').get()
        .then(posts => {
          if (!posts.empty) {
            posts.forEach((doc) => {
              this.posts.push(doc.data())
            })
            this.loadingPosts = false
          }
        }).catch(error => {
        this.$q.dialog({ title: error.code, message: error.message })
        this.loadingPosts = false
      })
    }
  },
  filters: {
    niceDate(value) {
      return date.formatDate(value, 'DD.MM.YYYY hh:mm')
    }
  },
  created() {
    this.getUser()
    this.getPosts()
  }
}
</script>

<style lang="sass">
.card-post
  .q-img
    min-height: 200px
</style>
