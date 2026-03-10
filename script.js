
const inputEmail = document.getElementById("email-usuario")
const inputSenha = document.getElementById("senha-usuario")
const button = document.getElementById("button")



button.addEventListener("click", () => { 
    event.preventDefault(); // Isso impede que a página recarregue e limpe o console, pois o Botao esta denfto de um <Form/> no Index.
const valorEmail = inputEmail.value
const valorSenha = inputSenha.value

if (valorEmail === "Hugobatista.89@hotmail.com" && valorSenha === "123456" ){

    console.log("Acesso Permitido")
}

else{ console.log ("Acesso Negado")}

});

