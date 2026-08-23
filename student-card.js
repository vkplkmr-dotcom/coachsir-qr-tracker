// ======================================================
// COACHsir ACADEMY - STUDENT CBT ACCESS CARD
// FINAL MERGED + CLEAN VERSION
// ======================================================


// ======================================================
// GET STUDENT ID FROM URL
// Example:
// student-card.html?id=S001
// ======================================================

const params =
    new URLSearchParams(
        window.location.search
    );

const studentId =
    params.get("id");
// ======================================================
// COACHsir SINGLE DEVICE LOCK SYSTEM
// ======================================================
//
// RULE:
//
// Student:
// First device = LOCKED
// Same device = ALLOWED
// Other device = BLOCKED
//
// Admin:
// Firebase authenticated admin = ALLOWED
//
// Firestore:
// qrData/{studentId}
// deviceLock: {
//     locked: true,
//     deviceToken: "...",
//     activatedAt: timestamp,
//     lastAccess: timestamp
// }
//
// Admin collection:
// admins/{uid}
//
// ======================================================


// ======================================================
// DEVICE TOKEN KEY
// ======================================================

const DEVICE_TOKEN_PREFIX =
    "coachsir_device_";


// ======================================================
// GET DEVICE STORAGE KEY
// ======================================================

function getDeviceStorageKey(id) {

    return (
        DEVICE_TOKEN_PREFIX +
        String(id).toUpperCase()
    );

}


// ======================================================
// GENERATE RANDOM DEVICE TOKEN
// ======================================================

function generateDeviceToken() {

    if (
        window.crypto &&
        window.crypto.getRandomValues
    ) {

        const array =
            new Uint32Array(8);

        window.crypto.getRandomValues(
            array
        );

        return Array.from(array)
            .map(
                value =>
                    value.toString(16)
            )
            .join("-");

    }


    return (
        Date.now().toString(36) +
        "-" +
        Math.random()
            .toString(36)
            .substring(2) +
        "-" +
        Math.random()
            .toString(36)
            .substring(2)
    );

}


// ======================================================
// GET LOCAL DEVICE TOKEN
// ======================================================

function getLocalDeviceToken() {

    if (!studentId) {
        return null;
    }

    const key =
        getDeviceStorageKey(
            studentId
        );

    try {

        let token =
            localStorage.getItem(
                key
            );

        if (!token) {

            token =
                generateDeviceToken();

            localStorage.setItem(
                key,
                token
            );

        }

        return token;

    }
    catch (error) {

        console.error(
            "Device storage error:",
            error
        );

        return null;

    }

}


// ======================================================
// CHECK ADMIN
// ======================================================
//
// Admin dashboard must be logged in with Firebase Auth.
//
// Firestore:
//
// admins
//   └── Firebase UID
//
// Example:
//
// admins
//   └── abc123xyz
//
// ======================================================

async function isCurrentUserAdmin() {

    try {

        if (
            typeof firebase ===
            "undefined"
        ) {

            return false;

        }


        if (
            !firebase.auth
        ) {

            return false;

        }


        const user =
            firebase.auth()
                .currentUser;


        if (!user) {

            return false;

        }


        const adminDoc =
            await db
                .collection("admins")
                .doc(user.uid)
                .get();


        return adminDoc.exists;

    }
    catch (error) {

        console.error(
            "Admin verification error:",
            error
        );

        return false;

    }

}


// ======================================================
// SHOW DEVICE BLOCK SCREEN
// ======================================================

function showDeviceBlockedScreen() {

    document.body.innerHTML = `

        <div style="
            min-height:100vh;
            display:flex;
            align-items:center;
            justify-content:center;
            padding:20px;
            box-sizing:border-box;
            background:
                linear-gradient(
                    135deg,
                    #071a33,
                    #0b3d91
                );
            font-family:Arial,sans-serif;
        ">

            <div style="
                width:100%;
                max-width:420px;
                background:#ffffff;
                border-radius:20px;
                padding:30px 24px;
                text-align:center;
                box-shadow:
                    0 20px 60px
                    rgba(0,0,0,.35);
                box-sizing:border-box;
            ">

                <div style="
                    width:75px;
                    height:75px;
                    margin:0 auto 20px;
                    border-radius:50%;
                    display:flex;
                    align-items:center;
                    justify-content:center;
                    background:#ffe8e8;
                    color:#d60000;
                    font-size:34px;
                ">

                    <i class="fa-solid fa-lock"></i>

                </div>

                <h2 style="
                    margin:0 0 12px;
                    color:#14213d;
                ">
                    Card Locked
                </h2>

                <p style="
                    color:#555;
                    line-height:1.6;
                    margin:0 0 20px;
                ">
                    This digital card is already
                    activated on another device.
                </p>

                <div style="
                    background:#f5f7fa;
                    border-radius:12px;
                    padding:14px;
                    margin-bottom:20px;
                    color:#333;
                ">

                    <strong>
                        Student ID
                    </strong>

                    <br>

                    <span>
                        ${studentId || "---"}
                    </span>

                </div>

                <p style="
                    font-size:13px;
                    color:#777;
                    margin:0;
                ">
                    Please contact COACHsir Academy
                    support or admin to change the
                    registered device.
                </p>

            </div>

        </div>

    `;

}


// ======================================================
// DEVICE LOCK VERIFICATION
// ======================================================

async function verifyStudentDevice(
    studentData
) {

    // --------------------------------------------------
    // ADMIN BYPASS
    // --------------------------------------------------

    const admin =
        await isCurrentUserAdmin();


    if (admin) {

        console.log(
            "✅ Admin access: Device lock bypassed"
        );

        return {
            allowed: true,
            admin: true
        };

    }


    // --------------------------------------------------
    // GET LOCAL TOKEN
    // --------------------------------------------------

    const localToken =
        getLocalDeviceToken();


    if (!localToken) {

        return {
            allowed: false,
            reason: "device-token-error"
        };

    }


    const lock =
        studentData.deviceLock;


    // --------------------------------------------------
    // FIRST DEVICE
    // --------------------------------------------------

    if (
        !lock ||
        lock.locked !== true ||
        !lock.deviceToken
    ) {

        try {

            await db
                .collection("qrData")
                .doc(studentId)
                .update({

                    deviceLock: {

                        locked: true,

                        deviceToken:
                            localToken,

                        activatedAt:
                            firebase.firestore
                                .FieldValue
                                .serverTimestamp(),

                        lastAccess:
                            firebase.firestore
                                .FieldValue
                                .serverTimestamp()

                    }

                });


            console.log(
                "✅ Device registered:",
                studentId
            );


            return {
                allowed: true,
                admin: false,
                firstDevice: true
            };

        }
        catch (error) {

            console.error(
                "Device registration error:",
                error
            );


            return {
                allowed: false,
                reason: "registration-error"
            };

        }

    }


    // --------------------------------------------------
    // SAME DEVICE
    // --------------------------------------------------

    if (
        lock.deviceToken ===
        localToken
    ) {

        try {

            await db
                .collection("qrData")
                .doc(studentId)
                .update({

                    "deviceLock.lastAccess":
                        firebase.firestore
                            .FieldValue
                            .serverTimestamp()

                });

        }
        catch (error) {

            console.warn(
                "Last access update failed:",
                error
            );

        }


        return {
            allowed: true,
            admin: false,
            sameDevice: true
        };

    }


    // --------------------------------------------------
    // DIFFERENT DEVICE
    // --------------------------------------------------

    console.warn(
        "❌ Different device detected:",
        studentId
    );


    return {
        allowed: false,
        reason: "different-device"
    };

}

// ======================================================
// COACHsir DYNAMIC QR CONFIG
// ======================================================

const COACHSIR_QR_TRACKER_URL =
    "https://vkplkmr-dotcom.github.io/coachsir-qr-tracker/?id=";


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

        const date =
            expiry.toDate();

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

        let cleanDate =
            expiry.trim();

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
        // MONTH NAME FORMATS
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


    const now =
        new Date();


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


    const now =
        new Date();


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
// GET LIVE START TIME
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
// GET LIVE END TIME
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
// CHECK WHETHER CLASS IS ACTUALLY LIVE
// ======================================================

function isLiveClassNow(liveData) {

    if (!liveData) {

        return {
            live: false,
            reason: "not-found"
        };

    }


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
        isLiveClassNow(
            liveData
        );


    liveStatus.classList.remove(
        "live"
    );


    if (result.live) {

        liveStatus.innerHTML =
            "🔴 LIVE CLASS RUNNING";

        liveStatus.classList.add(
            "live"
        );

        return;

    }


    if (
        result.reason ===
        "before-start"
    ) {

        liveStatus.innerHTML =
            "🟡 CLASS STARTING SOON";

        return;

    }


    liveStatus.innerHTML =
        "⚫ No Live Class";

}


// ======================================================
// ACTIVITY COUNT HELPER
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
// ======================================================

async function increaseCardOpenCount() {

    await increaseActivityCount(
        "cardOpenCount",
        true
    );

}


// ======================================================
// QR SCAN COUNT
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
// DYNAMIC QR GENERATOR
// ======================================================
//
// IMPORTANT:
//
// QR DATA:
// https://vkplkmr-dotcom.github.io/coachsir-qr-tracker/?id=S001
//
// CENTER TEXT:
// S001
//
// S046 automatically becomes:
// https://vkplkmr-dotcom.github.io/coachsir-qr-tracker/?id=S046
//
// ======================================================

// ======================================================
// COACHsir DYNAMIC QR
// SCANNABLE QR + CENTER STUDENT ID
// ======================================================

function generateStudentQR(studentIdValue) {

    const qrContainer =
        document.getElementById("qrcode");

    if (!qrContainer) {
        console.error("❌ QR container not found");
        return;
    }

    if (!studentIdValue) {
        console.error("❌ Student ID missing");
        return;
    }

    if (typeof QRCode === "undefined") {
        console.error("❌ QRCode library not loaded");
        return;
    }

    // --------------------------------------------------
    // CLEAN
    // --------------------------------------------------

    qrContainer.innerHTML = "";

    // --------------------------------------------------
    // IMPORTANT CONTAINER FIX
    // --------------------------------------------------

    qrContainer.style.position = "relative";
    qrContainer.style.width = "150px";
    qrContainer.style.height = "150px";
    qrContainer.style.padding = "0";
    qrContainer.style.margin = "auto";
    qrContainer.style.background = "#ffffff";
    qrContainer.style.boxSizing = "border-box";
    qrContainer.style.overflow = "hidden";

    // --------------------------------------------------
    // QR URL
    // --------------------------------------------------

    const qrURL =
        COACHSIR_QR_TRACKER_URL +
        encodeURIComponent(studentIdValue);

    console.log(
        "✅ COACHsir QR URL:",
        qrURL
    );

    // --------------------------------------------------
    // CREATE QR
    // --------------------------------------------------

    new QRCode(qrContainer, {

        text: qrURL,

        width: 150,
        height: 150,

        correctLevel:
            QRCode.CorrectLevel.H

    });

    // --------------------------------------------------
    // WAIT FOR QR
    // --------------------------------------------------

    let attempts = 0;

    const checkQR =
        setInterval(function () {

            attempts++;

            const canvas =
                qrContainer.querySelector("canvas");

            if (!canvas) {

                if (attempts >= 30) {

                    clearInterval(checkQR);

                    console.error(
                        "❌ QR canvas not found"
                    );

                }

                return;
            }

            clearInterval(checkQR);

            // --------------------------------------------------
            // FORCE CANVAS POSITION
            // --------------------------------------------------

            canvas.style.position = "absolute";
            canvas.style.left = "0";
            canvas.style.top = "0";
            canvas.style.width = "150px";
            canvas.style.height = "150px";

            // --------------------------------------------------
            // CENTER ID OVERLAY
            // --------------------------------------------------

            const idBox =
                document.createElement("div");

            idBox.innerText =
                studentIdValue.toUpperCase();

            idBox.style.position =
                "absolute";

            idBox.style.left =
                "50%";

            idBox.style.top =
                "50%";

            idBox.style.transform =
                "translate(-50%, -50%)";

            // SMALL BOX
            idBox.style.width =
                "42px";

            idBox.style.height =
                "17px";

            idBox.style.background =
                "#ffffff";

            idBox.style.border =
                "1px solid #e60000";

            idBox.style.borderRadius =
                "3px";

            idBox.style.display =
                "flex";

            idBox.style.alignItems =
                "center";

            idBox.style.justifyContent =
                "center";

            idBox.style.fontFamily =
                "Arial, sans-serif";

            idBox.style.fontSize =
                "10px";

            idBox.style.fontWeight =
                "800";

            idBox.style.color =
                "#e60000";

            idBox.style.lineHeight =
                "1";

            idBox.style.zIndex =
                "10";

            idBox.style.pointerEvents =
                "none";

            idBox.style.boxSizing =
                "border-box";

            // --------------------------------------------------
            // ADD ID
            // --------------------------------------------------

            qrContainer.appendChild(
                idBox
            );

            console.log(
                "✅ QR CENTER ID:",
                studentIdValue
            );

        }, 100);

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
            // DYNAMIC QR
            // ==================================================
            //
            // IMPORTANT:
            //
            // OLD:
            // QR contained only S001
            //
            // NEW:
            // QR contains complete tracker URL
            //
            // S001:
            // https://vkplkmr-dotcom.github.io/
            // coachsir-qr-tracker/?id=S001
            //
            // S046:
            // https://vkplkmr-dotcom.github.io/
            // coachsir-qr-tracker/?id=S046
            //
            // ==================================================

            generateStudentQR(
                studentId
            );


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
// ======================================================
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
