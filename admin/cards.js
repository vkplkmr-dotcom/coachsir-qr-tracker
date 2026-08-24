// ======================================================
// COACHsir ACADEMY
// ADMIN DIGITAL CARD MANAGEMENT
// ======================================================


// ======================================================
// FIREBASE CONFIG
// ======================================================

const firebaseConfig = {

    apiKey:
        "AIzaSyANpygbwjFFu1R7Aw-o36T5SkMmXVEhZOA",

    authDomain:
        "qr-tracker-57393.firebaseapp.com",

    projectId:
        "qr-tracker-57393",

    storageBucket:
        "qr-tracker-57393.firebasestorage.app",

    messagingSenderId:
        "617727926623",

    appId:
        "1:617727926623:web:36d78ef0a54e6051cbd6ea"

};


// ======================================================
// INITIALIZE FIREBASE
// ======================================================

if (!firebase.apps.length) {

    firebase.initializeApp(
        firebaseConfig
    );

}


const db =
    firebase.firestore();


// ======================================================
// ADMIN UID
// ======================================================

const COACHSIR_ADMIN_UID =
    "iYo2MA9sWNcRHNQcdREoQm47AX22";


// ======================================================
// STUDENT DATA
// ======================================================

let allStudents = [];


// ======================================================
// CHECK ADMIN
// ======================================================

// ======================================================
// VERIFY ADMIN
// WAITS FOR FIREBASE AUTH SESSION
// ======================================================

async function verifyAdmin() {

    try {

        const auth =
            firebase.auth();


        const user =
            await new Promise(
                (resolve) => {

                    const unsubscribe =
                        auth.onAuthStateChanged(
                            function(user) {

                                unsubscribe();

                                resolve(user);

                            }
                        );

                }
            );


        // ==============================================
        // ADMIN LOGIN NOT FOUND
        // ==============================================

        if (!user) {

            alert(
                "Please login as Admin."
            );

            window.location.href =
                "login.html";

            return false;

        }


        // ==============================================
        // CHECK ADMIN UID
        // ==============================================

        if (
            user.uid !==
            COACHSIR_ADMIN_UID
        ) {

            alert(
                "Unauthorized Admin."
            );

            // IMPORTANT:
            // Do NOT signOut here.
            // This prevents unwanted logout.

            return false;

        }


        console.log(
            "✅ Admin Verified:",
            user.uid
        );


        return true;

    }
    catch (error) {

        console.error(
            "Admin verification error:",
            error
        );


        alert(
            "Admin verification failed."
        );


        return false;

    }

}

// ======================================================
// LOAD STUDENTS
// ======================================================

async function loadStudentCards() {

    try {

        const allowed =
            await verifyAdmin();


        if (!allowed) {
            return;
        }


        const snapshot =
            await db
                .collection("qrData")
                .get();


        allStudents = [];


        snapshot.forEach(
            doc => {

                const data =
                    doc.data();


                allStudents.push({

                    id:
                        doc.id,

                    name:
                        data.studentName ||
                        data.name ||
                        "No Name",

                    program:
                        data.program ||
                        "Not Available",

                    paymentStatus:
                        data.paymentStatus ||
                        "pending",

                    expiryDate:
                        data.expiryDate,

                    deviceLock:
                        data.deviceLock

                });

            }
        );


        allStudents.sort(
            (a, b) =>
                a.id.localeCompare(
                    b.id
                )
        );


        document.getElementById(
            "studentTotal"
        ).innerText =
            allStudents.length +
            " Students";


        renderStudentCards(
            allStudents
        );

    }
    catch (error) {

        console.error(
            "Load Cards Error:",
            error
        );


        document.getElementById(
            "cardsContainer"
        ).innerHTML = `

            <div style="
                padding:30px;
                text-align:center;
                color:#d00;
            ">

                ❌ Unable to load students.

                <br><br>

                ${error.message}

            </div>

        `;

    }

}


// ======================================================
// FORMAT EXPIRY
// ======================================================

function formatExpiry(value) {

    if (!value) {

        return "Not Available";

    }


    try {

        let date;


        if (
            value &&
            typeof value.toDate ===
            "function"
        ) {

            date =
                value.toDate();

        }
        else {

            date =
                new Date(value);

        }


        if (
            isNaN(
                date.getTime()
            )
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
    catch (error) {

        return "Not Available";

    }

}


// ======================================================
// DEVICE STATUS
// ======================================================

function getDeviceStatus(
    deviceLock
) {

    if (
        deviceLock &&
        deviceLock.locked === true
    ) {

        return `

            <span style="
                color:#c62828;
                font-weight:700;
            ">

                🔒 Locked

            </span>

        `;

    }


    return `

        <span style="
            color:#2e7d32;
            font-weight:700;
        ">

            🟢 Not Registered

        </span>

    `;

}


// ======================================================
// PAYMENT STATUS
// ======================================================

function getPaymentStatus(
    status
) {

    const payment =
        String(
            status || "pending"
        )
        .toLowerCase();


    if (
        payment ===
        "approved"
    ) {

        return `

            <span style="
                color:#16821d;
                font-weight:700;
            ">

                ✅ Approved

            </span>

        `;

    }


    return `

        <span style="
            color:#d97706;
            font-weight:700;
        ">

            ⏳ ${payment}

        </span>

    `;

}


// ======================================================
// RENDER STUDENT CARDS
// ======================================================

function renderStudentCards(
    students
) {

    const container =
        document.getElementById(
            "cardsContainer"
        );


    if (!students.length) {

        container.innerHTML = `

            <div style="
                text-align:center;
                padding:40px;
            ">

                No students found.

            </div>

        `;

        return;

    }


    let html = "";


    students.forEach(
        student => {

            html += `

                <div
                    class="student-admin-card"
                    style="
                        background:#fff;
                        border:1px solid #e4e7eb;
                        border-radius:14px;
                        padding:18px;
                        margin-bottom:15px;
                        box-shadow:
                            0 5px 18px
                            rgba(0,0,0,.06);
                    "
                >

                    <div style="
                        display:flex;
                        justify-content:space-between;
                        gap:15px;
                        flex-wrap:wrap;
                    ">


                        <div>

                            <div style="
                                font-size:18px;
                                font-weight:800;
                                color:#123;
                            ">

                                ${escapeHTML(
                                    student.id
                                )}

                            </div>


                            <div style="
                                margin-top:5px;
                                font-size:16px;
                                font-weight:600;
                            ">

                                ${escapeHTML(
                                    student.name
                                )}

                            </div>


                            <div style="
                                margin-top:5px;
                                color:#666;
                            ">

                                🎓
                                ${escapeHTML(
                                    student.program
                                )}

                            </div>

                        </div>


                        <div style="
                            text-align:right;
                        ">

                            <div>
                                Payment:
                                ${getPaymentStatus(
                                    student.paymentStatus
                                )}
                            </div>


                            <div style="
                                margin-top:6px;
                            ">

                                Valid Till:
                                <b>
                                    ${formatExpiry(
                                        student.expiryDate
                                    )}
                                </b>

                            </div>


                            <div style="
                                margin-top:6px;
                            ">

                                Device:
                                ${getDeviceStatus(
                                    student.deviceLock
                                )}

                            </div>

                        </div>


                    </div>


                    <div style="
                        display:flex;
                        gap:10px;
                        flex-wrap:wrap;
                        margin-top:18px;
                        padding-top:15px;
                        border-top:1px solid #eee;
                    ">


                        <button
                            class="view-card-admin-btn"
                            onclick="
                                viewStudentCard(
                                    '${escapeJS(
                                        student.id
                                    )}'
                                )
                            "
                        >

                            <i class="
                                fa-solid
                                fa-id-card
                            "></i>

                            View Card

                        </button>


                        <button
                            class="reset-device-admin-btn"
                            onclick="
                                resetStudentDevice(
                                    '${escapeJS(
                                        student.id
                                    )}'
                                )
                            "
                        >

                            <i class="
                                fa-solid
                                fa-mobile-screen-button
                            "></i>

                            Reset Device

                        </button>


                    </div>

                </div>

            `;

        }
    );


    container.innerHTML =
        html;

}


// ======================================================
// VIEW STUDENT CARD - ADMIN MODE
// ======================================================

window.viewStudentCard =
    function(studentId) {

        if (!studentId) {

            alert(
                "Student ID missing."
            );

            return;

        }


        const cardURL =
            "../student-card.html?id=" +
            encodeURIComponent(studentId) +
            "&admin=1";


        window.open(
            cardURL,
            "_blank"
        );

    };


// ======================================================
// RESET DEVICE
// ======================================================

window.resetStudentDevice =
    async function(studentId) {

        if (!studentId) {

            alert(
                "Student ID missing."
            );

            return;

        }


        const confirmed =
            confirm(
                "Reset device for " +
                studentId +
                "?\n\n" +
                "The currently registered device " +
                "will be removed."
            );


        if (!confirmed) {
            return;
        }


        try {

            const allowed =
                await verifyAdmin();


            if (!allowed) {
                return;
            }


            const studentRef =
                db
                    .collection("qrData")
                    .doc(studentId);


            const studentDoc =
                await studentRef.get();


            if (!studentDoc.exists) {

                alert(
                    "Student not found."
                );

                return;

            }


            await studentRef.update({

                deviceLock:
                    firebase.firestore
                        .FieldValue
                        .delete()

            });


            alert(
                "✅ Device Reset Successfully\n\n" +
                "Student: " +
                studentId
            );


            await loadStudentCards();

        }
        catch (error) {

            console.error(
                "Reset Device Error:",
                error
            );


            alert(
                "❌ Reset failed:\n\n" +
                error.message
            );

        }

    };


// ======================================================
// SEARCH
// ======================================================

document
    .getElementById(
        "studentSearch"
    )
    .addEventListener(
        "input",
        function() {

            const query =
                this.value
                    .toLowerCase()
                    .trim();


            if (!query) {

                renderStudentCards(
                    allStudents
                );

                return;

            }


            const filtered =
                allStudents.filter(
                    student => {

                        return (

                            student.id
                                .toLowerCase()
                                .includes(
                                    query
                                )

                            ||

                            student.name
                                .toLowerCase()
                                .includes(
                                    query
                                )

                            ||

                            student.program
                                .toLowerCase()
                                .includes(
                                    query
                                )

                        );

                    }
                );


            renderStudentCards(
                filtered
            );

        }
    );


// ======================================================
// CLEAR SEARCH
// ======================================================

window.clearStudentSearch =
    function() {

        const input =
            document.getElementById(
                "studentSearch"
            );


        input.value = "";


        renderStudentCards(
            allStudents
        );

    };


// ======================================================
// ESCAPE HTML
// ======================================================

function escapeHTML(
    value
) {

    return String(
        value || ""
    )
    .replace(
        /&/g,
        "&amp;"
    )
    .replace(
        /</g,
        "&lt;"
    )
    .replace(
        />/g,
        "&gt;"
    )
    .replace(
        /"/g,
        "&quot;"
    )
    .replace(
        /'/g,
        "&#039;"
    );

}


// ======================================================
// ESCAPE JAVASCRIPT
// ======================================================

function escapeJS(
    value
) {

    return String(
        value || ""
    )
    .replace(
        /\\/g,
        "\\\\"
    )
    .replace(
        /'/g,
        "\\'"
    )
    .replace(
        /"/g,
        '\\"'
    );

}


// ======================================================
// LOGOUT
// ======================================================

window.logout =
    function() {

        firebase
            .auth()
            .signOut()
            .then(
                () => {

                    window.location.href =
                        "login.html";

                }
            )
            .catch(
                error => {

                    alert(
                        error.message
                    );

                }
            );

    };


// ======================================================
// START
// ======================================================

loadStudentCards();
