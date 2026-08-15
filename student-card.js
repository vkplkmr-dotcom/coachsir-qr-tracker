// ======================================================
// COACHsir ACADEMY - STUDENT CBT ACCESS CARD
// ======================================================


// ======================================================
// GET STUDENT ID FROM URL
// Example:
// student-card.html?id=S001
// ======================================================

const params = new URLSearchParams(window.location.search);
const studentId = params.get("id");


// ======================================================
// HELPER - PARSE EXPIRY DATE
// Supports:
// "Aug 29,2026"
// "Aug 29, 2026"
// Firestore Timestamp
// JavaScript Date
// ======================================================

function parseExpiryDate(expiry) {

    if (!expiry) {
        return null;
    }


    // ------------------------------------------
    // Firestore Timestamp
    // ------------------------------------------

    if (expiry && typeof expiry.toDate === "function") {

        const date = expiry.toDate();

        if (!isNaN(date.getTime())) {
            return date;
        }

    }


    // ------------------------------------------
    // JavaScript Date
    // ------------------------------------------

    if (expiry instanceof Date) {

        if (!isNaN(expiry.getTime())) {
            return expiry;
        }

    }


    // ------------------------------------------
    // String
    // ------------------------------------------

    if (typeof expiry === "string") {

        let cleanDate = expiry.trim();

        // Example:
        // Aug 29,2026
        // becomes:
        // Aug 29 2026

        cleanDate = cleanDate.replace(/,/g, " ");

        const parts = cleanDate.split(/\s+/);


        // ------------------------------------------
        // Manually parse:
        // Aug 29 2026
        // ------------------------------------------

        if (parts.length >= 3) {

            const monthName = parts[0];
            const day = parseInt(parts[1], 10);
            const year = parseInt(parts[2], 10);


            const monthMap = {

                Jan: 0,
                Feb: 1,
                Mar: 2,
                Apr: 3,
                May: 4,
                Jun: 5,
                Jul: 6,
                Aug: 7,
                Sep: 8,
                Oct: 9,
                Nov: 10,
                Dec: 11

            };


            const month =
                monthMap[monthName];


            if (
                month !== undefined &&
                !isNaN(day) &&
                !isNaN(year)
            ) {

                const date =
                    new Date(year, month, day);

                if (!isNaN(date.getTime())) {

                    return date;

                }

            }

        }


        // ------------------------------------------
        // Fallback
        // ------------------------------------------

        const parsed =
            new Date(cleanDate);

        if (!isNaN(parsed.getTime())) {

            return parsed;

        }

    }


    return null;

}


// ======================================================
// FORMAT DATE
// Example:
// 29 Aug 2026
// ======================================================

function formatExpiryDate(date) {

    if (!date || isNaN(date.getTime())) {

        return "Not Available";

    }


    return date.toLocaleDateString("en-IN", {

        day: "2-digit",
        month: "short",
        year: "numeric"

    });

}


// ======================================================
// CHECK WHETHER CARD IS ACTIVE
// Valid till date is inclusive.
//
// Example:
// Valid Till = 29 Aug 2026
//
// Card remains ACTIVE throughout 29 Aug.
// From 30 Aug -> EXPIRED.
// ======================================================

function isCardActive(expiryDate) {

    if (!expiryDate) {

        return false;

    }


    const today = new Date();


    // Remove time from today's date

    today.setHours(
        0,
        0,
        0,
        0
    );


    // Copy expiry date

    const expiry =
        new Date(expiryDate);


    // Valid throughout expiry day

    expiry.setHours(
        23,
        59,
        59,
        999
    );


    return today <= expiry;

}


// ======================================================
// LOAD STUDENT
// ======================================================

if (!studentId) {

    alert("Student ID Missing");

}
else {


    db.collection("qrData")
        .doc(studentId)
        .get()


        .then((doc) => {


            // ==================================================
            // STUDENT NOT FOUND
            // ==================================================

            if (!doc.exists) {

                alert(
                    "Student Not Found : " +
                    studentId
                );

                return;

            }


            const data = doc.data();
            const liveStatus =
document.getElementById("liveStatus");
            db.collection("qrData")
  .doc(studentId)
  .update({
    cardOpenCount: firebase.firestore.FieldValue.increment(1),
    lastScan: firebase.firestore.FieldValue.serverTimestamp()
  });
            db.collection("qrData")
  .doc(studentId)
  .update({
      count: firebase.firestore.FieldValue.increment(1),
      lastScan: firebase.firestore.FieldValue.serverTimestamp()
  })
  .catch(err => console.log(err));
async function increaseScanCount() {

    try {

        await db.collection("qrData")
            .doc(studentId)
            .update({

                count: firebase.firestore.FieldValue.increment(1),

                lastScan: firebase.firestore.FieldValue.serverTimestamp()

            });

    } catch (err) {

        console.error("Count Update Error:", err);

    }

}

            // ==================================================
            // STUDENT NAME
            // ==================================================

            document.getElementById(
                "studentName"
            ).innerText =

                data.studentName ||
                data.name ||
                "No Name";


            // ==================================================
            // STUDENT ID
            // ==================================================

            document.getElementById(
                "studentId"
            ).innerText = studentId;


            // ==================================================
            // PROGRAM
            // ==================================================

            document.getElementById(
                "program"
            ).innerText =

                data.program ||
                "Not Available";


            // ==================================================
            // EXPIRY / VALID TILL
            // ==================================================

            const expiryElement =
                document.getElementById("expiry");


            const expiryValue =
                data.expiryDate;


            const expiryDate =
                parseExpiryDate(expiryValue);


            if (expiryDate) {

                expiryElement.innerText =
                    formatExpiryDate(
                        expiryDate
                    );

            }
            else {

                expiryElement.innerText =
                    expiryValue ||
                    "Not Available";

            }


            // ==================================================
            // AUTOMATIC ACTIVE / EXPIRED
            // ==================================================

            const accessStatus =
                document.getElementById(
                    "accessStatus"
                );


            const cardActive =
                isCardActive(
                    expiryDate
                );


            if (cardActive) {

                accessStatus.innerText =
                    "ACTIVE";

                accessStatus.style.background =
                    "#16c60c";

            }
            else {

                accessStatus.innerText =
                    "EXPIRED";

                accessStatus.style.background =
                    "#ff0000";

            }


            // ==================================================
            // PAYMENT STATUS
            // ==================================================

            const paymentStatus =
                document.getElementById(
                    "paymentStatus"
                );


            const payment =
                (
                    data.paymentStatus ||
                    "PENDING"
                )
                .toString()
                .toLowerCase()
                .trim();


            if (payment === "approved") {

                paymentStatus.innerHTML =
                    '<i class="fa-solid fa-circle-check"></i> APPROVED';

                paymentStatus.classList.add(
                    "approved-status"
                );

            }
            else {

                paymentStatus.innerText =
                    payment.toUpperCase();

                paymentStatus.classList.add(
                    "pending-animation"
                );

            }


            // ==================================================
            // PHOTO
            // ==================================================

            const photo =
                document.getElementById(
                    "studentPhoto"
                );


            photo.src =
                data.photoURL ||
                "assets/students/S001.jpg";


            // If image fails

            photo.onerror = function () {

                this.src =
                    "assets/students/S001.jpg";

            };


            // ==================================================
            // SCAN COUNT
            // ==================================================

            document.getElementById(
                "scanCount"
            ).innerText =

                data.count || 0;


            // ==================================================
            // LAST VERIFIED
            // ==================================================

            const lastVerified =
                document.getElementById(
                    "lastVerified"
                );


            if (data.lastScan) {

                let scanDate = null;


                if (
                    typeof data.lastScan.toDate ===
                    "function"
                ) {

                    scanDate =
                        data.lastScan.toDate();

                }
                else {

                    scanDate =
                        new Date(
                            data.lastScan
                        );

                }


                if (
                    scanDate &&
                    !isNaN(
                        scanDate.getTime()
                    )
                ) {

                    lastVerified.innerText =
                        scanDate.toLocaleString(
                            "en-IN"
                        );

                }
                else {

                    lastVerified.innerText =
                        "---";

                }

            }
            else {

                lastVerified.innerText =
                    "---";

            }


            // ==================================================
            // CBT BUTTON
            // ==================================================

            const cbtBtn =
                document.getElementById(
                    "cbtBtn"
                );


            if (cbtBtn) {


                // Payment + expiry check

                if (
                    payment === "approved" &&
                    cardActive
                ) {


                    cbtBtn.style.cursor =
                        "pointer";


                cbtBtn.onclick = async function () {

    await db.collection("qrData")
        .doc(studentId)
        .update({

            cbtClickCount:
            firebase.firestore.FieldValue.increment(1)

        });

    window.location.href =
    "https://coachsiracademy.onlinetestpanel.com";

};

                }
                else {


                    cbtBtn.style.cursor =
                        "not-allowed";


                    cbtBtn.onclick =
                        function () {


                            if (
                                payment !==
                                "approved"
                            ) {

                                alert(
                                    "Payment approval pending."
                                );

                            }
                            else {

                                alert(
                                    "This card has expired."
                                );

                            }

                        };

                }

            }
const programMap = {
    "NEET Biology": "neet_biology",
    "NEET Physics": "neet_physics",
    "NEET Chemistry": "neet_chemistry"
};

const liveDocId = programMap[data.program];

if (liveDocId) {

    db.collection("liveClasses")
      .doc(liveDocId)
      .onSnapshot((doc) => {

        if (!doc.exists) return;

        const liveData = doc.data();

        if (liveData.status === true) {

            liveStatus.innerHTML =
            "🔴 LIVE CLASS RUNNING";

            liveStatus.classList.add("live");

        } else {

            liveStatus.innerHTML =
            "⚫ No Live Class";

            liveStatus.classList.remove("live");
        }

    });

}

            // ==================================================
            // LIVE CLASS BUTTON
            // ==================================================

            const liveBtn =
                document.getElementById(
                    "liveClassBtn"
                );


            if (liveBtn) {


                liveBtn.onclick =
                    async function () {


                        // --------------------------------------
                        // Payment check
                        // --------------------------------------

                        if (
                            payment !==
                            "approved"
                        ) {

                            alert(
                                "Payment approval pending."
                            );

                            return;

                        }


                        // --------------------------------------
                        // Expiry check
                        // --------------------------------------

                        if (!cardActive) {

                            alert(
                                "This card has expired."
                            );

                            return;

                        }


                        // --------------------------------------
                        // Program mapping
                        // --------------------------------------

                        const programMap = {

                            "NEET Biology":
                                "neet_biology",

                            "NEET Physics":
                                "neet_physics",

                            "NEET Chemistry":
                                "neet_chemistry"

                        };


                        const docId =
                            programMap[
                                data.program
                            ];


                        if (!docId) {

                            alert(
                                "Live class is not configured for this program."
                            );

                            return;

                        }


                        try {


                            const liveDoc =
                                await db
                                    .collection(
                                        "liveClasses"
                                    )
                                    .doc(docId)
                                    .get();


                            if (
                                !liveDoc.exists
                            ) {

                                alert(
                                    "Live class not found."
                                );

                                return;

                            }


                            const liveData =
                                liveDoc.data();


                            // ----------------------------------
                            // Live class status
                            // ----------------------------------

                            // ==================================================
// AUTOMATIC TIME CHECK
// ==================================================

let startTime = null;
let endTime = null;


if (
    liveData.startAt &&
    typeof liveData.startAt.toDate === "function"
) {

    startTime =
        liveData.startAt.toDate();

}


if (
    liveData.endAt &&
    typeof liveData.endAt.toDate === "function"
) {

    endTime =
        liveData.endAt.toDate();

}


const now = new Date();


if (
    !startTime ||
    !endTime
) {

    alert(
        "Live class timing is not configured."
    );

    return;

}


// Before class

if (now < startTime) {

    alert(
        "Live class has not started yet."
    );

    return;

}


// After class

if (now >= endTime) {

    alert(
        "Live class has ended."
    );

    return;

}


// ==================================================
// CLASS IS CURRENTLY LIVE
// ==================================================


                            // ----------------------------------
                            // Meeting link
                            // ----------------------------------

                            if (
                                !liveData.meetingLink
                            ) {

                                alert(
                                    "Meeting link is not available."
                                );

                                return;

                            }

await increaseScanCount();
                            await db.collection("qrData")
    .doc(studentId)
    .update({

        liveClassCount:
        firebase.firestore.FieldValue.increment(1)

    });
                            window.open(
                                liveData.meetingLink,
                                "_blank"
                            );


                        }
                        catch (error) {

                            console.error(
                                error
                            );

                            alert(
                                error.message
                            );

                        }

                    };

            }


            // ==================================================
            // QR CODE
            // ==================================================

            const qr =
                document.getElementById(
                    "qrcode"
                );


            qr.innerHTML = "";


            new QRCode(
                qr,
                {

                    text: studentId,

                    width: 150,

                    height: 150

                }
            );


        })


        .catch((error) => {


            console.error(
                "Firestore Error:",
                error
            );


            alert(
                error.message
            );


        });

}


// ======================================================
// WEBSITE BUTTON
// ======================================================

const websiteBtn =
    document.getElementById(
        "websiteBtn"
    );


if (websiteBtn) {


   websiteBtn.onclick = async function () {

    await db.collection("qrData")
        .doc(studentId)
        .update({

            count: firebase.firestore.FieldValue.increment(1),

            lastScan: firebase.firestore.FieldValue.serverTimestamp()

        });

    window.open(
        "https://vkplkmr-dotcom.github.io/coachsir--website/",
        "_blank"
    );

};
}


// ======================================================
// CARD FLIP
// ======================================================

const container =
    document.querySelector(
        ".card-container"
    );


const flipBtn =
    document.getElementById(
        "flipBtn"
    );


if (
    container &&
    flipBtn
) {


    flipBtn.addEventListener(
        "click",
        function () {


            container.classList.toggle(
                "flip"
            );


            if (
                container.classList.contains(
                    "flip"
                )
            ) {


                flipBtn.innerHTML =
                    '<i class="fa-solid fa-repeat"></i><span>Front</span>';


            }
            else {


                flipBtn.innerHTML =
                    '<i class="fa-solid fa-repeat"></i><span>Back</span>';


            }

        }
    );

}
// ======================================================
// ADD-ON : AUTOMATIC LIVE CLASS STATUS
// DOES NOT MODIFY OLD LIVE CLASS CODE
// Uses existing startTime field
// ======================================================

(function () {

    const autoLiveStatus =
        document.getElementById("liveStatus");

    if (!autoLiveStatus) return;


    // --------------------------------------------------
    // Convert "6:30 PM" into today's Date
    // --------------------------------------------------

    function getTodayTime(timeString) {

        if (!timeString) return null;

        const match = timeString
            .trim()
            .match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);

        if (!match) return null;

        let hour = parseInt(match[1], 10);
        const minute = parseInt(match[2], 10);
        const ampm = match[3].toUpperCase();

        if (ampm === "PM" && hour !== 12) {
            hour += 12;
        }

        if (ampm === "AM" && hour === 12) {
            hour = 0;
        }

        const now = new Date();

        return new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate(),
            hour,
            minute,
            0,
            0
        );
    }


    // --------------------------------------------------
    // Check automatic status
    // --------------------------------------------------

    async function automaticLiveCheck() {

        if (!studentId) return;


        const programMap = {

            "NEET Biology": "neet_biology",
            "NEET Physics": "neet_physics",
            "NEET Chemistry": "neet_chemistry"

        };


        const liveDocId =
            programMap[window.currentStudentProgram];


        if (!liveDocId) return;


        try {

            const doc = await db
                .collection("liveClasses")
                .doc(liveDocId)
                .get();


            if (!doc.exists) {

                return;

            }


            const liveData = doc.data();


            // Existing status must be TRUE
            // Old system remains untouched

            if (liveData.status !== true) {

                autoLiveStatus.innerHTML =
                    "⚫ No Live Class";

                autoLiveStatus.classList.remove("live");

                return;

            }


            const startTime =
                getTodayTime(liveData.startTime);


            if (!startTime) {

                return;

            }


            const now = new Date();


            // ------------------------------------------------
            // CLASS HAS NOT STARTED
            // ------------------------------------------------

            if (now < startTime) {

                autoLiveStatus.innerHTML =
                    "🟡 CLASS STARTING SOON";

                autoLiveStatus.classList.remove("live");

                return;

            }


            // ------------------------------------------------
            // CLASS STARTED
            // Default duration = 60 minutes
            // ------------------------------------------------

            const endTime =
                new Date(
                    startTime.getTime() +
                    60 * 60 * 1000
                );


            // ------------------------------------------------
            // LIVE
            // ------------------------------------------------

            if (
                now >= startTime &&
                now < endTime
            ) {

                autoLiveStatus.innerHTML =
                    "🔴 LIVE CLASS RUNNING";

                autoLiveStatus.classList.add("live");

                return;

            }


            // ------------------------------------------------
            // CLASS ENDED
            // ------------------------------------------------

            autoLiveStatus.innerHTML =
                "⚫ No Live Class";

            autoLiveStatus.classList.remove("live");


        }
        catch (error) {

            console.log(
                "Automatic Live Check:",
                error
            );

        }

    }


    // --------------------------------------------------
    // Get student's program
    // --------------------------------------------------

    db.collection("qrData")
        .doc(studentId)
        .get()
        .then(function (doc) {

            if (!doc.exists) return;

            const data = doc.data();

            window.currentStudentProgram =
                data.program;

            automaticLiveCheck();

        });


    // --------------------------------------------------
    // Check every 10 seconds
    // --------------------------------------------------

    setInterval(
        automaticLiveCheck,
        10000
    );

})();
