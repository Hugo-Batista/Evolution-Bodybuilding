const logoutLink = document.getElementById("logoutLink");
const themeToggle = document.getElementById("themeToggle");
const historyList = document.getElementById("historyList");

const WORKOUT_NAMES = {
  "peito": "Peito / Ombro / Tríceps",
  "costa": "Costa / Bíceps",
  "perna-quadriceps": "Perna (Quadríceps)",
  "perna-posteriores": "Perna (Posteriores)"
};

function getCurrentUser() {
  return localStorage.getItem("userEmail") || "";
}

function getWorkoutProgress(workout) {
  const user = getCurrentUser();
  const key = `progress_${user}_${workout}`;
  try {
    return JSON.parse(localStorage.getItem(key) || "{}");
  } catch {
    return {};
  }
}

function loadHistory() {
  const workouts = Object.keys(WORKOUT_NAMES);
  let historyHTML = "";

  workouts.forEach((workout) => {
    const progress = getWorkoutProgress(workout);
    const completedSets = Object.values(progress).filter(Boolean).length;
    const totalSets = Object.keys(progress).length;

    if (totalSets > 0) {
      const percentage = Math.round((completedSets / totalSets) * 100);
      historyHTML += `
        <div class="history-item">
          <h3>${WORKOUT_NAMES[workout]}</h3>
          <div class="progress-bar">
            <div class="progress-fill" style="width: ${percentage}%"></div>
          </div>
          <p>${completedSets} de ${totalSets} séries concluídas (${percentage}%)</p>
        </div>
      `;
    }
  });

  if (!historyHTML) {
    historyHTML = "<p class='no-history'>Nenhum treino iniciado ainda. Comece seus treinos no dashboard!</p>";
  }

  historyList.innerHTML = historyHTML;
}

function logout() {
  localStorage.removeItem("loggedIn");
  localStorage.removeItem("userEmail");
  window.location.href = "index.html";
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
}

function loadTheme() {
  const savedTheme = localStorage.getItem("theme") || "light";
  if (savedTheme === "dark") {
    document.body.classList.add("dark-theme");
  }
  updateThemeIcon();
}

function ensureLoggedIn() {
  if (localStorage.getItem("loggedIn") !== "true") {
    window.location.href = "index.html";
  }
}

logoutLink.addEventListener("click", (event) => {
  event.preventDefault();
  logout();
});

if (themeToggle) {
  themeToggle.addEventListener("click", toggleTheme);
}

window.addEventListener("DOMContentLoaded", () => {
  ensureLoggedIn();
  loadTheme();
  loadHistory();
});
