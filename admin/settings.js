
(function () {
    // Use a separate name to avoid conflicts with firebase/config.js
    const settingsDb = firebase.firestore();

    // Load saved settings
    async function loadSettings() {
        try {
            const paymentDoc = await settingsDb
                .collection("settings")
                .doc("payment")
                .get();

            document.getElementById("paymentAmount").value =
                paymentDoc.exists && paymentDoc.data().amount != null
                    ? paymentDoc.data().amount
                    : 30;

            const academyDoc = await settingsDb
                .collection("settings")
                .doc("academy")
                .get();

            const academyData = academyDoc.exists
                ? academyDoc.data()
                : {};

            const paymentData = paymentDoc.exists
                ? paymentDoc.data()
                : {};

            document.getElementById("academyName").value =
                academyData.academyName ||
                paymentData.academyName ||
                "COACHsir Online Academy";

            document.getElementById("session").value =
                academyData.session ||
                paymentData.session ||
                "2026-2027";

        } catch (error) {
            console.error("Settings load error:", error);
            showMessage(
                "statusMsg",
                "❌ Load failed: " + error.message,
                true
            );
        }
    }

    function showMessage(id, message, isError) {
        const element = document.getElementById(id);
        if (!element) return;

        element.textContent = message;
        element.style.color = isError ? "#c62828" : "#188038";
    }

    // Save monthly CBT fee
    async function savePaymentSettings() {
        const input = document.getElementById("paymentAmount");
        const amount = Number(input.value);

        if (input.value.trim() === "" ||
            !Number.isFinite(amount) || amount < 0) {
            showMessage(
                "statusMsg",
                "❌ Enter a valid fee amount.",
                true
            );
            return;
        }

        try {
            await settingsDb
                .collection("settings")
                .doc("payment")
                .set({
                    amount: amount,
                    updatedAt:
                        firebase.firestore.FieldValue.serverTimestamp()
                }, { merge: true });

            showMessage(
                "statusMsg",
                "✅ Payment Settings Saved Successfully",
                false
            );
        } catch (error) {
            console.error("Payment save error:", error);
            showMessage(
                "statusMsg",
                "❌ Save failed: " + error.message,
                true
            );
        }
    }

    // Save academy name and session
    async function saveAcademySettings() {
        const academyName =
            document.getElementById("academyName").value.trim();

        const session =
            document.getElementById("session").value.trim();

        if (!academyName || !session) {
            showMessage(
                "academyStatusMsg",
                "❌ Enter Academy Name and Session.",
                true
            );
            return;
        }

        try {
            const settings = {
                academyName: academyName,
                session: session,
                updatedAt:
                    firebase.firestore.FieldValue.serverTimestamp()
            };

            await settingsDb
                .collection("settings")
                .doc("academy")
                .set(settings, { merge: true });

            // Keep the same details in the existing payment document
            await settingsDb
                .collection("settings")
                .doc("payment")
                .set(settings, { merge: true });

            showMessage(
                "academyStatusMsg",
                "✅ Academy Information Saved Successfully",
                false
            );
        } catch (error) {
            console.error("Academy save error:", error);
            showMessage(
                "academyStatusMsg",
                "❌ Save failed: " + error.message,
                true
            );
        }
    }

    // Make functions available to the HTML onclick buttons
    window.savePaymentSettings = savePaymentSettings;
    window.saveAcademySettings = saveAcademySettings;

    // Load settings after the page is ready
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", loadSettings);
    } else {
        loadSettings();
    }
})();
