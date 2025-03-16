document.addEventListener("DOMContentLoaded", () => {
    const logoutButton = document.getElementById("logoutButton");

    if (logoutButton) {
        logoutButton.addEventListener("click", () => {
            console.log("Logging out..."); // Debugging

            // ✅ Remove authentication data
            localStorage.removeItem("token");
            localStorage.removeItem("role");

            // ✅ Redirect to login page
            window.location.href = "../login/index.html"; // ✅ Go up one directory, then into /login/
        });
    }
});