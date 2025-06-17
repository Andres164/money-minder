const formRegister = document.getElementById("registerForm");
const txtEmail = document.getElementById("email");
const txtUsername = document.getElementById("username");
const txtPassword = document.getElementById("password");
const btnRegister = document.getElementById("register");

formRegister.addEventListener("submit", formRegisterSubmitted);

const apiBaseUrl = "https://money-minder-spring-boot-723598043884.northamerica-south1.run.app";

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

        if (response.status === 400) {
            warningAlert("Ya existe un usuario con este correo.");
            return;
        }

        if (!response.ok) {
            errorAlert("Ocurrió un error al registrarse. Inténtalo más tarde.");
            return;
        }

        successAlert("¡Cuenta creada con éxito! Serás redirigido al login...")
            .then(() => window.location.href = "index.html");
    } catch (err) {
        errorAlert("Error de red. Inténtalo más tarde.");
    } finally { 
        btnRegister.disabled = false;
    }
}