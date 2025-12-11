// ⚠️⚠️⚠️ salonView.js (fixed)
import { auth, db } from "./firebase.js";
import { doc, getDoc, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  const salonId = params.get("id");

  const salonNameEl = document.getElementById("salonName");
  const salonDescEl = document.getElementById("salonDesc");
  const servicesListEl = document.getElementById("servicesList");
  const salonPhoneEl = document.getElementById("salonPhone");
  const locBtn = document.getElementById("locBtn");

  const custName = document.getElementById("custName");
  const custPhone = document.getElementById("custPhone");
  const serviceSelect = document.getElementById("serviceSelect");
  const dateEl = document.getElementById("date");
  const timeEl = document.getElementById("time");
  const bookBtn = document.getElementById("bookBtn");
  const bookMsg = document.getElementById("bookMsg");

  async function loadSalon() {
    if (!salonId) {
      if (salonNameEl) salonNameEl.textContent = "No salon specified";
      return;
    }
    const sDoc = await getDoc(doc(db, "salons", salonId));
    if (!sDoc.exists()) {
      if (salonNameEl) salonNameEl.textContent = "Salon not found";
      return;
    }
    const s = sDoc.data();
    if (salonNameEl) salonNameEl.textContent = s.name || "Salon";
    if (salonDescEl) salonDescEl.textContent = s.description || "";
    if (salonPhoneEl) salonPhoneEl.textContent = s.phone || "—";
    // services is expected to be array [{name, price}]
    if (servicesListEl) servicesListEl.innerHTML = (s.services || []).map(x => `<div>${x.name} — ₹${x.price}</div>`).join("");
    if (serviceSelect) serviceSelect.innerHTML = (s.services || []).map(x => `<option value="${x.name}">${x.name} — ₹${x.price}</option>`).join("");
    // location
    if (locBtn) {
      locBtn.onclick = () => {
        if (s.location && s.location.lat && s.location.lng) {
          const url = `https://www.google.com/maps/search/?api=1&query=${s.location.lat},${s.location.lng}`;
          window.open(url, "_blank");
        } else {
          alert("No location available");
        }
      };
    }
  }

  if (bookBtn) {
    bookBtn.addEventListener("click", async () => {
      // basic validation
      const name = custName.value.trim();
      const phone = custPhone.value.trim();
      const service = serviceSelect.value;
      const date = dateEl.value;
      const time = timeEl.value;
      if (!name || !phone || !service || !date) return alert("Please complete form");
      try {
        // store date as Firestore timestamp: use serverTimestamp only for createdAt; date keep as ISO string for clarity
        await addDoc(collection(db, "bookings"), {
          salonId,
          salonName: (salonNameEl && salonNameEl.textContent) || null,
          customerName: name,
          customerPhone: phone,
          service,
          date: new Date(date + " " + (time || "00:00")), // Firestore will accept JS Date
          createdAt: serverTimestamp(),
          status: "booked"
        });
        if (bookMsg) bookMsg.innerHTML = "<strong>Booking successful 🎉</strong>";
      } catch (e) {
        if (bookMsg) bookMsg.innerHTML = "<em>Booking failed: " + e.message + "</em>";
      }
    });
  }

  loadSalon();
});
