document.addEventListener("DOMContentLoaded", async () => {
    // 1. Fetch updated user data if a token exists
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const response = await fetch("https://seniorproject-jkm4.onrender.com/api/user", {
          headers: {
            "Authorization": "Bearer " + token
          }
        });
        const data = await response.json();
        if (response.ok) {
          // Update localStorage with the new role (or any other updated info)
          localStorage.setItem("role", data.role);
          console.log("Updated role:", data.role);
          // Optionally, update the UI further here if needed
        } else {
          console.error("Error fetching user data:", data.error);
        }
      } catch (error) {
        console.error("Fetch error:", error);
      }
    }
  
    // 2. Signout functionality
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
  
    // 3. Display username on the home page
    const username = localStorage.getItem('username');
    const displayName = username ? capitalize(username) : "Guest";
    const usernameDisplay = document.getElementById('usernameDisplay');
    if (usernameDisplay) {
      usernameDisplay.textContent = `Welcome, ${displayName}!`;
    }
  });
  
  // Helper function to capitalize the first letter of a string
  function capitalize(str) {
    if (!str) return "";
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
  