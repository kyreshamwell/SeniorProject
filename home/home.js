document.addEventListener("DOMContentLoaded", () => {
    // Signout functionality
    const logoutButton = document.getElementById("signoutButton");
    if (logoutButton) {
        logoutButton.addEventListener("click", () => {
            console.log("Logging out...");
            // Remove authentication data from localStorage
            localStorage.removeItem("token");
            localStorage.removeItem("username");
            localStorage.removeItem("role");
            // Redirect to login page
            window.location.href = "../login/index.html";
        });
    }

    // Display username on home page
    const username = localStorage.getItem('username');
    const displayName = username ? capitalize(username) : "Guest";
    const usernameDisplay = document.getElementById('usernameDisplay');
    if (usernameDisplay) {
        usernameDisplay.textContent = `Welcome, ${displayName}!`;
    }
});

function capitalize(str) {
    if (!str) return "";
    return str.charAt(0).toUpperCase() + str.slice(1);
}