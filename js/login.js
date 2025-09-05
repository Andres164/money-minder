const formLogIn = document.getElementById("loginForm");
const txtBoxEmail = document.getElementById("email");
const txtBoxPassword = document.getElementById("password");
const btnLogin = document.getElementById("login");

formLogIn.addEventListener("submit", formLogInSubmitted);
document.addEventListener("DOMContentLoaded", () => {
    // Triggers API instance to turn on, but we don’t care about the response
    fetch(`${apiBaseUrl}/users`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        cache: "no-store"
    }).catch(() => {
        // ignore errors 
    });
});

async function formLogInSubmitted(e) {
    e.preventDefault();
    btnLogin.disabled = true;

    const email = txtBoxEmail.value.trim();
    const password = txtBoxPassword.value.trim();

    const request = { email: email, password: password };

    try {
        const response = await fetch(`${apiBaseUrl}/users/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(request)
        });
        
        if(response.status >= 500) {
            errorAlert("Ocurrio un error al intentar autentificar, intentelo mas tarde");
            const resBody = await response.json();
            console.error(resBody.error);
            return;
        } if (response.status >= 500) {
            errorAlert("Ocurrio un error al intentar guardar el gasto, intente mas tarde");
            return;
        }
        if(response.status == 429) {
            warningAlert("Alto ahi 🛑, estas haciendo demasiadas consultas, espera un minuto por favor.");
            return;
        }
        if (response.status == 404) {
            warningAlert("No existe un usuario con este correo.");
            return;
        }
        if(response.status == 401) {
            warningAlert("Contraseña incorrecta.");
            return;
        } 
        if(response.status >= 400) {
            const resBody = await response.json();
            const resBodyKeys = Object.keys(resBody);
            const resBodyValues = Object.values(resBody);
            warningAlert(`El campo ${resBodyKeys} es invalio. ${resBodyValues[0]}`);
            return;
        }

        const user = await response.json();
        console.log("Bienvenido, " + user.username);
        
        /* Change for JWT on the backend */
        sessionStorage.setItem("logedInUser", JSON.stringify(user));

        window.location.href = "main.html";
    } catch (err) {
        errorAlert("Ocurrio un error, intentelo mas tarde.");
    }
    finally {
        btnLogin.disabled = false;       
    }
}