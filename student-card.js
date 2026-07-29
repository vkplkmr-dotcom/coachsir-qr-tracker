// ===============================
// GET STUDENT ID
// ===============================

const params = new URLSearchParams(window.location.search);

const studentId = params.get("id");


// ===============================
// LOAD STUDENT
// ===============================

if(!studentId){

    alert("Student ID Missing");

}
else{


db.collection("qrData")
.doc(studentId)
.get()

.then((doc)=>{


    if(!doc.exists){

        alert("Student Not Found : " + studentId);
        return;

    }


    const data = doc.data();
// SECURITY ACTIVITY

document.getElementById("scanCount").innerText =
data.count || 0;


if(data.lastScan){

    let scanDate;

    if(data.lastScan.toDate){

        scanDate = data.lastScan.toDate();

    }
    else{

        scanDate = new Date(data.lastScan);

    }


    document.getElementById("lastVerified").innerText =
    scanDate.toLocaleString("en-IN");

}


    // NAME

    document.getElementById("studentName").innerText =
    data.name || "No Name";



    // ID

    document.getElementById("studentId").innerText =
    studentId;
// CBT EXAM BUTTON

const cbtBtn = document.getElementById("cbtBtn");


if(data.paymentStatus === "approved"){

    cbtBtn.style.cursor = "pointer";

    cbtBtn.onclick = function(){

        window.location.href =
        "https://cbtexam.onlinetestpanel.com";

    };

}
else{

    cbtBtn.onclick = function(){

        alert("Payment approval pending.");

    };

}


    // PROGRAM

    document.getElementById("program").innerText =
    data.program || "Not Available";




    // EXPIRY

    let expiry = data.expiryDate;


    if(expiry){


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





    // PAYMENT

    const paymentStatus =
document.getElementById("paymentStatus");

const status =
(data.paymentStatus || "PENDING").toUpperCase();

if(status === "APPROVED"){

    paymentStatus.innerHTML =
    '<i class="fa-solid fa-circle-check"></i> APPROVED';

    paymentStatus.classList.add("approved-status");

}
else{

    paymentStatus.innerText = status;

    paymentStatus.classList.add("pending-animation");

}




    // ACTIVE

    const access =
    document.getElementById("accessStatus");


    if(data.active === true){


        access.innerText="ACTIVE";

        access.style.background="#16c60c";


    }
    else{


        access.innerText="EXPIRED";

        access.style.background="#ff0000";


    }

// PHOTO


    const photo =
    document.getElementById("studentPhoto");


    photo.src =
    data.photoURL || "assets/student.png";






    // QR


    const qr =
    document.getElementById("qrcode");


    qr.innerHTML="";


    new QRCode(qr,{

        text:studentId,

        width:150,

        height:150

    });



})

.catch((error)=>{


    alert(error.message);


});


}
// WEBSITE BUTTON
// ===============================

const websiteBtn = document.getElementById("websiteBtn");

if(websiteBtn){

    websiteBtn.onclick = function(){

        window.open(
            "https://vkplkmr-dotcom.github.io/coachsir--website/",
            "_blank"
        );

    };

}




// CARD FLIP
// ===============================

const container =
document.querySelector(".card-container");


const flipBtn =
document.getElementById("flipBtn");


if(container && flipBtn){

    flipBtn.addEventListener("click",function(){

        container.classList.toggle("flip");

        if(container.classList.contains("flip")){

            flipBtn.innerHTML =
            '<i class="fa-solid fa-repeat"></i><span>Front</span>';

        }
        else{

            flipBtn.innerHTML =
            '<i class="fa-solid fa-repeat"></i><span>Back</span>';

        }

    });

}
