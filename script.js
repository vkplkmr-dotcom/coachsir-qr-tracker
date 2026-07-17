// ===============================
// COACHsir QR TRACKER - script.js
// Modular Version Step 3
// ===============================


// ===============================
// CONFIG
// ===============================

const SHEET_URL = "https://script.google.com/macros/s/AKfycby5inXpjWD10lIzHkOku21RwhVlMh9htuDOxwkb3mFwxR6BooQ0L-f6YArf8sNv4WbE/exec";

const UPI_ID = "vkplkmr-1@oksbi";

const EXAM_URL = "https://cbtexam.onlinetestpanel.com/";

const DEFAULT_EXPIRY = new Date("2026-08-15T23:59:59");


// ===============================
// USER DATA
// ===============================

const params = new URLSearchParams(window.location.search);

const studentId = params.get("id") || "general";

const isAdmin = params.get("admin") === "1234";


// Firestore Reference

const studentRef = db.collection("qrData").doc(studentId);


// ===============================
// COMMON FUNCTIONS
// ===============================


// Copy UPI

window.copyUPI = function(){

    navigator.clipboard.writeText(UPI_ID)
    .then(()=>{
        alert("✅ UPI ID Copied");
    })
    .catch(()=>{
        alert("UPI ID : " + UPI_ID);
    });

};



// Show message

function showMessage(html){

    const box = document.getElementById("count");

    if(box){
        box.innerHTML = html;
    }

}



// ===============================
// FIREBASE FUNCTIONS
// ===============================


async function getStudentData(){

    const doc = await studentRef.get();

    if(doc.exists){
        return doc.data();
    }

    return null;

}



async function createStudent(){

    const now = new Date();

    await studentRef.set({

        count:0,

        active:true,

        scanLimit:100,

        unlimited:false,

        paymentStatus:"pending",

        paymentAmount:1,

        createdAt:now,

        expiryDate:DEFAULT_EXPIRY,

        lastScan:null

    });

}



async function updatePayment(status){

    await studentRef.update({

        paymentStatus:status

    });

}



// ===============================
// PAYMENT SYSTEM
// ===============================


function showPaymentPage(amount){

const upiLink =
`upi://pay?pa=${encodeURIComponent(UPI_ID)}&pn=${encodeURIComponent("COACHsir Academy")}&am=${amount}&cu=INR`;


showMessage(`

<div style="
max-width:400px;
margin:auto;
background:white;
padding:20px;
border-radius:15px;
text-align:center;
box-shadow:0 0 15px #ccc;">


<h2 style="color:#0066ff;">
💳 Payment Required
</h2>


<p>
CBT Exam Access के लिए Payment करें
</p>


<h1 id="paymentAmountDisplay">
₹${amount}
</h1>


<img src="assets/upi-qr.png"
style="width:220px;border-radius:12px;">


<br><br>


<a href="${upiLink}">

<button style="
width:100%;
padding:14px;
background:#0066ff;
color:white;
border:0;
border-radius:10px;">

💳 Pay Now

</button>

</a>


<br><br>


<b>UPI ID</b>

<div style="
padding:10px;
background:#eee;
border-radius:8px;">

${UPI_ID}

</div>


<br>


<button onclick="copyUPI()"
style="
width:100%;
padding:12px;
background:#333;
color:white;
border:0;
border-radius:8px;">

📋 Copy UPI

</button>


<br><br>


<button onclick="paymentDone()"
style="
width:100%;
padding:14px;
background:green;
color:white;
border:0;
border-radius:10px;">

✅ I Have Paid

</button>


</div>

`);

}





window.paymentDone = async function(){

try{


await updatePayment("verification_pending");


// Google Sheet

fetch(SHEET_URL,{

method:"POST",

mode:"no-cors",

body:JSON.stringify({

action:"payment",

studentId:studentId,

paymentStatus:"verification_pending",

amount:1

})

});


showMessage(`

<div style="text-align:center;padding:20px;">

<h2 style="color:green;">
✅ Payment Submitted
</h2>


<p>
Admin verification के बाद CBT Access मिलेगा।
</p>


</div>

`);


}catch(error){

alert(error.message);

}


};




// ===============================
// ADMIN APPROVAL
// ===============================


window.approvePayment = async function(id){


try{


await db.collection("qrData")
.doc(id)
.update({

paymentStatus:"approved"

});


alert("✅ Payment Approved");


location.reload();


}

catch(error){

alert(error.message);

}


};




// ===============================
// MAIN START
// ===============================


async function init(){


try{


// Admin

if(isAdmin){

console.log("Admin Mode");

return;

}


// Get data

let data = await getStudentData();


// New Student

if(!data){

await createStudent();

data = await getStudentData();

}



// Payment Check


if(data.paymentStatus !== "approved"){


if(data.paymentStatus==="verification_pending"){


showMessage(`

<h2>
⏳ Payment Verification Pending
</h2>

<p>
Please wait for admin approval.
</p>

`);


return;


}


showPaymentPage(data.paymentAmount || 1);

return;


}


console.log("Payment Approved");


// आगे Step 3 Part 2 में:
// Expiry Check
// Scan Limit
// Attendance Record
// CBT Redirect


}

catch(error){

console.error(error);

showMessage(
"❌ Error : "+error.message
);

}


}



// Start

init();        paymentStatus:"pending",

        paymentAmount:1,

        createdAt:now,

        expiryDate:DEFAULT_EXPIRY,

        lastScan:null

    });

}



async function updatePayment(status){

    await studentRef.update({

        paymentStatus:status

    });

}



// ===============================
// PAYMENT SYSTEM
// ===============================


function showPaymentPage(amount){

const upiLink =
`upi://pay?pa=${encodeURIComponent(UPI_ID)}&pn=${encodeURIComponent("COACHsir Academy")}&am=${amount}&cu=INR`;


showMessage(`

<div style="
max-width:400px;
margin:auto;
background:white;
padding:20px;
border-radius:15px;
text-align:center;
box-shadow:0 0 15px #ccc;">


<h2 style="color:#0066ff;">
💳 Payment Required
</h2>


<p>
CBT Exam Access के लिए Payment करें
</p>


<h1 id="paymentAmountDisplay">
₹${amount}
</h1>


<img src="assets/upi-qr.png"
style="width:220px;border-radius:12px;">


<br><br>


<a href="${upiLink}">

<button style="
width:100%;
padding:14px;
background:#0066ff;
color:white;
border:0;
border-radius:10px;">

💳 Pay Now

</button>

</a>


<br><br>


<b>UPI ID</b>

<div style="
padding:10px;
background:#eee;
border-radius:8px;">

${UPI_ID}

</div>


<br>


<button onclick="copyUPI()"
style="
width:100%;
padding:12px;
background:#333;
color:white;
border:0;
border-radius:8px;">

📋 Copy UPI

</button>


<br><br>


<button onclick="paymentDone()"
style="
width:100%;
padding:14px;
background:green;
color:white;
border:0;
border-radius:10px;">

✅ I Have Paid

</button>


</div>

`);

}





window.paymentDone = async function(){

try{


await updatePayment("verification_pending");


// Google Sheet

fetch(SHEET_URL,{

method:"POST",

mode:"no-cors",

body:JSON.stringify({

action:"payment",

studentId:studentId,

paymentStatus:"verification_pending",

amount:1

})

});


showMessage(`

<div style="text-align:center;padding:20px;">

<h2 style="color:green;">
✅ Payment Submitted
</h2>


<p>
Admin verification के बाद CBT Access मिलेगा।
</p>


</div>

`);


}catch(error){

alert(error.message);

}


};




// ===============================
// ADMIN APPROVAL
// ===============================


window.approvePayment = async function(id){


try{


await db.collection("qrData")
.doc(id)
.update({

paymentStatus:"approved"

});


alert("✅ Payment Approved");


location.reload();


}

catch(error){

alert(error.message);

}


};




// ===============================
// MAIN START
// ===============================


async function init(){


try{


// Admin

if(isAdmin){

console.log("Admin Mode");

return;

}


// Get data

let data = await getStudentData();


// New Student

if(!data){

await createStudent();

data = await getStudentData();

}



// Payment Check


if(data.paymentStatus !== "approved"){


if(data.paymentStatus==="verification_pending"){


showMessage(`

<h2>
⏳ Payment Verification Pending
</h2>

<p>
Please wait for admin approval.
</p>

`);


return;


}


showPaymentPage(data || 1);

return;


}


console.log("Payment Approved");


// आगे Step 3 Part 2 में:
// Expiry Check
// Scan Limit
// Attendance Record
// CBT Redirect


}

catch(error){

console.error(error);

showMessage(
"❌ Error : "+error.message
);

}


}



// Start

init();    console.error("Payment submission error:", error);
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
      alert("Student ID: " + studentId);
alert("Payment Status: " + data.paymentStatus);

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
        const upiId = "vkplkmr-1@oksbi";
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
      fetch(SHEET_URL, {
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

    // Redirect to Exam
    document.getElementById("count").innerHTML = `
      <div style="text-align:center; padding:20px;">
        <h2 style="color:green;">✅ Attendance Recorded</h2>
        <p>Redirecting to CBT Exam...</p>
      </div>
    `;

    setTimeout(() => {
      window.location.href = "https://cbtexam.onlinetestpanel.com/";
    }, 2000);

  } catch (error) {
    console.error("Main logic error:", error);
    document.getElementById("count").innerHTML = "❌ Error: " + error.message;
  }
}

// Run the logic
runMainLogic();
