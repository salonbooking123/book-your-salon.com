// ⚠️⚠️⚠️ customer-signup.js (fixed)
// Wait for DOM ready and import serverTimestamp
import { auth, db } from "./firebase.js";
import { createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { doc, setDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", () => {
  const nameEl = document.getElementById("name");
  const emailEl = document.getElementById("email");
  const phoneEl = document.getElementById("phone");
  const passEl = document.getElementById("password");
  const btn = document.getElementById("signupBtn");

  if (!btn) return;

  btn.addEventListener("click", async () => {
    const name = nameEl.value.trim();
    const email = emailEl.value.trim();
    const phone = phoneEl.value.trim();
    const password = passEl.value;
    if (!name) return alert("Enter name");
    if (email) {
      // create with email
      try {
        const uc = await createUserWithEmailAndPassword(auth, email, password);
        const uid = uc.user.uid;
        await setDoc(doc(db, "customers", uid), {
          name,
          email,
          phone: phone || null,
          createdAt: serverTimestamp()
        });
        window.location.href = "customer-profile.html";
      } catch (e) {
        alert(e.message);
      }
    } else {
      alert("Please signup via phone flow (use Phone OTP) or provide email.");
    }
  });
});
