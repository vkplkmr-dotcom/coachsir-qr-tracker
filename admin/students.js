// ===============================
// STUDENT MANAGEMENT JS
// ===============================


// ADD STUDENT

async function addStudent(){

const studentId =
document.getElementById("studentId").value.trim();

const studentName =
document.getElementById("studentName").value.trim();

const mobile =
document.getElementById("studentMobile").value.trim();

const studentClass =
document.getElementById("studentClass").value.trim();

const program =
document.getElementById("studentProgram").value;

const scanLimit =
Number(document.getElementById("scanLimit").value) || 100;



if(!studentId || !studentName){

alert("Please enter Student ID and Name");
return;

}


try{


await db.collection("qrData")
.doc(studentId)
.set({

studentId:studentId,

studentName:studentName,

mobile:mobile,

studentClass:studentClass,

program:program,

count:0,

active:true,

scanLimit:scanLimit,

unlimited:false,

paymentStatus:"pending",

paymentAmount:30,

createdAt:
firebase.firestore.FieldValue.serverTimestamp()

});



alert("✅ Student Added Successfully");


// Clear Form Fields

document.getElementById("studentId").value = "";

document.getElementById("studentName").value = "";

document.getElementById("studentMobile").value = "";

document.getElementById("studentClass").value = "";

document.getElementById("scanLimit").value = "100";


// Reload List

loadStudents();


loadStudents();



}

catch(error){

console.error(error);

alert(error.message);

}


}





// LOAD STUDENTS


async function loadStudents(){


const list =
document.getElementById("studentList");


list.innerHTML="";


try{


const snapshot =
await db.collection("qrData").get();



snapshot.forEach(doc=>{


const data = doc.data();



list.innerHTML += `

<tr>

<td>${doc.id}</td>

<td>${data.studentName || "-"}</td>

<td>${data.studentClass || "-"}</td>

<td>${data.program || "-"}</td>

<td>${data.mobile || "-"}</td>


<td>

${data.active ? "🟢 Active":"🔴 Inactive"}

</td>


<td>

${data.paymentStatus || "pending"}

</td>


<td>


<button class="view-btn"
onclick="viewStudent('${doc.id}')">

👁 View

</button>


<button class="edit-btn"
onclick="editStudent('${doc.id}')">

✏️ Edit

</button>


<button class="delete-btn"
onclick="deleteStudent('${doc.id}')">

🗑 Delete

</button>


</td>


</tr>


`;


});



}

catch(error){

console.error(error);


list.innerHTML=`

<tr>
<td colspan="8">
Error Loading Students
</td>
</tr>

`;


}


}





// SEARCH STUDENT


function searchStudents(){


let value =
document.getElementById("searchBox")
.value.toLowerCase();



document.querySelectorAll("#studentList tr")
.forEach(row=>{


row.style.display =
row.innerText.toLowerCase()
.includes(value)
?
""
:
"none";


});


}





// VIEW STUDENT


function viewStudent(id){

alert("Student ID : "+id);

}





// EDIT STUDENT


async function updateStudent(){

const id =
document.getElementById("studentId").value;


await db.collection("qrData")
.doc(id)
.update({

studentName:
document.getElementById("studentName").value,


mobile:
document.getElementById("studentMobile").value,


studentClass:
document.getElementById("studentClass").value,


program:
document.getElementById("studentProgram").value,


scanLimit:
Number(document.getElementById("scanLimit").value)

});


alert("✅ Student Updated Successfully");


// Hide Update Button

document.getElementById("updateBtn").style.display="none";


// Clear Fields

document.getElementById("studentId").value="";

document.getElementById("studentName").value="";

document.getElementById("studentMobile").value="";

document.getElementById("studentClass").value="";

document.getElementById("scanLimit").value="100";


loadStudents();

}




// DELETE STUDENT


async function deleteStudent(id){


if(confirm("Delete Student?")){


await db.collection("qrData")
.doc(id)
.delete();


alert("🗑 Deleted");


loadStudents();


}


}





// AUTO LOAD


window.onload=function(){

loadStudents();

};
