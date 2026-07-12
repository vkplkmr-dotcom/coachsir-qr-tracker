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
const storage = firebase.storage();

// Google Sheet Web App URL
const SHEET_URL =
  "https://script.google.com/macros/s/AKfycbwA6xaTfaX17AR9Bgwxl4bT5H4n4KHYm9LkiUMTu7bxq9LO4OFJ2L6YBWHEfD4v98m4Gw/exec";

// Payment Details
const UPI_ID = "vkplkmr-1@oksbi";
const PAYMENT_AMOUNT = "30";
// Get Student ID
const params = new URLSearchParams(window.location.search);
const studentId = params.get("id") || "general";

// Firestore Reference
const counterRef = db.collection("qrData").doc(studentId);

// Default Expiry Date
const defaultExpiryDate = new Date("2026-08-15T23:59:59");


// ===============================
// SHOW PAYMENT PAGE
// ===============================

function showPaymentPage(message = "Subscription Payment Required") {

  const upiLink =
    `upi://pay?pa=${encodeURIComponent(UPI_ID)}` +
    `&pn=${encodeURIComponent("COACHsir Academy")}` +
    `&am=${encodeURIComponent(PAYMENT_AMOUNT)}` +
    `&cu=INR` +
    `&tn=${encodeURIComponent("Student Subscription Fee")}`;

  document.getElementById("count").innerHTML = `
    <div class="payment-box">

      <h2>💳 ${message}</h2>

      <p><strong>Student ID:</strong> ${studentId}</p>

      <h1>₹${PAYMENT_AMOUNT}</h1>

      <p><strong>UPI ID:</strong></p>
      <p id="upiIdText">${UPI_ID}</p>

      <button onclick="copyUpiId()">
        📋 Copy UPI ID
      </button>

      <br><br>

      <a href="${upiLink}" class="pay-btn">
        💳 Pay ₹${PAYMENT_AMOUNT} Now
      </a>

      <br><br>

      <p>
        Payment करने के बाद payment screenshot upload करें।
      </p>

      <input
        type="file"
        id="paymentProof"
        accept="image/*"
      >

      <br><br>

      <button
        id="submitPaymentBtn"
        onclick="submitPaymentProof()"
      >
        📤 Submit Payment Screenshot
      </button>

      <p id="uploadStatus"></p>

    </div>
  `;
}


// COPY UPI ID
async function copyUpiId() {
  try {
    await navigator.clipboard.writeText(UPI_ID);
    alert("UPI ID copied: " + UPI_ID);
  } catch (error) {
    alert("UPI ID: " + UPI_ID);
  }
}}


// ===============================
// UPLOAD PAYMENT SCREENSHOT
// ===============================

async function submitPaymentProof() {

  const fileInput =
    document.getElementById("paymentProof");

  const status =
    document.getElementById("uploadStatus");

  const button =
    document.getElementById("submitPaymentBtn");

  if (!fileInput.files.length) {

    status.innerHTML =
      "❌ Please select payment screenshot.";

    return;
  }

  const file = fileInput.files[0];

  // Basic image validation
  if (!file.type.startsWith("image/")) {

    status.innerHTML =
      "❌ Please upload an image file.";

    return;
  }

  try {

    button.disabled = true;

    status.innerHTML =
      "⏳ Uploading payment screenshot...";

    const safeFileName =
      file.name.replace(/[^a-zA-Z0-9._-]/g, "_");

    const fileName =
      `payment_proofs/${studentId}_${Date.now()}_${safeFileName}`;

    const storageRef =
      storage.ref().child(fileName);

    await storageRef.put(file);

    const screenshotURL =
      await storageRef.getDownloadURL();


    // Update Firestore
    await counterRef.set({

      active: false,

      paymentStatus: "pending",

      paymentAmount: Number(PAYMENT_AMOUNT),

      paymentProofURL: screenshotURL,

      paymentSubmittedAt:
        firebase.firestore.FieldValue.serverTimestamp()

    }, { merge: true });


    // Send payment request to Google Sheet
    try {

      await fetch(SHEET_URL, {

        method: "POST",

        body: JSON.stringify({

          action: "payment",

          studentId: studentId,

          amount: Number(PAYMENT_AMOUNT),

          paymentStatus: "pending",

          paymentProofURL: screenshotURL

        })

      });

    } catch (sheetError) {

      console.warn(
        "Google Sheet update failed:",
        sheetError
      );

    }


    document.getElementById("count").innerHTML = `

      <div class="payment-box">

        <h2>✅ Payment Submitted</h2>

        <p>
          Your payment is under verification.
        </p>

        <p>
          Payment verify होने के बाद आपका
          QR Card activate कर दिया जाएगा।
        </p>

        <p>
          <strong>Student ID:</strong>
          ${studentId}
        </p>

      </div>
    `;

  } catch (error) {

    console.error(error);

    button.disabled = false;

    status.innerHTML =
      "❌ Upload failed: " + error.message;

  }
}


// ===============================
// CHECK QR STATUS
// ===============================

counterRef.get().then(async (doc) => {

  const now = new Date();

  // ===============================
  // NEW STUDENT
  // ===============================

  if (!doc.exists) {

    await counterRef.set({

      count: 0,

      active: false,

      paymentStatus: "unpaid",

      scanLimit: 100,

      unlimited: false,

      createdAt: now,

      expiryDate: defaultExpiryDate

    });

    showPaymentPage(
      "First Subscription Payment"
    );

    return;
  }


  const data = doc.data();


  // ===============================
  // PAYMENT PENDING
  // ===============================

  if (data.paymentStatus === "pending") {

    document.getElementById("count").innerHTML = `

      <div class="payment-box">

        <h2>⏳ Payment Under Verification</h2>

        <p>
          आपका payment screenshot submit हो चुका है।
        </p>

        <p>
          Verification के बाद आपका QR Card
          activate किया जाएगा।
        </p>

        <p>
          <strong>Student ID:</strong>
          ${studentId}
        </p>

      </div>
    `;

    return;
  }


  // ===============================
  // INACTIVE / UNPAID
  // ===============================

  if (data.active === false) {

    showPaymentPage(
      "Subscription Payment Required"
    );

    return;
  }


  // ===============================
  // EXPIRY CHECK
  // ===============================

  let expiry = defaultExpiryDate;

  if (
    data.expiryDate &&
    typeof data.expiryDate.toDate === "function"
  ) {

    expiry =
      data.expiryDate.toDate();

  }


  if (now > expiry) {

    await counterRef.update({

      active: false,

      paymentStatus: "unpaid"

    });

    showPaymentPage(
      "Subscription Expired - Renew Now"
    );

    return;
  }


  // ===============================
  // SCAN LIMIT CHECK
  // ===============================

  const currentCount =
    data.count || 0;

  const scanLimit =
    Number(data.scanLimit ?? Infinity);

  const unlimited =
    data.unlimited === true;


  if (
    !unlimited &&
    currentCount >= scanLimit
  ) {

    await counterRef.update({

      active: false

    });

    document.getElementById("count").innerHTML = `

      <h2>❌ Scan Limit Reached</h2>

      <p>
        Please contact COACHsir Academy.
      </p>
    `;

    return;
  }


  // ===============================
  // ACTIVE STUDENT
  // ===============================

  const newCount =
    currentCount + 1;


  await counterRef.update({

    count: newCount,

    lastScan: now

  });


  // Google Sheet Scan Record
  fetch(SHEET_URL, {

    method: "POST",

    body: JSON.stringify({

      studentId: studentId,

      scanCount: newCount

    })

  });


  document.getElementById("count").innerHTML = `

    ✅ Attendance Recorded

    <br>

    Redirecting to CBT Exam...

  `;


  setTimeout(() => {

    window.location.href =
      "https://cbtexam.onlinetestpanel.com/";

  }, 2000);


}).catch((error) => {

  console.error(error);

  document.getElementById("count").innerHTML =

    "❌ Error: " + error.message;

});
