import { initializeApp } from "firebase/app"
import { getAuth } from "firebase/auth"

const firebaseConfig = {
  apiKey: "AIzaSyA6A4Je0BK5HlhI6x0F7v1BCwxD87Fd9HU",
  authDomain: "ai-exam-prep-7ffc2.firebaseapp.com",
  projectId: "ai-exam-prep-7ffc2",
  storageBucket: "ai-exam-prep-7ffc2.firebasestorage.app",
  messagingSenderId: "795944726126",
  appId: "1:795944726126:web:3c732cd96643939407807f",
  measurementId: "G-J61M6302ES"
}

const app = initializeApp(firebaseConfig)

export const auth = getAuth(app)