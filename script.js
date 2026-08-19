// ======================================================
// COACHsir ACADEMY - QR TRACKER
// CLEAN + FIXED VERSION
// ======================================================


// ======================================================
// CONFIG
// ======================================================

const CONFIG = {

  UPI_ID: "vkplkmr-1@oksbi",

  EXAM_URL:
    "https://coachsiracademy.onlinetestpanel.com/",

  SHEET_URL:
    "https://script.google.com/macros/s/AKfycby5inXpjWD10lIzHkOku21RwhVlMh9htuDOxwkb3mFwxR6BooQ0L-f6YArf8sNv4WbE/exec",

  LOADING_TIMEOUT: 12000

};


// ======================================================
// URL PARAMETERS
// ======================================================

const params =
  new URLSearchParams(window.location.search);

const studentId =
  params.get("id") || "general";

const isAdmin =
  params.get("admin") === "1234";


// ======================================================
// DEFAULT EXPIRY
// ======================================================

const defaultExpiryDate =
  new Date("2026-12-31T23:59:59");


// ======================================================
// GLOBALS
// ======================================================

let loadingTimer = null;


// ======================================================
// GET COUNT ELEMENT
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

    element.innerHTML = html;

  }

}


// ======================================================
// SHOW ERROR
// ======================================================

function showError(error) {

  console.error(
    "COACHsir QR Tracker Error:",
    error
  );

  const message =
    error && error.message
      ? error.message
      : String(error);

  showMessage(`

    <div style="
      text-align:center;
      padding:25px;
      max-width:420px;
      margin:auto;
    ">

      <h2 style="
        color:#dc2626;
        margin-bottom:12px;
      ">
        ❌ Something went wrong
      </h2>

      <p style="
        margin-bottom:15px;
      ">
        ${message}
      </p>

      <button
        onclick="location.reload()"
        style="
          padding:11px 20px;
          border:none;
          border-radius:8px;
          background:#0b57d0;
          color:white;
          cursor:pointer;
          font-size:15px;
        "
      >
        🔄 Retry
      </button>

    </div>

  `);

}


// ======================================================
// LOADING SCREEN
// ======================================================

function showLoading() {

  showMessage(`

    <div style="
      text-align:center;
      padding:30px;
    ">

      <div style="
        width:42px;
        height:42px;
        border:4px solid #dbeafe;
        border-top:4px solid #0b57d0;
        border-radius:50%;
        animation:coachsirSpin 1s linear infinite;
        margin:0 auto 15px;
      "></div>

      <h2 style="
        color:#0b57d0;
        margin-bottom:8px;
      ">
        COACHsir QR Tracker
      </h2>

      <p>
        Loading...
      </p>

    </div>

    <style>
      @keyframes coachsirSpin {
        from {
          transform:rotate(0deg);
        }
        to {
          transform:rotate(360deg);
        }
      }
    </style>

  `);

}


// ======================================================
// LOADING WATCHDOG
// Prevent permanent Loading screen
// ======================================================

function startLoadingWatchdog() {

  clearTimeout(loadingTimer);

  loadingTimer =
    setTimeout(function () {

      const element =
        getCountElement();

      if (!element) {
        return;
      }

      // Agar abhi bhi Loading screen hai
      if (
        element.innerText.includes("Loading")
      ) {

        showMessage(`

          <div style="
            text-align:center;
            padding:25px;
          ">

            <h2>
              ⚠️ Loading is taking too long
            </h2>

            <p>
              Internet/Firebase connection check karein.
            </p>

            <button
              onclick="location.reload()"
              style="
                padding:11px 20px;
                margin-top:12px;
                border:none;
                border-radius:8px;
                background:#0b57d0;
                color:white;
                cursor:pointer;
              "
            >
              🔄 Retry
            </button>

          </div>

        `);

      }

    }, CONFIG.LOADING_TIMEOUT);

}


// ======================================================
// STOP LOADING WATCHDOG
// ======================================================

function stopLoadingWatchdog() {

  clearTimeout(loadingTimer);

}


// ======================================================
// FIRESTORE REFERENCE
// ======================================================

function getCounterRef() {

  if (
    typeof db === "undefined" ||
    !db
  ) {

    throw new Error(
      "Firestore database is not initialized. Please check firebase/config.js"
    );

  }

  return db
    .collection("qrData")
    .doc(studentId);

}


// ======================================================
// GET PAYMENT AMOUNT
// ======================================================

async function getPaymentAmount() {

  try {

    if (
      typeof db === "undefined" ||
      !db
    ) {

      return 30;

    }

    const doc =
      await db
        .collection("settings")
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

window.copyUPI =
  async function () {

    try {

      if (
        navigator.clipboard &&
        navigator.clipboard.writeText
      ) {

        await navigator.clipboard.writeText(
          CONFIG.UPI_ID
        );

        alert(
          "✅ UPI ID Copied"
        );

      } else {

        alert(
          "UPI ID: " +
          CONFIG.UPI_ID
        );

      }

    } catch (error) {

      alert(
        "UPI ID: " +
        CONFIG.UPI_ID
      );

    }

  };


// ======================================================
// GET EXPIRY DATE
// ======================================================

function getExpiryDate(data) {

  let expiry =
    defaultExpiryDate;

  if (
    !data ||
    !data.expiryDate
  ) {

    return expiry;

  }


  // Firestore Timestamp
  if (
    typeof data.expiryDate.toDate ===
    "function"
  ) {

    return data.expiryDate.toDate();

  }


  // JavaScript Date
  if (
    data.expiryDate instanceof Date
  ) {

    return data.expiryDate;

  }


  // String / Number
  const parsed =
    new Date(
      data.expiryDate
    );

  if (
    !isNaN(
      parsed.getTime()
    )
  ) {

    expiry = parsed;

  }

  return expiry;

}


// ======================================================
// SHOW PAYMENT PAGE
// ======================================================

async function showPaymentPage(amount) {

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


  showMessage(`

    <div style="
      max-width:400px;
      margin:auto;
      background:#fff;
      padding:20px;
      border-radius:15px;
      box-shadow:0 0 15px rgba(0,0,0,.15);
      text-align:center;
    ">

      <h2 style="
        color:#0066ff;
        margin-bottom:10px;
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
          margin:15px 0;
        "
      >
        ₹${amount}
      </h1>


      <img
        src="assets/upi-qr.png"
        style="
          width:220px;
          max-width:100%;
          border-radius:12px;
          margin:10px 0 15px;
        "
        onerror="
          this.style.display='none';
        "
      >


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
            cursor:pointer;
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
          margin-top:10px;
          box-sizing:border-box;
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
          cursor:pointer;
        "
      >
        📤 Submit Payment Proof
      </button>


      <p style="
        margin-top:15px;
        color:#666;
        font-size:14px;
      ">

        Payment verification के बाद
        CBT Exam Access activate होगा।

      </p>

    </div>

  `);

}


// ======================================================
// UPLOAD PAYMENT PROOF
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
          "Payment upload field not found."
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


      if (
        !file.type ||
        !file.type.startsWith("image/")
      ) {

        alert(
          "Please select a valid image file."
        );

        return;

      }


      showMessage(`

        <div style="
          text-align:center;
          padding:25px;
        ">

          <h2>
            ⏳ Uploading...
          </h2>

          <p>
            Please wait...
          </p>

        </div>

      `);


      const reader =
        new FileReader();


      reader.onload =
        async function () {

          try {

            const result =
              reader.result;

            const base64 =
              result.split(",")[1];

            if (!base64) {

              throw new Error(
                "Unable to read payment screenshot."
              );

            }


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
            const counterRef =
              getCounterRef();


            await counterRef.update({

              paymentStatus:
                "verification_pending"

            });


            showMessage(`

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

                <button
                  onclick="location.reload()"
                  style="
                    padding:10px 18px;
                    margin-top:10px;
                    border:none;
                    border-radius:8px;
                    cursor:pointer;
                  "
                >
                  🔄 Refresh
                </button>

              </div>

            `);


          } catch (error) {

            console.error(
              "Payment proof error:",
              error
            );

            showError(error);

          }

        };


      reader.onerror =
        function () {

          showError(
            new Error(
              "Unable to read screenshot."
            )
          );

        };


      reader.readAsDataURL(file);


    } catch (error) {

      showError(error);

    }

  };


// ======================================================
// PAYMENT DONE
// ======================================================

window.paymentDone =
  async function () {

    try {

      const counterRef =
        getCounterRef();


      let currentPaymentAmount =
        await getPaymentAmount();


      const amountElement =
        document.getElementById(
          "paymentAmountDisplay"
        );


      if (amountElement) {

        const parsed =
          parseFloat(
            amountElement.innerText
              .replace("₹", "")
              .trim()
          );

        if (
          !isNaN(parsed)
        ) {

          currentPaymentAmount =
            parsed;

        }

      }


      const doc =
        await counterRef.get();


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


      await counterRef.update({

        paymentStatus:
          "verification_pending"

      });


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


      showMessage(`

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
            Admin verification के बाद
            CBT Exam access activate होगा।
          </p>

          <button
            onclick="location.reload()"
            style="
              padding:10px 18px;
              margin-top:10px;
            "
          >
            🔄 Refresh
          </button>

        </div>

      `);


    } catch (error) {

      showError(error);

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


      // Approval date + 30 days
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
              .fromDate(
                expiryDate
              ),

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
// ADMIN PANEL
// ======================================================

async function showAdminPanel() {

  const countElement =
    getCountElement();


  if (!countElement) {

    throw new Error(
      "Element #count not found."
    );

  }


  countElement.innerHTML = `

    <div style="
      text-align:center;
      padding:20px;
    ">

      <h2>
        🔐 Admin Panel
      </h2>

      <p>
        Loading students...
      </p>

    </div>

  `;


  const snapshot =
    await db
      .collection("qrData")
      .get();


  let html =
    "<h2>🔐 Admin Panel</h2>";


  if (snapshot.empty) {

    html += `
      <p>
        No students found.
      </p>
    `;

  }


  snapshot.forEach(
    function (doc) {

      const data =
        doc.data();


      html += `

        <div style="
          border:1px solid #ccc;
          padding:12px;
          margin:10px;
          border-radius:8px;
        ">

          <b>
            Student ID:
            ${doc.id}
          </b>

          <br><br>

          Status:
          <b>
            ${data.paymentStatus || "pending"}
          </b>

          <br><br>

          Count:
          ${data.count || 0}

          <br><br>

          <button
            onclick="
              window.approvePayment('${doc.id}')
            "
            style="
              cursor:pointer;
              padding:10px 15px;
              position:relative;
              z-index:9999;
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

}


// ======================================================
// MAIN LOGIC
// ======================================================

async function runMainLogic() {

  const countElement =
    getCountElement();


  if (!countElement) {

    console.error(
      "Element #count not found."
    );

    return;

  }


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
      "Admin:",
      isAdmin
    );

    console.log(
      "================================"
    );


    // Show loading
    showLoading();

    startLoadingWatchdog();


    // ==================================================
    // CHECK FIREBASE
    // ==================================================

    if (
      typeof firebase ===
      "undefined"
    ) {

      throw new Error(
        "Firebase SDK is not loaded."
      );

    }


    if (
      typeof db ===
      "undefined" ||
      !db
    ) {

      throw new Error(
        "Firestore database is not initialized. Check firebase/config.js"
      );

    }


    const counterRef =
      getCounterRef();


    // ==================================================
    // ADMIN
    // ==================================================

    if (isAdmin) {

      await showAdminPanel();

      stopLoadingWatchdog();

      return;

    }


    // ==================================================
    // GET STUDENT
    // ==================================================

    const doc =
      await counterRef.get();


    const now =
      new Date();


    // ==================================================
    // EXISTING STUDENT
    // ==================================================

    if (doc.exists) {

      const data =
        doc.data();


      console.log(
        "Student data:",
        data
      );


      // ================================================
      // ACTIVE CHECK
      // ================================================

      if (
        data.active === false
      ) {

        stopLoadingWatchdog();

        showMessage(`

          <div style="
            text-align:center;
            padding:25px;
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


      // ================================================
      // PAYMENT VERIFICATION PENDING
      // ================================================

      if (
        data.paymentStatus ===
        "verification_pending"
      ) {

        stopLoadingWatchdog();

        showMessage(`

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

            <button
              onclick="location.reload()"
              style="
                padding:10px 18px;
                margin-top:10px;
                cursor:pointer;
              "
            >
              🔄 Refresh
            </button>

          </div>

        `);

        return;

      }


      // ================================================
      // PAYMENT REQUIRED
      // ================================================

      if (
        data.paymentStatus !==
        "approved"
      ) {

        const amount =
          Number(
            data.paymentAmount
          ) ||
          await getPaymentAmount();


        stopLoadingWatchdog();

        await showPaymentPage(
          amount
        );

        return;

      }


      // ================================================
      // EXPIRY CHECK
      // ================================================

      const expiry =
        getExpiryDate(data);


      console.log(
        "Expiry:",
        expiry
      );


      if (
        now.getTime() >
        expiry.getTime()
      ) {

        await counterRef.update({

          active:
            false

        });


        stopLoadingWatchdog();

        showMessage(`

          <div style="
            text-align:center;
            padding:25px;
          ">

            <h2>
              ❌ QR Expired
            </h2>

            <p>
              Please renew fees.
            </p>

          </div>

        `);

        return;

      }


      // ================================================
      // SCAN LIMIT
      // ================================================

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


        stopLoadingWatchdog();

        showMessage(`

          <div style="
            text-align:center;
            padding:25px;
          ">

            <h2>
              ❌ Scan Limit Reached
            </h2>

            <p>
              Please contact COACHsir Academy.
            </p>

          </div>

        `);

        return;

      }


      // ================================================
      // RECORD SCAN
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


      console.log(
        "Scan recorded:",
        newCount
      );


      // ================================================
      // GOOGLE SHEET LOG
      // FIRE AND FORGET
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
        function (error) {

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

      console.log(
        "Creating new student:",
        studentId
      );


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
            .fromDate(
              defaultExpiryDate
            ),

        lastScan:
          firebase.firestore.Timestamp
            .fromDate(now)

      });


      console.log(
        "New student created."
      );


      // New student ko payment page
      stopLoadingWatchdog();

      await showPaymentPage(
        paymentAmount
      );

      return;

    }


    // ==================================================
    // FINAL PAYMENT CHECK
    // ==================================================

    const latestDoc =
      await counterRef.get();


    if (
      latestDoc.exists &&
      latestDoc.data().paymentStatus ===
      "approved"
    ) {

      stopLoadingWatchdog();


      showMessage(`

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

      `);


      setTimeout(
        function () {

          window.location.href =
            CONFIG.EXAM_URL;

        },
        2000
      );


    } else {

      stopLoadingWatchdog();


      showMessage(`

        <div style="
          text-align:center;
          padding:25px;
        ">

          <h2>
            ⏳ Payment Verification Required
          </h2>

          <p>
            Please wait for approval.
          </p>

          <button
            onclick="location.reload()"
            style="
              padding:10px 18px;
              margin-top:10px;
              cursor:pointer;
            "
          >
            🔄 Refresh
          </button>

        </div>

      `);

    }


  } catch (error) {

    stopLoadingWatchdog();

    showError(error);

  }

}


// ======================================================
// START
// ======================================================

function startTracker() {

  console.log(
    "COACHsir QR Tracker Initializing..."
  );


  runMainLogic();

}


// ======================================================
// DOM READY
// ======================================================

if (
  document.readyState ===
  "loading"
) {

  document.addEventListener(
    "DOMContentLoaded",
    startTracker
  );

} else {

  startTracker();

}    if (doc.exists) {

      const amount =
        Number(doc.data().amount);

      if (amount > 0) {

        return amount;

      }

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

      // Approval ke time se 30 days
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
// UPLOAD PAYMENT PROOF
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
          "Payment upload field not found."
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


      // Basic image check
      if (
        !file.type ||
        !file.type.startsWith("image/")
      ) {

        alert(
          "Please select a valid image file."
        );

        return;

      }


      showMessage(`

        <div style="
          text-align:center;
          padding:25px;
        ">

          <h2>⏳ Uploading...</h2>

          <p>
            Please wait...
          </p>

        </div>

      `);


      const reader =
        new FileReader();


      reader.onload =
        async function () {

          try {

            const result =
              reader.result;


            const base64 =
              result.split(",")[1];


            if (!base64) {

              throw new Error(
                "Unable to read payment screenshot."
              );

            }


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
            await counterRef.update({

              paymentStatus:
                "verification_pending"

            });


            showMessage(`

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

                <button
                  onclick="location.reload()"
                  style="
                    padding:10px 18px;
                    margin-top:10px;
                    border:none;
                    border-radius:8px;
                    cursor:pointer;
                  "
                >
                  🔄 Refresh
                </button>

              </div>

            `);


          } catch (error) {

            console.error(
              "Payment proof error:",
              error
            );

            alert(
              "❌ Error:\n" +
              error.message
            );


            showMessage(`

              <div style="
                text-align:center;
                padding:20px;
              ">

                <h2>
                  ❌ Upload Failed
                </h2>

                <p>
                  ${error.message}
                </p>

              </div>

            `);

          }

        };


      reader.onerror =
        function () {

          alert(
            "Unable to read screenshot."
          );

        };


      reader.readAsDataURL(file);


    } catch (error) {

      console.error(
        "Upload error:",
        error
      );

      alert(
        "❌ Error:\n" +
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

      let currentPaymentAmount =
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

          currentPaymentAmount =
            parsed;

        }

      }


      console.log(
        "Payment amount:",
        currentPaymentAmount
      );


      const doc =
        await counterRef.get();


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


      await counterRef.update({

        paymentStatus:
          "verification_pending"

      });


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


      showMessage(`

        <div style="
          text-align:center;
          padding:20px;
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
              padding:10px;
              margin-top:10px;
            "
          >
            🔄 Refresh Page
          </button>

        </div>

      `);


    } catch (error) {

      console.error(
        "Payment submission error:",
        error
      );


      alert(
        "Error submitting payment:\n" +
        error.message
      );


      showMessage(`

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

      `);

    }

  };


// ======================================================
// PAYMENT PAGE
// ======================================================

async function showPaymentPage(
  amount
) {

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


  showMessage(`

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
        style="
          width:220px;
          max-width:100%;
          border-radius:12px;
          margin:15px 0;
        "
        onerror="
          this.style.display='none'
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
            cursor:pointer;
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
          cursor:pointer;
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

  `);

}


// ======================================================
// ADMIN PANEL
// ======================================================

async function showAdminPanel() {

  const countElement =
    getCountElement();


  if (!countElement) {

    return;

  }


  countElement.innerHTML = `

    <div style="
      text-align:center;
      padding:20px;
    ">

      <h2>
        🔐 Admin Panel
      </h2>

      <p>
        Loading students...
      </p>

    </div>

  `;


  const snapshot =
    await db
      .collection("qrData")
      .get();


  let html =
    "<h2>🔐 Admin Panel</h2>";


  if (snapshot.empty) {

    html += `
      <p>
        No students found.
      </p>
    `;

  }


  snapshot.forEach(
    function (d) {

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
            Student ID:
            ${d.id}
          </b>

          <br><br>

          Status:
          <b>
            ${data.paymentStatus ||
              "pending"}
          </b>

          <br><br>

          Count:
          ${data.count || 0}

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

}


// ======================================================
// GET EXPIRY DATE
// ======================================================

function getExpiryDate(data) {

  let expiry =
    defaultExpiryDate;


  if (data.expiryDate) {

    // Firestore Timestamp
    if (
      typeof data.expiryDate.toDate ===
      "function"
    ) {

      expiry =
        data.expiryDate.toDate();

    }

    // JavaScript Date
    else if (
      data.expiryDate instanceof Date
    ) {

      expiry =
        data.expiryDate;

    }

    // String / Number
    else {

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


  return expiry;

}


// ======================================================
// MAIN LOGIC
// ======================================================

async function runMainLogic() {

  const countElement =
    getCountElement();


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
      "Admin:",
      isAdmin
    );

    console.log(
      "================================"
    );


    if (!countElement) {

      throw new Error(
        "Element #count not found in index.html"
      );

    }


    // Initial loading
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
    // CHECK FIREBASE
    // ==================================================

    if (
      typeof firebase ===
      "undefined"
    ) {

      throw new Error(
        "Firebase SDK is not loaded."
      );

    }


    if (
      typeof db ===
      "undefined"
    ) {

      throw new Error(
        "Firestore database is not initialized."
      );

    }


    // ==================================================
    // ADMIN PANEL
    // ==================================================

    if (isAdmin) {

      await showAdminPanel();

      return;

    }


    // ==================================================
    // CURRENT TIME
    // ==================================================

    const now =
      new Date();


    // ==================================================
    // GET STUDENT DOCUMENT
    // ==================================================

    const doc =
      await counterRef.get();


    console.log(
      "Firestore document exists:",
      doc.exists
    );


    // ==================================================
    // EXISTING STUDENT
    // ==================================================

    if (doc.exists) {

      const data =
        doc.data();


      console.log(
        "Student data:",
        data
      );


      // ================================================
      // 1. ACTIVE CHECK
      // ================================================

      if (data.active === false) {

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


      // ================================================
      // 2. PAYMENT VERIFICATION PENDING
      // ================================================

      if (
        data.paymentStatus ===
        "verification_pending"
      ) {

        showMessage(`

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

            <button
              onclick="
                location.reload()
              "
              style="
                padding:10px 18px;
                margin-top:10px;
                cursor:pointer;
              "
            >
              🔄 Refresh
            </button>

          </div>

        `);

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
          Number(
            data.paymentAmount
          ) ||
          await getPaymentAmount();


        await showPaymentPage(
          amount
        );

        return;

      }


      // ================================================
      // 4. EXPIRY CHECK
      // ================================================

      const expiry =
        getExpiryDate(data);


      console.log(
        "Expiry:",
        expiry
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
              Please renew fees.
            </p>

          </div>

        `);

        return;

      }


      // ================================================
      // 5. SCAN LIMIT
      // ================================================

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


        showMessage(`

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

        `);

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


      console.log(
        "Scan recorded:",
        newCount
      );


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
        function (error) {

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

      console.log(
        "Creating new student:",
        studentId
      );


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
            .fromDate(
              defaultExpiryDate
            ),

        lastScan:
          firebase.firestore.Timestamp
            .fromDate(now)

      });


      // New student ko payment page dikhao
      await showPaymentPage(
        paymentAmount
      );

      return;

    }


    // ==================================================
    // FINAL PAYMENT CHECK
    // ==================================================

    const latestDoc =
      await counterRef.get();


    if (
      latestDoc.exists &&
      latestDoc.data().paymentStatus ===
      "approved"
    ) {

      showMessage(`

        <div style="
          text-align:center;
          padding:20px;
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

      `);


      setTimeout(
        function () {

          window.location.href =
            CONFIG.EXAM_URL;

        },
        2000
      );


    } else {

      showMessage(`

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

      `);

    }


  } catch (error) {

    console.error(
      "================================"
    );

    console.error(
      "QR TRACKER ERROR:",
      error
    );

    console.error(
      "================================"
    );


    if (countElement) {

      countElement.innerHTML = `

        <div style="
          text-align:center;
          padding:25px;
        ">

          <h2 style="
            color:red;
          ">
            ❌ Error
          </h2>

          <p>
            ${error.message}
          </p>

          <button
            onclick="
              location.reload()
            "
            style="
              padding:10px 18px;
              margin-top:10px;
              cursor:pointer;
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
// START QR TRACKER
// ======================================================

document.addEventListener(
  "DOMContentLoaded",
  function () {

    runMainLogic();

  }
);window.copyUPI = function () {

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
        
