// ==========================================
// COACHsir QR TRACKER - AUTO STUDENT UPDATE
// This is an ADD-ON file.
// Existing students.js is NOT modified.
// ==========================================

let autoEditStudentId = null;
let autoSaveTimer = null;
let autoSaveRunning = false;


// ------------------------------------------
// EDIT STUDENT
// ------------------------------------------

async function editStudent(id) {

    try {

        const doc = await db
            .collection("qrData")
            .doc(id)
            .get();

        if (!doc.exists) {
            alert("Student record not found.");
            return;
        }

        const data = doc.data();

        // Remember which student is being edited
        autoEditStudentId = id;

        // Fill existing fields
        document.getElementById("studentId").value =
            data.studentId || id;

        document.getElementById("studentName").value =
            data.studentName || "";

        document.getElementById("studentMobile").value =
            data.mobile || "";

        document.getElementById("studentClass").value =
            data.studentClass || "";

        document.getElementById("studentProgram").value =
            data.program || "NEET Biology";

        document.getElementById("scanLimit").value =
            data.scanLimit ?? 100;

        // Show update button
        const updateBtn = document.getElementById("updateBtn");

        if (updateBtn) {
            updateBtn.style.display = "inline-block";
        }

        // Put cursor on name
        document.getElementById("studentName").focus();

    } catch (error) {

        console.error("Edit Student Error:", error);

        alert("Unable to load student data.");
    }
}


// ------------------------------------------
// AUTO SAVE TO FIRESTORE
// ------------------------------------------

async function autoSaveStudent() {

    if (!autoEditStudentId) return;

    if (autoSaveRunning) return;

    const studentId =
        document.getElementById("studentId").value.trim();

    if (!studentId) return;

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


    autoSaveRunning = true;

    try {

        await db
            .collection("qrData")
            .doc(autoEditStudentId)
            .update({

                studentName: studentName,

                mobile: mobile,

                studentClass: studentClass,

                program: program,

                scanLimit: scanLimit,

                updatedAt:
                    firebase.firestore.FieldValue.serverTimestamp()

            });

        console.log("✅ Auto-saved to Firestore:", autoEditStudentId);

    } catch (error) {

        console.error("❌ Auto-save failed:", error);

    } finally {

        autoSaveRunning = false;
    }
}


// ------------------------------------------
// DELAYED AUTO SAVE
// Prevents Firestore write on every keystroke
// ------------------------------------------

function scheduleAutoSave() {

    if (!autoEditStudentId) return;

    clearTimeout(autoSaveTimer);

    autoSaveTimer = setTimeout(() => {

        autoSaveStudent();

    }, 800);
}


// ------------------------------------------
// WATCH FORM FIELDS
// ------------------------------------------

window.addEventListener("load", function () {

    const fields = [

        "studentName",
        "studentMobile",
        "studentClass",
        "studentProgram",
        "scanLimit"

    ];

    fields.forEach(function (id) {

        const field = document.getElementById(id);

        if (!field) return;

        field.addEventListener("input", scheduleAutoSave);

        field.addEventListener("change", scheduleAutoSave);

    });

});


// ------------------------------------------
// RESET EDIT MODE AFTER UPDATE
// ------------------------------------------

const originalUpdateStudent = window.updateStudent;

window.updateStudent = async function () {

    if (typeof originalUpdateStudent === "function") {

        await originalUpdateStudent();

    }

    autoEditStudentId = null;

};
