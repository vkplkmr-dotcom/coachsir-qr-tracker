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

// Get Student ID
const params = new URLSearchParams(window.location.search);
const studentId = params.get("id") || "general";

// Firestore Reference
const counterRef = db.collection("qrData").doc(studentId);

// Default Expiry Date
const defaultExpiryDate = new Date("2026-08-15T23:59:59");

counterRef.get().then(async (doc) => {

  const now = new Date();

  if (doc.exists) {

    const data = doc.data();

    // Active Check
    if (data.active === false) {
      document.getElementById("count").innerHTML =
        "<h2>❌ QR Inactive</h2><p>Please contact COACHsir Academy.</p>";
      return;
    }

    // Payment Check

if(data.paymentStatus !== "approved"){

document.getElementById("count").innerHTML = `

<h2>💳 Payment Required</h2>

<p>
CBT Exam Access के लिए पहले फीस जमा करें
</p>

<h3>
Fees: ₹${data.paymentAmount || 1}
</h3>


<a href="upi://pay?pa=YOURUPIID@upi&pn=COACHsir%20Academy&am=${data.paymentAmount || 1}">

<button style="
padding:12px 20px;
background:#0066ff;
color:white;
border:none;
border-radius:8px;
font-size:18px;
">
Pay Now
</button>

</a>

<br><br>


<button onclick="paymentDone()"
style="
padding:10px 20px;
background:green;
color:white;
border:none;
border-radius:8px;
">
I Have Paid
</button>

`;

return;

}

    // Expiry Check
    let expiry = defaultExpiryDate;

    if (data.expiryDate && typeof data.expiryDate.toDate === "function") {
      expiry = data.expiryDate.toDate();
    }

    if (now > expiry) {

      await counterRef.update({
        active: false
      });

      document.getElementById("count").innerHTML =
        "<h2>❌ QR Expired</h2><p>Please renew your fees.</p>";

      return;
    }

    // Scan Limit Check
    const currentCount = data.count || 0;
    const scanLimit = Number(data.scanLimit ?? Infinity);
    const unlimited = data.unlimited === true;

    if (!unlimited && currentCount >= scanLimit) {

      await counterRef.update({
        active: false
      });

      document.getElementById("count").innerHTML =
        "<h2>❌ Scan Limit Reached</h2><p>Please contact COACHsir Academy.</p>";

      return;
    }

    // Increase Count
    const newCount = currentCount + 1;

    await counterRef.update({
      count: newCount,
      lastScan: now
    });

    // Google Sheet
    fetch(SHEET_URL, {
      method: "POST",
      body: JSON.stringify({
        studentId: studentId,
        scanCount: newCount
      })
    });

  } else {

    // New Student
    await counterRef.set({
      count: 1,
      active: true,
      scanLimit: 100,
      unlimited: false,
      createdAt: now,
      expiryDate: defaultExpiryDate,
      lastScan: now
    });

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

  setTimeout(() => {
    window.location.href =
      "https://cbtexam.onlinetestpanel.com/";
  }, 2000);

}).catch((error) => {

  console.error(error);

  document.getElementById("count").innerHTML =
    "❌ Error: " + error.message;

});
