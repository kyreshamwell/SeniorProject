document.addEventListener("DOMContentLoaded", () => {
    const membersDiv = document.getElementById("members");
    const addButton = document.getElementById("addMember");
    const removeButton = document.getElementById("removeMember");
    const confirmButton = document.getElementById("confirmTeam");

    let memberCount = 1; // Starts with 1 member (member1)

    addButton.addEventListener("click", () => {
        if (memberCount < 3) { // Maximum 4 members allowed
            memberCount++;
            const newMember = document.createElement("div");
            newMember.innerHTML = `
                <label for="member${memberCount}">Team Member ${memberCount}:</label>
                <input type="text" id="member${memberCount}" class="member-input" placeholder="Enter a username">
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

    confirmButton.addEventListener("click", () => {
        teamValidation();
    });
});

function teamValidation() {
    const teamName = document.getElementById("teamName").value.trim();
    const userName = document.getElementById("userName").value.trim();
    
    // Collect team member usernames from inputs with class "member-input"
    let members = [];
    const memberInputs = document.querySelectorAll(".member-input");
    memberInputs.forEach(input => {
        const val = input.value.trim();
        if (val !== "") {
            members.push(val);
        }
    });

    // Check for duplicate member usernames on the client side
    const uniqueMembers = [...new Set(members)];
    if (uniqueMembers.length !== members.length) {
        return alert("Duplicate usernames entered.");
    }

    // Prepare payload for API call
    const payload = {
        teamName,
        userName,
        members
    };

    // Make a POST request to your backend's /team-signup endpoint
    fetch("https://seniorproject-jkm4.onrender.com/team-signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
    })
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            alert("Error: " + data.error);
        } else {
            alert(data.message);
            // Optionally, redirect to a team info page:
            window.location.href = "team-info.html";
        }
    })
    .catch(error => {
        console.error("Team signup error:", error);
        alert("An error occurred during team signup.");
    });
}