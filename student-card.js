// Get Student ID from URL

const urlParams = new URLSearchParams(window.location.search);

const studentId = urlParams.get("id");


// Check ID

if(!studentId){

    alert("Student ID Missing");

}


// Load Student Data

db.collection("qrData").doc(studentId).get()

.then((doc)=>{


    if(!doc.exists){

        alert("Student Not Found");

        return;

    }


    const data = doc.data();



    // Student Name

    document.getElementById("studentName").innerText =
    data.name || "No Name";



    // Student ID

    document.getElementById("studentId").innerText =
    studentId;



    // Program

    document.getElementById("program").innerText =
    data.program || "Not Available";





    // Expiry Date

    if(data.expiryDate){


        let expiry = data.expiryDate;


        if(expiry.toDate){

            expiry = expiry.toDate();

        }
        else{

            expiry = new Date(expiry);

        }


        document.getElementById("expiry").innerText =
        expiry.toLocaleDateString("en-IN");


    }
    else{

        document.getElementById("expiry").innerText =
        "Not Available";

    }





    // Payment Status

    document.getElementById("paymentStatus").innerText =
    (data.paymentStatus || "PENDING").toUpperCase();





    // Access Status

    const access = document.getElementById("accessStatus");


    if(data.active){


        access.innerText = "ACTIVE";

        access.style.background="#16c60c";


    }
    else{


        access.innerText="EXPIRED";

        access.style.background="#ff0000";


    }





    // Student Photo

    const photo =
    document.getElementById("studentPhoto");


    if(data.photoURL){

        photo.src=data.photoURL;

    }
    else{

        photo.src="assets/student.png";

    }





    // QR Code


    document.getElementById("qrcode").innerHTML="";


    new QRCode(
        document.getElementById("qrcode"),
        {

            text: studentId,

            width:180,

            height:180

        }
    );



})

.catch((error)=>{


    alert(error.message);


});






// CARD FLIP BUTTON


const flipBtn = document.getElementById("flipBtn");

const card = document.getElementById("studentCard");


flipBtn.addEventListener("click",()=>{


    card.classList.toggle("flip");


    if(card.classList.contains("flip")){


        flipBtn.innerHTML =
        '<i class="fa-solid fa-repeat"></i> Back';


    }
    else{


        flipBtn.innerHTML =
        '<i class="fa-solid fa-repeat"></i> Front';


    }


});
