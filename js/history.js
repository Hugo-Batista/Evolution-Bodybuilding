const logoutLink = document.getElementById("logoutLink");
const themeToggle = document.getElementById("themeToggle");
const historyList = document.getElementById("historyList");
const historySummary = document.getElementById("historySummary");
const historyDateInput = document.getElementById("historyDate");
const consultDateFilterBtn = document.getElementById("consultDateFilter");
const historyFilterStatus = document.getElementById("historyFilterStatus");

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
    const raw = JSON.parse(localStorage.getItem(key) || "{}");
    if (raw && raw.sets) {
      return {
        sets: raw.sets || {},
        history: Array.isArray(raw.history) ? raw.history : [],
        lastSavedAt: typeof raw.lastSavedAt === "number" ? raw.lastSavedAt : 0,
        lastSavedDateKey: raw.lastSavedDateKey || ""
      };
    }

    return {
      sets: raw || {},
      history: [],
      lastSavedAt: 0,
      lastSavedDateKey: ""
    };
  } catch {
    return {
      sets: {},
      history: [],
      lastSavedAt: 0,
      lastSavedDateKey: ""
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

function getSortedHistory(history) {
  return [...history].sort((left, right) => {
    const leftValue = left.timestamp || new Date(left.dateKey || 0).getTime();
    const rightValue = right.timestamp || new Date(right.dateKey || 0).getTime();
    return rightValue - leftValue;
  });
}

function formatDateLabel(dateValue) {
  if (!dateValue) {
    return "";
  }

  const [year, month, day] = dateValue.split("-");
  if (!year || !month || !day) {
    return dateValue;
  }

  return `${day}/${month}/${year}`;
}

function buildSummaryCards(workouts, selectedDate = "") {
  let summaryHTML = "";

  workouts.forEach((workout) => {
    const progressData = getWorkoutProgress(workout);
    const history = getSortedHistory(progressData.history || []);
    const latestEntry = selectedDate
      ? history.find((entry) => entry.dateKey === selectedDate)
      : history[0];

    if (!latestEntry) {
      return;
    }

    summaryHTML += `
      <article class="history-item history-summary-card">
        <h3>${WORKOUT_NAMES[workout]}</h3>
        <div class="progress-bar">
          <div class="progress-fill" style="width: ${latestEntry.percent}%"></div>
        </div>
        <p>${latestEntry.completedSets} de ${latestEntry.totalSets} séries concluídas (${latestEntry.percent}%)</p>
        <small>${selectedDate ? `Treino consultado em ${latestEntry.dateLabel}` : `Último treino salvo em ${latestEntry.dateLabel}`}</small>
      </article>
    `;
  });

  historySummary.innerHTML = summaryHTML || "";
}

function collectHistoryEntries(workouts) {
  const entries = [];

  workouts.forEach((workout) => {
    const progressData = getWorkoutProgress(workout);
    const history = getSortedHistory(progressData.history || []);

    history.forEach((entry) => {
      entries.push({
        workout,
        workoutName: WORKOUT_NAMES[workout],
        ...entry
      });
    });
  });

  return entries.sort((left, right) => {
    const leftValue = left.timestamp || new Date(left.dateKey || 0).getTime();
    const rightValue = right.timestamp || new Date(right.dateKey || 0).getTime();
    return rightValue - leftValue;
  });
}

function hasLegacyProgressWithoutHistory(workouts) {
  return workouts.some((workout) => {
    const progressData = getWorkoutProgress(workout);
    const totalSets = Object.keys(progressData.sets || {}).length;
    const hasHistory = Array.isArray(progressData.history) && progressData.history.length > 0;
    return totalSets > 0 && !hasHistory;
  });
}

function renderHistoryEntries(entries) {
  if (!entries.length) {
    historyList.innerHTML = "<p class='no-history'>Nenhum treino encontrado para a data selecionada.</p>";
    return;
  }

  const groupedByDate = entries.reduce((accumulator, entry) => {
    if (!accumulator[entry.dateKey]) {
      accumulator[entry.dateKey] = [];
    }

    accumulator[entry.dateKey].push(entry);
    return accumulator;
  }, {});

  const groupedHTML = Object.keys(groupedByDate)
    .sort((left, right) => new Date(right).getTime() - new Date(left).getTime())
    .map((dateKey) => {
      const dateEntries = groupedByDate[dateKey];
      const dateLabel = dateEntries[0].dateLabel;
      const cards = dateEntries.map((entry) => {
        const exerciseLines = Array.isArray(entry.exercises) && entry.exercises.length
          ? `
            <ul class="history-exercise-list">
              ${entry.exercises.map((exercise) => `<li>${exercise.name}: ${exercise.completedSets}/${exercise.totalSets} séries</li>`).join("")}
            </ul>
          `
          : "";

        return `
          <article class="history-item history-entry-card">
            <div class="history-entry-head">
              <h3>${entry.workoutName}</h3>
              <div class="history-entry-actions">
                <span class="history-badge">${entry.percent}%</span>
                <button class="history-delete-btn" type="button" data-workout="${entry.workout}" data-date-key="${entry.dateKey}">Excluir</button>
              </div>
            </div>
            <div class="progress-bar">
              <div class="progress-fill" style="width: ${entry.percent}%"></div>
            </div>
            <p>${entry.completedSets} de ${entry.totalSets} séries concluídas</p>
            ${exerciseLines}
          </article>
        `;
      }).join("");

      return `
        <section class="history-day-group">
          <div class="history-day-header">
            <h2>${dateLabel}</h2>
            <span>${dateEntries.length} treino(s) salvo(s)</span>
          </div>
          <div class="history-day-grid">
            ${cards}
          </div>
        </section>
      `;
    })
    .join("");

  historyList.innerHTML = groupedHTML;
}

function loadHistory() {
  const workouts = Object.keys(WORKOUT_NAMES);
  const selectedDate = historyDateInput?.value || "";
  const selectedDateLabel = formatDateLabel(selectedDate);

  const entries = collectHistoryEntries(workouts);
  if (!entries.length) {
    buildSummaryCards(workouts, selectedDate);
    const hasLegacyData = hasLegacyProgressWithoutHistory(workouts);

    if (historyFilterStatus) {
      if (hasLegacyData) {
        historyFilterStatus.textContent = "Existe progresso antigo sem data registrada. Abra o treino e clique em Salvar Progresso para migrar para o novo histórico por data.";
      } else {
        historyFilterStatus.textContent = selectedDateLabel
          ? `Nenhum treino salvo em ${selectedDateLabel}.`
          : "Nenhum filtro aplicado. Exibindo todos os treinos salvos.";
      }
    }
    historyList.innerHTML = hasLegacyData
      ? "<p class='no-history'>Seu progresso antigo foi encontrado, mas ainda sem data. Entre no treino e clique em Salvar Progresso para registrar a data automaticamente.</p>"
      : "<p class='no-history'>Nenhum treino iniciado ainda. Comece seus treinos no painel!</p>";
    return;
  }

  const filteredEntries = selectedDate
    ? entries.filter((entry) => entry.dateKey === selectedDate)
    : entries;

  buildSummaryCards(workouts, selectedDate);

  if (historyFilterStatus) {
    historyFilterStatus.textContent = selectedDateLabel
      ? filteredEntries.length
        ? `Consultando treinos salvos em ${selectedDateLabel}.`
        : `Nenhum treino salvo em ${selectedDateLabel}.`
      : "Nenhum filtro aplicado. Exibindo todos os treinos salvos.";
  }

  renderHistoryEntries(filteredEntries);
}

function deleteHistoryEntry(workout, dateKey) {
  const progressData = getWorkoutProgress(workout);
  const updatedHistory = (progressData.history || []).filter((entry) => entry.dateKey !== dateKey);
  const isTodayEntry = dateKey === getLocalDateKey();

  setWorkoutProgress(workout, {
    sets: isTodayEntry ? {} : (progressData.sets || {}),
    history: updatedHistory
  });

  loadHistory();
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

if (consultDateFilterBtn) {
  consultDateFilterBtn.addEventListener("click", () => {
    loadHistory();
  });
}

if (historyList) {
  historyList.addEventListener("click", (event) => {
    const deleteButton = event.target.closest(".history-delete-btn");
    if (!deleteButton) {
      return;
    }

    const workout = deleteButton.dataset.workout;
    const dateKey = deleteButton.dataset.dateKey;

    if (!workout || !dateKey) {
      return;
    }

    const confirmed = window.confirm("Deseja apagar este treino salvo do histórico?");
    if (!confirmed) {
      return;
    }

    deleteHistoryEntry(workout, dateKey);
  });
}

window.addEventListener("DOMContentLoaded", () => {
  ensureLoggedIn();
  loadTheme();
  loadHistory();
});
