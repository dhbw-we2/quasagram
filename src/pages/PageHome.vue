<template>
  <q-page class="constrain q-pa-md">

    <div class="row q-col-gutter-lg">
      <div class="col-12 col-sm-8">
        <template v-if="!loadingPosts && posts.length">
          <q-card
            v-for="post in posts"
            :key="post.id"
            class="card-post q-mb-md"
            bordered
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

            <q-img height="50%"
                   :src="post.imageUrl"
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
                <q-skeleton type="QAvatar" animation="fade" size="40px"/>
              </q-item-section>

              <q-item-section>
                <q-item-label>
                  <q-skeleton type="text" animation="fade"/>
                </q-item-label>
                <q-item-label caption>
                  <q-skeleton type="text" animation="fade"/>
                </q-item-label>
              </q-item-section>
            </q-item>

            <q-skeleton height="200px" square animation="fade"/>

            <q-card-section>
              <q-skeleton type="text" class="text-subtitle2" animation="fade"/>
              <q-skeleton type="text" width="50%" class="text-subtitle2" animation="fade"/>
            </q-card-section>
          </q-card>
        </template>
      </div>

      <div class="col-4 large-screen-only">
        <q-item class="fixed">
          <q-item-section avatar>
            <q-avatar size="48px">
              <img
                src="https://avatars3.githubusercontent.com/u/13683277?s=460&u=a90a4b666d907370d387e5af56a6c6c5e295ee2b&v=4">
            </q-avatar>
          </q-item-section>

          <q-item-section>
            <q-item-label class="text-bold">artingo</q-item-label>
            <q-item-label caption>
              Fred Walther
            </q-item-label>
          </q-item-section>
        </q-item>
      </div>
    </div>

  </q-page>
</template>

<script>
import {date} from 'quasar'
import $fb from 'boot/firebaseInit'

export default {
  name: 'PageHome',
  data() {
    return {
      posts: [],
      loadingPosts: false
    }
  },
  methods: {
    getPosts() {
      this.loadingPosts = true
      $fb.db.collection('posts').orderBy('date', 'desc').get().then(snapshot => {
        snapshot.forEach((doc) => {
          this.posts.push(doc.data())
        })
        this.loadingPosts = false
      }).catch(err => {
        this.$q.dialog({
          title: 'Error',
          message: err.message
        })
        this.loadingPosts = false
      })

    }
  },
  filters: {
    niceDate(value) {
      return date.formatDate(value, 'MMMM D h:mmA')
    }
  },
  created() {
    this.getPosts()
  }
}
</script>

<style lang="sass">
.card-post
  .q-img
    min-height: 200px
</style>
