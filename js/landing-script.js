document.addEventListener("DOMContentLoaded", () => {
  const cursor = document.querySelector(".custom-cursor");
  const heroBg = document.querySelector(".hero-bg");
  const revealElements = document.querySelectorAll(".reveal-text");

  // Variabel untuk Smooth Cursor (Lerping)
  let mouseX = 0;
  let mouseY = 0;
  let cursorX = 0;
  let cursorY = 0;

  // 1. Smooth Cursor Movement (Lerp)
  // Menambahkan efek 'delay' halus pada kursor agar terasa premium
  document.addEventListener("mousemove", (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;

    // 2. Subtle Parallax Effect on Hero Background
    // Bergerak berlawanan arah dengan mouse untuk kedalaman visual
    const xForce = (e.clientX - window.innerWidth / 2) * 0.015;
    const yForce = (e.clientY - window.innerHeight / 2) * 0.015;

    if (heroBg) {
      heroBg.style.transform = `scale(1.1) translate(${xForce}px, ${yForce}px)`;
    }
  });

  // Loop untuk menjalankan animasi kursor yang halus
  function animateCursor() {
    const lerpAmount = 0.15; // Semakin kecil semakin lambat/halus

    cursorX += (mouseX - cursorX) * lerpAmount;
    cursorY += (mouseY - cursorY) * lerpAmount;

    cursor.style.left = `${cursorX}px`;
    cursor.style.top = `${cursorY}px`;

    requestAnimationFrame(animateCursor);
  }
  animateCursor();

  // 3. Hover Interactions
  const interactiveElements = document.querySelectorAll(
    "a, button, .bean-item",
  );

  interactiveElements.forEach((el) => {
    el.addEventListener("mouseenter", () => {
      cursor.classList.add("expand");

      // Jika hover pada bean-item, kursor bisa berubah warna atau teks
      if (el.classList.contains("bean-item")) {
        cursor.style.borderColor = "white";
      }
    });

    el.addEventListener("mouseleave", () => {
      cursor.classList.remove("expand");
      cursor.style.borderColor = ""; // Reset ke gold
    });
  });

  // 4. Staggered Reveal Animation (Hero)
  // Memunculkan elemen satu per satu dengan jeda yang elegan
  const startReveal = () => {
    revealElements.forEach((el, index) => {
      setTimeout(
        () => {
          el.classList.add("active");
        },
        400 + index * 150,
      );
    });
  };

  // Jalankan reveal setelah loading singkat
  setTimeout(startReveal, 300);

  // 5. Scroll Reveal for Beans Section (Intersection Observer)
  const observerOptions = {
    threshold: 0.15,
    rootMargin: "0px 0px -50px 0px",
  };

  const scrollObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = "1";
        entry.target.style.transform = "translateY(0)";
        // Berhenti mengamati setelah elemen muncul
        scrollObserver.unobserve(entry.target);
      }
    });
  }, observerOptions);

  document.querySelectorAll(".bean-item").forEach((item) => {
    // State awal sebelum scroll
    item.style.opacity = "0";
    item.style.transform = "translateY(60px)";
    item.style.transition = "all 1s cubic-bezier(0.23, 1, 0.32, 1)";
    scrollObserver.observe(item);
  });
});
// Tambahkan ini di dalam document.addEventListener("DOMContentLoaded", () => { ... })

const scrollReminder = document.querySelector(".scroll-reminder");

window.addEventListener("scroll", () => {
  // Jika user scroll lebih dari 100px, sembunyikan reminder
  if (window.scrollY > 100) {
    scrollReminder.classList.add("fade-out");
  } else {
    scrollReminder.classList.remove("fade-out");
  }
});

// Tambahkan interaksi kursor (Expand saat hover mouse reminder)
if (scrollReminder) {
  scrollReminder.addEventListener("mouseenter", () =>
    cursor.classList.add("expand"),
  );
  scrollReminder.addEventListener("mouseleave", () =>
    cursor.classList.remove("expand"),
  );
}
