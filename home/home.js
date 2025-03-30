document.addEventListener("DOMContentLoaded", async () => {
    // Fetch updated user data if a token exists
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
          // Update localStorage with the new role
          localStorage.setItem("role", data.role);
          console.log("Updated role:", data.role);
          // Check if the user is an admin
          if (data.role === "admin") {
            // Display the "Back to Admin Dashboard" link
            document.getElementById("adminLink").style.display = "block";
          }
        } else {
          console.error("Error fetching user data:", data.error);
        }
      } catch (error) {
        console.error("Fetch error:", error);
      }
    }
  
    // Signout functionality
    const logoutButton = document.getElementById("signoutButton");
    if (logoutButton) {
      logoutButton.addEventListener("click", () => {
        console.log("Logging out...");
        localStorage.removeItem("token");
        localStorage.removeItem("username");
        localStorage.removeItem("role");
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
  