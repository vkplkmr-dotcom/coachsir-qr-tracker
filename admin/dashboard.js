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

if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}


const db = firebase.firestore();



// Load Dashboard Data

async function loadDashboard(){


try{


const snapshot = await db.collection("qrData").get();



let totalStudents = 0;
let pendingPayments = 0;
let approvedPayments = 0;
let todayScan = 0;
let totalCardOpen = 0;
let totalQrScan = 0;
let totalCbtClick = 0;
let totalLiveClass = 0;
let totalWebsiteVisit = 0;


const today = new Date();
today.setHours(0,0,0,0);

let paymentHTML = "";
let activityHTML = "";



snapshot.forEach(doc=>{


const data = doc.data();
  activityHTML += `
<tr>
<td>${doc.id}</td>
<td>${data.studentName || data.name || "-"}</td>
<td>${data.cardOpenCount || 0}</td>
<td>${data.qrScanCount || 0}</td>
<td>${data.cbtClickCount || 0}</td>
<td>${data.liveClassCount || 0}</td>
<td>${data.websiteClickCount || 0}</td>
</tr>
`;
totalCardOpen += data.cardOpenCount || 0;

totalQrScan += data.qrScanCount || 0;

totalCbtClick += data.cbtClickCount || 0;

totalLiveClass += data.liveClassCount || 0;

totalWebsiteVisit += data.websiteClickCount || 0;
totalStudents++;


// Payment Status

if(
   data.paymentStatus === "verification_pending" ||
   data.paymentStatus === "pending"
){
    pendingPayments++;
}

if(data.paymentStatus === "approved"){

    approvedPayments++;

}



// Today's Scan

if(data.lastScan){

    let scanDate;

    if(typeof data.lastScan.toDate === "function"){

        scanDate = data.lastScan.toDate();

    }else{

        scanDate = new Date(data.lastScan);

    }


    if(scanDate >= today){

        todayScan++;

    }

}



// Payment List

if(data.paymentStatus){

paymentHTML += `

<tr>

<td>
<b>${doc.id}</b>
</td>


<td>
₹${data.paymentAmount || 0}
</td>


<td>

<span class="status ${data.paymentStatus}">
${data.paymentStatus || "pending"}
</span>

</td>


<td>

${
(
 data.paymentStatus === "verification_pending" ||
 data.paymentStatus === "pending"
)
?
`<button class="approve-btn"
onclick="approvePayment('${doc.id}')">
Approve
</button>`
:
`<button class="view-btn"
onclick="viewPayment('${doc.id}')">
View
</button>`

}

</td>


</tr>

`;
}


});




// Update Cards


document.getElementById("totalStudents").innerHTML =
totalStudents;


document.getElementById("pendingPayments").innerHTML =
pendingPayments;


document.getElementById("approvedPayments").innerHTML =
approvedPayments;


document.getElementById("todayScan").innerHTML =
todayScan;
document.getElementById("totalCardOpen").innerHTML =
totalCardOpen;

document.getElementById("totalQrScan").innerHTML =
totalQrScan;

document.getElementById("totalCbtClick").innerHTML =
totalCbtClick;

document.getElementById("totalLiveClass").innerHTML =
totalLiveClass;

document.getElementById("totalWebsiteVisit").innerHTML =
totalWebsiteVisit;



// Payment Section

document.getElementById("paymentList").innerHTML =
paymentHTML || "No Payments";
document.getElementById("studentActivityTable").innerHTML =
activityHTML || `
<tr>
<td colspan="7">No Data</td>
</tr>
`;


}

catch(error){

console.error(error);

}

}




// Run

window.approvePayment = async function(id){

    if(!confirm(
        "Approve this payment?\n\n30 days validity will start from today."
    )){
        return;
    }

    try{

        // Approval date = अभी
        const approvedDate = new Date();

        // 30 days validity
        const expiryDate = new Date(approvedDate);
        expiryDate.setDate(
            expiryDate.getDate() + 30
        );

        await db.collection("qrData")
        .doc(id)
        .update({

            paymentStatus: "approved",

            approvedAt:
                firebase.firestore.FieldValue.serverTimestamp(),

            expiryDate:
                firebase.firestore.Timestamp.fromDate(
                    expiryDate
                )

        });

        alert(
            "Payment Approved ✅\n\n" +
            "Validity: 30 Days\n" +
            "Valid Till: " +
            expiryDate.toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "short",
                year: "numeric"
            })
        );

        location.reload();

    }
    catch(error){

        console.error(
            "Payment Approval Error:",
            error
        );

        alert(error.message);

    }

}
window.viewPayment = function(id){

    db.collection("qrData")
    .doc(id)
    .get()
    .then((doc)=>{

        if(doc.exists){

            const data = doc.data();

            alert(
`Student ID: ${id}

Amount: ₹${data.paymentAmount || 0}

Status: ${data.paymentStatus}

Scan Limit: ${data.scanLimit || 0}

Created:
${data.createdAt ? data.createdAt.toDate() : "N/A"}`
            );

        }

    })
    .catch(error=>{

        alert(error.message);

    });

}


// Run Dashboard
loadDashboard();
window.logout = function(){

    firebase.auth().signOut()
    .then(()=>{

        window.location.href="login.html";

    })
    .catch((error)=>{

        alert(error.message);

    });

};
// ======================================================
// COACHsir ADMIN - VIEW STUDENT CARD
// ======================================================

window.viewStudentCard = function(studentId) {

    if (!studentId) {

        alert("Student ID is missing.");

        return;

    }


    // Admin View Mode
    const cardURL =
        "../student-card.html?id=" +
        encodeURIComponent(studentId) +
        "&admin=1";


    // Open card in new tab
    window.open(
        cardURL,
        "_blank"
    );

};
