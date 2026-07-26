// ================================
// GET STUDENT ID FROM URL
// ================================

const urlParams = new URLSearchParams(window.location.search);

const studentId = urlParams.get("id");


// ================================
// LOAD STUDENT DATA
// ================================

if(!studentId){

    alert("Student ID Missing");

}
else{


db.collection("qrData")
.doc(studentId)
.get()

.then((doc)=>{


    if(!doc.exists){

        alert("Student Not Found");
        return;

    }


    const data = doc.data();



    // NAME

    document.getElementById("studentName").innerText =
    data.name || "No Name";



    // ID

    document.getElementById("studentId").innerText =
    studentId;



    // PROGRAM

    document.getElementById("program").innerText =
    data.program || "Not Available";



    // EXPIRY DATE

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





    // PAYMENT STATUS

    document.getElementById("paymentStatus").innerText =
    (data.paymentStatus || "PENDING").toUpperCase();






    // ACTIVE STATUS

    const accessStatus =
    document.getElementById("accessStatus");


    if(data.active){


        accessStatus.innerText="ACTIVE";

        accessStatus.style.background="#16c60c";


    }
    else{


        accessStatus.innerText="EXPIRED";

        accessStatus.style.background="#ff0000";


    }





    // PHOTO


    const photo =
    document.getElementById("studentPhoto");


    if(data.photoURL){

        photo.src=data.photoURL;

    }
    else{

        photo.src="assets/student.png";

    }





    // QR CODE


    const qr =
    document.getElementById("qrcode");


    qr.innerHTML="";


    new QRCode(qr,{

        text:studentId,

        width:180,

        height:180

    });



})

.catch((error)=>{

    alert(error.message);

});


}



// ================================
// CARD FLIP
// ================================


const cardContainer =
document.querySelector(".card-container");


const flipBtn =
document.getElementById("flipBtn");



if(flipBtn){


flipBtn.addEventListener("click",()=>{


    cardContainer.classList.toggle("flip");



    if(cardContainer.classList.contains("flip")){


        flipBtn.innerHTML =
        '<i class="fa-solid fa-repeat"></i> Front';


    }
    else{


        flipBtn.innerHTML =
        '<i class="fa-solid fa-repeat"></i> Back';


    }


});


}
