const firebaseConfig = {

apiKey: "AIzaSyANpygbwjFFu1R7Aw-o36T5SkMmXVEhZOA",
authDomain: "qr-tracker-57393.firebaseapp.com",
projectId: "qr-tracker-57393",
storageBucket: "qr-tracker-57393.firebasestorage.app",
messagingSenderId: "617727926623",
appId: "1:617727926623:web:36d78ef0a54e6051cbd6ea"

};


const db = firebase.firestore();

async function loadSettings() {
    try {

        const doc = await db
        .collection("settings")
        .doc("payment")
        .get();

        if (doc.exists) {
            document.getElementById("paymentAmount").value =
            doc.data().amount || 30;
        }

    } catch (error) {
        console.error(error);
    }
}

async function savePaymentSettings() {

    const amount = Number(
        document.getElementById("paymentAmount").value
    );

    try {

        await db
        .collection("settings")
        .doc("payment")
        .set({
            amount: amount
        });

        document.getElementById("statusMsg").innerHTML =
        "✅ Settings Saved Successfully";

    } catch (error) {

        document.getElementById("statusMsg").innerHTML =
        "❌ Error Saving Settings";

        console.error(error);
    }
}

loadSettings();
