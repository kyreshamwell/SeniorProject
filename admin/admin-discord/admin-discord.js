document.addEventListener("DOMContentLoaded", () => {
    const discordForm = document.getElementById("discordForm");
    const messageDiv = document.getElementById("message");
  
    discordForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const discordURL = document.getElementById("discordURL").value.trim();
      console.log("Discord URL submitted:", discordURL);
  
      // Send a POST request to update the Discord URL.
      // Assuming you have an API endpoint at /api/settings/discord that accepts a POST.
      try {
        const response = await fetch("https://seniorproject-jkm4.onrender.com/api/settings/discord", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ discordURL })
        });
        const data = await response.json();
        if (response.ok) {
          messageDiv.textContent = "Discord URL updated successfully!";
          messageDiv.style.color = "green";
        } else {
          messageDiv.textContent = data.error || "An error occurred.";
          messageDiv.style.color = "red";
        }
      } catch (error) {
        console.error("Error updating Discord URL:", error);
        messageDiv.textContent = "Server error.";
        messageDiv.style.color = "red";
      }
    });
  });
  

  