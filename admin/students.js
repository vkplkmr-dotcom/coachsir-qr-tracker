// students.js

// Add Student

async function addStudent() {


const studentId =
document.getElementById("studentId").value.trim();


const studentName =
document.getElementById("studentName").value.trim();


const mobile =
document.getElementById("studentMobile").value.trim();


const program =
document.getElementById("studentProgram").value;


const studentClass =
document.getElementById("studentClass").value.trim();


const scanLimit =
Number(document.getElementById("scanLimit").value) || 100;



if(!studentId || !studentName){

alert("Enter Student ID and Name");
return;

}



try{


await db.collection("qrData")
.doc(studentId)
.set({


studentId: studentId,

studentName: studentName,

name: studentName,

mobile: mobile,

program: program,

studentClass: studentClass,


count:0,

active:true,


scanLimit:scanLimit,

unlimited:false,


paymentAmount:30,

paymentStatus:"pending",



expiryDate:
firebase.firestore.Timestamp.fromDate(
new Date("2026-08-23T23:59:59")
),



lastScan:
firebase.firestore.FieldValue.serverTimestamp(),



createdAt:
firebase.firestore.FieldValue.serverTimestamp()



});



alert("✅ Student Added Successfully");



loadStudents();



}

catch(error){

console.error(error);

alert(error.message);

}


}






// Load Students


async function loadStudents(){


const list =
document.getElementById("studentList");


list.innerHTML="";



const snapshot =
await db.collection("qrData").get();



snapshot.forEach(doc=>{


const data=doc.data();



list.innerHTML += `

<tr>

<td>${doc.id}</td>

<td>${data.studentName || ""}</td>

<td>${data.studentClass || ""}</td>

<td>${data.mobile || ""}</td>

<td>
${data.paymentStatus || "pending"}
</td>


</tr>

`;


});


}






window.onload=function(){

loadStudents();

};
