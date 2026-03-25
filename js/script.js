
const inputEmail = document.getElementById("email-usuario");
const inputSenha = document.getElementById("senha-usuario");
const button = document.getElementById("button");
const messageEl = document.getElementById("message");

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

function showMessage(text, color) {
  messageEl.textContent = text;
  messageEl.style.color = color;
}

function loginSuccess(email) {
  localStorage.setItem("loggedIn", "true");
  localStorage.setItem("userEmail", email);
  showMessage("Acesso permitido! Redirecionando...", "green");
  setTimeout(() => {
    window.location.href = "dashboard.html";
  }, 800);
}

function loginFailure() {
  showMessage("E-mail ou senha incorretos", "red");
}

function seedDefaultUser() {
  const users = getUsers();
  const defaultUser = { name: "Administrador", email: "hugobatista.89@hotmail.com", password: "123456" };
  const exists = users.find((u) => u.email === defaultUser.email);
  if (!exists) {
    users.push(defaultUser);
    setUsers(users);
  }
}


button.addEventListener("click", (event) => {
  event.preventDefault();

  const valorEmail = inputEmail.value.trim().toLowerCase();
  const valorSenha = inputSenha.value;

  if (!valorEmail || !valorSenha) {
    showMessage("Preencha e-mail e senha", "orange");
    return;
  }

  const user = getUsers().find((u) => u.email === valorEmail);
  if (user && user.password === valorSenha) {
    loginSuccess(user.email);
  } else {
    loginFailure();
  }

  inputEmail.value = "";
  inputSenha.value = "";
});

window.addEventListener("DOMContentLoaded", () => {
  seedDefaultUser();

  if (localStorage.getItem("loggedIn") === "true") {
    window.location.href = "dashboard.html";
  }
});

