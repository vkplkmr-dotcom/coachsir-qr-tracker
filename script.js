// ======================================================
// COACHsir ACADEMY - QR / CBT PAYMENT SYSTEM
// ======================================================
// Firebase SDK v8.10.1 must be loaded before this file
// ======================================================


// ======================================================
// CONFIG
// ======================================================

const CONFIG = {

  // UPI ID
  UPI_ID: "vkplkmr-1@oksbi",

  // CBT Exam URL
  EXAM_URL: "https://coachsiracademy.onlinetestpanel.com/",

  // Fallback expiry date
  // Student document ki expiryDate ko priority milegi.
  EXPIRY_DATE: new Date("2026-12-31T23:59:59")

};


// ======================================================
// GOOGLE SHEET URL
// ======================================================

CONFIG.SHEET_URL =
  "https://script.google.com/macros/s/AKfycby5inXpjWD10lIzHkOku21RwhVlMh9htuDOxwkb3mFwxR6BooQ0L-f6YArf8sNv4WbE/exec";


// ======================================================
// URL PARAMETERS
// ======================================================

const params =
  new URLSearchParams(window.location.search);

const studentId =
  params.get("id") || "general";


// ======================================================
// ADMIN CHECK
// ======================================================

const isAdmin =
  params.get("admin") === "1234";


// ======================================================
// FIRESTORE REFERENCE
// ======================================================

const counterRef =
  db.collection("qrData").doc(studentId);


// ======================================================
// DEFAULT EXPIRY
// ======================================================

const defaultExpiryDate =
  CONFIG.EXPIRY_DATE;


// ======================================================
// SAFE ELEMENT
// ======================================================

function getCountElement() {

  return document.getElementById("count");

}


// ======================================================
// SHOW MESSAGE
// ======================================================

function showMessage(html) {

  const element =
    getCountElement();

  if (element) {

    element.innerHTML =
      html;

  }

}


// ======================================================
// PAYMENT AMOUNT
// ======================================================

async function getPaymentAmount() {

  try {

    const doc =
      await db.collection("settings")
        .doc("payment")
        .get();

    if (doc.exists) {

      const amount =
        Number(doc.data().amount);

      if (
        Number.isFinite(amount) &&
        amount > 0
      ) {

        return amount;

      }

    }

  } catch (error) {

    console.error(
      "Payment amount error:",
      error
    );

  }

  return 30;

}


// ======================================================
// DATE PARSER
// Supports:
//
// Firestore Timestamp
// Date
// YYYY-MM-DD
// DD/MM/YYYY
// DD-MM-YYYY
// Aug 29, 2026
// Aug 29,2026
// 29 Aug 2026
// ======================================================

function parseExpiryDate(value) {

  if (!value) {

    return new Date(
      defaultExpiryDate.getTime()
    );

  }


  // Firestore Timestamp

  if (
    typeof value.toDate ===
    "function"
  ) {

    const date =
      value.toDate();

    if (
      date instanceof Date &&
      !isNaN(date.getTime())
    ) {

      return date;

    }

  }


  // JavaScript Date

  if (
    value instanceof Date
  ) {

    if (
      !isNaN(value.getTime())
    ) {

      return value;

    }

  }


  // String

  if (
    typeof value ===
    "string"
  ) {

    const text =
      value.trim();

    // YYYY-MM-DD

    let match =
      text.match(
        /^(\d{4})-(\d{1,2})-(\d{1,2})$/
      );

    if (match) {

      const year =
        Number(match[1]);

      const month =
        Number(match[2]) - 1;

      const day =
        Number(match[3]);

      const date =
        new Date(
          year,
          month,
          day,
          23,
          59,
          59
        );

      if (
        !isNaN(date.getTime())
      ) {

        return date;

      }

    }


    // DD/MM/YYYY

    match =
      text.match(
        /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/
      );

    if (match) {

      const day =
        Number(match[1]);

      const month =
        Number(match[2]) - 1;

      const year =
        Number(match[3]);

      const date =
        new Date(
          year,
          month,
          day,
          23,
          59,
          59
        );

      if (
        !isNaN(date.getTime())
      ) {

        return date;

      }

    }


    // DD-MM-YYYY

    match =
      text.match(
        /^(\d{1,2})-(\d{1,2})-(\d{4})$/
      );

    if (match) {

      const day =
        Number(match[1]);

      const month =
        Number(match[2]) - 1;

      const year =
        Number(match[3]);

      const date =
        new Date(
          year,
          month,
          day,
          23,
          59,
          59
        );

      if (
        !isNaN(date.getTime())
      ) {

        return date;

      }

    }


    // Month formats

    const parsed =
      new Date(text);

    if (
      !isNaN(parsed.getTime())
    ) {

      parsed.setHours(
        23,
        59,
        59,
        999
      );

      return parsed;

    }

  }


  // Fallback

  return new Date(
    defaultExpiryDate.getTime()
  );

}


// ======================================================
// FORMAT DATE
// ======================================================

function formatExpiryDate(value) {

  const date =
    parseExpiryDate(value);

  return date.toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric"
    }
  );

}


// ======================================================
// COPY UPI
// ======================================================

window.copyUPI =
  async function () {

    const upi =
      CONFIG.UPI_ID;

    try {

      if (
        navigator.clipboard &&
        navigator.clipboard.writeText
      ) {

        await navigator.clipboard.writeText(
          upi
        );

        alert(
          "UPI ID Copied"
        );

      } else {

        alert(
          "UPI ID: " + upi
        );

      }

    } catch (error) {

      console.error(
        "Copy UPI error:",
        error
      );

      alert(
        "UPI ID: " + upi
      );

    }

  };


// ======================================================
// ADMIN APPROVE PAYMENT
// ======================================================

window.approvePayment =
  async function (id) {

    try {

      if (!id) {

        alert(
          "Invalid Student ID"
        );

        return;

      }


      await db.collection("qrData")
        .doc(id)
        .update({

          paymentStatus:
            "approved",

          paymentApprovedAt:
            new Date()

        });


      alert(
        "Payment Approved"
      );


      location.reload();


    } catch (error) {

      console.error(
        "Approve payment error:",
        error
      );

      alert(
        "Error approving payment: " +
        error.message
      );

    }

  };


// ======================================================
// RESET SUBMIT BUTTON
// ======================================================

function resetUploadButton() {

  const button =
    document.getElementById(
      "submitPaymentProofBtn"
    );

  if (!button) {

    return;

  }

  button.disabled =
    false;

  button.innerHTML =
    "📤 Submit Payment Proof";

  button.style.opacity =
    "1";

  button.style.cursor =
    "pointer";

}


// ======================================================
// PAYMENT PROOF UPLOAD
// ======================================================

window.uploadPaymentProof =
  async function () {

    const fileInput =
      document.getElementById(
        "paymentScreenshot"
      );


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


    // File type

    if (
      !file.type ||
      !file.type.startsWith("image/")
    ) {

      alert(
        "Please select a valid image file."
      );

      return;

    }


    // File size

    if (
      file.size >
      5 * 1024 * 1024
    ) {

      alert(
        "Screenshot size should be less than 5 MB."
      );

      return;

    }


    // Button

    const button =
      document.getElementById(
        "submitPaymentProofBtn"
      );


    if (button) {

      button.disabled =
        true;

      button.innerHTML =
        "⏳ Uploading...";

      button.style.opacity =
        "0.7";

      button.style.cursor =
        "not-allowed";

    }


    try {

      // Check student

      const studentDoc =
        await counterRef.get();


      if (!studentDoc.exists) {

        throw new Error(
          "Student record not found."
        );

      }


      if (
        studentDoc.data().paymentStatus ===
        "approved"
      ) {

        alert(
          "Payment is already approved."
        );

        resetUploadButton();

        return;

      }


      const amount =
        await getPaymentAmount();


      // Read image

      const reader =
        new FileReader();


      reader.onload =
        async function () {

          try {

            const result =
              reader.result;


            if (!result) {

              throw new Error(
                "Unable to read payment screenshot."
              );

            }


            const parts =
              result.split(",");


            const base64 =
              parts.length > 1
                ? parts[1]
                : "";


            if (!base64) {

              throw new Error(
                "Invalid image data."
              );

            }


            // Payment payload

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
              "Payment proof sending...",
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

                mode:
                  "no-cors",

                body:
                  JSON.stringify(
                    payload
                  )

              }
            );


            // Firebase

            await counterRef.update({

              paymentStatus:
                "verification_pending",

              paymentSubmittedAt:
                new Date(),

              paymentAmount:
                amount

            });


            // Success

            showMessage(`

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

            `);


          } catch (error) {

            console.error(
              "Payment proof error:",
              error
            );

            resetUploadButton();

            alert(
              "Payment submission failed: " +
              error.message
            );

          }

        };


      reader.onerror =
        function () {

          resetUploadButton();

          alert(
            "Unable to read screenshot."
          );

        };


      reader.readAsDataURL(
        file
      );


    } catch (error) {

      console.error(
        "Upload error:",
        error
      );

      resetUploadButton();

      alert(
        "Error: " +
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

      const doc =
        await counterRef.get();


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


      const amountElement =
        document.getElementById(
          "paymentAmountDisplay"
        );


      let amount =
        await getPaymentAmount();


      if (amountElement) {

        const text =
          amountElement.innerText
            .replace("₹", "")
            .trim();

        const parsed =
          parseFloat(text);

        if (
          Number.isFinite(parsed) &&
          parsed > 0
        ) {

          amount =
            parsed;

        }

      }


      await counterRef.update({

        paymentStatus:
          "verification_pending",

        paymentSubmittedAt:
          new Date(),

        paymentAmount:
          amount

      });


      await fetch(
        CONFIG.SHEET_URL,
        {

          method:
            "POST",

          mode:
            "no-cors",

          body:
            JSON.stringify({

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

            })

        }
      );


      showMessage(`

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

      `);


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
// ADMIN PANEL
// ======================================================

async function showAdminPanel() {

  const snapshot =
    await db.collection("qrData")
      .get();


  let html = `

    <div style="
      max-width:600px;
      margin:auto;
      padding:10px;
    ">

      <div style="
        text-align:center;
        margin-bottom:20px;
      ">

        <h2>
          🔐 Admin Panel
        </h2>

        <p>
          Payment Verification
        </p>

      </div>

  `;


  snapshot.forEach(
    function (d) {

      const data =
        d.data();


      const status =
        data.paymentStatus ||
        "pending";


      html += `

        <div style="
          border:1px solid #ddd;
          padding:15px;
          margin:10px 0;
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

          ${status}

          <br><br>

          <button
            type="button"
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
            onclick="window.approvePayment('${d.id}')"
          >
            ✅ Approve Payment
          </button>

        </div>

      `;

    }
  );


  html += `
    </div>
  `;


  showMessage(
    html
  );

}


// ======================================================
// PAYMENT SCREEN
// ======================================================

async function showPaymentScreen(
  data
) {

  const storedAmount =
    Number(data.paymentAmount);


  const amount =
    storedAmount > 0
      ? storedAmount
      : await getPaymentAmount();


  const upiId =
    CONFIG.UPI_ID;


  const upiLink =
    "upi://pay" +
    "?pa=" +
    encodeURIComponent(upiId) +
    "&pn=" +
    encodeURIComponent(
      "COACHsir Academy"
    ) +
    "&am=" +
    encodeURIComponent(amount) +
    "&cu=INR";


  showMessage(`

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


      <img
        src="assets/upi-qr.png"
        alt="UPI QR Code"
        style="
          width:220px;
          max-width:100%;
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

  `);

}


// ======================================================
// PAYMENT PENDING SCREEN
// ======================================================

function showPendingScreen() {

  showMessage(`

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

      <button
        onclick="location.reload()"
        style="
          padding:10px 20px;
          margin-top:10px;
          border:none;
          border-radius:8px;
          background:#0066ff;
          color:white;
          color:white;
          cursor:pointer;
        "
      >
        Check Again
      </button>

    </div>

  `);

}


// ======================================================
// CBT REDIRECT
// ======================================================

function openCBT() {

  showMessage(`

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

  `);


  setTimeout(
    function () {

      window.location.href =
        CONFIG.EXAM_URL;

    },
    1500
  );

}


// ======================================================
// MAIN LOGIC
// ======================================================

async function runMainLogic() {

  try {

    // --------------------------------------------------
    // FIREBASE CHECK
    // --------------------------------------------------

    if (
      typeof db ===
      "undefined"
    ) {

      throw new Error(
        "Firebase database is not loaded. Check index.html Firebase scripts."
      );

    }


    // --------------------------------------------------
    // ADMIN
    // --------------------------------------------------

    if (isAdmin) {

      await showAdminPanel();

      return;

    }


    // --------------------------------------------------
    // GET STUDENT
    // --------------------------------------------------

    const doc =
      await counterRef.get();


    const now =
      new Date();


    // ==================================================
    // NEW STUDENT
    // ==================================================

    if (!doc.exists) {

      const amount =
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
          amount,

        createdAt:
          now,

        expiryDate:
          defaultExpiryDate,

        lastScan:
          now

      });


      // New student ko payment screen dikhao
      await showPaymentScreen({

        paymentAmount:
          amount

      });


      return;

    }


    // ==================================================
    // EXISTING STUDENT
    // ==================================================

    const data =
      doc.data();


    // --------------------------------------------------
    // ACTIVE CHECK
    // --------------------------------------------------

    if (
      data.active === false
    ) {

      showMessage(`

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

      `);

      return;

    }


    // ==================================================
    // EXPIRY CHECK
    // ==================================================

    const expiry =
      parseExpiryDate(
        data.expiryDate
      );


    if (
      now.getTime() >
      expiry.getTime()
    ) {

      await counterRef.update({

        active:
          false

      });


      showMessage(`

        <div style="
          text-align:center;
          padding:20px;
        ">

          <h2>
            ❌ QR Expired
          </h2>

          <p>
            Valid Till:
            <b>
              ${formatExpiryDate(expiry)}
            </b>
          </p>

          <p>
            Please renew fees.
          </p>

        </div>

      `);

      return;

    }


    // ==================================================
    // PAYMENT STATUS
    // ==================================================

    const paymentStatus =
      data.paymentStatus ||
      "pending";


    // --------------------------------------------------
    // APPROVED
    // --------------------------------------------------

    if (
      paymentStatus ===
      "approved"
    ) {

      // Approved student ko CBT access
      openCBT();

      return;

    }


    // --------------------------------------------------
    // VERIFICATION PENDING
    // --------------------------------------------------

    if (
      paymentStatus ===
      "verification_pending"
    ) {

      showPendingScreen();

      return;

    }


    // --------------------------------------------------
    // PAYMENT REQUIRED
    // --------------------------------------------------

    await showPaymentScreen(
      data
    );

  } catch (error) {

    console.error(
      "MAIN LOGIC ERROR:",
      error
    );


    showMessage(`

      <div style="
        text-align:center;
        padding:20px;
      ">

        <h2>
          ❌ Error
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

    `);

  }

}


// ======================================================
// START
// ======================================================

runMainLogic();
