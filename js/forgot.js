const emailInput = document.getElementById("email-recuperar");
const recoverButton = document.getElementById("recoverButton");
const messageEl = document.getElementById("message");

function getUsers() {
  try {
    return JSON.parse(localStorage.getItem("users") || "[]");
  } catch {
    return [];
  }
}

function showMessage(text, color) {
  messageEl.textContent = text;
  messageEl.style.color = color;
}

function handleRecover(event) {
  event.preventDefault();

  const email = emailInput.value.trim().toLowerCase();

  if (!email) {
    showMessage("Digite seu e-mail", "orange");
    return;
  }

  const users = getUsers();
  const user = users.find((u) => u.email === email);

  if (user) {
    // Simulação: em um app real, enviaria e-mail
    showMessage(`Sua senha é: ${user.password}. Em um app real, isso seria enviado por e-mail.`, "green");
  } else {
    showMessage("E-mail não encontrado", "red");
  }

  emailInput.value = "";
}

recoverButton.addEventListener("click", handleRecover);
