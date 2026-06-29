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

// Google Sheet Web App URL
const SHEET_URL =
  "https://script.google.com/macros/s/AKfycbwA6xaTfaX17AR9Bgwxl4bT5H4n4KHYm9LkiUMTu7bxq9LO4OFJ2L6YBWHEfD4v98m4Gw/exec";

// Student ID from URL
const params = new URLSearchParams(window.location.search);
const studentId = params.get("id") || "general";

// Firestore Document
const counterRef = db.collection("qrData").doc(studentId);

// Fixed Expiry Date: 15 August 2026
const expiryDate = new Date("2026-08-15T23:59:59");

counterRef.get().then(async (doc) => {

  const now = new Date();

  // Existing Student
  if (doc.exists) {

    const data = doc.data();

    // Check Active Status
    if (data.active === false) {
      document.getElementById("count").innerHTML =
        "<h2>❌ QR Inactive</h2><p>Please contact COACHsir Academy.</p>";
      return;
    }

    // Check Expiry
    if (now > data.expiryDate.toDate()) {

      await counterRef.update({
        active: false
      });

      document.getElementById("count").innerHTML =
        "<h2>❌ QR Expired</h2><p>Please renew your fees.</p>";

      return;
    }

    let count = (data.count || 0) + 1;

    await counterRef.update({
      count: count,
      lastScan: now
    });

    // Save to Google Sheet
    fetch(SHEET_URL, {
      method: "POST",
      body: JSON.stringify({
        studentId: studentId,
        scanCount: count
      })
    });

  }

  // New Student (First Scan)
  else {

    await counterRef.set({
      count: 1,
      active: true,
      createdAt: now,
      expiryDate: expiryDate,
      lastScan: now
    });

    // Save to Google Sheet
    fetch(SHEET_URL, {
      method: "POST",
      body: JSON.stringify({
        studentId: studentId,
        scanCount: 1
      })
    });
  }

  document.getElementById("count").innerHTML =
    "✅ Attendance Recorded<br>Redirecting to CBT Exam...";

  // Redirect to CBT Portal
  setTimeout(() => {
    window.location.href =
      "https://cbtexam.onlinetestpanel.com/";
  }, 2000);

}).catch((error) => {
  document.getElementById("count").innerHTML =
    "❌ Error: " + error.message;
});
