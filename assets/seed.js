// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js";
import { getFirestore, collection, doc, setDoc } from 'https://www.gstatic.com/firebasejs/11.1.0/firebase-firestore.js';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAavLvrCJfHdfYLQIZEia1VitPrENQJC1A",
  authDomain: "room-booking-a12da.firebaseapp.com",
  projectId: "room-booking-a12da",
  storageBucket: "room-booking-a12da.firebasestorage.app",
  messagingSenderId: "485687011288",
  appId: "1:485687011288:web:a27fe0e6a57c066c33f4ad",
  measurementId: "G-16J4K8F23L"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const datas = [101,102,103,201,202,203,301,302,303]


async function AddRoomData() {
  const roomsRef = collection(db, "rooms");

  for (let i = 0; i < datas.length; i++) {
    const roomNumber = datas[i];
    const roomDoc = doc(roomsRef, roomNumber.toString())
    await setDoc(roomDoc, {
      name: roomNumber,
      createdAt: new Date().toISOString()
    })
  }
}


AddRoomData()
