// company-select.js
document.addEventListener("DOMContentLoaded", async () => {
  // 0) Get token
  const token = localStorage.getItem("token");
  if (!token) {
    window.location.href = "/login/index.html";
    return;
  }

  // 1) Fetch current user once (to grab the real teamId and role)
  let user;
  try {
    const userRes = await fetch(
      "https://seniorproject-jkm4.onrender.com/api/user",
      { headers: { Authorization: "Bearer " + token } }
    );
    if (!userRes.ok) throw new Error("Failed to fetch user");
    user = await userRes.json();
    // store the ObjectId of the team
    localStorage.setItem("teamId", user.team);
  } catch (err) {
    console.error("Error loading user data:", err);
    return;
  }

  // 2) Fetch & render companies
  const form = document.getElementById("companyForm");
  const opts = document.getElementById("options");
  try {
    const res = await fetch(
      "https://seniorproject-jkm4.onrender.com/api/companies"
    );
    const { companies } = await res.json();
    companies.forEach((c) => {
      const slots = c.maxTeams - c.teamsAssigned;
      const disabled = slots <= 0 ? "disabled" : "";
      const label = document.createElement("label");
      label.innerHTML = `
        <input type="radio" name="company" value="${c._id}" ${disabled}/>
        ${c.name} (${slots} slots left)
      `;
      opts.appendChild(label);
    });
  } catch (err) {
    console.error("Error fetching companies:", err);
  }

  // 3) Submit selection
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const choice = form.company.value;
    if (!choice) return alert("Please pick one.");

    const teamId = localStorage.getItem("teamId");
    try {
      const resp = await fetch(
        `https://seniorproject-jkm4.onrender.com/api/teams/${teamId}/select-company`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + token,
          },
          body: JSON.stringify({ companyId: choice }),
        }
      );
      if (resp.ok) alert("Company assigned!");
      else {
        const err = await resp.json();
        alert("Error: " + (err.error || resp.statusText));
      }
    } catch (err) {
      console.error("Network error:", err);
      alert("Failed to assign company.");
    }
  });

  // 4) Go Back button
  document.getElementById("goBackButton")?.addEventListener("click", () => {
    window.location.href = "/home/home.html";
  });

  // 5) Show Admin link if admin
  if (user.role === "admin") {
    document.getElementById("adminLink").style.display = "inline-flex";
  }
});