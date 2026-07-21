// ===============================
// COACHsir Admin Login JS
// ===============================


// Firebase Configuration

// Firebase already initialized from config.js

function login(){

    const email =
    document.getElementById("email").value.trim();

    const password =
    document.getElementById("password").value;

    const msg =
    document.getElementById("msg");


    firebase.auth()
    .signInWithEmailAndPassword(email,password)

    .then(()=>{

        msg.innerHTML="✅ Login Successful";
        msg.style.color="green";

        setTimeout(()=>{

            window.location.href="dashboard.html";

        },1000);

    })

    .catch((error)=>{

        msg.innerHTML="❌ "+error.message;
        msg.style.color="red";

    });

}

// Initialize Firebase

if (!firebase.apps.length) {

  firebase.initializeApp(firebaseConfig);

}



// ===============================
// Login Function
// ===============================

function login(){


    const email =
    document.getElementById("email").value.trim();


    const password =
    document.getElementById("password").value;


    const msg =
    document.getElementById("msg");


    const btn =
    document.querySelector("button");



    // Empty Check

    if(email === "" || password === ""){

        msg.innerHTML="⚠️ Please enter email and password";

        msg.style.color="red";

        return;

    }



    // Loading Effect

    if(btn){

        btn.innerHTML="Checking Login...";

        btn.disabled=true;

    }



    // Firebase Login

    firebase.auth()

    .signInWithEmailAndPassword(email,password)


    .then(function(){


        msg.innerHTML="✅ Login Successful";

        msg.style.color="green";



        setTimeout(function(){


            window.location.href="dashboard.html";


        },1000);



    })



    .catch(function(error){


        msg.innerHTML="❌ "+error.message;

        msg.style.color="red";


        if(btn){

            btn.innerHTML="LOGIN TO DASHBOARD";

            btn.disabled=false;

        }


    });


}



// ===============================
// Show / Hide Password
// ===============================

function togglePassword(){


    const pass =
    document.getElementById("password");


    const eye =
    document.getElementById("eye");



    if(pass.type==="password"){


        pass.type="text";


        eye.classList.remove("fa-eye");

        eye.classList.add("fa-eye-slash");


    }

    else{


        pass.type="password";


        eye.classList.remove("fa-eye-slash");

        eye.classList.add("fa-eye");


    }


}
