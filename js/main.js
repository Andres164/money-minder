const changePasswordForm = document.getElementById("changePasswordForm");
const btnDeleteAccount = document.getElementById("btnDeleteAccount");
const btnLogout = document.getElementById("btnLogout");

const user = JSON.parse(sessionStorage.getItem("logedInUser"));
if (!user) {
  window.location.href = "index.html";
}

window.addEventListener("DOMContentLoaded", loadUsers);

changePasswordForm.addEventListener("submit", changePasswordFormSubmit);
btnDeleteAccount.addEventListener("click", btnDeleteAccountClicked);
btnLogout.addEventListener("click", btnLogoutClicked);

const apiBaseUrl = "https://money-minder-spring-boot-723598043884.northamerica-south1.run.app";

async function loadUsers() {
  lblWelcomed.innerHTML += ` ${user.username}`;

  try {
    const res = await fetch(`${apiBaseUrl}/users`);
    const users = await res.json();

    const tbody = document.querySelector("#userTable tbody");
    users.forEach(u => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${u.id}</td>
        <td>${u.email}</td>
        <td>${u.username}</td>
      `;
      tbody.appendChild(tr);
    });
  } catch (err) {
    errorAlert("Error al cargar los usuarios.");
  }
}

async function changePasswordFormSubmit(e) {
    e.preventDefault();
    const oldPassword = document.getElementById("oldPassword").value;
    const newPassword = document.getElementById("newPassword").value;

    try {
        const res = await fetch(`${apiBaseUrl}/users/${user.email}/change-password`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ oldPassword, newPassword })
        });

        if (res.status === 401) {
            warningAlert("La contraseña actual es incorrecta.");
            return;
        }

        if (!res.ok) {
            errorAlert("No se pudo cambiar la contraseña.");
            return;
        }

        successAlert("¡Contraseña actualizada!");
        changePasswordForm.reset();
    } catch (err) {
        errorAlert("Error al cambiar la contraseña.");
    }
}

async function btnDeleteAccountClicked() {
    const result = await confirmationAlert("Esta acción eliminará tu cuenta permanentemente.", "¿Estás seguro?", "warning");

    if (!result.isConfirmed) { 
        return; 
    }

    try {
        const res = await fetch(`${apiBaseUrl}/users/${user.email}`, {
        method: "DELETE"
        });

        if (!res.ok) {
            errorAlert("No se pudo eliminar la cuenta.");
            const resBody = await res.json();
            console.error(resBody.error);
            return;
        }

        sessionStorage.clear();
        successAlert("Cuenta eliminada correctamente.").then(() => {
            window.location.href = "register.html";
        });
    } catch (err) {
        errorAlert("Error al eliminar la cuenta.");
    }
}

async function btnLogoutClicked() {
    const result = await confirmationAlert("¿Estás seguro que quieres cerrar sesión?")

    if(result.isConfirmed) {
        sessionStorage.clear();
        window.location.href = "index.html";
    }
}