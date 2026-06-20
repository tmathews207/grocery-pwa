import { initializeApp } from 'firebase/app'
import {
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
} from 'firebase/firestore'

const firebaseConfig = {
  apiKey: 'AIzaSyCtRRS-rGyRTgF5_6qd5qJJ0jyrgjSHnU4',
  authDomain: 'grocery-26f52.firebaseapp.com',
  projectId: 'grocery-26f52',
  storageBucket: 'grocery-26f52.firebasestorage.app',
  messagingSenderId: '1061993663379',
  appId: '1:1061993663379:web:e710ae80415f1a24a73666',
}

const app = initializeApp(firebaseConfig)

// Persistent cache means the app works offline and syncs when back online
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager(),
  }),
})
