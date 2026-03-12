
const inputEmail = document.getElementById("email-usuario")
const inputSenha = document.getElementById("senha-usuario")
const button = document.getElementById("button")
const Valorparagrafo = document.getElementById("message")




button.addEventListener("click", (event) => { 
    event.preventDefault(); // Isso impede que a página recarregue e limpe o console, pois o Botao esta denfto de um <Form/> no Index.
const valorEmail = inputEmail.value;
const valorSenha = inputSenha.value;

if (valorEmail === "Hugobatista.89@hotmail.com" && valorSenha === "123456" ){

Valorparagrafo.textContent = "Acesso permitido! Redirecionando...";
Valorparagrafo.style.color = "green";

setTimeout(() => {
window.location.href = "dashboard.html";
}, 1000);


  }

else{
    Valorparagrafo.textContent = "E-mail ou senha Incorretos";
    Valorparagrafo.style.color = "red";
}

inputEmail.value = "";
inputSenha.value = "";
})

// === Esse é um operador de Comparação 
// && Esse é um Operador Logico de Confirmação

