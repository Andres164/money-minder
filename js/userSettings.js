const changePasswordForm = document.getElementById("changePasswordForm");
const btnDeleteAccount = document.getElementById("btnDeleteAccount");

const loggedInUser = JSON.parse(sessionStorage.getItem("logedInUser"));
if (!loggedInUser) {
  window.location.href = "index.html";
}

changePasswordForm.addEventListener("submit", changePasswordFormSubmit);
btnDeleteAccount.addEventListener("click", btnDeleteAccountClicked);


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