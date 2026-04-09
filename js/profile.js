const logoutLink = document.getElementById("logoutLink");
const themeToggle = document.getElementById("themeToggle");
const profileForm = document.getElementById("profileForm");
const profileName = document.getElementById("profileName");
const profileEmail = document.getElementById("profileEmail");
const profilePassword = document.getElementById("profilePassword");
const profileConfirmPassword = document.getElementById("profileConfirmPassword");
const deleteAccountBtn = document.getElementById("deleteAccount");

function getUsers() {
  try {
    return JSON.parse(localStorage.getItem("users") || "[]");
  } catch {
    return [];
  }
}

function setUsers(users) {
  localStorage.setItem("users", JSON.stringify(users));
}

function getCurrentUser() {
  return localStorage.getItem("userEmail") || "";
}

function loadProfile() {
  const email = getCurrentUser();
  const users = getUsers();
  const user = users.find((u) => u.email === email);

  if (user) {
    profileName.value = user.name || "";
    profileEmail.value = user.email;
  }
}

function saveProfile(event) {
  event.preventDefault();

  const email = getCurrentUser();
  const users = getUsers();
  const userIndex = users.findIndex((u) => u.email === email);

  if (userIndex === -1) {
    alert("Usuário não encontrado!");
    return;
  }

  const newName = profileName.value.trim();
  const newPassword = profilePassword.value;
  const confirmPassword = profileConfirmPassword.value;

  if (!newName) {
    alert("Nome é obrigatório!");
    return;
  }

  if (newPassword && newPassword !== confirmPassword) {
    alert("As senhas não coincidem!");
    return;
  }

  users[userIndex].name = newName;
  if (newPassword) {
    users[userIndex].password = newPassword;
  }

  setUsers(users);
  alert("Perfil atualizado com sucesso!");
}

function deleteAccount() {
  if (confirm("Tem certeza que deseja excluir sua conta? Esta ação não pode ser desfeita.")) {
    const email = getCurrentUser();
    const users = getUsers();
    const filteredUsers = users.filter((u) => u.email !== email);

    setUsers(filteredUsers);
    localStorage.removeItem("loggedIn");
    localStorage.removeItem("userEmail");

    alert("Conta excluída com sucesso!");
    window.location.href = "index.html";
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

profileForm.addEventListener("submit", saveProfile);
deleteAccountBtn.addEventListener("click", deleteAccount);

if (themeToggle) {
  themeToggle.addEventListener("click", toggleTheme);
}

window.addEventListener("DOMContentLoaded", () => {
  ensureLoggedIn();
  loadTheme();
  loadProfile();
});
