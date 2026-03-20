const nameInput = document.getElementById("name-usuario");
const emailInput = document.getElementById("email-usuario");
const passwordInput = document.getElementById("senha-usuario");
const confirmInput = document.getElementById("senha-confirm");
const registerButton = document.getElementById("registerButton");
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

function validateEmail(email) {
  return email && email.includes("@") && email.includes(".");
}

function handleRegister(event) {
  event.preventDefault();

  const name = nameInput.value.trim();
  const email = emailInput.value.trim().toLowerCase();
  const password = passwordInput.value;
  const confirm = confirmInput.value;

  if (!name || !email || !password || !confirm) {
    showMessage("Preencha todos os campos", "orange");
    return;
  }

  if (!validateEmail(email)) {
    showMessage("E-mail inválido", "orange");
    return;
  }

  if (password !== confirm) {
    showMessage("As senhas não coincidem", "red");
    return;
  }

  const users = getUsers();
  const already = users.find((u) => u.email === email);

  if (already) {
    showMessage("E-mail já cadastrado", "red");
    return;
  }

  users.push({ name, email, password });
  setUsers(users);

  showMessage("Cadastro feito com sucesso! Redirecionando...", "green");
  setTimeout(() => {
    window.location.href = "index.html";
  }, 1000);
}

registerButton.addEventListener("click", handleRegister);

window.addEventListener("DOMContentLoaded", () => {
  const stored = getUsers();
  if (stored.length === 0) {
    // Seed initial user for compatibilidade com login antigo
    setUsers([{ name: "Administrador", email: "Hugobatista.89@hotmail.com", password: "123456" }]);
  }
});
