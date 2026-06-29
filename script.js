// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyANpygbwjFFu1R7Aw-o36T5SkMmXVEhZOA",
  authDomain: "qr-tracker-57393.firebaseapp.com",
  projectId: "qr-tracker-57393",
  storageBucket: "qr-tracker-57393.firebasestorage.app",
  messagingSenderId: "617727926623",
  appId: "1:617727926623:web:36d78ef0a54e6051cbd6ea",
  measurementId: "G-YX2VLEDZ4H"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// URL से Student ID प्राप्त करें
const params = new URLSearchParams(window.location.search);
const studentId = params.get("id") || "general";

// Student के लिए अलग Counter बनाएं
const counterRef = db.collection("qrData").doc(studentId);

// Counter बढ़ाएँ
counterRef.get().then((doc) => {

  if (doc.exists) {

    let count = doc.data().count + 1;

    counterRef.update({
      count: count
    });

    document.getElementById("count").innerHTML =
      `Student ID: ${studentId}<br>Total QR Scans: ${count}`;

  } else {

    counterRef.set({
      count: 1
    });

    document.getElementById("count").innerHTML =
      `Student ID: ${studentId}<br>Total QR Scans: 1`;
  }

}).catch((error) => {
  console.log("Error:", error);
  document.getElementById("count").innerText =
    "Error: " + error.message;
});
