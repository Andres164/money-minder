const btnLogout = document.getElementById("btnLogout");

const loggedInUser = JSON.parse(sessionStorage.getItem("logedInUser"));
if (!loggedInUser) {
  window.location.href = "index.html";
}

window.addEventListener("DOMContentLoaded", loadExpenses);

btnLogout.addEventListener("click", btnLogoutClicked);

async function loadExpenses() {
  lblWelcomed.innerHTML += ` ${loggedInUser.username}`;

  try {
    const res = await fetch(`${apiBaseUrl}/expenses`);
    const userExpenses = await res.json();
    const tbody = document.querySelector("#tableExpenses tbody");

    userExpenses.forEach(expense => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
        <td hidden>${expense.id}</td>
        <td>${expense.description}</td>
        <td>$${expense.amount} ${expense.currency}</td>
        <td>${expense.category.name}</td>
        <td>${expense.date}</td>
        `;
      tbody.appendChild(tr);
    });
  } catch (err) {
    console.error(err);
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
