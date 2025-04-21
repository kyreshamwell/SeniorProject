// team‑sign.js
document.addEventListener("DOMContentLoaded", () => {
    const membersDiv   = document.getElementById("members");
    const addButton    = document.getElementById("addMember");
    const removeButton = document.getElementById("removeMember");
    const confirmButton= document.getElementById("confirmTeam");
  
    let memberCount = 1;
  
    addButton.addEventListener("click", () => {
      if (memberCount < 3) {
        memberCount++;
        const newMember = document.createElement("div");
        newMember.innerHTML = `
          <label for="member${memberCount}">Team Member ${memberCount}:</label>
          <input type="text" id="member${memberCount}"
                 class="member-input" placeholder="Enter a username">
        `;
        membersDiv.appendChild(newMember);
      } else {
        alert("Team limit reached! A maximum of 4 members is allowed.");
      }
    });
  
    removeButton.addEventListener("click", () => {
      if (memberCount > 1) {
        membersDiv.removeChild(membersDiv.lastElementChild);
        memberCount--;
      } else {
        alert("A team must have at least one member.");
      }
    });
  
    confirmButton.addEventListener("click", teamValidation);
  });
  
  async function teamValidation() {
    const teamNameEl = document.getElementById("teamName");
    const userNameEl = document.getElementById("userName");
    if (!teamNameEl || !userNameEl) {
      console.error("Inputs not found in DOM");
      return;
    }
  
    const teamName = teamNameEl.value.trim();
    const userName = userNameEl.value.trim();
  
    // 1) Make sure both fields are filled
    if (!teamName || !userName) {
      alert("❌ Please enter both a Team Name and Your Username.");
      return;
    }
  
    // 2) Gather member-input fields
    const memberInputs = document.querySelectorAll(".member-input");
    const members = Array.from(memberInputs)
      .map(i => i.value.trim())
      .filter(v => v !== "");
  
    // 3) Check for duplicates
    const uniqueMembers = [...new Set(members)];
    if (uniqueMembers.length !== members.length) {
      alert("❌ Duplicate usernames entered.");
      return;
    }
  
    // 4) Build payload
    const payload = { teamName, userName, members };
    console.log("📤 Team signup payload:", payload);
  
    // 5) Send to backend
    try {
      const res = await fetch("https://seniorproject-jkm4.onrender.com/team-signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
  
      if (!res.ok) {
        // show the server’s error message
        alert("❌ Error: " + (data.error || res.statusText));
      } else {
        alert("✅ " + data.message);
        // redirect or update UI
        window.location.href = "/home/home.html";
      }
    } catch (err) {
      console.error("Team signup network error:", err);
      alert("❌ Network error during team signup.");
    }
  }