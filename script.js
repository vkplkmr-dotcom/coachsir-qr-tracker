// ======================================================
// COACHsir ACADEMY - QR TRACKER
// ======================================================
// Firebase SDK v8.10.1 must be loaded BEFORE this file
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
// ======================================================

const params =
  new URLSearchParams(window.location.search);

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
// Only used for NEW students
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

      return Number(
        doc.data().amount
      ) || 30;

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
// COPY UPI
// ======================================================

window.copyUPI = function () {

  if (
    navigator.clipboard &&
    navigator.clipboard.writeText
  ) {

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

  } else {

    alert(
      "UPI ID: " +
      CONFIG.UPI_ID
    );

  }

};


// ======================================================
// ADMIN - APPROVE PAYMENT
// ======================================================

window.approvePayment =
  async function (id) {

    try {

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
        "✅ Payment Approved\n\n" +
        "Expiry: " +
        expiryDate.toLocaleDateString()
      );


      location.reload();


    } catch (error) {

      console.error(
        "Approve payment error:",
        error
      );

      alert(
        "❌ Error approving payment:\n" +
        error.message
      );

    }

  };


// ======================================================
// PAYMENT PROOF UPLOAD
// ======================================================

window.uploadPaymentProof =
  async function () {

    try {

      const fileElement =
        document.getElementById(
          "paymentScreenshot"
        );


      if (!fileElement) {

        alert(
          "❌ Payment upload field not found."
        );

        return;

      }


      const file =
        fileElement.files[0];


      if (!file) {

        alert(
          "Please upload payment screenshot."
        );

        return;

      }


      // FileReader
      const reader =
        new FileReader();


      reader.onload =
        async function () {

          try {

            const base64 =
              reader.result
                .split(",")[1];


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
                studentId:
                  studentId,

                amount:
                  amount,

                fileName:
                  file.name
              }
            );


            // Google Sheet
            await fetch(
              CONFIG.SHEET_URL,
              {

                method:
                  "POST",

                body:
                  JSON.stringify(payload)

              }
            );


            // Firestore
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
                  padding:25px;
                ">

                  <h2 style="
                    color:green;
                  ">
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
              "❌ Error:\n" +
              error.message
            );

          }

        };


      reader.readAsDataURL(file);


    } catch (error) {

      console.error(
        "Upload error:",
        error
      );

      alert(
        "❌ Upload Error:\n" +
        error.message
      );

    }

  };


// ======================================================
// PAYMENT DONE
// ======================================================

window.paymentDone =
  async function () {

    try {

      let amount =
        await getPaymentAmount();


      const amountElement =
        document.getElementById(
          "paymentAmountDisplay"
        );


      if (amountElement) {

        const text =
          amountElement.innerText
            .replace("₹", "")
            .trim();


        const parsed =
          parseFloat(text);


        if (!isNaN(parsed)) {

          amount =
            parsed;

        }

      }


      // Get student
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


      // Google Sheet
      const payload = {

        action:
          "payment",

        studentId:
          studentId,

        amount:
          amount,

        paymentStatus:
          "verification_pending",

        paymentProofURL:
          ""

      };


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
            padding:25px;
          ">

            <h2 style="
              color:green;
            ">
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
                padding:10px 20px;
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
        "❌ Error submitting payment:\n" +
        error.message
      );

    }

  };


// ======================================================
// SHOW PAYMENT PAGE
// ======================================================

async function showPaymentPage(
  data,
  countElement
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
      box-shadow:0 0 15px rgba(0,0,0,.2);
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
        id="paymentAmountDisplay"
        style="
          color:#16a34a;
          font-size:42px;
          font-weight:bold;
        "
      >
        ₹${amount}
      </h1>


      <img
        src="assets/upi-qr.png"
        alt="UPI QR"
        style="
          width:220px;
          border-radius:12px;
          margin:15px 0;
        "
      >


      <br>


      <a
        href="${upiLink}"
        style="
          text-decoration:none;
        "
      >

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
        onclick="window.copyUPI()"
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
        onclick="window.uploadPaymentProof()"
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

        After successful payment verification
        by the Admin, your CBT Exam Access
        will be activated.

      </p>

    </div>

  `;

}


// ======================================================
// ADMIN PANEL
// ======================================================

async function showAdminPanel(
  countElement
) {

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
          padding:15px;
          margin:10px 0;
          border-radius:8px;
        ">

          <b>
            Student ID:
            ${d.id}
          </b>

          <br><br>

          Status:
          ${
            data.paymentStatus ||
            "pending"
          }

          <br>

          Count:
          ${
            data.count ||
            0
          }

          <br><br>

          <button
            onclick="
              window.approvePayment(
                '${d.id}'
              )
            "
            style="
              cursor:pointer;
              padding:10px 20px;
              position:relative;
              z-index:9999;
            "
          >
            ✅ Approve Payment
          </button>

        </div>

      `;

    }
  );


  countElement.innerHTML =
    html;

}


// ======================================================
// MAIN LOGIC
// ======================================================

async function runMainLogic() {

  const countElement =
    document.getElementById(
      "count"
    );


  try {

    console.log(
      "================================"
    );

    console.log(
      "COACHsir QR Tracker Started"
    );

    console.log(
      "Student ID:",
      studentId
    );

    console.log(
      "================================"
    );


    // Check HTML
    if (!countElement) {

      console.error(
        "❌ #count element not found"
      );

      return;

    }


    // Check Firebase
    if (
      typeof firebase ===
      "undefined"
    ) {

      throw new Error(
        "Firebase SDK not loaded."
      );

    }


    if (
      typeof db ===
      "undefined"
    ) {

      throw new Error(
        "Firestore database (db) not initialized."
      );

    }


    // Loading
    countElement.innerHTML = `

      <div style="
        text-align:center;
        padding:30px;
      ">

        <h2>
          ⏳ Loading...
        </h2>

        <p>
          Please wait...
        </p>

      </div>

    `;


    // ==================================================
    // ADMIN
    // ==================================================

    if (isAdmin) {

      await showAdminPanel(
        countElement
      );

      return;

    }


    // ==================================================
    // GET STUDENT
    // ==================================================

    let doc =
      await counterRef.get();


    const now =
      new Date();


    // ==================================================
    // NEW STUDENT
    // ==================================================

    if (!doc.exists) {

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


      // Get again
      doc =
        await counterRef.get();

    }


    // ==================================================
    // STUDENT DATA
    // ==================================================

    const data =
      doc.data();


    // ==================================================
    // ACTIVE CHECK
    // ==================================================

    if (data.active === false) {

      countElement.innerHTML = `

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


    // ==================================================
    // PAYMENT PENDING
    // ==================================================

    if (
      data.paymentStatus ===
      "verification_pending"
    ) {

      countElement.innerHTML = `

        <div style="
          text-align:center;
          padding:25px;
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


    // ==================================================
    // PAYMENT REQUIRED
    // ==================================================

    if (
      data.paymentStatus !==
      "approved"
    ) {

      await showPaymentPage(
        data,
        countElement
      );

      return;

    }


    // ==================================================
    // EXPIRY CHECK
    // ==================================================

    let expiry =
      defaultExpiryDate;


    if (data.expiryDate) {

      if (
        typeof data.expiryDate.toDate ===
        "function"
      ) {

        expiry =
          data.expiryDate.toDate();

      } else {

        const parsed =
          new Date(
            data.expiryDate
          );


        if (
          !isNaN(
            parsed.getTime()
          )
        ) {

          expiry =
            parsed;

        }

      }

    }


    console.log(
      "Expiry:",
      expiry
    );


    if (now > expiry) {

      await counterRef.update({

        active:
          false

      });


      countElement.innerHTML = `

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


    // ==================================================
    // SCAN LIMIT
    // ==================================================

    const currentCount =
      Number(
        data.count || 0
      );


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

        active:
          false

      });


      countElement.innerHTML = `

        <div style="
          text-align:center;
          padding:20px;
        ">

          <h2>
            ❌ Scan Limit Reached
          </h2>

          <p>
            Please contact COACHsir Academy.
          </p>

        </div>

      `;

      return;

    }


    // ==================================================
    // RECORD SCAN
    // ==================================================

    const newCount =
      currentCount + 1;


    await counterRef.update({

      count:
        newCount,

      lastScan:
        firebase.firestore.Timestamp
          .fromDate(now)

    });


    console.log(
      "Scan Count:",
      newCount
    );


    // ==================================================
    // GOOGLE SHEET LOG
    // ==================================================

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
          "Google Sheet log error:",
          error
        );

      }
    );


    // ==================================================
    // ACCESS GRANTED
    // ==================================================

    countElement.innerHTML = `

      <div style="
        text-align:center;
        padding:25px;
      ">

        <h2 style="
          color:green;
        ">
          ✅ Access Granted
        </h2>

        <p>
          Opening CBT Exam...
        </p>

      </div>

    `;


    // Redirect
    setTimeout(
      function () {

        window.location.href =
          CONFIG.EXAM_URL;

      },
      2000
    );


  } catch (error) {

    console.error(
      "❌ MAIN LOGIC ERROR:",
      error
    );


    if (countElement) {

      countElement.innerHTML = `

        <div style="
          text-align:center;
          padding:25px;
        ">

          <h2>
            ❌ QR Tracker Error
          </h2>

          <p style="
            color:#c00;
            word-break:break-word;
          ">
            ${error.message}
          </p>

          <button
            onclick="location.reload()"
            style="
              padding:10px 20px;
              margin-top:10px;
            "
          >
            🔄 Retry
          </button>

        </div>

      `;

    }

  }

}


// ======================================================
// START
// ======================================================

runMainLogic();
