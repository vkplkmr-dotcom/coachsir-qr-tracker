const db = firebase.firestore();

async function loadSettings() {

    const doc = await db
    .collection("settings")
    .doc("payment")
    .get();

    if(doc.exists){
        document.getElementById("paymentAmount").value =
        doc.data().amount || 30;
    }
}

async function savePaymentSettings(){

    const amount = Number(
        document.getElementById("paymentAmount").value
    );

    await db
    .collection("settings")
    .doc("payment")
    .set({
        amount: amount
    });

    document.getElementById("statusMsg").innerHTML =
    "✅ Settings Saved Successfully";
}

loadSettings();
