// ⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️ salonCards.js (modified)
// Loads salons from Firestore, calculates distance (if user allows geolocation),
// renders card with a link to salon-view.html?id=<id>

import { db } from "./firebase.js";
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const container = document.getElementById("salonCardsContainer");

function haversine(lat1, lon1, lat2, lon2) {
  // returns km
  const toRad = v => (v * Math.PI) / 180;
  const R = 6371; // km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
          Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
          Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

let userLoc = null;
if (navigator.geolocation) {
  navigator.geolocation.getCurrentPosition((pos) => {
    userLoc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
    renderSalons(); // load with distance
  }, (err) => {
    console.warn("Geolocation denied:", err.message);
    renderSalons(); // still load without distance
  });
} else {
  renderSalons();
}

async function renderSalons() {
  container.innerHTML = "Loading salons...";
  const snap = await getDocs(collection(db, "salons"));
  if (snap.empty) {
    container.innerHTML = "<p>No salons found</p>";
    return;
  }
  const items = [];
  snap.forEach(docSnap => {
    const s = docSnap.data();
    const id = docSnap.id;
    let distText = "";
    if (userLoc && s.location && s.location.lat && s.location.lng) {
      const dkm = haversine(userLoc.lat, userLoc.lng, s.location.lat, s.location.lng);
      distText = `${dkm < 1 ? Math.round(dkm*1000) + " m" : dkm.toFixed(1) + " km"} away`;
    }
    items.push(`
      <div class="salon-card">
        <div class="salon-image"><img src="${s.banner || 'scissor.png'}" alt="" /></div>
        <div class="salon-card-body">
          <div class="salon-header">
            <img class="salon-logo" src="${s.logo || 'scissor.png'}" alt="" />
            <div>
              <h4 style="margin:0">${s.name}</h4>
              <small class="muted">${s.address || ''} ${distText? ' • ' + distText : ''}</small>
            </div>
          </div>
          <div style="margin-top:8px;">
            <a class="btn" href="salon-view.html?id=${id}">View & Book</a>
          </div>
        </div>
      </div>
    `);
  });
  container.innerHTML = items.join("");
}
