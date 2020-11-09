import firebase from 'firebase/app'
import 'firebase/firestore'
import 'firebase/storage'
import 'firebase/auth'

const firebaseConfig = require('./secretConfig.json')
let fbApp = firebase.initializeApp(firebaseConfig)
let db = fbApp.firestore()
let auth = fbApp.auth()
let storage = fbApp.storage().ref()
export default {db, auth, storage}
