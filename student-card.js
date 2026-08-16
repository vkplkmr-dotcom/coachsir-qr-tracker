```js
// ======================================================
// COACHsir ACADEMY - STUDENT CBT ACCESS CARD
// FINAL CLEAN VERSION
// ======================================================


// ======================================================
// GET STUDENT ID FROM URL
// Example:
// student-card.html?id=S001
// ======================================================

const params = new URLSearchParams(window.location.search);
const studentId = params.get("id");


// ======================================================
// PROGRAM MAP
// ======================================================

const programMap = {

    "NEET Biology": "neet_biology",
    "NEET Physics": "neet_physics",
    "NEET Chemistry": "neet_chemistry"

};


// ======================================================
// PARSE EXPIRY DATE
//
// Supports:
// 2026-08-22
// 2026-08-29
// Aug 29,2026
// Aug 29, 2026
// 29 Aug 2026
// 29/08/2026
// 29-08-2026
// Firestore Timestamp
// JavaScript Date
// ======================================================

function parseExpiryDate(expiry) {

    if (!expiry) {
        return null;
    }


    // --------------------------------------------------
    // Firestore Timestamp
    // --------------------------------------------------

    if (
        expiry &&
        typeof expiry.toDate === "function"
    ) {

        const date = expiry.toDate();

        if (!isNaN(date.getTime())) {
            return date;
        }

    }


    // --------------------------------------------------
    // JavaScript Date
    // --------------------------------------------------

    if (expiry instanceof Date) {

        if (!isNaN(expiry.getTime())) {
            return expiry;
        }

    }


    // --------------------------------------------------
    // String
    // --------------------------------------------------

    if (typeof expiry === "string") {

        let cleanDate = expiry.trim();

        if (!cleanDate) {
            return null;
        }


        // --------------------------------------------------
        // YYYY-MM-DD
        // --------------------------------------------------

        let match =
            cleanDate.match(
                /^(\d{4})-(\d{2})-(\d{2})$/
            );

        if (match) {

            const year =
                parseInt(match[1], 10);

            const month =
                parseInt(match[2], 10) - 1;

            const day =
                parseInt(match[3], 10);

            const date =
                new Date(
                    year,
                    month,
                    day
                );


            if (
                date.getFullYear() === year &&
                date.getMonth() === month &&
                date.getDate() === day
            ) {

                return date;

            }

        }


        // --------------------------------------------------
        // DD/MM/YYYY
        // DD-MM-YYYY
        // --------------------------------------------------

        match =
            cleanDate.match(
                /^(\d{1,2})[\/-](\d{1,2})[\/-](\d{4})$/
            );

        if (match) {

            const day =
                parseInt(match[1], 10);

            const month =
                parseInt(match[2], 10) - 1;

            const year =
                parseInt(match[3], 10);

            const date =
                new Date(
                    year,
                    month,
                    day
                );


            if (
                date.getFullYear() === year &&
                date.getMonth() === month &&
                date.getDate() === day
            ) {

                return date;

            }

        }


        // --------------------------------------------------
        // Month Name Formats
        //
        // Aug 29,2026
        // Aug 29, 2026
        // 29 Aug 2026
        // --------------------------------------------------

        cleanDate =
            cleanDate.replace(/,/g, " ");

        const parts =
            cleanDate.split(/\s+/);


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


        // --------------------------------------------------
        // Month Day Year
        // Example:
        // Aug 29 2026
        // --------------------------------------------------

        if (parts.length >= 3) {

            let monthName =
                parts[0]
                    .substring(0, 3);

            monthName =
                monthName.charAt(0).toUpperCase() +
                monthName.substring(1).toLowerCase();


            let day =
                parseInt(parts[1], 10);

            let year =
                parseInt(parts[2], 10);


            let month =
                monthMap[monthName];


            if (
                month !== undefined &&
                !isNaN(day) &&
                !isNaN(year)
            ) {

                const date =
                    new Date(
                        year,
                        month,
                        day
                    );


                if (
                    date.getFullYear() === year &&
                    date.getMonth() === month &&
                    date.getDate() === day
                ) {

                    return date;

                }

            }

        }


        // --------------------------------------------------
        // Day Month Year
        // Example:
        // 29 Aug 2026
        // --------------------------------------------------

        if (parts.length >= 3) {

            const day =
                parseInt(parts[0], 10);


            let monthName =
                parts[1]
                    .substring(0, 3);

            monthName =
                monthName.charAt(0).toUpperCase() +
                monthName.substring(1).toLowerCase();


            const year =
                parseInt(parts[2], 10);


            const month =
                monthMap[monthName];


            if (
                month !== undefined &&
                !isNaN(day) &&
                !isNaN(year)
            ) {

                const date =
                    new Date(
                        year,
                        month,
                        day
                    );


                if (
                    date.getFullYear() === year &&
                    date.getMonth() === month &&
                    date.getDate() === day
                ) {

                    return date;

                }

            }

        }


        // --------------------------------------------------
        // Final browser fallback
        // --------------------------------------------------

        const parsed =
            new Date(cleanDate);


        if (!isNaN(parsed.getTime())) {
            return parsed;
        }

    }


    return null;

}


// ======================================================
// FORMAT EXPIRY DATE
// Example:
// 29 Aug 2026
// ======================================================

function formatExpiryDate(date) {

    if (
        !date ||
        isNaN(date.getTime())
    ) {

        return "Not Available";

    }


    return date.toLocaleDateString(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    );

}


// ======================================================
// CHECK CARD ACTIVE
//
// Valid Till = 29 Aug 2026
//
// Active:
// 29 Aug 2026 पूरा दिन
//
// Expired:
// 30 Aug 2026 से
// ======================================================

function isCardActive(expiryDate) {

    if (!expiryDate) {
        return false;
    }


    if (
        !(expiryDate instanceof Date) ||
        isNaN(expiryDate.getTime())
    ) {

        return false;

    }


    const now = new Date();


    const today =
        new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate()
        );


    const expiry =
        new Date(
            expiryDate.getFullYear(),
            expiryDate.getMonth(),
            expiryDate.getDate()
        );


    return today <= expiry;

}


// ======================================================
// GET TODAY TIME
//
// Example:
// "7:30 PM"
// "07:30 PM"
// ======================================================

function getTodayTime(timeString) {

    if (!timeString) {
        return null;
    }


    const match =
        timeString
            .toString()
            .trim()
            .match(
                /^(\d{1,2}):(\d{2})\s*(AM|PM)$/i
            );


    if (!match) {
        return null;
    }


    let hour =
        parseInt(match[1], 10);

    const minute =
        parseInt(match[2], 10);

    const ampm =
        match[3].toUpperCase();


    if (
        hour < 1 ||
        hour > 12 ||
        minute < 0 ||
        minute > 59
    ) {

        return null;

    }


    if (
        ampm === "PM" &&
        hour !== 12
    ) {

        hour += 12;

    }


    if (
        ampm === "AM" &&
        hour === 12
    ) {

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


// ======================================================
// GET FIRESTORE DATE
// Supports:
// Firestore Timestamp
// JavaScript Date
// String
// ======================================================

function getFirestoreDate(value) {

    if (!value) {
        return null;
    }


    if (
        value &&
        typeof value.toDate === "function"
    ) {

        const date =
            value.toDate();

        if (!isNaN(date.getTime())) {
            return date;
        }

    }


    if (value instanceof Date) {

        if (!isNaN(value.getTime())) {
            return value;
        }

    }


    if (typeof value === "string") {

        const date =
            new Date(value);

        if (!isNaN(date.getTime())) {
            return date;
        }

    }


    return null;

}


// ======================================================
// GET LIVE CLASS START TIME
//
// Priority:
// 1. startAt Firestore Timestamp
// 2. startTime "7:30 PM"
// ======================================================

function getLiveStartTime(liveData) {

    if (!liveData) {
        return null;
    }


    if (liveData.startAt) {

        const timestampDate =
            getFirestoreDate(
                liveData.startAt
            );


        if (timestampDate) {
            return timestampDate;
        }

    }


    if (liveData.startTime) {

        return getTodayTime(
            liveData.startTime
        );

    }


    return null;

}


// ======================================================
// GET LIVE CLASS END TIME
//
// Priority:
// 1. endAt Firestore Timestamp
// 2. endTime "8:30 PM"
// ======================================================

function getLiveEndTime(liveData) {

    if (!liveData) {
        return null;
    }


    if (liveData.endAt) {

        const timestampDate =
            getFirestoreDate(
                liveData.endAt
            );


        if (timestampDate) {
            return timestampDate;
        }

    }


    if (liveData.endTime) {

        return getTodayTime(
            liveData.endTime
        );

    }


    return null;

}


// ======================================================
// CHECK WHETHER LIVE CLASS IS ACTUALLY LIVE
// ======================================================

function isLiveClassNow(liveData) {

    if (!liveData) {

        return {
            live: false,
            reason: "not-found"
        };

    }


    // Existing admin status must be TRUE
    if (liveData.status !== true) {

        return {
            live: false,
            reason: "disabled"
        };

    }


    const startTime =
        getLiveStartTime(liveData);


    const endTime =
        getLiveEndTime(liveData);


    if (!startTime || !endTime) {

        return {
            live: false,
            reason: "timing-missing"
        };

    }


    const now = new Date();


    if (now < startTime) {

        return {
            live: false,
            reason: "before-start",
            startTime,
            endTime
        };

    }


    if (now >= endTime) {

        return {
            live: false,
            reason: "ended",
            startTime,
            endTime
        };

    }


    return {
        live: true,
        reason: "live",
        startTime,
        endTime
    };

}


// ======================================================
// UPDATE LIVE STATUS UI
// ======================================================

function updateLiveStatusUI(liveData) {

    const liveStatus =
        document.getElementById(
            "liveStatus"
        );


    if (!liveStatus) {
        return;
    }


    const result =
        isLiveClassNow(liveData);


    liveStatus.classList.remove(
        "live"
    );


    // --------------------------------------------------
    // LIVE
    // --------------------------------------------------

    if (result.live) {

        liveStatus.innerHTML =
            "🔴 LIVE CLASS RUNNING";

        liveStatus.classList.add(
            "live"
        );

        return;

    }


    // --------------------------------------------------
    // BEFORE START
    // --------------------------------------------------

    if (
        result.reason ===
        "before-start"
    ) {

        liveStatus.innerHTML =
            "🟡 CLASS STARTING SOON";

        return;

    }


    // --------------------------------------------------
    // DEFAULT
    // --------------------------------------------------

    liveStatus.innerHTML =
        "⚫ No Live Class";

}


// ======================================================
// INCREASE CARD OPEN COUNT
// Runs ONCE when card loads
// ======================================================

async function increaseCardOpenCount() {

    if (!studentId) {
        return;
    }


    try {

        await db
            .collection("qrData")
            .doc(studentId)
            .update({

                cardOpenCount:
                    firebase.firestore.FieldValue.increment(1),

                lastScan:
                    firebase.firestore.FieldValue.serverTimestamp()

            });

    }
    catch (error) {

        console.error(
            "Card Open Count Error:",
            error
        );

    }

}


// ======================================================
// INCREASE QR SCAN COUNT
// Use this when QR tracker opens the card
// ======================================================

async function increaseScanCount() {

    if (!studentId) {
        return;
    }


    try {

        await db
            .collection("qrData")
            .doc(studentId)
            .update({

                count:
                    firebase.firestore.FieldValue.increment(1),

                lastScan:
                    firebase.firestore.FieldValue.serverTimestamp()

            });

    }
    catch (error) {

        console.error(
            "QR Scan Count Error:",
            error
        );

    }

}


// ======================================================
// UPDATE LIVE CLASS COUNT
// ======================================================

async function increaseLiveClassCount() {

    if (!studentId) {
        return;
    }


    try {

        await db
            .collection("qrData")
            .doc(studentId)
            .update({

                liveClassCount:
                    firebase.firestore.FieldValue.increment(1)

            });

    }
    catch (error) {

        console.error(
            "Live Class Count Error:",
            error
        );

    }

}


// ======================================================
// UPDATE CBT CLICK COUNT
// ======================================================

async function increaseCbtClickCount() {

    if (!studentId) {
        return;
    }


    try {

        await db
            .collection("qrData")
            .doc(studentId)
            .update({

                cbtClickCount:
                    firebase.firestore.FieldValue.increment(1)

            });

    }
    catch (error) {

        console.error(
            "CBT Count Error:",
            error
        );

    }

}


// ======================================================
// UPDATE WEBSITE CLICK COUNT
// ======================================================

async function increaseWebsiteClickCount() {

    if (!studentId) {
        return;
    }


    try {

        await db
            .collection("qrData")
            .doc(studentId)
            .update({

                websiteClickCount:
                    firebase.firestore.FieldValue.increment(1)

            });

    }
    catch (error) {

        console.error(
            "Website Count Error:",
            error
        );

    }

}


// ======================================================
// LOAD STUDENT
// ======================================================

if (!studentId) {

    alert(
        "Student ID Missing"
    );

}
else {

    db.collection("qrData")
        .doc(studentId)
        .get()

        .then(async (doc) => {


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


            const data =
                doc.data();


            // ==================================================
            // STORE PROGRAM GLOBALLY
            // ==================================================

            window.currentStudentProgram =
                data.program || "";


            // ==================================================
            // CARD OPEN COUNT
            //
            // IMPORTANT:
            // Only cardOpenCount increases here.
            //
            // "count" is reserved for QR Scan.
            // ==================================================

            increaseCardOpenCount();


            // ==================================================
            // STUDENT NAME
            // ==================================================

            const studentName =
                document.getElementById(
                    "studentName"
                );


            if (studentName) {

                studentName.innerText =
                    data.studentName ||
                    data.name ||
                    "No Name";

            }


            // ==================================================
            // STUDENT ID
            // ==================================================

            const studentIdElement =
                document.getElementById(
                    "studentId"
                );


            if (studentIdElement) {

                studentIdElement.innerText =
                    studentId;

            }


            // ==================================================
            // PROGRAM
            // ==================================================

            const programElement =
                document.getElementById(
                    "program"
                );


            if (programElement) {

                programElement.innerText =
                    data.program ||
                    "Not Available";

            }


            // ==================================================
            // EXPIRY / VALID TILL
            // ==================================================

            const expiryElement =
                document.getElementById(
                    "expiry"
                );


            const expiryValue =
                data.expiryDate;


            const expiryDate =
                parseExpiryDate(
                    expiryValue
                );


            if (expiryElement) {

                expiryElement.innerText =
                    formatExpiryDate(
                        expiryDate
                    );

            }


            // ==================================================
            // CARD ACTIVE / EXPIRED
            // ==================================================

            const accessStatus =
                document.getElementById(
                    "accessStatus"
                );


            const cardActive =
                isCardActive(
                    expiryDate
                );


            if (accessStatus) {

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


            if (paymentStatus) {

                paymentStatus.classList.remove(
                    "approved-status",
                    "pending-animation"
                );


                if (
                    payment ===
                    "approved"
                ) {

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

            }


            // ==================================================
            // PHOTO
            // ==================================================

            const photo =
                document.getElementById(
                    "studentPhoto"
                );


            if (photo) {

                photo.src =
                    data.photoURL ||
                    "assets/students/S001.jpg";


                photo.onerror =
                    function () {

                        this.src =
                            "assets/students/S001.jpg";

                    };

            }


            // ==================================================
            // SCAN COUNT
            // ==================================================

            const scanCount =
                document.getElementById(
                    "scanCount"
                );


            if (scanCount) {

                scanCount.innerText =
                    data.count || 0;

            }


            // ==================================================
            // CARD OPEN COUNT
            // ==================================================

            const cardOpenCount =
                document.getElementById(
                    "cardOpenCount"
                );


            if (cardOpenCount) {

                cardOpenCount.innerText =
                    data.cardOpenCount || 0;

            }


            // ==================================================
            // QR SCAN COUNT
            // ==================================================

            const qrScanCount =
                document.getElementById(
                    "qrScanCount"
                );


            if (qrScanCount) {

                qrScanCount.innerText =
                    data.count || 0;

            }


            // ==================================================
            // CBT CLICK COUNT
            // ==================================================

            const cbtClickCount =
                document.getElementById(
                    "cbtClickCount"
                );


            if (cbtClickCount) {

                cbtClickCount.innerText =
                    data.cbtClickCount || 0;

            }


            // ==================================================
            // LIVE CLASS COUNT
            // ==================================================

            const liveClassCount =
                document.getElementById(
                    "liveClassCount"
                );


            if (liveClassCount) {

                liveClassCount.innerText =
                    data.liveClassCount || 0;

            }


            // ==================================================
            // WEBSITE CLICK COUNT
            // ==================================================

            const websiteClickCount =
                document.getElementById(
                    "websiteClickCount"
                );


            if (websiteClickCount) {

                websiteClickCount.innerText =
                    data.websiteClickCount || 0;

            }


            // ==================================================
            // LAST VERIFIED
            // ==================================================

            const lastVerified =
                document.getElementById(
                    "lastVerified"
                );


            if (lastVerified) {

                if (data.lastScan) {

                    const scanDate =
                        getFirestoreDate(
                            data.lastScan
                        );


                    if (scanDate) {

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

            }


            // ==================================================
            // LIVE STATUS
            // ==================================================

            const liveDocId =
                programMap[
                    data.program
                ];


            if (liveDocId) {

                db.collection("liveClasses")
                    .doc(liveDocId)
                    .onSnapshot(
                        (liveDoc) => {

                            if (!liveDoc.exists) {

                                updateLiveStatusUI(
                                    null
                                );

                                return;

                            }


                            const liveData =
                                liveDoc.data();


                            updateLiveStatusUI(
                                liveData
                            );

                        },
                        (error) => {

                            console.error(
                                "Live Class Listener Error:",
                                error
                            );

                        }
                    );

            }
            else {

                updateLiveStatusUI(
                    null
                );

            }


            // ==================================================
            // CBT BUTTON
            // ==================================================

            const cbtBtn =
                document.getElementById(
                    "cbtBtn"
                );


            if (cbtBtn) {

                if (
                    payment === "approved" &&
                    cardActive
                ) {

                    cbtBtn.style.cursor =
                        "pointer";


                    cbtBtn.onclick =
                        async function () {

                            await increaseCbtClickCount();


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
                        // PAYMENT CHECK
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
                        // EXPIRY CHECK
                        // --------------------------------------

                        if (!cardActive) {

                            alert(
                                "This card has expired."
                            );

                            return;

                        }


                        // --------------------------------------
                        // PROGRAM CHECK
                        // --------------------------------------

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


                            if (!liveDoc.exists) {

                                alert(
                                    "Live class not found."
                                );

                                return;

                            }


                            const liveData =
                                liveDoc.data();


                            // ----------------------------------
                            // ACTUAL LIVE CHECK
                            // ----------------------------------

                            const liveResult =
                                isLiveClassNow(
                                    liveData
                                );


                            if (
                                !liveResult.live
                            ) {

                                if (
                                    liveResult.reason ===
                                    "before-start"
                                ) {

                                    alert(
                                        "Live class has not started yet."
                                    );

                                }
                                else if (
                                    liveResult.reason ===
                                    "ended"
                                ) {

                                    alert(
                                        "Live class has ended."
                                    );

                                }
                                else if (
                                    liveResult.reason ===
                                    "disabled"
                                ) {

                                    alert(
                                        "No Live Class is running right now."
                                    );

                                }
                                else {

                                    alert(
                                        "Live class timing is not configured."
                                    );

                                }

                                return;

                            }


                            // ----------------------------------
                            // MEETING LINK
                            // ----------------------------------

                            if (
                                !liveData.meetingLink
                            ) {

                                alert(
                                    "Meeting link is not available."
                                );

                                return;

                            }


                            // ----------------------------------
                            // COUNT LIVE CLASS CLICK
                            // ----------------------------------

                            await increaseLiveClassCount();


                            // ----------------------------------
                            // OPEN MEETING
                            // ----------------------------------

                            window.open(
                                liveData.meetingLink,
                                "_blank"
                            );

                        }
                        catch (error) {

                            console.error(
                                "Live Class Error:",
                                error
                            );


                            alert(
                                error.message ||
                                "Unable to open live class."
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


            if (
                qr &&
                typeof QRCode !==
                "undefined"
            ) {

                qr.innerHTML =
                    "";


                new QRCode(
                    qr,
                    {

                        text:
                            studentId,

                        width:
                            150,

                        height:
                            150

                    }
                );

            }


            // ==================================================
            // INITIAL LIVE STATUS
            // ==================================================

            if (liveDocId) {

                try {

                    const initialLiveDoc =
                        await db
                            .collection(
                                "liveClasses"
                            )
                            .doc(liveDocId)
                            .get();


                    if (
                        initialLiveDoc.exists
                    ) {

                        updateLiveStatusUI(
                            initialLiveDoc.data()
                        );

                    }
                    else {

                        updateLiveStatusUI(
                            null
                        );

                    }

                }
                catch (error) {

                    console.error(
                        "Initial Live Status Error:",
                        error
                    );

                }

            }

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

    websiteBtn.onclick =
        async function () {


            await increaseWebsiteClickCount();


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
// AUTOMATIC LIVE STATUS REFRESH
//
// Checks every 10 seconds.
//
// This is only a UI refresh.
// Actual button click performs another
// real-time Firestore check before opening.
// ======================================================

async function automaticLiveCheck() {

    if (!studentId) {
        return;
    }


    const autoLiveStatus =
        document.getElementById(
            "liveStatus"
        );


    if (!autoLiveStatus) {
        return;
    }


    const program =
        window.currentStudentProgram;


    if (!program) {
        return;
    }


    const liveDocId =
        programMap[program];


    if (!liveDocId) {

        updateLiveStatusUI(
            null
        );

        return;

    }


    try {

        const doc =
            await db
                .collection(
                    "liveClasses"
                )
                .doc(liveDocId)
                .get();


        if (!doc.exists) {

            updateLiveStatusUI(
                null
            );

            return;

        }


        const liveData =
            doc.data();


        updateLiveStatusUI(
            liveData
        );

    }
    catch (error) {

        console.error(
            "Automatic Live Check:",
            error
        );

    }

}


// ======================================================
// CHECK LIVE STATUS EVERY 10 SECONDS
// ======================================================

setInterval(
    automaticLiveCheck,
    10000
);


// ======================================================
// OPTIONAL FIRST CHECK
// ======================================================

setTimeout(
    automaticLiveCheck,
    1000
);
```
