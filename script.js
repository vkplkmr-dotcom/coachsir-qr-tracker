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

// Student के लिए अलग Counter
const counterRef = db.collection("qrData").doc(studentId);

counterRef.get().then((doc) => {

  if (doc.exists) {

    let count = doc.data().count + 1;

    counterRef.update({
      count: count
    });

    showPage(count);

  } else {

    counterRef.set({
      count: 1
    });

    showPage(1);
  }

}).catch((error) => {
  document.getElementById("count").innerText =
    "Error: " + error.message;
});

// Page Display Function
function showPage(count) {

  document.getElementById("count").innerHTML = `
    <h2>Student ID: ${studentId}</h2>
    <h3>Total QR Scans: ${count}</h3>

    <br>

    <a href="https://cbtexam.onlinetestpanel.com/" target="_blank">
      <button style="padding:15px; font-size:18px; margin:10px;">
        Open CBT Exam
      </button>
    </a>

    <br>

    <a href="https://vkplkmr-dotcom.github.io/coachsir--website/" target="_blank">
      <button style="padding:15px; font-size:18px; margin:10px;">
        Open COACHsir Website
      </button>
    </a>
  `;
}
