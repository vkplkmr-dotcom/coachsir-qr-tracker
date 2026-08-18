// ======================================================
// COACHsir ACADEMY - QR TRACKER
// ======================================================
// Firebase SDK v8.10.1 must be loaded in index.html
// ======================================================


// ======================================================
// CONFIG
// ======================================================

const CONFIG = {

  UPI_ID: "vkplkmr-1@oksbi",

  EXAM_URL:
    "https://coachsiracademy.onlinetestpanel.com/",

  SHEET_URL:
    "https://script.google.com/macros/s/AKfycby5inXpjWD10lIzHkOku21RwhVlMh9htuDOxwkb3mFwxR6BooQ0L-f6YArf8sNv4WbE/exec"

};


// ======================================================
// STUDENT ID
// Example:
// index.html?id=S001
// ======================================================

const params = new URLSearchParams(window.location.search);

const studentId =
  params.get("id") || "general";

const isAdmin =
  params.get("admin") === "1234";


// ======================================================
// FIRESTORE REFERENCE
// ======================================================

const counterRef =
  db.collection("qrData").doc(studentId);


// ======================================================
// DEFAULT EXPIRY
// IMPORTANT:
// This should only be used when creating a NEW student.
// Existing student's Firestore expiryDate is preferred.
// ======================================================

const defaultExpiryDate =
  new Date("2026-12-31T23:59:59");


// ======================================================
// GET PAYMENT AMOUNT
// ======================================================

async function getPaymentAmount() {

  try {

    const doc =
      await db
        .collection("settings")
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
// COPY UPI ID
// ======================================================

window.copyUPI = function () {

  navigator.clipboard
    .writeText(CONFIG.UPI_ID)

    .then(() => {

      alert("✅ UPI ID Copied");

    })

    .catch(() => {

      alert(
        "UPI ID: " +
        CONFIG.UPI_ID
      );

    });

};


// ======================================================
// ADMIN - APPROVE PAYMENT
// ======================================================

window.approvePayment =
  async function (id) {

    try {

      // Approval ke time se 30 days expiry
      const expiryDate =
        new Date();

      expiryDate.setDate(
        expiryDate.getDate() + 30
      );


      await db
        .collection("qrData")
        .doc(id)
        .update({

          paymentStatus:
            "approved",

          expiryDate:
            firebase.firestore.Timestamp
              .fromDate(expiryDate),

          active:
            true

        });


      alert(
        "✅ Payment Approved\n" +
        "Expiry: " +
        expiryDate.toLocaleDateString()
      );


      location.reload();


    } catch (error) {

      alert(
        "Error approving payment: " +
        error.message
      );

      console.error(
        "Error approving payment:",
        error
      );

    }

  };


// ======================================================
// UPLOAD PAYMENT PROOF
// ======================================================

window.uploadPaymentProof =
  async function () {

    const fileElement =
      document.getElementById(
        "paymentScreenshot"
      );


    if (!fileElement) {

      alert(
        "Payment upload field not found."
      );

      return;

    }


    const file =
      fileElement.files[0];


    if (!file) {

      alert(
        "Please upload payment screenshot"
      );

      return;

    }


    const reader =
      new FileReader();


    reader.onload =
      async function () {

        const base64 =
          reader.result.split(",")[1];


        try {

          const amount =
            await getPaymentAmount();


          const payload = {

            action:
              "payment",

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
            "Sending payment proof:",
            {
              studentId,
              amount,
              fileName: file.name
            }
          );


          // Send to Google Sheet
          await fetch(
            CONFIG.SHEET_URL,
            {

              method:
                "POST",

              body:
                JSON.stringify(payload)

            }
          );


          // Update Firestore
          await db
            .collection("qrData")
            .doc(studentId)
            .update({

              paymentStatus:
                "verification_pending"

            });


          const countElement =
            document.getElementById(
              "count"
            );


          if (countElement) {

            countElement.innerHTML = `

              <div style="
                text-align:center;
                padding:20px;
              ">

                <h2 style="color:green;">
                  ✅ Payment Submitted
                </h2>

                <p>
                  Screenshot received successfully.
                </p>

                <p>
                  Admin verification के बाद
                  CBT Access मिलेगा।
                </p>

              </div>

            `;

          }


        } catch (error) {

          console.error(
            "Payment proof error:",
            error
          );

          alert(
            "Error: " +
            error.message
          );

        }

      };


    reader.readAsDataURL(file);

  };


// ======================================================
// PAYMENT DONE
// ======================================================

window.paymentDone =
  async function () {

    try {

      let currentPaymentAmount =
        await getPaymentAmount();


      const amountElement =
        document.getElementById(
          "paymentAmountDisplay"
        );


      if (amountElement) {

        currentPaymentAmount =
          parseFloat(
            amountElement.innerText
              .replace("₹", "")
              .trim()
          ) || currentPaymentAmount;

      }


      console.log(
        "Payment amount:",
        currentPaymentAmount
      );


      // Check current payment status
      const doc =
        await db
          .collection("qrData")
          .doc(studentId)
          .get();


      if (
        doc.exists &&
        doc.data().paymentStatus ===
          "approved"
      ) {

        alert(
          "✅ Payment is already approved."
        );

        return;

      }


      // Update Firestore
      await db
        .collection("qrData")
        .doc(studentId)
        .update({

          paymentStatus:
            "verification_pending"

        });


      // Google Sheet payload
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


      console.log(
        "Sending Payment Data:",
        payload
      );


      await fetch(
        CONFIG.SHEET_URL,
        {

          method:
            "POST",

          headers: {
            "Content-Type":
              "application/json"
          },

          body:
            JSON.stringify(payload)

        }
      );


      const countElement =
        document.getElementById(
          "count"
        );


      if (countElement) {

        countElement.innerHTML = `

          <div style="
            text-align:center;
            padding:20px;
          ">

            <h2 style="color:green;">
              ✅ Payment Submitted
            </h2>

            <p>
              Your payment has been
              submitted successfully.
            </p>

            <p>
              After admin verification,
              CBT Exam access will be activated.
            </p>

            <button
              onclick="location.reload()"
              style="
                padding:10px;
                margin-top:10px;
              "
            >
              Refresh Page
            </button>

          </div>

        `;

      }


    } catch (error) {

      console.error(
        "Payment submission error:",
        error
      );


      alert(
        "Error submitting payment: " +
        error.message
      );

    }

  };


// ======================================================
// MAIN LOGIC
// ======================================================

async function runMainLogic() {

  try {

    console.log(
      "QR Tracker started..."
    );

    console.log(
      "Student ID:",
      studentId
    );


    const countElement =
      document.getElementById(
        "count"
      );


    if (!countElement) {

      console.error(
        "Element #count not found."
      );

      return;

    }


    // Initial loading
    countElement.innerHTML = `

      <div style="
        text-align:center;
        padding:30px;
      ">

        <h2>⏳ Loading...</h2>

        <p>
          Please wait...
        </p>

      </div>

    `;


    // ==================================================
    // GET STUDENT DOCUMENT
    // ==================================================

    const doc =
      await counterRef.get();


    // ==================================================
    // ADMIN PANEL
    // ==================================================

    if (isAdmin) {

      const snapshot =
        await db
          .collection("qrData")
          .get();


      let html =
        "<h2>🔐 Admin Panel</h2>";


      snapshot.forEach(
        d => {

          const data =
            d.data();


          html += `

            <div style="
              border:1px solid #ccc;
              padding:10px;
              margin:10px;
              border-radius:8px;
            ">

              <b>
                ${d.id}
              </b>

              <br>

              Status:
              ${data.paymentStatus ||
                "pending"}

              <br><br>

              <button
                style="
                  cursor:pointer;
                  padding:10px;
                  position:relative;
                  z-index:9999;
                "
                onclick="
                  window.approvePayment(
                    '${d.id}'
                  )
                "
              >
                ✅ Approve
              </button>

            </div>

          `;

        }
      );


      countElement.innerHTML =
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


      // ================================================
      // 1. QR ACTIVE CHECK
      // ================================================

      if (data.active === false) {

        countElement.innerHTML = `

          <h2>
            ❌ QR Inactive
          </h2>

          <p>
            Please contact COACHsir Academy
          </p>

        `;

        return;

      }


      // ================================================
      // 2. PAYMENT VERIFICATION PENDING
      // ================================================

      if (
        data.paymentStatus ===
        "verification_pending"
      ) {

        countElement.innerHTML = `

          <div style="
            text-align:center;
            padding:20px;
          ">

            <h2>
              ⏳ Payment Verification Pending
            </h2>

            <p>
              Your payment has already
              been submitted.
            </p>

            <p>
              Please wait for admin approval.
            </p>

          </div>

        `;

        return;

      }


      // ================================================
      // 3. PAYMENT REQUIRED
      // ================================================

      if (
        data.paymentStatus !==
        "approved"
      ) {

        const amount =
          data.paymentAmount ||
          await getPaymentAmount();


        const upiId =
          CONFIG.UPI_ID;


        const upiLink =
          `upi://pay?pa=${
            encodeURIComponent(upiId)
          }&pn=${
            encodeURIComponent(
              "COACHsir Academy"
            )
          }&am=${
            amount
          }&cu=INR`;


        countElement.innerHTML = `

          <div style="
            max-width:400px;
            margin:auto;
            background:#fff;
            padding:20px;
            border-radius:15px;
            box-shadow:
              0 0 15px
              rgba(0,0,0,.2);
            text-align:center;
          ">

            <h2 style="
              color:#0066ff;
            ">
              💳 Payment Required
            </h2>


            <p>
              CBT Exam Access के लिए
              पहले Payment करें।
            </p>


            <h1
              style="
                color:#16a34a;
                font-size:42px;
                font-weight:bold;
              "
              id="paymentAmountDisplay"
            >
              ₹${amount}
            </h1>


            <img
              src="assets/upi-qr.png"
              style="
                width:220px;
                border-radius:12px;
                margin:15px 0;
              "
            >


            <br>


            <a href="${upiLink}">

              <button
                style="
                  width:100%;
                  padding:14px;
                  background:#0066ff;
                  color:white;
                  border:none;
                  border-radius:10px;
                  font-size:18px;
                "
              >
                💳 Pay with Any UPI App
              </button>

            </a>


            <br><br>


            <p>
              <b>UPI ID</b>
            </p>


            <div style="
              background:#f1f1f1;
              padding:12px;
              border-radius:8px;
              font-size:17px;
              font-weight:bold;
            ">

              ${upiId}

            </div>


            <br>


            <button
              onclick="
                window.copyUPI()
              "
              style="
                width:100%;
                padding:12px;
                background:#333;
                color:white;
                border:none;
                border-radius:8px;
              "
            >
              📋 Copy UPI ID
            </button>


            <br><br>


            <input
              type="file"
              id="paymentScreenshot"
              accept="image/*"
              style="
                width:100%;
                padding:10px;
                margin-top:15px;
              "
            >


            <br><br>


            <button
              onclick="
                window.uploadPaymentProof()
              "
              style="
                width:100%;
                padding:14px;
                background:green;
                color:white;
                border:none;
                border-radius:10px;
                font-size:18px;
              "
            >
              📤 Submit Payment Proof
            </button>


            <p style="
              margin-top:15px;
              color:#666;
              font-size:14px;
            ">

              After successful payment
              verification by the Admin,
              your CBT Exam Access
              will be activated.

            </p>

          </div>

        `;

        return;

      }


      // ================================================
      // 4. EXPIRY CHECK
      // ================================================

      let expiry =
        defaultExpiryDate;


      if (
        data.expiryDate
      ) {

        if (
          typeof data.expiryDate.toDate ===
          "function"
        ) {

          expiry =
            data.expiryDate.toDate();

        } else {

          const parsedExpiry =
            new Date(
              data.expiryDate
            );


          if (
            !isNaN(
              parsedExpiry.getTime()
            )
          ) {

            expiry =
              parsedExpiry;

          }

        }

      }


      console.log(
        "Expiry:",
        expiry
      );


      if (
        now > expiry
      ) {

        await counterRef.update({
          active: false
        });


        countElement.innerHTML = `

          <h2>
            ❌ QR Expired
          </h2>

          <p>
            Please renew fees
          </p>

        `;

        return;

      }


      // ================================================
      // 5. SCAN LIMIT
      // ================================================

      const currentCount =
        Number(data.count || 0);


      const scanLimit =
        Number(
          data.scanLimit ??
          Infinity
        );


      const unlimited =
        data.unlimited === true;


      if (
        !unlimited &&
        currentCount >= scanLimit
      ) {

        await counterRef.update({
          active: false
        });


        countElement.innerHTML = `

          <h2>
            ❌ Scan Limit Reached
          </h2>

        `;

        return;

      }


      // ================================================
      // 6. RECORD SCAN
      // ================================================

      const newCount =
        currentCount + 1;


      await counterRef.update({

        count:
          newCount,

        lastScan:
          firebase.firestore.Timestamp
            .fromDate(now)

      });


      // ================================================
      // GOOGLE SHEET LOG
      // ================================================

      fetch(
        CONFIG.SHEET_URL,
        {

          method:
            "POST",

          headers: {
            "Content-Type":
              "application/json"
          },

          body:
            JSON.stringify({

              studentId:
                studentId,

              scanCount:
                newCount

            })

        }

      ).catch(
        error => {

          console.error(
            "Sheet log error:",
            error
          );

        }
      );

    }


    // ==================================================
    // NEW STUDENT
    // ==================================================

    else {

      const paymentAmount =
        await getPaymentAmount();


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
          paymentAmount,

        createdAt:
          firebase.firestore.Timestamp
            .fromDate(now),

        expiryDate:
          firebase.firestore.Timestamp
            .fromDate(defaultExpiryDate),

        lastScan:
          firebase.firestore.Timestamp
            .fromDate(now)

      });

    }


    // ==================================================
    // CHECK PAYMENT AGAIN
    // ==================================================

    const latestDoc =
      await counterRef.get();


    if (
      latestDoc.exists &&
      latestDoc.data().paymentStatus ===
        "approved"
    ) {

      countElement.innerHTML = `

        <div style="
          text-align:center;
          padding:20px;
        ">

          <h2 style="color:green;">
            ✅ Access Granted
          </h2>

          <p>
            Opening CBT Exam...
          </p>

        </div>

      `;


      setTimeout(
        function () {

          window.location.href =
            CONFIG.EXAM_URL;

        },
        2000
      );


    } else {

      countElement.innerHTML = `

        <div style="
          text-align:center;
          padding:20px;
        ">

          <h2>
            ⏳ Payment Verification Required
          </h2>

          <p>
            Please wait for approval.
          </p>

        </div>

      `;

    }


  } catch (error) {

    console.error(
      "Main logic error:",
      error
    );


    const countElement =
      document.getElementById(
        "count"
      );


    if (countElement) {

      countElement.innerHTML = `

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

}


// ======================================================
// START QR TRACKER
// ======================================================

runMainLogic();

reader.onload = async function(){

const base64 = reader.result.split(",")[1];


try{

console.log("Sending Data", {
  studentId: studentId,
  amount: await getPaymentAmount(),
  paymentStatus: "verification_pending",
  fileName: file.name,
  mimeType: file.type,
  imageLength: base64.length
});
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
        

reader.onload = async function(){

const base64 = reader.result.split(",")[1];


try{

console.log("Sending Data", {
  studentId: studentId,
  amount: await getPaymentAmount(),
  paymentStatus: "verification_pending",
  fileName: file.name,
  mimeType: file.type,
  imageLength: base64.length
});
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
        
