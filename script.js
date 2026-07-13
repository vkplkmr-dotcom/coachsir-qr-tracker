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
alert("NEW SCRIPT RUNNING");
firebase.initializeApp(firebaseConfig);

const db = firebase.firestore();


// Google Sheet URL
const SHEET_URL =
"https://script.google.com/macros/s/AKfycbwA6xaTfaX17AR9Bgwxl4bT5H4n4KHYm9LkiUMTu7bxq9LO4OFJ2L6YBWHEfD4v98m4Gw/exec";


// Student ID
const params = new URLSearchParams(window.location.search);

const studentId = params.get("id") || "general";
const isAdmin = params.get("admin") === "1234";


// Firestore Reference
const counterRef =
db.collection("qrData").doc(studentId);


// Expiry Date
const defaultExpiryDate =
new Date("2026-08-15T23:59:59");



counterRef.get().then(async(doc)=>{

if(isAdmin){

const snapshot = await db.collection("qrData").get();

let html = "<h2>🔐 Admin Panel</h2>";

snapshot.forEach(d=>{

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



if(doc.exists){


const data = doc.data();



// QR Active Check

if(data.active === false){

document.getElementById("count").innerHTML =
`
<h2>❌ QR Inactive</h2>
<p>Please contact COACHsir Academy</p>
`;

return;

}




if(data.paymentStatus !== "approved"){

const amount = data.paymentAmount || 1;

const upiId = "vkplkmr-1@oksbi";

const upiLink = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent("COACHsir Academy")}&am=${amount}&cu=INR`;

document.getElementById("count").innerHTML = `

<div style="max-width:400px;margin:auto;background:#fff;padding:20px;border-radius:15px;box-shadow:0 0 15px rgba(0,0,0,.2);text-align:center;">

<h2 style="color:#0066ff;">💳 Payment Required</h2>

<p>CBT Exam Access के लिए पहले Payment करें</p>

<h1 style="color:green;">₹${amount}</h1>

<img src="assets/upi-qr.png"
style="width:220px;border-radius:12px;margin:15px 0;">

<br>

<a href="${upiLink}">

<button style="
width:100%;
padding:14px;
background:#0066ff;
color:white;
border:none;
border-radius:10px;
font-size:18px;
">

💳 Pay with Any UPI App

</button>

</a>

<br><br>

<p><b>UPI ID</b></p>

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

<button onclick="copyUPI()" style="
width:100%;
padding:12px;
background:#333;
color:white;
border:none;
border-radius:8px;
">

📋 Copy UPI ID

</button>

<br><br>

<button onclick="paymentDone()" style="
width:100%;
padding:14px;
background:green;
color:white;
border:none;
border-radius:10px;
font-size:18px;
">

✅ I Have Paid

</button>

<p style="margin-top:15px;color:#666;font-size:14px;">
Payment verification के बाद CBT Exam Access मिलेगा।
</p>

</div>

`;

return;

}





// Expiry Check


let expiry = defaultExpiryDate;


if(data.expiryDate &&
typeof data.expiryDate.toDate === "function"){

expiry = data.expiryDate.toDate();

}



if(now > expiry){


await counterRef.update({

active:false

});


document.getElementById("count").innerHTML =
`
<h2>❌ QR Expired</h2>
<p>Please renew fees</p>
`;

return;

}




// Scan Limit Check


const currentCount = data.count || 0;


const scanLimit =
Number(data.scanLimit ?? Infinity);


const unlimited =
data.unlimited === true;



if(!unlimited && currentCount >= scanLimit){


await counterRef.update({

active:false

});



document.getElementById("count").innerHTML =
`
<h2>❌ Scan Limit Reached</h2>
`;

return;


}




// Increase Scan Count


const newCount = currentCount + 1;


await counterRef.update({

count:newCount,

lastScan:now

});




// Google Sheet

fetch(SHEET_URL,{

method:"POST",

body:JSON.stringify({

studentId:studentId,

scanCount:newCount

})

});



}

else{


// New Student Create


await counterRef.set({

count:1,

active:true,

scanLimit:100,

unlimited:false,


paymentStatus:"pending",

paymentAmount:1,


createdAt:now,

expiryDate:defaultExpiryDate,

lastScan:now

});


}





document.getElementById("count").innerHTML =

`
✅ Attendance Recorded
<br>
Redirecting to CBT Exam...
`;



setTimeout(()=>{


window.location.href =
"https://cbtexam.onlinetestpanel.com/";


},2000);



})

.catch(error=>{


console.error(error);


document.getElementById("count").innerHTML =
"❌ Error: "+error.message;


});





// COPY UPI FUNCTION


function copyUPI(){


navigator.clipboard.writeText(
"vkplkmr-1@oksbi"
)


.then(()=>{


alert(
"✅ UPI ID Copied"
);


})


.catch(()=>{


alert(
"UPI ID: vkplkmr-1@oksbi"
);


});


}


window.approvePayment = function(id){

alert("Clicked : " + id);

db.collection("qrData")
.doc(id)
.update({
paymentStatus:"approved"
})
.then(()=>{

alert("✅ Payment Approved");
location.reload();

})
.catch(error=>{
alert(error.message);
});

}

function approvePayment(id){

db.collection("qrData")
.doc(id)
.update({

paymentStatus:"approved"

})
.then(()=>{

alert("Payment Approved");

location.reload();

});

}
// PAYMENT DONE BUTTON


function paymentDone(){

  


db.collection("qrData")
.doc(studentId)
.update({

paymentStatus:"verification_pending"

})


.then(()=>{


document.getElementById("count").innerHTML =

`
<h2>✅ Payment Submitted</h2>

<p>
Admin verification के बाद CBT Access मिलेगा.
</p>
`;


})


.catch(error=>{


alert(error.message);


});


}
