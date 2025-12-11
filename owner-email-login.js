import { auth } from "./firebase.js";
import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { db } from "./firebase.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

document.getElementById("ownerEmailLoginForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("owner_login_email").value.trim();
    const password = document.getElementById("owner_login_password").value.trim();

    try {
        // 1️⃣ Login through Firebase Authentication
        const userCred = await signInWithEmailAndPassword(auth, email, password);
        const user = userCred.user;

        // 2️⃣ Check Firestore owner record
        const ownerRef = doc(db, "owners", user.uid);
        const ownerSnap = await getDoc(ownerRef);

        if (!ownerSnap.exists()) {
            alert("Owner profile not found!");
            return;
        }

        // 3️⃣ Save owner session
        localStorage.setItem("ownerLoggedIn", "true");
        localStorage.setItem("ownerId", user.uid);

        // 4️⃣ Redirect to dashboard
        window.location.href = "owner-dashboard.html";

    } catch (error) {
        console.log("Login Error:", error);
        alert("Invalid email or password.");
    }
});
