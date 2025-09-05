const formRegister = document.getElementById("registerForm");
const txtEmail = document.getElementById("email");
const txtUsername = document.getElementById("username");
const txtPassword = document.getElementById("password");
const btnRegister = document.getElementById("register");

formRegister.addEventListener("submit", formRegisterSubmitted);

async function formRegisterSubmitted(e) {
    e.preventDefault();
    btnRegister.disabled = true;

    const email = txtEmail.value.trim();
    const username = txtUsername.value.trim();
    const password = txtPassword.value.trim();

    const request = { email, username, password };

    try {
        const response = await fetch(`${apiBaseUrl}/users`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(request)
        });

        if (response.status >= 500) {
            errorAlert("Ocurrió un error al registrarse. Inténtalo más tarde.");
            return;
        } else if(response.status == 429) {
            warningAlert("Alto ahi 🛑, estas haciendo demasiadas consultas, espera un minuto por favor.");
            return;
        } else if (response.status == 409) {
            warningToast("El email proporcionado ya esta registrado");
            return;
        } else if (response.status >= 400) {
            const resBody = await response.json();
            const resBodyKeys = Object.keys(resBody);
            const resBodyValues = Object.values(resBody);
            warningAlert(`El campo ${resBodyKeys} es invalio. ${resBodyValues[0]}`);
            return;
        }
        
        successAlert("¡Cuenta creada con éxito! Serás redirigido al login...")
            .then(() => window.location.href = "index.html");
    } catch (err) {
        console.error(err);
        errorAlert("Error inesperado. Inténtalo más tarde.");
    } finally { 
        btnRegister.disabled = false;
    }
}