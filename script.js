// Menú móvil
const nav = document.querySelector('.main-nav');
const navToggle = document.querySelector('.nav-toggle');

navToggle?.addEventListener('click', () => {
  nav.classList.toggle('open');
  const expanded = navToggle.getAttribute('aria-expanded') === 'true';
  navToggle.setAttribute('aria-expanded', String(!expanded));
});

// Animación suave al hacer scroll
if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) entry.target.classList.add('visible');
      });
    },
    { threshold: 0.2 }
  );
  document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));
} else {
  document.querySelectorAll('.reveal').forEach((el) => el.classList.add('visible'));
}

// Año dinámico en footer
const year = document.getElementById('year');
if (year) year.textContent = new Date().getFullYear();

const WHATSAPP_TO = '5491169030237';

function enviarWhatsApp(event) {
  if (event) event.preventDefault();

  const nombre = document.getElementById('nombre')?.value.trim() || '';
  const mensaje = document.getElementById('mensaje')?.value.trim() || '';

  if (nombre.length < 2 || mensaje.length < 5) {
    alert('Completá nombre y mensaje para enviar la consulta.');
    return false;
  }

  const texto = `Hola, soy ${nombre}.\nMensaje: ${mensaje}`;
  const url = `https://wa.me/${WHATSAPP_TO}?text=${encodeURIComponent(texto)}`;
  window.open(url, '_blank');
  return false;
}

// Disponible para onclick/onsubmit del HTML
window.enviarWhatsApp = enviarWhatsApp;

// Carrusel de reseñas (grid 2x2) sin modificar HTML/CSS
window.addEventListener('DOMContentLoaded', () => {
  const testimonials = Array.from(document.querySelectorAll('.testimonials-grid .testimonial'));
  const prevBtn = document.getElementById('reviews-prev');
  const nextBtn = document.getElementById('reviews-next');

  if (!testimonials.length) return;

  if (prevBtn) prevBtn.textContent = '<';
  if (nextBtn) nextBtn.textContent = '>';

  const VISIBLE_COUNT = 4;
  let currentIndex = 0;

  function normalizeIndex(index) {
    if (testimonials.length <= VISIBLE_COUNT) return 0;
    const maxStart = Math.max(0, testimonials.length - VISIBLE_COUNT);
    if (index < 0) return maxStart;
    if (index > maxStart) return 0;
    return index;
  }

  function renderTestimonials() {
    currentIndex = normalizeIndex(currentIndex);
    const endIndex = currentIndex + VISIBLE_COUNT;

    testimonials.forEach((card, index) => {
      const isVisible = index >= currentIndex && index < endIndex;
      card.style.display = isVisible ? '' : 'none';
    });
  }

  function goNext() {
    currentIndex += VISIBLE_COUNT;
    currentIndex = normalizeIndex(currentIndex);
    renderTestimonials();
  }

  function goPrev() {
    currentIndex -= VISIBLE_COUNT;
    currentIndex = normalizeIndex(currentIndex);
    renderTestimonials();
  }

  prevBtn?.addEventListener('click', goPrev);
  nextBtn?.addEventListener('click', goNext);

  renderTestimonials();
});

window.addEventListener("scroll", () => {
  const header = document.getElementById("header");

  if (window.scrollY > 50) {
    header.classList.add("scrolled");
  } else {
    header.classList.remove("scrolled");
  }
});

const track = document.querySelector(".carousel-track");
const slides = document.querySelectorAll(".slide");
const dotsContainer = document.querySelector(".dots");

let index = 0;

// crear dots
slides.forEach((_, i) => {
  const dot = document.createElement("span");
  if (i === 0) dot.classList.add("active");

  dot.addEventListener("click", () => {
    index = i;
    updateCarousel();
  });

  dotsContainer.appendChild(dot);
});

const dots = document.querySelectorAll(".dots span");

function updateCarousel() {
  track.style.transform = `translateX(-${index * 100}%)`;

  dots.forEach(d => d.classList.remove("active"));
  dots[index].classList.add("active");
}

// auto slide
setInterval(() => {
  index = (index + 1) % slides.length;
  updateCarousel();
}, 4000);













