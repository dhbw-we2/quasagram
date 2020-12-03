/**
 * Firebase references used by the app
 */
import firebase from 'firebase/app'
import 'firebase/firestore'
import 'firebase/storage'
import 'firebase/auth'

const firebaseConfig = require('./secretConfig.json')
let fbApp = firebase.initializeApp(firebaseConfig)
// reference to Firestore (database)
let db = fbApp.firestore()
// reference to Storage (file cloud)
let storage = fbApp.storage().ref()
// reference to Authentication
let auth = fbApp.auth()
// store login per session only
auth.setPersistence(firebase.auth.Auth.Persistence.SESSION)
// current user's unique ID
let UID
findUserId()

/**
 * Stores current userID in 'UID' variable
 */
function findUserId() {
    // get from authenticated user
    if (auth.currentUser) {
        UID = auth.currentUser.uid
    } else {
        // or from sessionStorage
        const userKey = sessionStorage.length && Object.keys(sessionStorage).find(key => key.startsWith('firebase:authUser'))
        if (userKey) {
            const user = JSON.parse(sessionStorage.getItem(userKey))
            UID = user && user.uid
        }
    }
}

export {db, auth, storage, UID, findUserId}
