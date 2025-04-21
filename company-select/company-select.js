// company-select.js
document.addEventListener("DOMContentLoaded", async () => {
    const form = document.getElementById("companyForm");
    const opts = document.getElementById("options");
  
    // 1) fetch list of companies
    const res = await fetch("https://your-backend/api/companies");
    const { companies } = await res.json();
  
    // 2) render radio buttons
    companies.forEach(c => {
      const slots = c.maxTeams - c.teamsAssigned;
      const disabled = slots <= 0 ? "disabled" : "";
      const label = document.createElement("label");
      label.innerHTML = `
        <input type="radio" name="company" value="${c._id}" ${disabled}/>
        ${c.name} (${slots} slots left)
      `;
      opts.appendChild(label);
    });
  
    // 3) handle submit
    form.addEventListener("submit", async e => {
      e.preventDefault();
      const choice = form.company.value;
      if (!choice) return alert("Please pick one.");
      const resp = await fetch(
        `https://your-backend/api/teams/${localStorage.getItem("teamId")}/select-company`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json",
                     "Authorization": "Bearer " + localStorage.getItem("token") },
          body: JSON.stringify({ companyId: choice })
        }
      );
      if (resp.ok) alert("Company assigned!");
      else alert("Error assigning company.");
    });
  });