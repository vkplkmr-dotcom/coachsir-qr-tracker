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



const today = new Date();
today.setHours(0,0,0,0);



let paymentHTML = "";



snapshot.forEach(doc=>{


const data = doc.data();

totalStudents++;


// Payment Status

if(data.paymentStatus === "verification_pending"){

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
data.paymentStatus === "verification_pending"

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




// Payment Section

document.getElementById("paymentList").innerHTML =
paymentHTML || "No Payments";



}

catch(error){

console.error(error);

}

}




// Run

loadDashboard();
window.approvePayment = async function(id){

try{

await db.collection("qrData")
.doc(id)
.update({

paymentStatus:"approved"

});


alert("Payment Approved ✅");


location.reload();


}

catch(error){

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
