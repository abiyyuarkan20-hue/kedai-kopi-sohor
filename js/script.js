// === ELEMENTS ===
const navbarNav = document.querySelector(".navbar-nav");
const hamburger = document.querySelector("#hamburger-menu");

const searchForm = document.querySelector(".search-form");
const searchBox = document.querySelector("#search-box");
const searchBtn = document.querySelector("#search-btn");

// Catatan: Variabel untuk Shopping Cart dan Modal dihapus dari sini
// karena sudah dikelola oleh Alpine.js di app.js

// === TOGGLE NAVBAR ===
hamburger.onclick = (e) => {
  navbarNav.classList.toggle("active");
  e.preventDefault();
};

// === TOGGLE SEARCH FORM ===
searchBtn.onclick = (e) => {
  searchForm.classList.toggle("active");
  searchBox.focus();
  e.preventDefault();
};

// === CLICK OUTSIDE TO CLOSE ELEMENTS ===
document.addEventListener("click", function (e) {
  // Tutup Navbar jika klik di luar hamburger dan nav
  if (!hamburger.contains(e.target) && !navbarNav.contains(e.target)) {
    navbarNav.classList.remove("active");
  }

  // Tutup Search Form jika klik di luar tombol search dan form
  if (!searchBtn.contains(e.target) && !searchForm.contains(e.target)) {
    searchForm.classList.remove("active");
  }
});
