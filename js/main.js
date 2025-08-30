const btnLogout = document.getElementById("btnLogout");
const expenseForm = document.getElementById("expenseForm");
const btnCreateExpense = document.getElementById("btnCreateExpense");
const btnSaveExpense = document.getElementById("btnSaveExpense");
const expenseModal = document.getElementById("expenseModal");
const expenseModalInstance = new bootstrap.Modal(expenseModal);

const selectCategory = document.getElementById("categoryId")
const txtBoxAmount = document.getElementById("txtBoxAmount");
const selectCurrency = document.getElementById("selectCurrency");
const txtBoxDescription = document.getElementById("txtBoxDescription");
const datePickerExpenseDate = document.getElementById("datePickerExpenseDate");

const loggedInUser = JSON.parse(sessionStorage.getItem("logedInUser"));
if (!loggedInUser) {
    window.location.href = "index.html";
}

window.addEventListener("DOMContentLoaded", loadExpenses);
window.addEventListener("DOMContentLoaded", setDatePickerExpenseToCurrentDate);

btnCreateExpense.addEventListener("click", () => { expenseModalInstance.show() });
btnSaveExpense.addEventListener("click", btnSaveExpenseClicked);
btnLogout.addEventListener("click", btnLogoutClicked);


async function loadExpenses() {
    lblWelcomed.innerHTML = `Bienvenido ${loggedInUser.username}`;

    try {
        const res = await fetch(`${apiBaseUrl}/expenses`);
        const userExpenses = await res.json();
        const tbody = document.querySelector("#tableExpenses tbody");
        tbody.innerHTML = "";

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

async function btnSaveExpenseClicked() {
    if (!expenseForm.checkValidity()) {
        expenseForm.reportValidity();
        return;
    }

    try {
        const expenseData = {
        userId: loggedInUser.id,
        categoryId: parseInt(selectCategory.value),
        amount: parseFloat(txtBoxAmount.value),
        currency: selectCurrency.value,
        description: txtBoxDescription.value,
        date: datePickerExpenseDate.value
        };
    
        const response = await fetch(`${apiBaseUrl}/expenses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(expenseData)
        });
    
        if (response.status >= 500) {
            errorAlert("Ocurrio un error al intentar guardar el gasto, intente mas tarde");
            return;
        } else if (response.status >= 400) {
            const resBody = await response.json();
            const resBodyKeys = Object.keys(resBody);
            const resBodyValues = Object.values(resBody);
            warningAlert(`El campo ${resBodyKeys} es invalio. ${resBodyValues[0]}`);
            return;
        }
    
        const resBody = await response.json();
        console.log("Expense saved:", resBody);

        loadExpenses();
        expenseModalInstance.hide();
        expenseForm.reset();

    } catch (err) {
        console.error(err);
        errorAlert("Error al guardar el gasto");
    }
}

function setDatePickerExpenseToCurrentDate() { 
    const now = new Date();
    const day = ("0" + now.getDate()).slice(-2);
    const month = ("0" + (now.getMonth() + 1)).slice(-2);
    const today = now.getFullYear()+"-"+(month)+"-"+(day) ;

    datePickerExpenseDate.value = today;
}