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

let editingExpenseId = null;
const loggedInUser = JSON.parse(sessionStorage.getItem("logedInUser"));
if (!loggedInUser) {
    window.location.href = "index.html";
}

window.addEventListener("DOMContentLoaded", loadExpenses);
window.addEventListener("DOMContentLoaded", setDatePickerExpenseToCurrentDate);

btnCreateExpense.addEventListener("click", btnCreateExpenseClicked);
btnSaveExpense.addEventListener("click", btnSaveExpenseClicked);
btnLogout.addEventListener("click", btnLogoutClicked);


async function loadExpenses() {
    lblWelcomed.innerHTML = `Bienvenido ${loggedInUser.username}`;

    try {
        const response = await fetch(`${apiBaseUrl}/users/${loggedInUser.email}/expenses`);

        if (response.status >= 500) {
            errorAlert("Ocurrio un error al intentar obtener sus gastos, intente mas tarde");
            return;
        } else if(response.status == 429) {
            warningAlert("Alto ahi 🛑, estas haciendo demasiadas consultas, espera un minuto por favor.");
            return;
        } else if (response.status >= 400) {
            const resBody = await response.json();
            const resBodyKeys = Object.keys(resBody);
            const resBodyValues = Object.values(resBody);
            warningAlert(`El campo ${resBodyKeys[0]} es invalio. ${resBodyValues[0]}`);
            return;
        }

        const userExpenses = await response.json();
        const tbody = document.querySelector("#tableExpenses tbody");
        tbody.innerHTML = "";

        const groups = {};
        userExpenses.forEach(expense => {
            if (!groups[expense.date]) groups[expense.date] = [];
            groups[expense.date].push(expense);
        });

        const sortedDates = Object.keys(groups).sort((a, b) => b.localeCompare(a));

        sortedDates.forEach(dateStr => {
            const dateObj = parseLocalDate(dateStr);
            const today = new Date();
            const yesterday = new Date();
            yesterday.setDate(today.getDate() - 1);

            let headerText;
            if (dateObj.toDateString() === today.toDateString()) {
                headerText = "Hoy";
            } else if (dateObj.toDateString() === yesterday.toDateString()) {
                headerText = "Ayer";
            } else {
                headerText = dateObj.toLocaleDateString("es-ES", { year: 'numeric', month: 'long', day: 'numeric' });
            }

            const headerRow = document.createElement("tr");
            headerRow.innerHTML = `<td colspan="5" class="expense-date-header">${headerText}</td>`;
            tbody.appendChild(headerRow);

            groups[dateStr].forEach(expense => {
                const tr = document.createElement("tr");
                tr.innerHTML = `
                    <td hidden>${expense.id}</td>
                    <td>${expense.category.name}</td>
                    <td>${expense.description}</td>
                    <td class="text-danger">$${expense.amount} ${expense.currency}</td>
                `;
                tr.classList.add("expense-row");
                tr.dataset.expenseId = expense.id;
                tr.expenseData = expense; // attach expense data for easy access
                tr.addEventListener("click", () => tableExpensesDataRowClicked(expense));
                tbody.appendChild(tr);
            });
        });
    } catch (err) {
        console.error(err);
        errorAlert("Error al cargar los usuarios.");
    }
}

// Button click events
function btnCreateExpenseClicked() { 
    editingExpenseId = null;
    clearDeleteButton();
    expenseForm.reset();
    setDatePickerExpenseToCurrentDate();
    expenseModalInstance.show();
}

async function btnSaveExpenseClicked() {
    if (!expenseForm.checkValidity()) {
        expenseForm.reportValidity();
        return;
    }

    try {
        const expenseData = {
            categoryId: parseInt(selectCategory.value),
            amount: parseFloat(txtBoxAmount.value),
            currency: selectCurrency.value,
            description: txtBoxDescription.value,
            date: datePickerExpenseDate.value
        };

        let response;
        if (editingExpenseId) {
            // Update existing expense
            response = await fetch(`${apiBaseUrl}/expenses/${editingExpenseId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(expenseData)
            });
        } else {
            // Create new expense
            expenseData.userId = loggedInUser.id;
            response = await fetch(`${apiBaseUrl}/expenses`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(expenseData)
            });
        }

        if (response.status >= 500) {
            errorAlert("Ocurrio un error al intentar guardar el gasto, intente mas tarde");
            return;
        } else if(response.status == 429) {
            warningAlert("Alto ahi 🛑, estas haciendo demasiadas consultas, espera un minuto por favor.");
            return;
        } else if (response.status >= 400) {
            const resBody = await response.json();
            const resBodyKeys = Object.keys(resBody);
            const resBodyValues = Object.values(resBody);
            warningAlert(`El campo ${resBodyKeys[0]} es invalio. ${resBodyValues[0]}`);
            return;
        }

        const resBody = await response.json();
        console.log("Expense saved/updated:", resBody);

        loadExpenses();
        expenseModalInstance.hide();
        resetForm(expenseForm);
        editingExpenseId = null;
        clearDeleteButton();

    } catch (err) {
        console.error(err);
        errorAlert("Error al guardar el gasto");
    }
}

async function btnLogoutClicked() {
    const result = await confirmationAlert("¿Estás seguro que quieres cerrar sesión?")

    if(result.isConfirmed) {
        sessionStorage.clear();
        window.location.href = "index.html";
    }
}

function tableExpensesDataRowClicked(expense) {
    editingExpenseId = expense.id;
    selectCategory.value = expense.category.id;
    txtBoxAmount.value = expense.amount;
    selectCurrency.value = expense.currency;
    txtBoxDescription.value = expense.description;
    datePickerExpenseDate.value = expense.date;
    addDeleteButton();
    expenseModalInstance.show();
}

// Helper Functions
async function deleteExpense() {
    if (!editingExpenseId) {
        console.error("while trying to delete, got editingExpenseId AS NULL🤔");
        return;
    }

    try {
        const response = await fetch(`${apiBaseUrl}/expenses/${editingExpenseId}`, {
            method: "DELETE"
        });
        if (response.status >= 500) {
            errorAlert("Ocurrio un error al eliminar el gasto, intente mas tarde.");
            return;
        } else if(response.status == 429) {
            warningAlert("Alto ahi 🛑, estas haciendo demasiadas consultas, espera un minuto por favor.");
            return;
        } else if (response.status >= 400) {
            const resBody = await response.json();
            const resBodyKeys = Object.keys(resBody);
            const resBodyValues = Object.values(resBody);
            warningAlert(`El campo ${resBodyKeys[0]} es invalio. ${resBodyValues[0]}`);
            return;
        }

        loadExpenses();
        expenseModalInstance.hide();
        resetForm(expenseForm);
        editingExpenseId = null;
        clearDeleteButton();
        successToast("Gasto eliminado 👍");
    } catch (err) {
        console.error(err);
        errorAlert("Error al eliminar el gasto");
    }
}

function addDeleteButton() {
    clearDeleteButton();
    const modalFooter = expenseModal.querySelector(".modal-footer");
    const deleteBtn = document.createElement("button");
    deleteBtn.type = "button";
    deleteBtn.className = "btn btn-danger";
    deleteBtn.id = "btnDeleteExpense";
    deleteBtn.innerHTML = "<i class='fa-solid fa-trash-can'></i>";
    deleteBtn.onclick = confirmDeleteExpense;
    modalFooter.appendChild(deleteBtn);
}

function clearDeleteButton() {
    const modalFooter = expenseModal.querySelector(".modal-footer");
    const btn = modalFooter.querySelector("#btnDeleteExpense");
    if (btn) {
        modalFooter.removeChild(btn);
    }
}

async function confirmDeleteExpense() {
    const result = await confirmationAlert("¿Seguro que deseas eliminar este gasto?");
    if (result.isConfirmed) {
        await deleteExpense();
    }
}


function setDatePickerExpenseToCurrentDate() { 
    const now = new Date();
    const day = ("0" + now.getDate()).slice(-2);
    const month = ("0" + (now.getMonth() + 1)).slice(-2);
    const today = now.getFullYear()+"-"+(month)+"-"+(day) ;

    datePickerExpenseDate.value = today;
}

function resetForm(form) {
    form.reset();
    setDatePickerExpenseToCurrentDate();
}

function parseLocalDate(dateStr) {
    // dateStr: "YYYY-MM-DD"
    const [year, month, day] = dateStr.split('-').map(Number);
    return new Date(year, month - 1, day);
}