// ⚠️⚠️⚠️ customer-phone-login.js (fixed)
// Wait for DOM to be ready before querying elements and mounting recaptcha
import { auth, mountInvisibleRecaptcha } from "./firebase.js";
import { signInWithPhoneNumber } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

document.addEventListener("DOMContentLoaded", () => {
  const phoneEl = document.getElementById("phone");
  const sendBtn = document.getElementById("sendOtp");
  const verifyBtn = document.getElementById("verifyOtp");
  const otpEl = document.getElementById("otp");

  if (!sendBtn || !verifyBtn) return;

  // mount invisible recaptcha on the container id
  let verifier = mountInvisibleRecaptcha("recaptcha-container");

  let confirmationResult;

  sendBtn.addEventListener("click", async () => {
    const num = phoneEl.value.trim();
    if (!num) return alert("Enter phone number");
    const phoneNumber = num.startsWith("+") ? num : "+91" + num;
    try {
      confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, verifier);
      alert("OTP sent");
    } catch (e) {
      console.error(e);
      alert("Failed to send OTP: " + e.message);
    }
  });

  verifyBtn.addEventListener("click", async () => {
    const code = otpEl.value.trim();
    if (!code) return alert("Enter OTP");
    try {
      const result = await confirmationResult.confirm(code);
      // success
      window.location.href = "customer-profile.html";
    } catch (e) {
      alert("Invalid OTP: " + e.message);
    }
  });
});
