// students.js


// ==========================
// ADD STUDENT (OLD FORM)
// ==========================

async function addStudent() {

  const studentId =
    document.getElementById("studentId")?.value.trim() || "";

  const studentName =
    document.getElementById("studentName")?.value.trim() || "";

  const scanLimit =
    Number(document.getElementById("scanLimit")?.value) || 100;


  const mobile =
    document.getElementById("studentMobile")?.value.trim() || "";


  const program =
    document.getElementById("newStudentProgram")?.value || "";


  const studentClass =
    document.getElementById("newStudentClass")?.value.trim() || "";


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

      name: studentName,

      mobile: mobile,

      program: program,

      studentClass: studentClass,


      count: 0,

      active: true,

      scanLimit: scanLimit,

      unlimited: false,


      paymentAmount: 30,

      paymentStatus: "pending",


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





// ==========================
// NEW STUDENT FORM BRIDGE
// ==========================

function addNewStudent(){


  document.getElementById("studentId").value =
  document.getElementById("newStudentId").value;


  document.getElementById("studentName").value =
  document.getElementById("newStudentName").value;


  if(document.getElementById("studentMobile")){

    document.getElementById("studentMobile").value =
    document.getElementById("newStudentMobile").value;

  }


  addStudent();


}





// ==========================
// LOAD STUDENTS
// ==========================

async function loadStudents(){


  const list =
  document.getElementById("studentList");


  if(!list) return;


  list.innerHTML="";


  try{


    const snapshot =
    await db.collection("qrData").get();



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



  }
  catch(error){

    console.error(error);

  }


}




// AUTO LOAD

window.onload=function(){

 loadStudents();

};
