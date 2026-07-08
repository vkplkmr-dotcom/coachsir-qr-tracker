// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyANpygbwjFFu1R7Aw-o36T5SkMmXVEhZOA",
  authDomain: "qr-tracker-57393.firebaseapp.com",
  projectId: "qr-tracker-57393",
  storageBucket: "qr-tracker-57393.firebasestorage.app",
  messagingSenderId: "617727926623",
  appId: "1:617727926623:web:36d78ef0a54e6051cbd6ea"
};

// Initialize Firebase
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

// Login Function
function login() {

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;
  const msg = document.getElementById("msg");

  firebase.auth().signInWithEmailAndPassword(email, password)
    .then(function () {

      msg.innerHTML = "✅ Login Successful";
      msg.style.color = "green";

      setTimeout(function () {
        window.location.href = "dashboard.html";
      }, 1000);

    })
    .catch(function (error) {

      msg.innerHTML = "❌ " + error.message;
      msg.style.color = "red";

    });
}
