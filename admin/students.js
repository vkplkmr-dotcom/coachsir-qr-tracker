// students.js

// Add Student

async function addStudent() {

  const studentId = document.getElementById("newStudentId").value.trim();

const studentName = document.getElementById("newStudentName").value.trim();
  const scanLimit = Number(
    document.getElementById("scanLimit").value
  ) || 100;
 const mobile = document.getElementById("newStudentMobile")?.value.trim() || "";
const program = document.getElementById("newStudentProgram")?.value || "";

const studentClass = document.getElementById("newStudentClass")?.value || "";

  if (!studentId || !studentName) {

    alert("Please enter Student ID and Name");
    return;

  }


  try {

    await db.collection("qrData")
.doc(studentId)
.set({

  studentId: studentId,

  studentName: studentName,

  mobile: mobile,

  studentClass: studentClass,

  count: 0,

  active: true,

  scanLimit: scanLimit,

  unlimited: false,

  paymentAmount: 30,

  paymentStatus: "pending",

  expiryDate: firebase.firestore.Timestamp.fromDate(
    new Date("2026-08-15T23:59:59")
  ),

  lastScan: firebase.firestore.FieldValue.serverTimestamp(),

  createdAt: firebase.firestore.FieldValue.serverTimestamp()

});

    alert("✅ Student Added Successfully");


    // Clear fields

    document.getElementById("studentId").value = "";
    document.getElementById("studentName").value = "";
    document.getElementById("scanLimit").value = "100";


    loadStudents();


  } catch(error) {

    console.error(error);

    alert(
      "Error: " + error.message
    );

  }

}





// Load Student List

async function loadStudents(){


  const list = document.getElementById("studentList");


  list.innerHTML = "";


  try {


    const snapshot = await db.collection("qrData")
    .get();



    snapshot.forEach(doc=>{


      const data = doc.data();



      list.innerHTML += `

      <tr>

      <td>${doc.id}</td>

      <td>${data.studentName || ""}</td>

      <td>
      ${data.paymentStatus || "pending"}
      </td>

      <td>
      ${data.scanLimit || 0}
      </td>


      </tr>

      `;


    });



  } catch(error){

    console.error(error);

    list.innerHTML =
    `
    <tr>
    <td colspan="4">
    Error loading students
    </td>
    </tr>
    `;

  }


}



// Auto Load

window.onload = function(){

  loadStudents();

};
function addNewStudent(){

    document.getElementById("studentId").value =
    document.getElementById("newStudentId").value;

    document.getElementById("studentName").value =
    document.getElementById("newStudentName").value;

    addStudent();

}
