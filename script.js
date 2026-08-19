// ======================================================
// COACHsir ACADEMY - QR / CBT PAYMENT SYSTEM
// ======================================================
// Firebase SDKs are loaded in index.html using v8.10.1
// ======================================================


// ======================================================
// CONFIG
// ======================================================

const CONFIG = {

  // UPI ID
  UPI_ID: "vkplkmr-1@oksbi",

  // CBT Exam URL
  EXAM_URL: "https://coachsiracademy.onlinetestpanel.com/",

  // Default expiry date
  EXPIRY_DATE: new Date("2026-08-15T23:59:59")

};


// ======================================================
// GOOGLE SHEET URL
// ======================================================

CONFIG.SHEET_URL =
  "https://script.google.com/macros/s/AKfycby5inXpjWD10lIzHkOku21RwhVlMh9htuDOxwkb3mFwxR6BooQ0L-f6YArf8sNv4WbE/exec";


// ======================================================
// GET STUDENT ID FROM URL
// Example:
// ?id=S001
// ======================================================

const params = new URLSearchParams(window.location.search);

const studentId =
  params.get("id") || "general";


// ======================================================
// ADMIN CHECK
// Example:
// ?id=S001&admin=1234
// ======================================================

const isAdmin =
  params.get("admin") === "1234";


// ======================================================
// FIRESTORE REFERENCE
// ======================================================

const counterRef =
  db.collection("qrData").doc(studentId);


// ======================================================
// GET PAYMENT AMOUNT FROM FIRESTORE SETTINGS
// ======================================================

async function getPaymentAmount() {

  try {

    const doc =
      await db.collection("settings")
        .doc("payment")
        .get();

    if (doc.exists) {

      return Number(doc.data().amount) || 30;

    }

    return 30;

  } catch (error) {

    console.error(
      "Payment amount error:",
      error
    );

    return 30;

  }

}


// ======================================================
// DEFAULT EXPIRY DATE
// ======================================================

const defaultExpiryDate =
  CONFIG.EXPIRY_DATE;


// ======================================================
// GLOBAL FUNCTION
// COPY UPI ID
// ======================================================

window.copyUPI = function () {

  const upi =
    CONFIG.UPI_ID;

  if (
    navigator.clipboard &&
    navigator.clipboard.writeText
  ) {

    navigator.clipboard
      .writeText(upi)
      .then(() => {

        alert("UPI ID Copied");

      })
      .catch(() => {

        alert(
          "UPI ID: " + upi
        );

      });

  } else {

    alert(
      "UPI ID: " + upi
    );

  }

};


// ======================================================
// GLOBAL FUNCTION
// ADMIN APPROVE PAYMENT
// ======================================================

window.approvePayment = async function (id) {

  try {

    if (!id) {

      alert("Invalid Student ID");
      return;

    }

    await db.collection("qrData")
      .doc(id)
      .update({

        paymentStatus: "approved"

      });

    alert("Payment Approved");

    location.reload();

  } catch (error) {

    console.error(
      "Error approving payment:",
      error
    );

    alert(
      "Error approving payment: " +
      error.message
    );

  }

};


// ======================================================
// PAYMENT PROOF UPLOAD
// ======================================================

window.uploadPaymentProof = async function () {

  const fileInput =
    document.getElementById(
      "paymentScreenshot"
    );


  // ----------------------------------------------------
  // CHECK FILE
  // ----------------------------------------------------

  if (
    !fileInput ||
    !fileInput.files ||
    !fileInput.files[0]
  ) {

    alert(
      "Please select payment screenshot first."
    );

    return;

  }


  const file =
    fileInput.files[0];


  // ----------------------------------------------------
  // CHECK FILE TYPE
  // ----------------------------------------------------

  if (
    !file.type ||
    !file.type.startsWith("image/")
  ) {

    alert(
      "Please select a valid image file."
    );

    return;

  }


  // ----------------------------------------------------
  // MAX FILE SIZE = 5 MB
  // ----------------------------------------------------

  if (
    file.size >
    5 * 1024 * 1024
  ) {

    alert(
      "Screenshot size should be less than 5 MB."
    );

    return;

  }


  // ----------------------------------------------------
  // BUTTON
  // ----------------------------------------------------

  const button =
    document.getElementById(
      "submitPaymentProofBtn"
    );


  if (button) {

    button.disabled = true;

    button.innerHTML =
      "Uploading...";

    button.style.opacity =
      "0.7";

    button.style.cursor =
      "not-allowed";

  }


  try {

    // --------------------------------------------------
    // GET PAYMENT AMOUNT
    // --------------------------------------------------

    const amount =
      await getPaymentAmount();


    // --------------------------------------------------
    // READ IMAGE
    // --------------------------------------------------

    const reader =
      new FileReader();


    reader.onload = async function () {

      try {

        const result =
          reader.result;


        if (!result) {

          throw new Error(
            "Unable to read payment screenshot."
          );

        }


        const base64 =
          result.split(",")[1];


        if (!base64) {

          throw new Error(
            "Invalid image data."
          );

        }


        // ------------------------------------------------
        // PAYMENT PAYLOAD
        // ------------------------------------------------

        const payload = {

          action: "payment",

          studentId:
            studentId,

          amount:
            amount,

          paymentStatus:
            "verification_pending",

          fileName:
            file.name,

          mimeType:
            file.type,

          image:
            base64

        };


        console.log(
          "Payment proof sending...",
          {
            studentId:
              studentId,

            amount:
              amount,

            fileName:
              file.name,

            mimeType:
              file.type
          }
        );


        // ------------------------------------------------
        // SEND TO GOOGLE SHEET
        //
        // IMPORTANT:
        // No Content-Type header here.
        // This prevents CORS preflight problem.
        // ------------------------------------------------

        await fetch(
          CONFIG.SHEET_URL,
          {

            method: "POST",

            mode: "no-cors",

            body:
              JSON.stringify(payload)

          }
        );


        console.log(
          "Payment proof sent to Google Sheet."
        );


        // ------------------------------------------------
        // UPDATE FIREBASE
        // ------------------------------------------------

        await db.collection("qrData")
          .doc(studentId)
          .update({

            paymentStatus:
              "verification_pending"

          });


        console.log(
          "Firebase payment status updated."
        );


        // ------------------------------------------------
        // SUCCESS SCREEN
        // ------------------------------------------------

        document.getElementById(
          "count"
        ).innerHTML = `

          <div style="
            max-width:420px;
            margin:30px auto;
            padding:25px;
            background:#ffffff;
            border-radius:18px;
            box-shadow:0 5px 25px rgba(0,0,0,0.15);
            text-align:center;
          ">

            <div style="
              font-size:50px;
              margin-bottom:10px;
            ">
              ✅
            </div>

            <h2 style="
              color:#16a34a;
              margin:10px 0;
            ">
              Payment Submitted Successfully
            </h2>

            <p style="
              color:#555;
              line-height:1.6;
            ">
              Your payment screenshot has been received.
            </p>

            <p style="
              color:#555;
              line-height:1.6;
            ">
              Please wait for Admin verification.
            </p>

            <div style="
              margin-top:20px;
              padding:12px;
              background:#f0fdf4;
              border-radius:10px;
              color:#166534;
              font-weight:bold;
            ">
              CBT Access will be activated
              after approval.
            </div>

            <button
              onclick="location.reload()"
              style="
                margin-top:20px;
                width:100%;
                padding:13px;
                border:none;
                border-radius:10px;
                background:#0066ff;
                color:white;
                font-size:16px;
                cursor:pointer;
              "
            >
              Refresh Page
            </button>

          </div>

        `;


      } catch (error) {

        console.error(
          "Payment proof error:",
          error
        );


        if (button) {

          button.disabled =
            false;

          button.innerHTML =
            "Submit Payment Proof";

          button.style.opacity =
            "1";

          button.style.cursor =
            "pointer";

        }


        alert(
          "Payment submission failed: " +
          error.message
        );

      }

    };


    // ----------------------------------------------------
    // FILE READER ERROR
    // ----------------------------------------------------

    reader.onerror = function () {

      if (button) {

        button.disabled =
          false;

        button.innerHTML =
          "Submit Payment Proof";

        button.style.opacity =
          "1";

        button.style.cursor =
          "pointer";

      }


      alert(
        "Unable to read screenshot."
      );

    };


    // ----------------------------------------------------
    // READ FILE
    // ----------------------------------------------------

    reader.readAsDataURL(file);


  } catch (error) {

    console.error(
      "Upload error:",
      error
    );


    if (button) {

      button.disabled =
        false;

      button.innerHTML =
        "Submit Payment Proof";

      button.style.opacity =
        "1";

      button.style.cursor =
        "pointer";

    }


    alert(
      "Error: " +
      error.message
    );

  }

};


// ======================================================
// PAYMENT DONE
// Alternative payment submission function
// ======================================================

window.paymentDone = async function () {

  try {

    let currentPaymentAmount =
      await getPaymentAmount();


    const amountElement =
      document.getElementById(
        "paymentAmountDisplay"
      );


    if (amountElement) {

      const amountText =
        amountElement.innerText
          .replace("₹", "")
          .trim();


      currentPaymentAmount =
        parseFloat(amountText) ||
        currentPaymentAmount;

    }


    console.log(
      "Payment amount detected:",
      currentPaymentAmount
    );


    // --------------------------------------------------
    // CHECK CURRENT PAYMENT STATUS
    // --------------------------------------------------

    const doc =
      await db.collection("qrData")
        .doc(studentId)
        .get();


    if (
      doc.exists &&
      doc.data().paymentStatus ===
        "approved"
    ) {

      alert(
        "Payment is already approved."
      );

      return;

    }


    // --------------------------------------------------
    // UPDATE FIREBASE
    // --------------------------------------------------

    await db.collection("qrData")
      .doc(studentId)
      .update({

        paymentStatus:
          "verification_pending"

      });


    // --------------------------------------------------
    // SEND TO GOOGLE SHEET
    // --------------------------------------------------

    const payload = {

      action:
        "payment",

      studentId:
        studentId,

      amount:
        currentPaymentAmount,

      paymentStatus:
        "verification_pending",

      paymentProofURL:
        ""

    };


    await fetch(
      CONFIG.SHEET_URL,
      {

        method: "POST",

        mode: "no-cors",

        body:
          JSON.stringify(payload)

      }
    );


    // --------------------------------------------------
    // SUCCESS
    // --------------------------------------------------

    document.getElementById(
      "count"
    ).innerHTML = `

      <div style="
        text-align:center;
        padding:25px;
      ">

        <div style="
          font-size:50px;
        ">
          ✅
        </div>

        <h2 style="
          color:green;
        ">
          Payment Submitted
        </h2>

        <p>
          Your payment has been submitted successfully.
        </p>

        <p>
          After Admin verification,
          CBT Exam access will be activated.
        </p>

        <button
          onclick="location.reload()"
          style="
            padding:10px 20px;
            margin-top:10px;
            border:none;
            border-radius:8px;
            background:#0066ff;
            color:white;
            cursor:pointer;
          "
        >
          Refresh Page
        </button>

      </div>

    `;


  } catch (error) {

    console.error(
      "Payment submission error:",
      error
    );


    alert(
      "Error submitting payment: " +
      error.message
    );


    document.getElementById(
      "count"
    ).innerHTML = `

      <div style="
        text-align:center;
        padding:20px;
      ">

        <h2>
          ❌ Error
        </h2>

        <p>
          Submission failed.
        </p>

        <p>
          ${error.message}
        </p>

      </div>

    `;

  }

};


// ======================================================
// MAIN LOGIC
// ======================================================

async function runMainLogic() {

  try {

    // --------------------------------------------------
    // GET STUDENT DOCUMENT
    // --------------------------------------------------

    const doc =
      await counterRef.get();


    // ==================================================
    // ADMIN PANEL
    // ==================================================

    if (isAdmin) {

      const snapshot =
        await db.collection("qrData")
          .get();


      let html = `

        <div style="
          text-align:center;
          margin-bottom:20px;
        ">

          <h2>
            🔐 Admin Panel
          </h2>

        </div>

      `;


      snapshot.forEach(d => {

        const data =
          d.data();


        html += `

          <div style="
            border:1px solid #ddd;
            padding:15px;
            margin:10px;
            border-radius:10px;
            background:#fff;
            box-shadow:0 2px 8px rgba(0,0,0,0.08);
          ">

            <b>
              Student ID:
            </b>

            ${d.id}

            <br><br>

            <b>
              Status:
            </b>

            ${data.paymentStatus || "pending"}

            <br><br>

            <button
              style="
                cursor:pointer;
                padding:10px 16px;
                border:none;
                border-radius:8px;
                background:#16a34a;
                color:white;
                font-weight:bold;
                position:relative;
                z-index:9999;
              "
              onclick="
                window.approvePayment('${d.id}')
              "
            >
              Approve Payment
            </button>

          </div>

        `;

      });


      document.getElementById(
        "count"
      ).innerHTML =
        html;


      return;

    }


    // ==================================================
    // CURRENT TIME
    // ==================================================

    const now =
      new Date();


    // ==================================================
    // EXISTING STUDENT
    // ==================================================

    if (doc.exists) {

      const data =
        doc.data();


      // =================================================
      // 1. QR ACTIVE CHECK
      // =================================================

      if (data.active === false) {

        document.getElementById(
          "count"
        ).innerHTML = `

          <div style="
            text-align:center;
            padding:20px;
          ">

            <h2>
              ❌ QR Inactive
            </h2>

            <p>
              Please contact COACHsir Academy.
            </p>

          </div>

        `;

        return;

      }


      // =================================================
      // 2. PAYMENT VERIFICATION PENDING
      // =================================================

      if (
        data.paymentStatus ===
        "verification_pending"
      ) {

        document.getElementById(
          "count"
        ).innerHTML = `

          <div style="
            text-align:center;
            padding:25px;
          ">

            <div style="
              font-size:45px;
            ">
              ⏳
            </div>

            <h2>
              Payment Verification Pending
            </h2>

            <p>
              Your payment has already been submitted.
            </p>

            <p>
              Please wait for Admin approval.
            </p>

          </div>

        `;

        return;

      }


      // =================================================
      // 3. PAYMENT CHECK
      // =================================================

      if (
        data.paymentStatus !==
        "approved"
      ) {

        const amount =
          data.paymentAmount ||
          await getPaymentAmount();


        const upiId =
          CONFIG.UPI_ID;


        // -----------------------------------------------
        // UPI PAYMENT LINK
        // -----------------------------------------------

        const upiLink =
          `upi://pay?pa=${encodeURIComponent(upiId)}` +
          `&pn=${encodeURIComponent("COACHsir Academy")}` +
          `&am=${amount}` +
          `&cu=INR`;


        // -----------------------------------------------
        // PAYMENT SCREEN
        // -----------------------------------------------

        document.getElementById(
          "count"
        ).innerHTML = `

          <div style="
            max-width:400px;
            margin:auto;
            background:#fff;
            padding:20px;
            border-radius:15px;
            box-shadow:0 0 15px rgba(0,0,0,.2);
            text-align:center;
          ">

            <h2 style="
              color:#0066ff;
            ">
              💳 Payment Required
            </h2>


            <p>
              CBT Exam Access के लिए पहले Payment करें।
            </p>


            <h1
              id="paymentAmountDisplay"
              style="
                color:#16a34a;
                font-size:42px;
                font-weight:bold;
              "
            >
              ₹${amount}
            </h1>


            <!-- UPI QR -->
            <img
              src="assets/upi-qr.png"
              alt="UPI QR Code"
              style="
                width:220px;
                border-radius:12px;
                margin:15px 0;
              "
            >


            <br>


            <!-- UPI PAYMENT BUTTON -->
            <a
              href="${upiLink}"
              style="
                text-decoration:none;
              "
            >

              <button
                type="button"
                style="
                  width:100%;
                  padding:14px;
                  background:#0066ff;
                  color:white;
                  border:none;
                  border-radius:10px;
                  font-size:18px;
                  cursor:pointer;
                "
              >
                💳 Pay with Any UPI App
              </button>

            </a>


            <br><br>


            <p>
              <b>
                UPI ID
              </b>
            </p>


            <div style="
              background:#f1f1f1;
              padding:12px;
              border-radius:8px;
              font-size:17px;
              font-weight:bold;
              word-break:break-all;
            ">
              ${upiId}
            </div>


            <br>


            <!-- COPY UPI -->
            <button
              type="button"
              onclick="window.copyUPI()"
              style="
                width:100%;
                padding:12px;
                background:#333;
                color:white;
                border:none;
                border-radius:8px;
                cursor:pointer;
              "
            >
              📋 Copy UPI ID
            </button>


            <br><br>


            <!-- PAYMENT SCREENSHOT -->
            <input
              type="file"
              id="paymentScreenshot"
              accept="image/*"
              style="
                width:100%;
                padding:10px;
                margin-top:15px;
                box-sizing:border-box;
              "
            >


            <br><br>


            <!-- SUBMIT PAYMENT PROOF -->
            <button
              id="submitPaymentProofBtn"
              type="button"
              onclick="window.uploadPaymentProof()"
              style="
                width:100%;
                padding:14px;
                background:#16a34a;
                color:white;
                border:none;
                border-radius:10px;
                font-size:18px;
                font-weight:bold;
                cursor:pointer;
              "
            >
              📤 Submit Payment Proof
            </button>


            <p style="
              margin-top:15px;
              color:#666;
              font-size:14px;
              line-height:1.5;
            ">
              After successful payment verification
              by the Admin, your CBT Exam Access
              will be activated.
            </p>

          </div>

        `;

        return;

      }


      // =================================================
      // 4. EXPIRY CHECK
      // =================================================

      let expiry =
        defaultExpiryDate;


      if (
        data.expiryDate &&
        typeof data.expiryDate.toDate ===
          "function"
      ) {

        expiry =
          data.expiryDate.toDate();

      }


      if (now > expiry) {

        await counterRef.update({

          active:
            false

        });


        document.getElementById(
          "count"
        ).innerHTML = `

          <div style="
            text-align:center;
            padding:20px;
          ">

            <h2>
              ❌ QR Expired
            </h2>

            <p>
              Please renew fees.
            </p>

          </div>

        `;

        return;

      }


      // =================================================
      // 5. SCAN LIMIT CHECK
      // =================================================

      const currentCount =
        data.count || 0;


      const scanLimit =
        Number(
          data.scanLimit ??
          Infinity
        );


      const unlimited =
        data.unlimited === true;


      if (
        !unlimited &&
        currentCount >=
          scanLimit
      ) {

        await counterRef.update({

          active:
            false

        });


        document.getElementById(
          "count"
        ).innerHTML = `

          <div style="
            text-align:center;
            padding:20px;
          ">

            <h2>
              ❌ Scan Limit Reached
            </h2>

          </div>

        `;

        return;

      }


      // =================================================
      // 6. SUCCESS - RECORD ATTENDANCE
      // =================================================

      const newCount =
        currentCount + 1;


      await counterRef.update({

        count:
          newCount,

        lastScan:
          now

      });


      // =================================================
      // LOG SCAN TO GOOGLE SHEET
      // FIRE AND FORGET
      // =================================================

      fetch(
        CONFIG.SHEET_URL,
        {

          method: "POST",

          mode: "no-cors",

          body:
            JSON.stringify({

              studentId:
                studentId,

              scanCount:
                newCount

            })

        }
      )
      .catch(error => {

        console.error(
          "Sheet log error:",
          error
        );

      });


    }


    // ==================================================
    // NEW STUDENT
    // ==================================================

    else {

      await counterRef.set({

        count:
          1,

        active:
          true,

        scanLimit:
          100,

        unlimited:
          false,

        paymentStatus:
          "pending",

        paymentAmount:
          await getPaymentAmount(),

        createdAt:
          now,

        expiryDate:
          defaultExpiryDate,

        lastScan:
          now

      });

    }


    // ==================================================
    // SECURE CBT REDIRECT
    // ==================================================

    const latestDoc =
      await counterRef.get();


    if (
      latestDoc.exists &&
      latestDoc.data().paymentStatus ===
        "approved"
    ) {


      document.getElementById(
        "count"
      ).innerHTML = `

        <div style="
          text-align:center;
          padding:25px;
        ">

          <div style="
            font-size:50px;
          ">
            ✅
          </div>

          <h2 style="
            color:green;
          ">
            Access Granted
          </h2>

          <p>
            Opening CBT Exam...
          </p>

        </div>

      `;


      setTimeout(() => {

        window.location.href =
          CONFIG.EXAM_URL;

      }, 2000);


    } else {


      document.getElementById(
        "count"
      ).innerHTML = `

        <div style="
          text-align:center;
          padding:25px;
        ">

          <div style="
            font-size:45px;
          ">
            ⏳
          </div>

          <h2>
            Payment Verification Required
          </h2>

          <p>
            Please wait for Admin approval.
          </p>

        </div>

      `;

    }


  } catch (error) {

    console.error(
      "Main logic error:",
      error
    );


    document.getElementById(
      "count"
    ).innerHTML = `

      <div style="
        text-align:center;
        padding:20px;
      ">

        <h2>
          ❌ Error
        </h2>

        <p>
          ${error.message}
        </p>

      </div>

    `;

  }

}


// ======================================================
// RUN MAIN LOGIC
// ======================================================

runMainLogic();});
const payload = {
  action: "payment",
  studentId: studentId,
  amount: await getPaymentAmount(),
  paymentStatus: "verification_pending",
  fileName: file.name,
  mimeType: file.type,
  image: base64
};

console.log(payload);

await fetch(CONFIG.SHEET_URL, {
  method: "POST",
  body: JSON.stringify(payload)
});

await db.collection("qrData")
.doc(studentId)
.update({

paymentStatus:"verification_pending"

});


document.getElementById("count").innerHTML=`

<div style="text-align:center;padding:20px;">

<h2 style="color:green;">
✅ Payment Submitted
</h2>

<p>
Screenshot received successfully.
</p>

<p>
Admin verification के बाद CBT Access मिलेगा।
</p>

</div>

`;


}

catch(error){

alert(error.message);

}


};


reader.readAsDataURL(file);


}
window.paymentDone = async function() {
  let currentPaymentAmount = await getPaymentAmount(); // Default value
  const amountElement = document.getElementById("paymentAmountDisplay");
  if (amountElement) {
    currentPaymentAmount = parseFloat(amountElement.innerText.replace("тВ╣", "")) || 1;
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
 // Send data to Google Sheet

const payload = {

  action: "payment",

  studentId: studentId,

  amount: currentPaymentAmount,

  paymentStatus: "verification_pending",

  paymentProofURL: ""

};

console.log("Sending Payment Data:", payload);


const response = await fetch(CONFIG.SHEET_URL, {

  method: "POST",

  headers: {
    "Content-Type": "application/json"
  },

  body: JSON.stringify(payload)

});
    // Note: With mode: 'no-cors', we cannot read the response body or status.
    console.log("Google Sheet request sent");

    document.getElementById("count").innerHTML = `
      <div style="text-align:center; padding:20px;">
        <h2 style="color:green;">✅ Payment Submitted</h2>
       <p>Your payment has been submitted successfully.</p>
<p>After admin verification, CBT Exam access will be activated.</p>
        <button onclick="location.reload()" style="padding:10px; margin-top:10px;">Refresh Page</button>
      </div>
    `;
  } catch (error) {
    alert("Error submitting payment: " + error.message);
    console.error("Payment submission error:", error);
    document.getElementById("count").innerHTML = `
      <h2>тЭМ Error</h2>
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
              тЬЕ Approve
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
       const amount = data.paymentAmount || await getPaymentAmount();
       const upiId = CONFIG.UPI_ID;
        const upiLink = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent("COACHsir Academy")}&am=${amount}&cu=INR`;

        document.getElementById("count").innerHTML = `
          <div style="max-width:400px;margin:auto;background:#fff;padding:20px;border-radius:15px;box-shadow:0 0 15px rgba(0,0,0,.2);text-align:center;">
           <h2 style="color:#0066ff;">💳 Payment Required</h2>

<p>CBT Exam Access के लिए पहले Payment करें।</p>
           <h1 style="color:#16a34a;font-size:42px;font-weight:bold;" id="paymentAmountDisplay">
₹${amount}
</h1>
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
            <input type="file" id="paymentScreenshot" accept="image/*"
style="width:100%;padding:10px;margin-top:15px;">

<br><br>

<button onclick="window.uploadPaymentProof()" 
style="width:100%;padding:14px;background:green;color:white;border:none;border-radius:10px;font-size:18px;">
📤 Submit Payment Proof
</button>
           <p style="margin-top:15px;color:#666;font-size:14px;">
After successful payment verification by the Admin, your CBT Exam Access will be activated.
</p>
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

  headers: {
    "Content-Type": "application/json"
  },

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
       paymentAmount: await getPaymentAmount(),
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
    window.location.href = CONFIG.EXAM_URL;
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
   document.getElementById("count").innerHTML =
"❌ Error: " + error.message;
  }
}

// Run the logic
runMainLogic();
        
