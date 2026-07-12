Firebase  } catch (error) {
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
