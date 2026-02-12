// Hotel Reviews Pro - Vanilla JS
const STORAGE_KEY = "hotel_reviews_v1";

const $ = (sel) => document.querySelector(sel);

const state = {
  reviews: [],
  selectedStars: 5,
  filterStars: "all",
  sortBy: "newest",
};

function loadReviews() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    state.reviews = raw ? JSON.parse(raw) : [];
  } catch {
    state.reviews = [];
  }
}

function saveReviews() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.reviews));
}

function formatDate(ts) {
  const d = new Date(ts);
  return d.toLocaleDateString("es-CO", { year: "numeric", month: "short", day: "2-digit" });
}

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function createStarPicker() {
  const el = $("#starPicker");
  el.innerHTML = "";

  for (let i = 1; i <= 5; i++) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "star";
    btn.setAttribute("aria-label", `${i} estrellas`);
    btn.textContent = "★";
    btn.dataset.value = String(i);

    btn.addEventListener("click", () => {
      state.selectedStars = i;
      renderStarPicker();
    });

    el.appendChild(btn);
  }

  renderStarPicker();
}

function renderStarPicker() {
  document.querySelectorAll("#starPicker .star").forEach((b) => {
    const v = Number(b.dataset.value);
    b.classList.toggle("active", v <= state.selectedStars);
  });
}

function computeStats(reviews) {
  const total = reviews.length;
  const counts = [0, 0, 0, 0, 0]; // index 0 -> 1 star ... index 4 -> 5 stars

  let sum = 0;
  for (const r of reviews) {
    const s = clamp(Number(r.stars), 1, 5);
    sum += s;
    counts[s - 1] += 1;
  }

  const avg = total ? sum / total : 0;
  return { total, avg, counts };
}

function getVisibleReviews() {
  let list = [...state.reviews];

  if (state.filterStars !== "all") {
    const s = Number(state.filterStars);
    list = list.filter((r) => Number(r.stars) === s);
  }

  if (state.sortBy === "newest") {
    list.sort((a, b) => b.createdAt - a.createdAt);
  } else if (state.sortBy === "highest") {
    list.sort((a, b) => Number(b.stars) - Number(a.stars) || b.createdAt - a.createdAt);
  }

  return list;
}

function renderStats() {
  const { total, avg, counts } = computeStats(state.reviews);

  $("#avgRating").textContent = avg.toFixed(1);
  $("#totalReviews").textContent = String(total);

  const breakdown = $("#breakdown");
  breakdown.innerHTML = "";

  // Mostrar de 5 a 1 para que se vea "pro"
  for (let stars = 5; stars >= 1; stars--) {
    const count = counts[stars - 1];
    const pct = total ? Math.round((count / total) * 100) : 0;

    const row = document.createElement("div");
    row.className = "row";
    row.innerHTML = `
      <span class="label">${stars}★</span>
      <div class="bar"><div class="fill" style="width:${pct}%"></div></div>
      <span class="value">${count}</span>
    `;
    breakdown.appendChild(row);
  }
}

function renderReviews() {
  const list = $("#reviewsList");
  const empty = $("#emptyState");
  const visible = getVisibleReviews();

  list.innerHTML = "";
  empty.hidden = visible.length !== 0;

  for (const r of visible) {
    const card = document.createElement("article");
    card.className = "review";

    const stars = "★".repeat(Number(r.stars)) + "☆".repeat(5 - Number(r.stars));

    card.innerHTML = `
      <div class="review-head">
        <div>
          <strong>${escapeHtml(r.name)}</strong>
          <div class="muted small">${formatDate(r.createdAt)}</div>
        </div>
        <div class="rating" aria-label="${r.stars} estrellas">${stars}</div>
      </div>
      <p>${escapeHtml(r.comment)}</p>
      <button class="link danger small" data-id="${r.id}">Eliminar</button>
    `;

    card.querySelector("button[data-id]").addEventListener("click", (e) => {
      const id = e.currentTarget.dataset.id;
      state.reviews = state.reviews.filter((x) => x.id !== id);
      saveReviews();
      render();
    });

    list.appendChild(card);
  }
}

function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function showError(msg) {
  const el = $("#formError");
  el.textContent = msg;
  el.hidden = false;
}

function clearError() {
  const el = $("#formError");
  el.hidden = true;
  el.textContent = "";
}

function onSubmit(e) {
  e.preventDefault();
  clearError();

  const name = $("#name").value.trim();
  const comment = $("#comment").value.trim();
  const stars = state.selectedStars;

  if (!name) return showError("Escribe tu nombre.");
  if (comment.length < 10) return showError("El comentario debe tener mínimo 10 caracteres.");

  const review = {
    id: crypto?.randomUUID ? crypto.randomUUID() : String(Date.now()),
    name,
    comment,
    stars,
    createdAt: Date.now(),
  };

  state.reviews.unshift(review);
  saveReviews();

  e.target.reset();
  state.selectedStars = 5;
  renderStarPicker();
  render();
}

function bindUI() {
  $("#reviewForm").addEventListener("submit", onSubmit);

  $("#filterStars").addEventListener("change", (e) => {
    state.filterStars = e.target.value;
    renderReviews();
  });

  $("#sortBy").addEventListener("change", (e) => {
    state.sortBy = e.target.value;
    renderReviews();
  });

  $("#clearAll").addEventListener("click", () => {
    const ok = confirm("¿Seguro que quieres borrar todas las reseñas?");
    if (!ok) return;
    state.reviews = [];
    saveReviews();
    render();
  });
}

function render() {
  renderStats();
  renderReviews();
}

function init() {
  loadReviews();
  createStarPicker();
  bindUI();
  render();
}

document.addEventListener("DOMContentLoaded", init);

