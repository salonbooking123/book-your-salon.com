// ⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️ customerProfile.js (fixed)
import { auth, db } from "./firebase.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", () => {
  const nameEl = document.getElementById("cname");
  const phoneEl = document.getElementById("cphone");
  const emailEl = document.getElementById("cemail");
  const bookingsList = document.getElementById("bookingsList");
  const logoutBtn = document.getElementById("logoutBtn");

  if (!nameEl || !bookingsList) return;

  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      // no user -> show guest text
      nameEl.textContent = "Guest";
      phoneEl.textContent = "-";
      emailEl.textContent = "-";
      bookingsList.innerHTML = "<p>Please login to see your bookings.</p>";
      return;
    }

    // show basic info
    nameEl.textContent = user.displayName || "—";
    phoneEl.textContent = user.phoneNumber || "—";
    emailEl.textContent = user.email || "—";

    // load bookings (bookings collection with field customerId = uid)
    try {
      const q = query(collection(db, "bookings"), where("customerId", "==", user.uid));
      const snap = await getDocs(q);
      if (snap.empty) {
        bookingsList.innerHTML = "<p>No past bookings</p>";
      } else {
        const items = [];
        snap.forEach(d => {
          const b = d.data();
          // handle different date formats defensively
          let dateText = "—";
          if (b.date && b.date.seconds) {
            dateText = new Date(b.date.seconds * 1000).toLocaleString();
          } else if (b.date instanceof Date) {
            dateText = b.date.toLocaleString();
          } else {
            dateText = String(b.date || "—");
          }
          items.push(`<div class="search-item"><strong>${b.salonName || b.salonId}</strong> — ${b.service} — ${dateText} — <em>${b.status||'booked'}</em></div>`);
        });
        bookingsList.innerHTML = items.join("");
      }
    } catch (e) {
      bookingsList.innerHTML = "<p>Error loading bookings</p>";
    }
  });

  if (logoutBtn) {
    logoutBtn.addEventListener("click", async () => {
      await signOut(auth);
      window.location.href = "index.html";
    });
  }
});
