// Test Student ID
const studentId = "S001";

// Load Student Data
db.collection("qrData").doc(studentId).get()
.then((doc) => {

    if (!doc.exists) {
        alert("Student Not Found");
        return;
    }

    const data = doc.data();

    // Student Details
    document.getElementById("studentName").innerText =
        data.name || "No Name";

    document.getElementById("studentId").innerText =
        studentId;

    document.getElementById("program").innerText =
        data.program || "Not Available";

    // Expiry Date
    if (data.expiryDate) {
        const date = data.expiryDate.toDate();

        document.getElementById("expiry").innerText =
            date.toLocaleDateString("en-IN");
    }

    // Payment Status
    document.getElementById("paymentStatus").innerText =
        (data.paymentStatus || "").toUpperCase();

    // Access Status
    if (data.active) {

        document.getElementById("accessStatus").innerText = "ACTIVE";
        document.getElementById("accessStatus").style.background = "#16c60c";

    } else {

        document.getElementById("accessStatus").innerText = "EXPIRED";
        document.getElementById("accessStatus").style.background = "#ff0000";
    }

    // Student Photo
    const photo = document.getElementById("studentPhoto");

    photo.src = "assets/students/" + studentId + ".jpg";

    photo.onerror = function () {
        photo.src = "assets/student.png";
    };

    // QR Code
    new QRCode(document.getElementById("qrcode"), {
        text: studentId,
        width: 180,
        height: 180
    });

})
.catch((error) => {

    alert(error.message);

});
