const logoutLink = document.getElementById("logoutLink");
const themeToggle = document.getElementById("themeToggle");
const saveProgressBtn = document.getElementById("saveProgress");
const resetProgressBtn = document.getElementById("resetProgress");
const exercises = Array.from(document.querySelectorAll(".exercise"));

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

function setWorkoutProgress(workout, progress) {
  const user = getCurrentUser();
  const key = `progress_${user}_${workout}`;
  localStorage.setItem(key, JSON.stringify(progress));
}

function loadProgress() {
  const url = window.location.pathname;
  const workout = url.split("-")[1].replace(".html", ""); // e.g., "peito"

  const progress = getWorkoutProgress(workout);

  exercises.forEach((exercise) => {
    const exerciseName = exercise.dataset.exercise;
    const sets = exercise.querySelectorAll("input[type='checkbox']");

    sets.forEach((checkbox, index) => {
      const setKey = `${exerciseName}_set${index + 1}`;
      if (progress[setKey]) {
        checkbox.checked = true;
      }
    });
  });
}

function saveProgress() {
  const url = window.location.pathname;
  const workout = url.split("-")[1].replace(".html", "");

  const progress = {};

  exercises.forEach((exercise) => {
    const exerciseName = exercise.dataset.exercise;
    const sets = exercise.querySelectorAll("input[type='checkbox']");

    sets.forEach((checkbox, index) => {
      const setKey = `${exerciseName}_set${index + 1}`;
      progress[setKey] = checkbox.checked;
    });
  });

  setWorkoutProgress(workout, progress);
  alert("Progresso salvo!");
}

function resetProgress() {
  if (confirm("Tem certeza que deseja reiniciar o progresso?")) {
    const url = window.location.pathname;
    const workout = url.split("-")[1].replace(".html", "");

    const progress = {};
    setWorkoutProgress(workout, progress);

    exercises.forEach((exercise) => {
      const sets = exercise.querySelectorAll("input[type='checkbox']");
      sets.forEach((checkbox) => {
        checkbox.checked = false;
      });
    });

    alert("Progresso reiniciado!");
  }
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

if (saveProgressBtn) {
  saveProgressBtn.addEventListener("click", saveProgress);
}

if (resetProgressBtn) {
  resetProgressBtn.addEventListener("click", resetProgress);
}

window.addEventListener("DOMContentLoaded", () => {
  ensureLoggedIn();
  loadTheme();
  loadProgress();
});
