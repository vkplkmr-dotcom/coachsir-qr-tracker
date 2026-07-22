// Firebase SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { 
    getFirestore,
    doc,
    getDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";


// Firebase Config
const firebaseConfig = {

apiKey: "YOUR_API_KEY",
authDomain: "YOUR_PROJECT.firebaseapp.com",
projectId: "YOUR_PROJECT_ID"

};


// Initialize Firebase

const app = initializeApp(firebaseConfig);

const db = getFirestore(app);


// URL से Student ID लेना

const params = new URLSearchParams(window.location.search);

const studentId = params.get("id");


if(!studentId){

alert("Student ID Missing");

}



// Firestore से Data लाना

async function loadStudent(){

const ref = doc(db,"qrData",studentId);

const snap = await getDoc(ref);


if(snap.exists()){


const data = snap.data();


// HTML में data दिखाना

document.getElementById("studentName").innerHTML =
data.name || "No Name";


document.getElementById("studentId").innerHTML =
studentId;


document.getElementById("studentCourse").innerHTML =
data.program || "Course";


if(data.expiryDate){

let date=data.expiryDate.toDate();

document.getElementById("expiryDate").innerHTML =
date.toLocaleDateString();

}



// Status

let status=document.getElementById("status");


if(data.active){

status.innerHTML="ACTIVE";
status.className="active";

}else{

status.innerHTML="INACTIVE";
status.className="inactive";

}


// QR Code

new QRCode(document.getElementById("qrcode"),{

text:
window.location.href,

width:120,
height:120

});


}
else{

document.getElementById("studentName").innerHTML =
"Student Not Found";

}


}


loadStudent();
