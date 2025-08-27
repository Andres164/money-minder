const changePasswordForm = document.getElementById("changePasswordForm");
const btnDeleteAccount = document.getElementById("btnDeleteAccount");
const btnLogout = document.getElementById("btnLogout");

const loggedInUser = JSON.parse(sessionStorage.getItem("logedInUser"));
if (!loggedInUser) {
  window.location.href = "index.html";
}

window.addEventListener("DOMContentLoaded", loadUsers);

changePasswordForm.addEventListener("submit", changePasswordFormSubmit);
btnDeleteAccount.addEventListener("click", btnDeleteAccountClicked);
btnLogout.addEventListener("click", btnLogoutClicked);

async function loadUsers() {
  lblWelcomed.innerHTML += ` ${loggedInUser.username}`;

  try {
    const res = await fetch(`${apiBaseUrl}/expenses`);
    const userExpenses = await res.json();

    const tbody = document.querySelector("#userTable tbody");
    userExpenses.forEach(u => {
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

async function btnLogoutClicked() {
    const result = await confirmationAlert("¿Estás seguro que quieres cerrar sesión?")

    if(result.isConfirmed) {
        sessionStorage.clear();
        window.location.href = "index.html";
    }
}

// TODO: Move to user settings

async function changePasswordFormSubmit(e) {
    e.preventDefault();
    const oldPassword = document.getElementById("oldPassword").value;
    const newPassword = document.getElementById("newPassword").value;

    try {
        const res = await fetch(`${apiBaseUrl}/users/${loggedInUser.email}/change-password`, {
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
        const res = await fetch(`${apiBaseUrl}/users/${loggedInUser.email}`, {
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