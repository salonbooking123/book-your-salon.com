// ⚠️⚠️⚠️ customer-email-login.js (fixed)
// Wait for DOM to be ready before querying elements
import { auth } from "./firebase.js";
import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

document.addEventListener("DOMContentLoaded", () => {
  const emailEl = document.getElementById("email");
  const passEl = document.getElementById("password");
  const btn = document.getElementById("loginBtn");

  if (!btn) return; // safe guard

  btn.addEventListener("click", async () => {
    const email = emailEl.value.trim();
    const password = passEl.value;
    if (!email || !password) return alert("Enter email and password");
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // redirect to customer profile page
      window.location.href = "customer-profile.html";
    } catch (e) {
      alert(e.message);
    }
  });
});
