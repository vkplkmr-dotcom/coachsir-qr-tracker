const firebaseConfig = {
  apiKey: "AIzaSyANpygbwjFFu1R7Aw-o36T5SkMmXVEhZOA",
  authDomain: "qr-tracker-57393.firebaseapp.com",
  projectId: "qr-tracker-57393",
  storageBucket: "qr-tracker-57393.firebasestorage.app",
  messagingSenderId: "617727926623",
  appId: "1:617727926623:web:36d78ef0a54e6051cbd6ea"
};

firebase.initializeApp(firebaseConfig);

const db = firebase.firestore();

// Add Student
function addStudent() {

  const id = document.getElementById("studentId").value.trim();
  const name = document.getElementById("studentName").value.trim();
  const limit = Number(document.getElementById("scanLimit").value);

  if (id === "") {
    alert("Student ID Required");
    return;
  }

  db.collection("qrData").doc(id).set({
    studentName: name,
    count: 0,
    active: true,
    scanLimit: limit,
    unlimited: false,
    createdAt: new Date()
}).then(() => {
    alert("Student Added Successfully");
    loadStudents();
  });

}

// Load Students
function loadStudents() {

  db.collection("qrData").get().then(snapshot => {

    let html = "";

    snapshot.forEach(doc => {

      const d = doc.data();

      html += `
<hr>
<b>ID :</b> ${doc.id}<br>
<b>Name :</b> ${d.studentName || "-"}<br>
<b>Count :</b> ${d.count}<br>
<b>Limit :</b> ${d.scanLimit}<br>
<b>Active :</b> ${d.active ? "✅ Yes" : "❌ No"}<br>
`;

    });

    document.getElementById("studentList").innerHTML = html;

  });

}

// Logout
function logout() {
  location.href = "login.html";
}

loadStudents();
