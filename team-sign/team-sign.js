document.addEventListener("DOMContentLoaded", () => {
    const membersDiv = document.getElementById("members");
    const addButton = document.getElementById("addMember");
    const removeButton = document.getElementById("removeMember");
    const confirmButton = document.getElementById("confirmTeam");

    let memberCount = 1; // Starts with 1 additional member (member1)

    addButton.addEventListener("click", () => {
        if (memberCount < 4) { // Max 4 members (including user)
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

// Placeholder function for future validation logic
function teamValidation() {
    alert("All team members have been assigned");
}
