// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyANpygbwjFFu1R7Aw-o36T5SkMmXVEhZOA",
  authDomain: "qr-tracker-57393.firebaseapp.com",
  projectId: "qr-tracker-57393",
  storageBucket: "qr-tracker-57393.firebasestorage.app",
  messagingSenderId: "617727926623",
  appId: "1:617727926623:web:36d78ef0a54e6051cbd6ea"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// URL से Student ID प्राप्त करें
const params = new URLSearchParams(window.location.search);
const studentId = params.get("id") || "general";

// Student Counter Reference
const counterRef = db.collection("qrData").doc(studentId);

// Google Apps Script URL
const SHEET_URL = "https://script.google.com/macros/s/AKfycbwA6xaTfaX17AR9Bgwxl4bT5H4n4KHYm9LkiUMTu7bxq9LO4OFJ2L6YBWHEfD4v98m4Gw/exec";

// Counter बढ़ाएँ
counterRef.get().then((doc) => {

  let count = 1;

  if (doc.exists) {
    count = doc.data().count + 1;

    counterRef.update({
      count: count,
      lastScan: new Date()
    });

  } else {

    counterRef.set({
      count: 1,
      lastScan: new Date()
    });
  }

  // Google Sheet में डेटा भेजें
  fetch(SHEET_URL, {
    method: "POST",
    body: JSON.stringify({
      studentId: studentId,
      scanCount: count
    })
  });

  document.getElementById("count").innerHTML =
    "Attendance Recorded...<br>Redirecting to CBT Exam...";

  // CBT Website पर Redirect
  setTimeout(() => {
    window.location.href = "https://cbtexam.onlinetestpanel.com/";
  }, 2000);

}).catch((error) => {
  document.getElementById("count").innerText =
    "Error: " + error.message;
});
