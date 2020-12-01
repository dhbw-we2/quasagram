import firebase from 'firebase/app'
import 'firebase/firestore'
import 'firebase/storage'
import 'firebase/auth'

const firebaseConfig = require('./secretConfig.json')
let fbApp = firebase.initializeApp(firebaseConfig)
let db = fbApp.firestore()
let storage = fbApp.storage().ref()
let auth = fbApp.auth()
auth.setPersistence(firebase.auth.Auth.Persistence.SESSION)
let UID
findUserId()

function findUserId() {
    if (auth.currentUser) {
        UID = auth.currentUser.uid
    } else {
        const userKey = sessionStorage.length && Object.keys(sessionStorage).find(key => key.startsWith('firebase:authUser'))
        if (userKey) {
            const user = JSON.parse(sessionStorage.getItem(userKey))
            UID = user && user.uid
        }
    }
}

export {db, auth, storage, UID, findUserId}
