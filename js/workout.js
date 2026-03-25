const logoutLink = document.getElementById("logoutLink"); //Link "Sair"
const themeToggle = document.getElementById("themeToggle"); // Botão para mudar "Modo Escuro" e "Ver Execução de Treino"
const saveProgressBtn = document.getElementById("saveProgress"); // Botão "Salvar Progresso"
const resetProgressBtn = document.getElementById("resetProgress"); // Botão "Reiniciar"
const exercises = Array.from(document.querySelectorAll(".exercise")); // Classe da Tabela "Supino Reto"

function getCurrentUser() {
  return localStorage.getItem("userEmail") || "";
}

function getWorkoutProgress(workout) {
  const user = getCurrentUser();
  const key = `progress_${user}_${workout}`;
  try {
    const raw = JSON.parse(localStorage.getItem(key) || "{}");
    if (raw && raw.sets) {
      return raw;
    }
    return {
      sets: raw || {},
      history: []
    };
  } catch {
    return {
      sets: {},
      history: []
    };
  }
}

function setWorkoutProgress(workout, progress) {
  const user = getCurrentUser();
  const key = `progress_${user}_${workout}`;
  localStorage.setItem(key, JSON.stringify(progress));
}

function loadProgress() {
  const url = window.location.pathname;
  const match = url.match(/workout-(.+)\.html$/);
  const workout = match ? match[1] : "";

  const progress = getWorkoutProgress(workout);
  const savedSets = progress.sets || {};

  exercises.forEach((exercise, exerciseIndex) => {
    const exerciseName = exercise.dataset.exercise;
    const sets = exercise.querySelectorAll("input[type='checkbox']");

    sets.forEach((checkbox, index) => {
      const setKey = `${exerciseName}_${exerciseIndex}_set${index + 1}`;
      const legacyKey = `${exerciseName}_set${index + 1}`;

      if (savedSets[setKey] || savedSets[legacyKey]) {
        checkbox.checked = true;
      }
    });
  });
}


function saveProgress() {
  const url = window.location.pathname;
  const match = url.match(/workout-(.+)\.html$/);
  const workout = match ? match[1] : "";

  const sets = {};
  let completedSets = 0;
  let totalSets = 0;

  exercises.forEach((exercise, exerciseIndex) => {
    const exerciseName = exercise.dataset.exercise;
    const checkboxes = exercise.querySelectorAll("input[type='checkbox']");

    checkboxes.forEach((checkbox, index) => {
      const setKey = `${exerciseName}_${exerciseIndex}_set${index + 1}`;
      sets[setKey] = checkbox.checked;
      totalSets++;
      if (checkbox.checked) completedSets++;
    });
  });

  const today = new Date();
  const todayKey = today.toISOString().split("T")[0]; // YYYY-MM-DD
  const formattedDate = today.toLocaleDateString("pt-BR");

  const currentProgress = getWorkoutProgress(workout);
  const history = currentProgress.history || [];

  // Atualiza o dia atual ou adiciona novo registro
  const existingEntryIndex = history.findIndex((item) => item.dateKey === todayKey);
  const snapshot = {
    dateKey: todayKey,
    dateLabel: formattedDate,
    completedSets,
    totalSets,
    percent: totalSets > 0 ? Math.round((completedSets / totalSets) * 100) : 0,
    timestamp: Date.now()
  };

  if (existingEntryIndex === -1) {
    history.unshift(snapshot);
  } else {
    history[existingEntryIndex] = snapshot;
  }

  setWorkoutProgress(workout, {
    sets,
    history
  });

  alert("Progresso salvo!");
}


function resetProgress() {
  if (confirm("Tem certeza que deseja reiniciar o progresso?")) {
    const url = window.location.pathname;
    const match = url.match(/workout-(.+)\.html$/);
    const workout = match ? match[1] : "";

    setWorkoutProgress(workout, {
      sets: {},
      history: []
    });

    exercises.forEach((exercise) => {
      const sets = exercise.querySelectorAll("input[type='checkbox']");
      sets.forEach((checkbox) => {
        checkbox.checked = false;
      });
    });

    alert("Progresso reiniciado!");
  }
}

function setupExerciseModals() {
  const modal = document.getElementById("workoutModal");
  const modalTitle = document.getElementById("modalTitle");
  const modalImage = document.getElementById("modalImage");
  const modalText = document.getElementById("modalText");
  const closeModal = document.getElementById("closeModal");

  if (!modal) return;

  document.querySelectorAll(".action-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const exerciseRow = btn.closest(".exercise");
      const title = exerciseRow ? exerciseRow.querySelector("td")?.textContent : "Exercício";
      const image = exerciseRow ? exerciseRow.dataset.image : "";
      const obs = exerciseRow ? exerciseRow.querySelector("td:nth-child(5)")?.textContent : "";

      modalTitle.textContent = title || "Exercício";
      modalImage.src = image || "https://i.imgur.com/YaIYE2I.png";
      modalText.textContent = obs ? `Dica: ${obs}` : "Mantenha a postura correta e execute com calma.";
      modal.classList.add("active");
    });
  });

  closeModal.addEventListener("click", () => {
    modal.classList.remove("active");
  });

  modal.addEventListener("click", (event) => {
    if (event.target === modal) {
      modal.classList.remove("active");
    }
  });
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
  setupExerciseModals();
});
