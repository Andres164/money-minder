const formLogIn = document.getElementById("loginForm");
const txtBoxEmail = document.getElementById("email");
const txtBoxPassword = document.getElementById("password");
const btnLogin = document.getElementById("login");

formLogIn.addEventListener("submit", formLogInSubmitted);

async function formLogInSubmitted(e) {
    e.preventDefault();
    btnLogin.disabled = true;

    const email = txtBoxEmail.value.trim();
    const password = txtBoxPassword.value.trim();

    const request = { email: email, password: password };

    try {
        const response = await fetch("http://localhost:8080/users/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(request)
        });
        
        if (response.status == 404) {
            warningAlert("No existe un usuario con este correo.");
            return;
        }
        else if(response.status == 401) {
            warningAlert("Contraseña incorrecta.");
            return;
        }
        else if(!response.ok) {
            errorAlert("Ocurrio un error al intentar autentificar, intentelo mas tarde");
            const resBody = await response.json();
            console.error(resBody.error);
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