document.addEventListener("DOMContentLoaded", async () => {
    try {
      // Fetch the current Discord URL from your backend
      const response = await fetch("https://seniorproject-jkm4.onrender.com/api/settings/discord");
      const data = await response.json();
      if (response.ok && data.discordURL) {
        // Update the anchor's href with the fetched Discord URL
        document.getElementById("discordLink").setAttribute("href", data.discordURL);
      } else {
        console.error("Error fetching Discord URL:", data.error);
      }
    } catch (error) {
      console.error("Fetch error:", error);
    }
  });
  