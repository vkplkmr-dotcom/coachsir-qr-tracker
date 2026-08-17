// ======================================================
// COACHsir ACADEMY - STUDENT CBT ACCESS CARD
// FINAL MERGED + CLEAN VERSION
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
// 2026-08-29
// 29/08/2026
// 29-08-2026
// Aug 29,2026
// Aug 29, 2026
// 29 Aug 2026
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
        // Month name formats
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


            const day =
                parseInt(parts[1], 10);

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
        // Browser fallback
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
// 29 Aug पूरा दिन ACTIVE
// 30 Aug से EXPIRED
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
// Supports:
// 7:30 PM
// 07:30 PM
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
// ======================================================

function getFirestoreDate(value) {

    if (!value) {
        return null;
    }


    // Firestore Timestamp

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


    // JavaScript Date

    if (value instanceof Date) {

        if (!isNaN(value.getTime())) {
            return value;
        }

    }


    // String

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
// GET LIVE START TIME
//
// Priority:
// 1. startAt
// 2. startTime
// ======================================================

function getLiveStartTime(liveData) {

    if (!liveData) {
        return null;
    }


    // Firestore Timestamp

    if (liveData.startAt) {

        const timestampDate =
            getFirestoreDate(
                liveData.startAt
            );


        if (timestampDate) {
            return timestampDate;
        }

    }


    // String time

    if (liveData.startTime) {

        return getTodayTime(
            liveData.startTime
        );

    }


    return null;

}


// ======================================================
// GET LIVE END TIME
//
// Priority:
// 1. endAt
// 2. endTime
// ======================================================

function getLiveEndTime(liveData) {

    if (!liveData) {
        return null;
    }


    // Firestore Timestamp

    if (liveData.endAt) {

        const timestampDate =
            getFirestoreDate(
                liveData.endAt
            );


        if (timestampDate) {
            return timestampDate;
        }

    }


    // String time

    if (liveData.endTime) {

        return getTodayTime(
            liveData.endTime
        );

    }


    return null;

}


// ======================================================
// CHECK WHETHER CLASS IS ACTUALLY LIVE
//
// Conditions:
//
// 1. status === true
// 2. current time >= start
// 3. current time < end
// ======================================================

function isLiveClassNow(liveData) {

    if (!liveData) {

        return {
            live: false,
            reason: "not-found"
        };

    }


    // Admin must enable class

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


    const now =
        new Date();


    // Before class

    if (now < startTime) {

        return {
            live: false,
            reason: "before-start",
            startTime,
            endTime
        };

    }


    // After class

    if (now >= endTime) {

        return {
            live: false,
            reason: "ended",
            startTime,
            endTime
        };

    }


    // Currently live

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
        isLiveClassNow(
            liveData
        );


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
// ACTIVITY COUNT HELPER
// ======================================================
//
// IMPORTANT:
//
// cardOpenCount = Card Open
// count         = QR Scan
// cbtClickCount = CBT Click
// liveClassCount = Live Class Click
// websiteClickCount = Website Click
//
// count is NOT used for card open / website / live.
// ======================================================

async function increaseActivityCount(
    fieldName,
    updateLastScan = false
) {

    if (!studentId) {
        return;
    }


    try {

        const updateData = {

            [fieldName]:
                firebase.firestore.FieldValue.increment(1)

        };


        if (updateLastScan) {

            updateData.lastScan =
                firebase.firestore.FieldValue.serverTimestamp();

        }


        await db
            .collection("qrData")
            .doc(studentId)
            .update(updateData);

    }
    catch (error) {

        console.error(
            "Activity Count Error:",
            fieldName,
            error
        );

    }

}


// ======================================================
// CARD OPEN COUNT
//
// Runs once when card loads.
// ======================================================

async function increaseCardOpenCount() {

    await increaseActivityCount(
        "cardOpenCount",
        true
    );

}


// ======================================================
// QR SCAN COUNT
//
// This should normally be called by QR tracker.
// It is NOT called automatically when card loads.
// ======================================================

async function increaseScanCount() {

    await increaseActivityCount(
        "count",
        true
    );

}


// ======================================================
// CBT CLICK COUNT
// ======================================================

async function increaseCbtClickCount() {

    await increaseActivityCount(
        "cbtClickCount",
        false
    );

}


// ======================================================
// LIVE CLASS CLICK COUNT
// ======================================================

async function increaseLiveClassCount() {

    await increaseActivityCount(
        "liveClassCount",
        false
    );

}


// ======================================================
// WEBSITE CLICK COUNT
// ======================================================

async function increaseWebsiteClickCount() {

    await increaseActivityCount(
        "websiteClickCount",
        false
    );

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
            // Only cardOpenCount increases.
            // count remains QR Scan count.
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


            const expiryDate =
                parseExpiryDate(
                    data.expiryDate
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
            // ACTIVITY COUNTS
            // ==================================================

            const scanCount =
                document.getElementById(
                    "scanCount"
                );


            if (scanCount) {

                scanCount.innerText =
                    data.count || 0;

            }


            const cardOpenCount =
                document.getElementById(
                    "cardOpenCount"
                );


            if (cardOpenCount) {

                cardOpenCount.innerText =
                    data.cardOpenCount || 0;

            }


            const qrScanCount =
                document.getElementById(
                    "qrScanCount"
                );


            if (qrScanCount) {

                qrScanCount.innerText =
                    data.count || 0;

            }


            const cbtClickCount =
                document.getElementById(
                    "cbtClickCount"
                );


            if (cbtClickCount) {

                cbtClickCount.innerText =
                    data.cbtClickCount || 0;

            }


            const liveClassCount =
                document.getElementById(
                    "liveClassCount"
                );


            if (liveClassCount) {

                liveClassCount.innerText =
                    data.liveClassCount || 0;

            }


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


            // ==================================================
            // LIVE CLASS DOCUMENT
            // ==================================================

            const liveDocId =
                programMap[
                    data.program
                ];


            // ==================================================
            // LIVE CLASS REAL-TIME LISTENER
            // ==================================================

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


                            updateLiveStatusUI(
                                liveDoc.data()
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
                            // REAL LIVE CHECK
                            // ----------------------------------

                            const liveResult =
                                isLiveClassNow(
                                    liveData
                                );


                            if (!liveResult.live) {

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
                            // LIVE CLASS CLICK COUNT
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
            // INITIAL LIVE STATUS CHECK
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


            // IMPORTANT:
            // Website click does NOT increase QR count.

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
// Uses:
// status
// startAt / startTime
// endAt / endTime
//
// So class will NOT show LIVE before start time.
// ======================================================

async function automaticLiveCheck() {

    if (!studentId) {
        return;
    }


    const liveStatus =
        document.getElementById(
            "liveStatus"
        );


    if (!liveStatus) {
        return;
    }


    const program =
        window.currentStudentProgram;


    if (!program) {
        return;
    }


    const liveDocId =
        programMap[
            program
        ];


    if (!liveDocId) {

        updateLiveStatusUI(
            null
        );

        return;

    }


    try {

        const doc =
            await db
                .collection("liveClasses")
                .doc(liveDocId)
                .get();


        if (!doc.exists) {

            updateLiveStatusUI(
                null
            );

            return;

        }


        updateLiveStatusUI(
            doc.data()
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
// FIRST AUTOMATIC CHECK
// ======================================================

setTimeout(
    automaticLiveCheck,
    1000
);


// ======================================================
// CHECK EVERY 10 SECONDS
// ======================================================

setInterval(
    automaticLiveCheck,
    10000
);
