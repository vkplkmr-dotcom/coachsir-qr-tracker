
const db = firebase.firestore();

// Load all academy settings
async function loadSettings() {
    try {
        // Existing payment settings document
        const paymentDoc = await db
            .collection("settings")
            .doc("payment")
            .get();

        if (paymentDoc.exists) {
            const data = paymentDoc.data();

            document.getElementById("paymentAmount").value =
                data.amount ?? 30;

            // Load academy details if stored in this document
            if (data.academyName) {
                document.getElementById("academyName").value =
                    data.academyName;
            }

            if (data.session) {
                document.getElementById("session").value =
                    data.session;
            }
        } else {
            document.getElementById("paymentAmount").value = 30;
        }

        // Academy information document
        const academyDoc = await db
            .collection("settings")
            .doc("academy")
            .get();

        if (academyDoc.exists) {
            const data = academyDoc.data();

            document.getElementById("academyName").value =
                data.academyName || "COACHsir Online Academy";

            document.getElementById("session").value =
                data.session || "2026-2027";
        } else {
            document.getElementById("academyName").value =
                "COACHsir Online Academy";

            document.getElementById("session").value =
                "2026-2027";
        }

    } catch (error) {
        console.error("Load settings error:", error);
        showMessage("statusMsg", "❌ Settings load नहीं हुईं। Firebase Rules जाँचें।", true);
    }
}


// Save payment settings
async function savePaymentSettings() {
    const amountInput = document.getElementById("paymentAmount");
    const amount = Number(amountInput.value);

    if (amountInput.value.trim() === "" ||
        !Number.isFinite(amount) || amount < 0) {
        showMessage("statusMsg", "❌ सही Payment Amount दर्ज करें।", true);
        return;
    }

    try {
        await db
            .collection("settings")
            .doc("payment")
            .set({
                amount: amount,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            }, { merge: true });

        showMessage("statusMsg", "✅ Payment Settings Saved Successfully", false);

    } catch (error) {
        console.error("Save payment error:", error);
        showMessage("statusMsg", "❌ Payment Settings सेव नहीं हुईं।", true);
    }
}


// Save academy information
async function saveAcademySettings() {
    const academyName = document
        .getElementById("academyName").value.trim();

    const session = document
        .getElementById("session").value.trim();

    if (!academyName || !session) {
        showMessage("academyStatusMsg", "❌ Academy Name और Session दोनों भरें।", true);
        return;
    }

    try {
        // Store academy details separately
        await db
            .collection("settings")
            .doc("academy")
            .set({
                academyName: academyName,
                session: session,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            }, { merge: true });

        // Also retain details in payment document for compatibility
        await db
            .collection("settings")
            .doc("payment")
            .set({
                academyName: academyName,
                session: session,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            }, { merge: true });

        showMessage("academyStatusMsg", "✅ Academy Information Saved Successfully", false);

    } catch (error) {
        console.error("Save academy error:", error);
        showMessage("academyStatusMsg", "❌ Academy Information सेव नहीं हुई। Firebase Rules जाँचें।", true);
    }
}


// Display status messages safely
function showMessage(elementId, message, isError) {
    const element = document.getElementById(elementId);

    if (!element) return;

    element.textContent = message;
    element.style.color = isError ? "#c62828" : "#188038";
}


// Load settings when page opens
loadSettings();
