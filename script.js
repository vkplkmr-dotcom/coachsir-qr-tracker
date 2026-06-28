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

// Counter document reference
const counterRef = db.collection("qrData").doc("counter");

// Increase count when page opens
counterRef.get().then((doc) => {
  if (doc.exists) {
    let count = doc.data().count + 1;

    counterRef.update({
      count: count
    });

    document.getElementById("count").innerText =
      "Total QR Scans: " + count;
  } else {
    counterRef.set({
      count: 1
    });

    document.getElementById("count").innerText =
      "Total QR Scans: 1";
  }
}).catch((error) => {
  console.log("Error:", error);
});
