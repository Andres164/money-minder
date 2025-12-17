const apiBaseUrl = "https://money-minder-spring-boot-723598043884.northamerica-south1.run.app"; // "http://localhost:8080";

document.addEventListener("DOMContentLoaded", checkEnvironment());

function checkEnvironment() {
    if(apiBaseUrl.includes("localhost")) {
        warningToast("Currently on developement environment configuration", 1000);
    }
}