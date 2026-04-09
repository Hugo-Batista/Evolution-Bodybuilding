const logoutLink = document.getElementById("logoutLink");
const userEmail = document.getElementById("user-email");
const workoutDetailsText = document.getElementById("workout-details-text");
const cards = Array.from(document.querySelectorAll(".card"));
const themeToggle = document.getElementById("themeToggle");

const TRAINING_INFO = {
  "Peito / Ombro / Tríceps":
    "3x12 supino reto\n3x10 desenvolvimento\n3x15 tríceps pulley\nUse carga desafiadora e mantenha a postura correta.",
  "Costa / Bíceps":
    "3x12 remada curvada\n3x10 puxada frontal\n3x12 rosca direta\nPriorize o controle do movimento e a contração muscular.",
  "Perna (Quadríceps)":
    "3x12 agachamento\n3x10 leg press\n3x15 extensão de pernas\nMantenha o core firme e o joelho alinhado com os pés.",
  "Perna (Posteriores)":
    "3x12 levantamento terra romeno\n3x12 flexora\n3x15 glúteo na máquina\nSinta o alongamento dos isquiotibiais em cada repetição.",
};

function getUsers() {
  try {
    return JSON.parse(localStorage.getItem("users") || "[]");
  } catch {
    return [];
  }
}

function ensureLoggedIn() {
  if (localStorage.getItem("loggedIn") !== "true") {
    window.location.href = "index.html";
  }
}

function setUserInfo() {
  const email = localStorage.getItem("userEmail") || "";
  if (!email) {
    userEmail.textContent = "Usuário";
    return;
  }

  const users = getUsers();
  const user = users.find((u) => u.email === email);
  if (user && user.name) {
    userEmail.textContent = user.name;
  } else {
    userEmail.textContent = email.replace(/@.*$/, "");
  }
}

function logout() {
  localStorage.removeItem("loggedIn");
  localStorage.removeItem("userEmail");
  window.location.href = "index.html";
}

function setWorkoutDetails(workout) {
  const detail = TRAINING_INFO[workout] || `Plano de treino para ${workout}.`;
  workoutDetailsText.textContent = detail;
}

function toggleTheme() {
  const body = document.body;
  const isDark = body.classList.toggle("dark-theme");
  localStorage.setItem("theme", isDark ? "dark" : "light");
  updateThemeIcon();
}

function updateThemeIcon() {
  const isDark = document.body.classList.contains("dark-theme");
  themeToggle.innerHTML = isDark ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
  themeToggle.setAttribute("aria-label", isDark ? "Ativar tema claro" : "Ativar tema escuro");
  themeToggle.setAttribute("title", isDark ? "Ativar tema claro" : "Ativar tema escuro");
}

function loadTheme() {
  const savedTheme = localStorage.getItem("theme") || "light";
  if (savedTheme === "dark") {
    document.body.classList.add("dark-theme");
  }
  updateThemeIcon();
}

cards.forEach((card) => {
  card.addEventListener("click", () => {
    const workout = card.dataset.workout;
    window.location.href = `workout-${workout}.html`;
  });
});

logoutLink.addEventListener("click", (event) => {
  event.preventDefault();
  logout();
});

if (themeToggle) {
  themeToggle.addEventListener("click", toggleTheme);
}

window.addEventListener("DOMContentLoaded", () => {
  ensureLoggedIn();
  setUserInfo();
  loadTheme();
});
