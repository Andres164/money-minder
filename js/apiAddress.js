const apiBaseUrl = "http://localhost:8080"; // "https://money-minder-spring-boot-723598043884.northamerica-south1.run.app";

document.addEventListener("DOMContentLoaded", checkEnvironment());

function checkEnvironment() {
    if(apiBaseUrl.includes("localhost")) {
        warningToast("Currently on developement environment configuration", 1000);
    }
}