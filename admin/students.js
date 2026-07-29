// =====================================
// COACHsir Academy
// Student Management JS
// =====================================


// ADD NEW STUDENT

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

            studentId: studentId,

            studentName: studentName,

            mobile: mobile,

            studentClass: studentClass,

            program: program,


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



        // Clear Form

        document.getElementById("studentId").value="";

        document.getElementById("studentName").value="";

        document.getElementById("studentMobile").value="";

        document.getElementById("studentClass").value="";

        document.getElementById("scanLimit").value="100";



        loadStudents();



    }
    catch(error){

        console.error(error);

        alert("Error : "+error.message);

    }

}





// =====================================
// LOAD STUDENTS
// =====================================


async function loadStudents(){


    const list =
    document.getElementById("studentList");



    list.innerHTML="";


    let total=0;

    let active=0;

    let pending=0;



    try{


        const snapshot =
        await db.collection("qrData")
        .get();



        snapshot.forEach(doc=>{


            const data = doc.data();



            total++;



            if(data.active===true){

                active++;

            }



            if(data.paymentStatus==="pending"){

                pending++;

            }



            list.innerHTML += `

            <tr>


            <td>
            ${doc.id}
            </td>


            <td>
            ${data.studentName || "-"}
            </td>


            <td>
            ${data.studentClass || "-"}
            </td>


            <td>
            ${data.program || "-"}
            </td>


            <td>
            ${data.mobile || "-"}
            </td>


            <td>

            ${
            data.active
            ?
            "🟢 Active"
            :
            "🔴 Inactive"
            }

            </td>



            <td>

            ${
            data.paymentStatus || "pending"
            }

            </td>



            <td>

            <button 
            class="view-btn"
            onclick="viewStudent('${doc.id}')">

            👁 View

            </button>


            </td>


            </tr>

            `;


        });



        // Update Dashboard Cards


        if(document.getElementById("totalStudents")){

            document.getElementById("totalStudents").innerHTML=total;

        }


        if(document.getElementById("activeStudents")){

            document.getElementById("activeStudents").innerHTML=active;

        }


        if(document.getElementById("pendingStudents")){

            document.getElementById("pendingStudents").innerHTML=pending;

        }



    }
    catch(error){


        console.error(error);



        list.innerHTML=`

        <tr>

        <td colspan="8">

        ❌ Error Loading Students

        </td>

        </tr>

        `;


    }


}





// =====================================
// SEARCH STUDENT
// =====================================


function searchStudents(){


    const value =
    document.getElementById("searchBox")
    .value
    .toLowerCase();



    const rows =
    document.querySelectorAll("#studentList tr");



    rows.forEach(row=>{


        row.style.display =
        row.innerText
        .toLowerCase()
        .includes(value)
        ?
        ""
        :
        "none";


    });


}





// =====================================
// VIEW STUDENT
// =====================================


function viewStudent(id){


    alert(
        "Student ID : "+id
    );


}





// AUTO LOAD

window.onload=function(){

    loadStudents();

};
