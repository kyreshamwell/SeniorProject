document.addEventListener("DOMContentLoaded", () => {
    const logoutButton = document.getElementById("signoutButton");

    if (logoutButton) {
        logoutButton.addEventListener("click", () => {
            console.log("Logging out..."); // Debugging

            localStorage.setItem('token', data.token);
            localStorage.setItem('role', data.role);
            localStorage.setItem('username', data.username);
            // ✅ Remove authentication data
            localStorage.removeItem("token");
            localStorage.removeItem("username");
            localStorage.removeItem("role");

            // ✅ Redirect to login page
            window.location.href = "../login/index.html"; // ✅ Go up one directory, then into /login/
        });
    }
});

function capitalize(str) {
    if (!str) return "";
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

document.addEventListener("DOMContentLoaded", () => {
    const username = localStorage.getItem('username');
    if (username) {
        const displayName = username ? capitalize(username) : "Guest";
        document.getElementById('usernameDisplay').textContent = `Welcome, ${displayName}!`;
    } else {
      document.getElementById('usernameDisplay').textContent = "Welcome, Guest!";
    }
  });


