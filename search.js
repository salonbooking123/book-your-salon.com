// ⚠️⚠️⚠️ search.js (modified)
// Simple client-side search against salons already rendered by salonCards.js.
// If you have a server / cloud function, paging and indexing are preferred for scale.

const box = document.getElementById("salonSearchBox");
const results = document.getElementById("salonSearchResults");
const dropdown = document.querySelector(".dropdown-search-list");
const clearBtn = document.getElementById("clearSearchBtn");
const recentList = document.getElementById("recentList");

let salonsCache = []; // populated by salonCards.js if you export it or by reading Firestore

async function clientFilter(q) {
  if (!q) return [];
  q = q.toLowerCase();
  // Simple filter: name, address, any service name
  return salonsCache.filter(s => {
    if ((s.name||"").toLowerCase().includes(q)) return true;
    if ((s.address||"").toLowerCase().includes(q)) return true;
    if ((s.services||[]).some(ss => (ss.name||"").toLowerCase().includes(q))) return true;
    return false;
  });
}

// You will need to populate salonsCache from Firestore in your app init
// after this, filterSalonSearch function below can be used by the input's oninput.

window.filterSalonSearch = async function() {
  const q = box.value.trim();
  if (!q) {
    dropdown.style.display="none";
    return;
  }
  const matches = await clientFilter(q);
  if (!matches.length) {
    dropdown.innerHTML = '<div class="no-result">No salons found</div>';
    dropdown.style.display = "block";
    return;
  }
  dropdown.innerHTML = matches.map(s => `<div class="result-item" onclick="selectSalon('${s.id}')">${s.name} — ${s.address || ''}</div>`).join("");
  dropdown.style.display = "block";
};

window.selectSalon = function(id) {
  localStorage.setItem("selected_salon", id);
  window.location.href = "salon-view.html?id=" + id;
};
