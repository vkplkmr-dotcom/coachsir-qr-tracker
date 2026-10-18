
/* ==========================================
   COACHsir Academy - Student Management
   Payment Status + 30-Day Validity
   Firebase SDK 8.10.1
========================================== */

let allStudents = [];
let editingStudentId = null;

const PAYMENT_STATUSES = [
    "pending",
    "verification_pending",
    "approved",
    "rejected"
];

function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, char => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[char]);
}

function displayStatus(status) {
    const labels = {
        pending: "⏳ Pending",
        verification_pending: "🔍 Verification Pending",
        approved: "✅ Approved",
        rejected: "❌ Rejected"
    };
    return labels[status] || escapeHTML(status || "pending");
}

function formatExpiry(date) {
    return date.toLocaleDateString("en-US", {
        month: "short",
        day: "2-digit",
        year: "numeric"
    }).replace(",", ",");
}


// ==========================================
// ADD STUDENT
// ==========================================

async function addStudent() {
    const studentId = document.getElementById("studentId").value.trim();
    const studentName = document.getElementById("studentName").value.trim();
    const mobile = document.getElementById("studentMobile").value.trim();
    const studentClass = document.getElementById("studentClass").value.trim();
    const program = document.getElementById("studentProgram").value;
    const scanLimit = Number(document.getElementById("scanLimit").value) || 100;

    if (!studentId || !studentName) {
        alert("Please enter Student ID and Name");
        return;
    }

    try {
        const ref = db.collection("qrData").doc(studentId);
        const existing = await ref.get();

        if (existing.exists) {
            alert("This Student ID already exists.");
            return;
        }

        await ref.set({
            studentId,
            studentName,
            mobile,
            studentClass,
            program,
            count: 0,
            cardOpenCount: 0,
            cbtClickCount: 0,
            liveClassCount: 0,
            websiteClickCount: 0,
            active: true,
            scanLimit,
            unlimited: false,
            paymentStatus: "pending",
            paymentAmount: 30,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        alert("✅ Student Added Successfully");
        clearForm();
        await loadStudents();

    } catch (error) {
        console.error(error);
        alert("Unable to add student: " + error.message);
    }
}


// ==========================================
// LOAD STUDENTS + COUNTERS
// ==========================================

async function loadStudents() {
    const list = document.getElementById("studentList");
    list.innerHTML = "<tr><td colspan='8'>Loading students...</td></tr>";

    try {
        const snapshot = await db.collection("qrData").get();

        allStudents = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        renderStudents();
        updateCounters();

    } catch (error) {
        console.error(error);
        list.innerHTML =
            "<tr><td colspan='8'>Error Loading Students. Check Firebase permissions.</td></tr>";
    }
}

function updateCounters() {
    const total = allStudents.length;
    const active = allStudents.filter(s => s.active === true).length;
    const pending = allStudents.filter(s =>
        (s.paymentStatus || "pending") !== "approved"
    ).length;

    document.getElementById("totalStudents").textContent = total;
    document.getElementById("activeStudents").textContent = active;
    document.getElementById("pendingStudents").textContent = pending;
}


// ==========================================
// RENDER STUDENT TABLE
// ==========================================

function renderStudents() {
    const list = document.getElementById("studentList");

    if (!allStudents.length) {
        list.innerHTML = "<tr><td colspan='8'>No students found.</td></tr>";
        return;
    }

    list.innerHTML = allStudents.map(student => {
        const id = escapeHTML(student.id);
        const status = PAYMENT_STATUSES.includes(student.paymentStatus)
            ? student.paymentStatus
            : "pending";

        const options = PAYMENT_STATUSES.map(value => `
            <option value="${value}" ${status === value ? "selected" : ""}>
                ${value === "pending" ? "Pending" :
                  value === "verification_pending" ? "Verification Pending" :
                  value === "approved" ? "Approved" : "Rejected"}
            </option>
        `).join("");

        return `
        <tr data-student-id="${id}">
            <td>${id}</td>
            <td>${escapeHTML(student.studentName || student.name || "-")}</td>
            <td>${escapeHTML(student.studentClass || "-")}</td>
            <td>${escapeHTML(student.program || "-")}</td>
            <td>${escapeHTML(student.mobile || "-")}</td>

            <td>${student.active ? "🟢 Active" : "🔴 Inactive"}</td>

            <td>
                <select class="payment-select" aria-label="Payment status for ${id}">
                    ${options}
                </select>
                <button class="btn-primary save-payment"
                        type="button" data-id="${id}">
                    Save
                </button>
                <div class="payment-message" aria-live="polite"></div>
            </td>

            <td>
                <button class="view-btn" type="button" data-action="view" data-id="${id}">
                    👁 View
                </button>
                <button class="edit-btn" type="button" data-action="edit" data-id="${id}">
                    ✏️ Edit
                </button>
                <button class="delete-btn" type="button" data-action="delete" data-id="${id}">
                    🗑 Delete
                </button>
            </td>
        </tr>`;
    }).join("");
}


// ==========================================
// SAVE PAYMENT STATUS
// ==========================================

async function savePaymentStatus(id, newStatus, button) {
    if (!PAYMENT_STATUSES.includes(newStatus)) {
        alert("Invalid payment status.");
        return;
    }

    const message = button.closest("td").querySelector(".payment-message");
    const oldText = button.textContent;

    button.disabled = true;
    button.textContent = "Saving...";
    message.textContent = "";

    try {
        const ref = db.collection("qrData").doc(id);
        const doc = await ref.get();

        if (!doc.exists) {
            throw new Error("Student record not found.");
        }

        const updates = {
            paymentStatus: newStatus,
            paymentStatusUpdatedAt:
                firebase.firestore.FieldValue.serverTimestamp()
        };

        // Approval starts a fresh 30-day validity period.
        if (newStatus === "approved") {
            const now = new Date();
            const expiry = new Date(now);
            expiry.setDate(expiry.getDate() + 30);

            updates.active = true;
            updates.approvedAt =
                firebase.firestore.FieldValue.serverTimestamp();
            updates.expiryDate = formatExpiry(expiry);
        }

        await ref.update(updates);

        message.textContent = "✅ Saved";
        await loadStudents();

        alert(
            newStatus === "approved"
                ? "Payment approved. Validity set for 30 days."
                : "Payment status updated to " + newStatus + "."
        );

    } catch (error) {
        console.error(error);
        message.textContent = "❌ Save failed";
        alert("Payment update failed: " + error.message);
    } finally {
        button.disabled = false;
        button.textContent = oldText;
    }
}


// ==========================================
// TABLE BUTTON HANDLERS
// ==========================================

document.getElementById("studentList").addEventListener("click", event => {
    const paymentButton = event.target.closest(".save-payment");

    if (paymentButton) {
        const row = paymentButton.closest("tr");
        const select = row.querySelector(".payment-select");

        savePaymentStatus(
            paymentButton.dataset.id,
            select.value,
            paymentButton
        );
        return;
    }

    const actionButton = event.target.closest("button[data-action]");
    if (!actionButton) return;

    const id = actionButton.dataset.id;

    if (actionButton.dataset.action === "view") {
        viewStudent(id);
    } else if (actionButton.dataset.action === "edit") {
        editStudent(id);
    } else if (actionButton.dataset.action === "delete") {
        deleteStudent(id);
    }
});


// ==========================================
// SEARCH STUDENTS
// ==========================================

function searchStudents() {
    const value = document.getElementById("searchBox").value.toLowerCase();

    document.querySelectorAll("#studentList tr").forEach(row => {
        row.style.display = row.innerText.toLowerCase().includes(value)
            ? ""
            : "none";
    });
}


// ==========================================
// VIEW STUDENT
// ==========================================

function viewStudent(id) {
    const student = allStudents.find(s => s.id === id);

    if (!student) {
        alert("Student not found.");
        return;
    }

    alert(
        "Student ID: " + student.id +
        "\nName: " + (student.studentName || student.name || "-") +
        "\nClass: " + (student.studentClass || "-") +
        "\nProgram: " + (student.program || "-") +
        "\nPayment: " + displayStatus(student.paymentStatus) +
        "\nExpiry: " + (student.expiryDate || "Not set")
    );
}


// ==========================================
// EDIT STUDENT
// ==========================================

function editStudent(id) {
    const student = allStudents.find(s => s.id === id);

    if (!student) {
        alert("Student not found.");
        return;
    }

    editingStudentId = id;

    document.getElementById("studentId").value = id;
    document.getElementById("studentId").readOnly = true;
    document.getElementById("studentName").value =
        student.studentName || student.name || "";
    document.getElementById("studentMobile").value = student.mobile || "";
    document.getElementById("studentClass").value = student.studentClass || "";
    document.getElementById("studentProgram").value = student.program || "NEET Biology";
    document.getElementById("scanLimit").value = student.scanLimit ?? 100;

    document.getElementById("updateBtn").style.display = "inline-block";
    window.scrollTo({ top: 0, behavior: "smooth" });
}


// ==========================================
// UPDATE STUDENT
// ==========================================

async function updateStudent() {
    const id = editingStudentId;

    if (!id) {
        alert("Please select a student using Edit first.");
        return;
    }

    const studentName = document.getElementById("studentName").value.trim();

    if (!studentName) {
        alert("Please enter Student Name.");
        return;
    }

    try {
        await db.collection("qrData").doc(id).update({
            studentName,
            mobile: document.getElementById("studentMobile").value.trim(),
            studentClass: document.getElementById("studentClass").value.trim(),
            program: document.getElementById("studentProgram").value,
            scanLimit: Number(document.getElementById("scanLimit").value) || 100
        });

        alert("✅ Student Updated Successfully");
        clearForm();
        await loadStudents();

    } catch (error) {
        console.error(error);
        alert("Update failed: " + error.message);
    }
}


// ==========================================
// CLEAR FORM
// ==========================================

function clearForm() {
    editingStudentId = null;

    document.getElementById("studentId").value = "";
    document.getElementById("studentId").readOnly = false;
    document.getElementById("studentName").value = "";
    document.getElementById("studentMobile").value = "";
    document.getElementById("studentClass").value = "";
    document.getElementById("scanLimit").value = "100";
    document.getElementById("updateBtn").style.display = "none";
}


// ==========================================
// DELETE STUDENT
// ==========================================

async function deleteStudent(id) {
    if (!confirm("Delete Student " + id + "? This cannot be undone.")) {
        return;
    }

    try {
        await db.collection("qrData").doc(id).delete();

        if (editingStudentId === id) clearForm();

        alert("🗑 Student Deleted");
        await loadStudents();

    } catch (error) {
        console.error(error);
        alert("Delete failed: " + error.message);
    }
}


// ==========================================
// AUTO LOAD
// ==========================================

window.addEventListener("load", loadStudents);
