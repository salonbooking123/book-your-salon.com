// ⚠️⚠️⚠️ ownerProfileNew.js (FINAL — fixed login redirect loop)
import { auth, db } from "./firebase.js";
import { 
  onAuthStateChanged, 
  deleteUser 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

import { 
  doc, setDoc, getDoc, 
  collection, query, where, getDocs, 
  updateDoc 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", () => {

  const salonName = document.getElementById("salonName");
  const ownerName = document.getElementById("ownerName");
  const ownerPhone = document.getElementById("ownerPhone");
  const address = document.getElementById("address");
  const latEl = document.getElementById("lat");
  const lngEl = document.getElementById("lng");
  const detectLoc = document.getElementById("detectLoc");
  const servicesEditor = document.getElementById("servicesEditor");
  const addServiceBtn = document.getElementById("addService");
  const saveBtn = document.getElementById("saveSalon");
  const queueList = document.getElementById("queueList");
  const deleteBtn = document.getElementById("deleteAccountBtn");

  if (!saveBtn) return;

  let services = [];

  // ----------- Render services dynamically -----------
  function renderServices() {
    servicesEditor.innerHTML = services.map((s, i) => `
      <div class="row" style="gap:8px;align-items:center;margin-bottom:8px">
        <input data-i="${i}" class="svc-name" placeholder="Service name" value="${s.name || ''}" />
        <input data-i="${i}" class="svc-price" placeholder="Price" value="${s.price || ''}" />
        <button data-i="${i}" class="del-svc btn ghost">Delete</button>
      </div>
    `).join("");

    // delete buttons
    servicesEditor.querySelectorAll(".del-svc").forEach(b => {
      b.addEventListener("click", () => {
        const i = +b.getAttribute("data-i");
        services.splice(i, 1);
        renderServices();
      });
    });

    // update name
    servicesEditor.querySelectorAll(".svc-name").forEach(inp => {
      inp.addEventListener("input", () => {
        const i = +inp.getAttribute("data-i");
        services[i].name = inp.value;
      });
    });

    // update price
    servicesEditor.querySelectorAll(".svc-price").forEach(inp => {
      inp.addEventListener("input", () => {
        const i = +inp.getAttribute("data-i");
        services[i].price = inp.value;
      });
    });
  }

  addServiceBtn?.addEventListener("click", () => {
    services.push({ name: "", price: "" });
    renderServices();
  });

  detectLoc?.addEventListener("click", () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(p => {
        latEl.value = p.coords.latitude;
        lngEl.value = p.coords.longitude;
      }, e => alert("Failed to detect location: " + e.message));
    } else {
      alert("Geolocation not supported");
    }
  });

  // ----------- FIXED: Load owner AFTER Firebase finishes auth check -----------
  let authChecked = false;

  onAuthStateChanged(auth, async (user) => {
    authChecked = true;

    if (!user) {
      // Only redirect AFTER Firebase finishes checking login
      window.location.href = "owner-email-login.html";
      return;
    }

    try {
      // Get owner details
      const ownerRef = doc(db, "owners", user.uid);
      const ownerSnap = await getDoc(ownerRef);

      if (ownerSnap.exists()) {
        const d = ownerSnap.data();

        salonName.value = d.salonName || "";
        ownerName.value = d.ownerName || "";
        ownerPhone.value = d.phone || "";
        address.value = d.address || "";

        if (d.location) {
          latEl.value = d.location.lat ?? "";
          lngEl.value = d.location.lng ?? "";
        }

        services = d.services || [];
        renderServices();
      } else {
        services = [];
        renderServices();
      }

      // Load queue
      const q = query(
        collection(db, "bookings"),
        where("salonOwnerId", "==", user.uid)
      );

      const snaps = await getDocs(q);
      let out = [];

      snaps.forEach(s => {
        const b = s.data();
        if (b.status === "booked" || b.status === "waiting") {
          out.push(`
            <div style="display:flex;justify-content:space-between;align-items:center;padding:8px;border-bottom:1px solid #eee">
              <div>
                <strong>${b.customerName || 'Unknown'}</strong>
                <div class="muted">${b.service || ''} • ${b.customerPhone || ''}</div>
              </div>
              <button class="remove-queue btn ghost" data-id="${s.id}">Remove</button>
            </div>
          `);
        }
      });

      queueList.innerHTML = out.join("");

      queueList.querySelectorAll(".remove-queue").forEach(btn => {
        btn.addEventListener("click", async () => {
          const id = btn.getAttribute("data-id");
          await updateDoc(doc(db, "bookings", id), { status: "removed" });
          btn.parentElement.parentElement.remove();
        });
      });

    } catch (err) {
      console.error("Error loading profile:", err);
      alert("Failed to load owner profile. Please try again.");
    }
  });

  // ----------- Save changes -----------
  saveBtn.addEventListener("click", async () => {
    const user = auth.currentUser;
    if (!user) return alert("Not authenticated");

    const data = {
      salonName: salonName.value.trim(),
      ownerName: ownerName.value.trim(),
      phone: ownerPhone.value.trim(),
      address: address.value.trim(),
      location: {
        lat: parseFloat(latEl.value) || null,
        lng: parseFloat(lngEl.value) || null
      },
      services
    };

    try {
      // Save owner data
      await setDoc(doc(db, "owners", user.uid), data, { merge: true });

      // Save salon listing
      await setDoc(doc(db, "salons", user.uid), {
        name: data.salonName,
        address: data.address,
        phone: data.phone,
        location: data.location,
        services: data.services,
        ownerId: user.uid
      }, { merge: true });

      alert("Profile saved successfully");
    } catch (err) {
      console.error("Error saving profile:", err);
      alert("Failed to save profile.");
    }
  });

  // ----------- Delete account -----------
  deleteBtn?.addEventListener("click", async () => {
    const user = auth.currentUser;
    if (!user) return;

    if (!confirm("Are you sure you want to delete your account?")) return;

    await deleteUser(user);
    alert("Account deleted.");
    window.location.href = "owner-email-login.html";
  });

});
