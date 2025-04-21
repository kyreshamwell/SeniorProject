// company-select.js
document.addEventListener("DOMContentLoaded", async () => {
  // ——————————————————————————————————————
  // 0) Ensure we have a token & fetch the user
  const token = localStorage.getItem("token");
  if (!token) {
    // not logged in → back to login
    window.location.href = "/login/index.html";
    return;
  }

  let user;
  try {
    const userRes = await fetch(
      "https://seniorproject-jkm4.onrender.com/api/user",
      { headers: { Authorization: "Bearer " + token } }
    );
    if (!userRes.ok) throw new Error("Failed to fetch user");
    user = await userRes.json();
    // store real teamId for later
    localStorage.setItem("teamId", user.team);
  } catch (err) {
    console.error("Error loading user data:", err);
    return;
  }

  // ——————————————————————————————————————
  // 1) Fetch and render companies
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

  // ——————————————————————————————————————
  // 2) Handle company selection submit
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const choice = form.company.value;
    if (!choice) return alert("Please pick one.");

    const teamId = localStorage.getItem("teamId");
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
  });

  // ——————————————————————————————————————
  // 3) Go Back button
  document.getElementById("goBackButton")?.addEventListener("click", () => {
    window.location.href = "/home/home.html";
  });

  // 4) Show Admin Dashboard link if user is admin
  if (user.role === "admin") {
    document.getElementById("adminLink").style.display = "inline-flex";
  }
});