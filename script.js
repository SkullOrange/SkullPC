const WHATSAPP_TO = "5491169030237";
const THEME_KEY = "skullpc_theme";

const nav = document.querySelector(".main-nav");
const navToggle = document.querySelector(".nav-toggle");
const header = document.getElementById("header");
const themeToggle = document.getElementById("theme-toggle");
const year = document.getElementById("year");

if (year) year.textContent = new Date().getFullYear();

function buildWhatsappUrl(message) {
  return `https://wa.me/${WHATSAPP_TO}?text=${encodeURIComponent(message)}`;
}

function escapeHTML(value) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  }[char]));
}

function openWhatsapp(message) {
  window.open(buildWhatsappUrl(message), "_blank", "noopener,noreferrer");
}

function applyTheme(theme) {
  const isLight = theme === "light";
  document.body.classList.toggle("light-theme", isLight);
  if (themeToggle) themeToggle.textContent = isLight ? "☀" : "☾";
}

applyTheme(localStorage.getItem(THEME_KEY) || "dark");

themeToggle?.addEventListener("click", () => {
  const nextTheme = document.body.classList.contains("light-theme") ? "dark" : "light";
  localStorage.setItem(THEME_KEY, nextTheme);
  applyTheme(nextTheme);
});

navToggle?.addEventListener("click", () => {
  nav?.classList.toggle("open");
  const expanded = navToggle.getAttribute("aria-expanded") === "true";
  navToggle.setAttribute("aria-expanded", String(!expanded));
});

document.querySelectorAll(".main-nav a").forEach((link) => {
  link.addEventListener("click", () => {
    nav?.classList.remove("open");
    navToggle?.setAttribute("aria-expanded", "false");
  });
});

function updateHeaderState() {
  header?.classList.toggle("scrolled", window.scrollY > 24);
}

window.addEventListener("scroll", updateHeaderState, { passive: true });
updateHeaderState();

if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );
  document.querySelectorAll(".reveal").forEach((element) => observer.observe(element));
} else {
  document.querySelectorAll(".reveal").forEach((element) => element.classList.add("visible"));
}

document.addEventListener("click", (event) => {
  const target = event.target;
  if (!(target instanceof HTMLElement)) return;

  const whatsappTrigger = target.closest("[data-wa]");
  if (whatsappTrigger instanceof HTMLElement) {
    event.preventDefault();
    openWhatsapp(whatsappTrigger.dataset.wa || "Hola SkullPC, quería realizar una consulta.");
    return;
  }

  const servicePanel = target.closest(".service-panel");
  if (servicePanel instanceof HTMLElement && target.closest("button")) {
    const service = servicePanel.dataset.serviceGroup || "servicio técnico";
    openWhatsapp(`Hola SkullPC, quiero consultar por ${service}.`);
    return;
  }
});

function normalizePcConfig(item) {
  return {
    id: item.id || item.slug || item.name || item.nombre,
    name: item.name || item.nombre || "PC armada",
    image: item.image || item.imagen || "img/Logo.png",
    processor: item.processor || item.procesador || "",
    motherboard: item.motherboard || item.mother || "",
    ram: item.ram || "",
    storage: item.storage || item.almacenamiento || "",
    graphics: item.graphics || item.graficos || item.gpu || "",
    psu: item.psu || item.fuente || "",
    case: item.case || item.gabinete || "",
    features: Array.isArray(item.features || item.caracteristicas) ? (item.features || item.caracteristicas) : [],
    recommendedUse: item.recommendedUse || item.uso || item.usoRecomendado || "",
    active: item.active !== false,
  };
}

function buildPcMessage(pc) {
  const lines = [
    `Hola SkullPC, quería consultar por la ${pc.name}.`,
    "",
    "Configuración:",
    pc.processor ? `Procesador: ${pc.processor}` : "",
    pc.motherboard ? `Motherboard: ${pc.motherboard}` : "",
    pc.ram ? `RAM: ${pc.ram}` : "",
    pc.storage ? `Almacenamiento: ${pc.storage}` : "",
    pc.graphics ? `Gráficos: ${pc.graphics}` : "",
    pc.psu ? `Fuente: ${pc.psu}` : "",
    pc.case ? `Gabinete: ${pc.case}` : "",
    "",
    "¿Me podrían confirmar precio y disponibilidad?",
  ].filter(Boolean);
  return lines.join("\n");
}

function renderPcConfigs(items) {
  const grid = document.getElementById("pcs-grid");
  const empty = document.getElementById("pcs-empty");
  if (!grid || !empty) return;

  const pcs = items.map(normalizePcConfig).filter((pc) => pc.active && pc.name);
  empty.hidden = pcs.length > 0;
  grid.innerHTML = pcs.map((pc) => `
    <article class="build-card">
      <img src="${escapeHTML(pc.image)}" alt="${escapeHTML(pc.name)}" loading="lazy">
      <span class="order-badge">Precio a consultar</span>
      <h3>${escapeHTML(pc.name)}</h3>
      ${pc.recommendedUse ? `<p>${escapeHTML(pc.recommendedUse)}</p>` : ""}
      <dl class="pc-specs">
        ${pc.processor ? `<div><dt>Procesador</dt><dd>${escapeHTML(pc.processor)}</dd></div>` : ""}
        ${pc.motherboard ? `<div><dt>Motherboard</dt><dd>${escapeHTML(pc.motherboard)}</dd></div>` : ""}
        ${pc.ram ? `<div><dt>RAM</dt><dd>${escapeHTML(pc.ram)}</dd></div>` : ""}
        ${pc.storage ? `<div><dt>Almacenamiento</dt><dd>${escapeHTML(pc.storage)}</dd></div>` : ""}
        ${pc.graphics ? `<div><dt>Gráficos</dt><dd>${escapeHTML(pc.graphics)}</dd></div>` : ""}
        ${pc.psu ? `<div><dt>Fuente</dt><dd>${escapeHTML(pc.psu)}</dd></div>` : ""}
        ${pc.case ? `<div><dt>Gabinete</dt><dd>${escapeHTML(pc.case)}</dd></div>` : ""}
      </dl>
      ${pc.features.length ? `<ul>${pc.features.map((feature) => `<li>${escapeHTML(feature)}</li>`).join("")}</ul>` : ""}
      <button class="btn btn-whatsapp" type="button" data-wa="${escapeHTML(buildPcMessage(pc))}">Consultar</button>
    </article>
  `).join("");
}

async function loadPcConfigs() {
  try {
    const response = await fetch("pcs-armadas.json", { cache: "no-store" });
    if (!response.ok) throw new Error(`PC config status ${response.status}`);
    const data = await response.json();
    renderPcConfigs(Array.isArray(data) ? data : []);
  } catch (_error) {
    renderPcConfigs([]);
  }
}

document.getElementById("contact-form")?.addEventListener("submit", (event) => {
  event.preventDefault();

  const name = document.getElementById("contact-name")?.value.trim() || "";
  const type = document.getElementById("contact-type")?.value || "";
  const description = document.getElementById("contact-description")?.value.trim() || "";

  if (name.length < 2 || !type || description.length < 4) {
    alert("Completá nombre, tipo de consulta y descripción.");
    return;
  }

  const message = [
    "Hola SkullPC, quería realizar una consulta.",
    "",
    `Nombre: ${name}`,
    `Tipo de consulta: ${type}`,
    `Descripción: ${description}`,
  ].join("\n");

  openWhatsapp(message);
});

document.getElementById("component-form")?.addEventListener("submit", (event) => {
  event.preventDefault();

  const component = document.getElementById("component-choice")?.value || "";
  const goal = document.getElementById("component-goal")?.value || "";
  const comments = document.getElementById("component-comments")?.value.trim() || "Sin comentarios adicionales";

  if (!component || !goal) {
    alert("Elegí el componente y qué querés hacer.");
    return;
  }

  const message = [
    "Hola SkullPC, quiero consultar por componentes.",
    "",
    `Componente: ${component}`,
    `Objetivo: ${goal}`,
    `Comentarios: ${comments}`,
  ].join("\n");

  openWhatsapp(message);
});

const lightbox = document.getElementById("lightbox");
const lightboxImage = lightbox?.querySelector("img");

document.querySelectorAll("[data-lightbox]").forEach((button) => {
  button.addEventListener("click", () => {
    const image = button.getAttribute("data-lightbox");
    if (!lightbox || !lightboxImage || !image) return;
    lightboxImage.src = image;
    lightbox.hidden = false;
    document.body.style.overflow = "hidden";
  });
});

function closeLightbox() {
  if (!lightbox) return;
  lightbox.hidden = true;
  document.body.style.overflow = "";
}

lightbox?.addEventListener("click", (event) => {
  if (event.target === lightbox) closeLightbox();
});

document.querySelector(".lightbox-close")?.addEventListener("click", closeLightbox);

window.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeLightbox();
});

loadPcConfigs();
