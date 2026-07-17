const firebaseConfig = {

apiKey: "AIzaSyANpygbwjFFu1R7Aw-o36T5SkMmXVEhZOA",
authDomain: "qr-tracker-57393.firebaseapp.com",
projectId: "qr-tracker-57393",
storageBucket: "qr-tracker-57393.firebasestorage.app",
messagingSenderId: "617727926623",
appId: "1:617727926623:web:36d78ef0a54e6051cbd6ea"

};


if(!firebase.apps.length){

firebase.initializeApp(firebaseConfig);

}


const db = firebase.firestore();



async function loadFee(){


const doc = await db.collection("settings")
.doc("payment")
.get();



if(doc.exists){

document.getElementById("currentFee").innerHTML =
"₹ " + doc.data().amount;


}

else{


await db.collection("settings")
.doc("payment")
.set({

amount:30

});


document.getElementById("currentFee").innerHTML =
"₹ 30";


}


}



async function updateFee(){


let fee =
Number(document.getElementById("feeInput").value);



if(!fee){

alert("Enter Fee");

return;

}



await db.collection("settings")
.doc("payment")
.update({

amount:fee

});



document.getElementById("msg").innerHTML =
"✅ Fee Updated Successfully";


loadFee();


}



loadFee();
