<template>
  <q-page class="constrain q-pa-md">
    <div class="row q-col-gutter-lg">
      <div class="col-12 col-sm-8">
        <template v-if="!loadingPosts && posts.length">
          <q-card
            v-for="post in posts"
            :key="post.id"
            bordered
            class="card-post q-mb-md"
            flat
          >
            <q-item>
              <q-item-section avatar>
                <q-avatar>
                  <img src="https://avatars3.githubusercontent.com/u/13683277">
                </q-avatar>
              </q-item-section>

              <q-item-section>
                <q-item-label class="text-bold">freddie_walker</q-item-label>
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
        <template v-else-if="!loadingPosts && !posts.length">
          <h5 class="text-center text-grey">No posts yet.</h5>
        </template>
        <template v-else>
          <q-card bordered>
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

      <div v-show="user.image" class="col-4 large-screen-only">
        <q-item class="fixed">
          <q-item-section avatar>
            <q-avatar size="48px">
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
      </div>
    </div>

  </q-page>
</template>

<script>
import {date} from 'quasar'
import {db, auth, UID} from 'boot/firebase'

export default {
  name: 'Home',
  props: ['uid'],
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
            this.user.email = auth.currentUser.email
            this.user.image = 'https://avatars3.githubusercontent.com/u/13683277?s=460&u=a90a4b666d907370d387e5af56a6c6c5e295ee2b&v=4'
          }
        }).catch(error => {
        this.$q.dialog({ title: error.code, message: error.message })
      })

    },
    getPosts() {
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
