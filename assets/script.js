// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js";
import { getFirestore, collection, getDocs, doc, setDoc, deleteDoc, query, where, orderBy } from 'https://www.gstatic.com/firebasejs/11.1.0/firebase-firestore.js';

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

// DOM elements
const passwordInput = document.getElementById("passwordInput");
const loginButton = document.getElementById("loginButton");
const viewModeButton = document.getElementById("viewModeButton");
const filterSection = document.querySelector(".filter-section");
const dateFilter = document.getElementById("dateFilter");
const periodFilter = document.getElementById("periodFilter");
const roomList = document.getElementById("roomList");
const bookingModal = document.getElementById("bookingModal");
const modalRoomName = document.getElementById("modalRoomName");
const modalRoomStatus = document.getElementById("modalRoomStatus");
const bookButton = document.getElementById("bookButton");
const cancelButton = document.getElementById("cancelButton");
const closeModalBtn = document.getElementById("closeModalBtn");

let currentTeacher = null;
let isViewMode = false;

// Login functionality
loginButton.addEventListener("click", async () => {
  const password = passwordInput.value;
  const usersRef = collection(db, "users");
  const snapshot = await getDocs(usersRef);
  const user = snapshot.docs.find(doc => doc.data().password === password);

  if (user) {
    currentTeacher = user.data().name;
    filterSection.style.display = "flex";
    document.querySelector(".login-section").style.display = "none";
    dateFilter.valueAsDate = new Date();
    periodFilter.value = "1"; // Set default to 1st Period
    loadRooms();
  } else {
    alert("Mật khẩu của bạn không chính xác");
  }
});

// View mode functionality
viewModeButton.addEventListener("click", () => {
  isViewMode = true;
  filterSection.style.display = "flex";
  document.querySelector(".login-section").style.display = "none";
  dateFilter.valueAsDate = new Date();
  periodFilter.value = "1"; // Set default to 1st Period
  loadRooms();
});

// Load rooms
async function loadRooms() {
  const date = dateFilter.value;
  const period = periodFilter.value;
  const bookingsRef = collection(db, "bookings");
  let q = query(bookingsRef, where("date", "==", date), where("period", "==", Number(period)));
  const snapshot = await getDocs(q);
  const bookings = snapshot.docs.map(doc => doc.data());

  const roomsRef = collection(db, "rooms");
  const roomsSnapshot = await getDocs(query(roomsRef, orderBy("createdAt", "asc")));
  const rooms = roomsSnapshot.docs.map(doc => {
    const room = doc.data();
    const booking = bookings.find(b => b.roomId === doc.id);
    return {
      id: doc.id,
      ...room,
      status: booking ? "booked" : "open",
      bookedBy: booking ? booking.teacherName : null,
      bookedAt: booking ? booking.bookedAt : null,
      period: booking ? booking.period : null
    };
  });

  renderRooms(rooms);
}

// Render rooms
function renderRooms(rooms) {
  roomList.innerHTML = "";
  rooms.forEach(room => {
    const roomElement = document.createElement("div");
    roomElement.classList.add("room", room.status);
    if (room.status === "booked" && room.bookedBy !== currentTeacher) {
      roomElement.classList.add("booked-by-others");
    }
    roomElement.innerHTML = `
      <div class="room-content">
        <div class="room-number">${room.name}</div>
        <span class="status-tag ${room.status}">${room.status === 'open' ? 'trống' : ''}</span>
        ${room.bookedBy ? `
          <p class="booked-by">
            (${room.bookedBy === currentTeacher ? 'bạn' : room.bookedBy} đã đăng ký)
          </p>
        ` : ''}
      </div>
    `;
    if (!isViewMode) {
      roomElement.addEventListener("click", () => openModal(room));
    }
    roomList.appendChild(roomElement);
  });
}

// Open modal
function openModal(room) {
  if (isViewMode) return;
  
  modalRoomName.textContent = `Phòng: ${room.name}`;
  modalRoomStatus.textContent = `Trạng thái: ${room.status === 'open' ? 'trống' : 'đã được đăng ký'}`;
  if (room.status === "booked") {
    modalRoomStatus.textContent += `\nĐược đăng ký bởi ${room.bookedBy === currentTeacher ? 'bạn' : room.bookedBy}`;
    modalRoomStatus.textContent += `\nTiết ${room.period}`;
  }
  bookButton.style.display = room.status === "open" ? "inline-block" : "none";
  cancelButton.style.display = room.status === "booked" && room.bookedBy === currentTeacher ? "inline-block" : "none";
  bookingModal.style.display = "block";

  bookButton.onclick = () => bookRoom(room);
  cancelButton.onclick = () => cancelBooking(room);
}

// Book room
async function bookRoom(room) {
  if (isViewMode) return;

  const date = dateFilter.value;
  const period = Number(periodFilter.value);
  const bookingRef = doc(collection(db, "bookings"));
  await setDoc(bookingRef, {
    roomId: room.id,
    date: date,
    period: period,
    teacherName: currentTeacher,
    bookedAt: new Date().toISOString()
  });
  closeModal();
  loadRooms();
}

// Cancel booking
async function cancelBooking(room) {
  if (isViewMode) return;

  const date = dateFilter.value;
  const period = room.period;
  const bookingsRef = collection(db, "bookings");
  const q = query(bookingsRef, 
    where("roomId", "==", room.id), 
    where("date", "==", date), 
    where("period", "==", Number(period))
  );
  const snapshot = await getDocs(q);
  if (!snapshot.empty) {
    await deleteDoc(snapshot.docs[0].ref);
  }
  closeModal();
  loadRooms();
}

// Close modal
function closeModal() {
  bookingModal.style.display = "none";
}

// Event listeners
dateFilter.addEventListener("change", loadRooms);
periodFilter.addEventListener("change", loadRooms);
closeModalBtn.addEventListener("click", closeModal);

// Set default date to today and period to 1st Period
dateFilter.valueAsDate = new Date();
periodFilter.value = "1";
