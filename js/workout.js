const logoutLink = document.getElementById("logoutLink"); //Link "Sair"
const themeToggle = document.getElementById("themeToggle"); // Botão para mudar "Modo Escuro" e "Ver Execução de Treino"
const saveProgressBtn = document.getElementById("saveProgress"); // Botão "Salvar Progresso"
const resetProgressBtn = document.getElementById("resetProgress"); // Botão "Reiniciar"
const exercises = Array.from(document.querySelectorAll(".exercise")); // Classe da Tabela "Supino Reto"
let autoSaveTimer = null;
let previouslyFocusedElement = null;

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

function getLocalDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
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


function saveProgress(options = {}) {
  const { silent = false } = options;
  const url = window.location.pathname;
  const match = url.match(/workout-(.+)\.html$/);
  const workout = match ? match[1] : "";

  const sets = {};
  const exerciseHistory = [];
  let completedSets = 0;
  let totalSets = 0;

  exercises.forEach((exercise, exerciseIndex) => {
    const exerciseName = exercise.dataset.exercise;
    const checkboxes = exercise.querySelectorAll("input[type='checkbox']");
    const exerciseLabel = exercise.querySelector("td")?.textContent?.trim() || `Exercício ${exerciseIndex + 1}`;
    let exerciseCompletedSets = 0;
    const exerciseTotalSets = checkboxes.length;

    checkboxes.forEach((checkbox, index) => {
      const setKey = `${exerciseName}_${exerciseIndex}_set${index + 1}`;
      sets[setKey] = checkbox.checked;
      totalSets++;
      if (checkbox.checked) {
        completedSets++;
        exerciseCompletedSets++;
      }
    });

    exerciseHistory.push({
      name: exerciseLabel,
      completedSets: exerciseCompletedSets,
      totalSets: exerciseTotalSets
    });
  });

  const today = new Date();
  const todayKey = getLocalDateKey(today);
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
    exercises: exerciseHistory,
    timestamp: Date.now()
  };

  if (existingEntryIndex === -1) {
    history.unshift(snapshot);
  } else {
    history[existingEntryIndex] = snapshot;
  }

  setWorkoutProgress(workout, {
    sets,
    history,
    lastSavedAt: Date.now(),
    lastSavedDateKey: todayKey
  });

  if (!silent) {
    alert("Progresso salvo!");
  }
}

function setupAutoSave() {
  const checkboxes = document.querySelectorAll(".exercise input[type='checkbox']");
  checkboxes.forEach((checkbox) => {
    checkbox.addEventListener("change", () => {
      clearTimeout(autoSaveTimer);
      autoSaveTimer = setTimeout(() => {
        saveProgress({ silent: true });
      }, 400);
    });
  });
}


function resetProgress() {
  if (confirm("Tem certeza que deseja reiniciar o progresso?")) {
    const url = window.location.pathname;
    const match = url.match(/workout-(.+)\.html$/);
    const workout = match ? match[1] : "";
    const currentProgress = getWorkoutProgress(workout);

    setWorkoutProgress(workout, {
      sets: {},
      history: currentProgress.history || []
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
  const imageLoader = document.getElementById("imageLoader");

  if (!modal) return;

  function closeModalDialog() {
    modal.classList.remove("active");
    if (previouslyFocusedElement && typeof previouslyFocusedElement.focus === "function") {
      previouslyFocusedElement.focus();
    }
  }

  function loadImage(imageUrl) {
    return new Promise((resolve, reject) => {
      if (!imageUrl) {
        reject("Sem URL");
        return;
      }
      const img = new Image();
      img.onload = () => resolve(imageUrl);
      img.onerror = () => reject("Erro ao carregar imagem");
      img.src = imageUrl;
    });
  }

  document.querySelectorAll(".action-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const exerciseRow = btn.closest(".exercise");
      const title = exerciseRow ? exerciseRow.querySelector("td")?.textContent : "Exercício";
      const image = exerciseRow ? exerciseRow.dataset.image?.trim() : "";
      const obs = exerciseRow ? exerciseRow.querySelector("td:nth-child(5)")?.textContent : "";

      modalTitle.textContent = title || "Exercício";
      modalText.textContent = obs ? `Dica: ${obs}` : "Mantenha a postura correta e execute com calma.";
      previouslyFocusedElement = btn;
      modal.classList.add("active");
      closeModal.focus();

      // Mostra loading enquanto carrega
      imageLoader.style.display = "block";
      modalImage.style.display = "none";

      // Carrega a imagem
      const imageToLoad = image || "https://i.imgur.com/YaIYE2I.png";
      loadImage(imageToLoad)
        .then((url) => {
          modalImage.src = url;
          imageLoader.style.display = "none";
          modalImage.style.display = "block";
        })
        .catch(() => {
          modalImage.src = "https://i.imgur.com/YaIYE2I.png";
          imageLoader.style.display = "none";
          modalImage.style.display = "block";
        });
    });
  });

  // Preload de todas as imagens quando a página carrega
  window.addEventListener("load", () => {
    document.querySelectorAll(".exercise[data-image]").forEach((row) => {
      const imgUrl = row.dataset.image?.trim();
      if (imgUrl) {
        const img = new Image();
        img.src = imgUrl;
      }
    });
  });

  closeModal.addEventListener("click", () => {
    closeModalDialog();
  });

  modal.addEventListener("click", (event) => {
    if (event.target === modal) {
      closeModalDialog();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && modal.classList.contains("active")) {
      closeModalDialog();
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
  saveProgressBtn.addEventListener("click", () => saveProgress());
}

if (resetProgressBtn) {
  resetProgressBtn.addEventListener("click", resetProgress);
}

window.addEventListener("DOMContentLoaded", () => {
  ensureLoggedIn();
  loadTheme();
  loadProgress();
  setupAutoSave();
  setupExerciseModals();
});
