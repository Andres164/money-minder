function successAlert(message, title = 'Operacion exitosa') {
    return Swal.fire({
        icon: 'success',
        title: title,
        text: message,
    });
}

function errorAlert(message, title = 'Error inesperado') {
    return Swal.fire({
        icon: 'error',
        title: title,
        text: message,
    });
}

function warningAlert(message, title = 'Advertencia') {
    return Swal.fire({
        icon: 'warning',
        title: title,
        text: message,
    });
}

async function confirmationAlert(message, title = '¿Deseas continuar?', icon = 'question') {
    return Swal.fire({
        title: title,
        text: message,
        icon: icon,
        showCancelButton: true,
        confirmButtonText: 'Confirmar',
        cancelButtonText: 'Cancelar'
    });
}