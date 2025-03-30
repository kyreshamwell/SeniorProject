document.addEventListener("DOMContentLoaded", async () => {
  
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
  });
  

  