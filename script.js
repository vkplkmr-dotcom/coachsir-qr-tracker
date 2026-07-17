// Firebase Configuration
// Firebase SDKs are loaded in index.html using v8.10.1

// Google Sheet URL - FIXED syntax error here
// ===============================
// CONFIG
// ===============================

const CONFIG = {

  

  UPI_ID: "vkplkmr-1@oksbi",

  EXAM_URL: "https://cbtexam.onlinetestpanel.com/",

  EXPIRY_DATE: new Date("2026-08-15T23:59:59")

};
CONFIG.SHEET_URL= "https://script.google.com/macros/s/AKfycby5inXpjWD10lIzHkOku21RwhVlMh9htuDOxwkb3mFwxR6BooQ0L-f6YArf8sNv4WbE/exec";
// Student ID
const params = new URLSearchParams(window.location.search);
const studentId = params.get("id") || "general";
const isAdmin = params.get("admin") === "1234";

// Firestore Reference
const counterRef = db.collection("qrData").doc(studentId);

// Expiry Date
const defaultExpiryDate = new Date("2026-08-15T23:59:59");

// --- Global Functions ---

// Function to copy UPI ID
window.copyUPI = function() {
  navigator.clipboard.writeText(CONFIG.UPI_ID)
  .then(() => {
    alert("✅ UPI ID Copied");
  })
  .catch(() => {
    alert("UPI ID: vkplkmr-1@oksbi");
  });
};

// Global function for admin approval
window.approvePayment = function(id) {
  db.collection("qrData")
    .doc(id)
    .update({
      paymentStatus: "approved"
    })
    .then(() => {
      alert("✅ Payment Approved");
      location.reload();
    })
    .catch(error => {
      alert("Error approving payment: " + error.message);
      console.error("Error approving payment:", error);
    });
};

// Function for payment done button
window.paymentDone = async function() {
  let currentPaymentAmount = 1; // Default value
  const amountElement = document.getElementById("paymentAmountDisplay");
  if (amountElement) {
    currentPaymentAmount = parseFloat(amountElement.innerText.replace("₹", "")) || 1;
  }
  console.log("Payment amount detected:", currentPaymentAmount);

  try {
    // Update Firebase payment status
const doc = await db.collection("qrData").doc(studentId).get();

if (doc.exists && doc.data().paymentStatus === "approved") {
  alert("✅ Payment is already approved.");
  return;
}

await db.collection("qrData")
  .doc(studentId)
  .update({
    paymentStatus: "verification_pending"
  });

console.log("Firebase payment status updated to verification_pending.");
    // Send data to Google Sheet
    const response = await fetch(CONFIG.SHEET_URL, {
      method: "POST",
      mode: "no-cors", // Use no-cors to avoid Failed to fetch if the server doesn't support CORS
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        action: "payment",
        studentId: studentId,
        amount: currentPaymentAmount,
        paymentStatus: "verification_pending",
        paymentProofURL: "" 
      })
    });

    // Note: With mode: 'no-cors', we cannot read the response body or status.
    console.log("Google Sheet request sent (no-cors mode).");

    document.getElementById("count").innerHTML = `
      <div style="text-align:center; padding:20px;">
        <h2 style="color:green;">✅ Payment Submitted</h2>
        <p>Admin verification के बाद CBT Access मिलेगा.</p>
        <button onclick="location.reload()" style="padding:10px; margin-top:10px;">Refresh Page</button>
      </div>
    `;
  } catch (error) {
    alert("Error submitting payment: " + error.message);
    console.error("Payment submission error:", error);
    document.getElementById("count").innerHTML = `
      <h2>❌ Error</h2>
      <p>Submission failed. Error: ${error.message}</p>
    `;
  }
};

// --- Main Logic ---

async function runMainLogic() {
  try {
    const doc = await counterRef.get();

    if (isAdmin) {
      const snapshot = await db.collection("qrData").get();
      let html = "<h2>🔐 Admin Panel</h2>";

      snapshot.forEach(d => {
        const data = d.data();
        html += `
          <div style="border:1px solid #ccc;padding:10px;margin:10px;border-radius:8px">
            <b>${d.id}</b><br>
            Status : ${data.paymentStatus || "pending"}<br><br>
            <button style="cursor:pointer; padding:10px; position:relative; z-index:9999;"
              onclick="window.approvePayment('${d.id}')">
              ✅ Approve
            </button>
          </div>
        `;
      });

      document.getElementById("count").innerHTML = html;
      return;
    }

    const now = new Date();

    if (doc.exists) {
      const data = doc.data();
    // 1. QR Active Check
      if (data.active === false) {
        document.getElementById("count").innerHTML = `
          <h2>❌ QR Inactive</h2>
          <p>Please contact COACHsir Academy</p>
        `;
        return;
      }

      // 2. Payment Check
      if (data.paymentStatus === "verification_pending") {
  document.getElementById("count").innerHTML = `
    <div style="text-align:center;padding:20px;">
      <h2>⏳ Payment Verification Pending</h2>
      <p>Your payment has already been submitted.</p>
      <p>Please wait for admin approval.</p>
    </div>
  `;
  return;
}
      if (data.paymentStatus !== "approved") {
        const amount = data.paymentAmount || 1;
       const upiId = CONFIG.UPI_ID;
        const upiLink = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent("COACHsir Academy")}&am=${amount}&cu=INR`;

        document.getElementById("count").innerHTML = `
          <div style="max-width:400px;margin:auto;background:#fff;padding:20px;border-radius:15px;box-shadow:0 0 15px rgba(0,0,0,.2);text-align:center;">
            <h2 style="color:#0066ff;">💳 Payment Required</h2>
            <p>CBT Exam Access के लिए पहले Payment करें</p>
            <h1 style="color:green;" id="paymentAmountDisplay">₹${amount}</h1>
            <img src="assets/upi-qr.png" style="width:220px;border-radius:12px;margin:15px 0;">
            <br>
            <a href="${upiLink}">
              <button style="width:100%; padding:14px; background:#0066ff; color:white; border:none; border-radius:10px; font-size:18px;">
                💳 Pay with Any UPI App
              </button>
            </a>
            <br><br>
            <p><b>UPI ID</b></p>
            <div style="background:#f1f1f1; padding:12px; border-radius:8px; font-size:17px; font-weight:bold;">
              ${upiId}
            </div>
            <br>
            <button onclick="window.copyUPI()" style="width:100%; padding:12px; background:#333; color:white; border:none; border-radius:8px;">
              📋 Copy UPI ID
            </button>
            <br><br>
            <button onclick="window.paymentDone()" style="width:100%; padding:14px; background:green; color:white; border:none; border-radius:10px; font-size:18px;">
              ✅ I Have Paid
            </button>
            <p style="margin-top:15px;color:#666;font-size:14px;">
              Payment verification के बाद CBT Exam Access मिलेगा।
            </p>
          </div>
        `;
        return;
      }

      // 3. Expiry Check
      let expiry = defaultExpiryDate;
      if (data.expiryDate && typeof data.expiryDate.toDate === "function") {
        expiry = data.expiryDate.toDate();
      }

      if (now > expiry) {
        await counterRef.update({ active: false });
        document.getElementById("count").innerHTML = `
          <h2>❌ QR Expired</h2>
          <p>Please renew fees</p>
        `;
        return;
      }

      // 4. Scan Limit Check
      const currentCount = data.count || 0;
      const scanLimit = Number(data.scanLimit ?? Infinity);
      const unlimited = data.unlimited === true;

      if (!unlimited && currentCount >= scanLimit) {
        await counterRef.update({ active: false });
        document.getElementById("count").innerHTML = `
          <h2>❌ Scan Limit Reached</h2>
        `;
        return;
      }

      // 5. Success: Record Attendance
      const newCount = currentCount + 1;
      await counterRef.update({
        count: newCount,
        lastScan: now
      });

      // Log to Google Sheet (Fire and forget)
      fetch(CONFIG.SHEET_URL, {
        method: "POST",
        mode: "no-cors",
        body: JSON.stringify({
          studentId: studentId,
          scanCount: newCount
        })
      }).catch(e => console.error("Sheet log error:", e));

    } else {
      // New Student Create
      await counterRef.set({
        count: 1,
        active: true,
        scanLimit: 100,
        unlimited: false,
        paymentStatus: "pending",
        paymentAmount: 1,
        createdAt: now,
        expiryDate: defaultExpiryDate,
        lastScan: now
      });
    }

   // Secure CBT Redirect

const latestDoc = await counterRef.get();

if (latestDoc.exists && latestDoc.data().paymentStatus === "approved") {

  document.getElementById("count").innerHTML = `
    <div style="text-align:center; padding:20px;">
      <h2 style="color:green;">✅ Access Granted</h2>
      <p>Opening CBT Exam...</p>
    </div>
  `;

  setTimeout(() => {
    window.location.href = "https://cbtexam.onlinetestpanel.com/";
  }, 2000);

} else {

  document.getElementById("count").innerHTML = `
    <div style="text-align:center; padding:20px;">
      <h2>⏳ Payment Verification Required</h2>
      <p>Please wait for approval.</p>
    </div>
  `;

}
  } catch (error) {
    console.error("Main logic error:", error);
    document.getElementById("count").innerHTML = "❌ Error: " + error.message;
  }
}

// Run the logic
runMainLogic();
