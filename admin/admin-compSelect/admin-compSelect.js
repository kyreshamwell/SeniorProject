// admin-company-select.js
document.addEventListener("DOMContentLoaded", () => {
    const tableBody = document.querySelector("#companyTable tbody");
    const form = document.getElementById("newCompanyForm");
  
    async function loadCompanies() {
      tableBody.innerHTML = "";
      const res = await fetch("https://seniorproject-jkm4.onrender.com/api/companies", {
        headers: { "Authorization": "Bearer " + localStorage.getItem("token") }
      });
      const data = await res.json();
      data.companies.forEach(c => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>${c.name}</td>
          <td>${c.maxTeams}</td>
          <td>${c.teamsAssigned}</td>
          <td>
            <button class="edit" data-id="${c._id}">✏️</button>
            <button class="delete" data-id="${c._id}">🗑️</button>
          </td>`;
        tableBody.appendChild(tr);
      });
    }
  
    // Add new company
    form.addEventListener("submit", async e => {
      e.preventDefault();
      await fetch("https://seniorproject-jkm4.onrender.com/api/companies", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + localStorage.getItem("token")
        },
        body: JSON.stringify({
          name: document.getElementById("companyName").value,
          maxTeams: Number(document.getElementById("companyMax").value)
        })
      });
      form.reset();
      loadCompanies();
    });
  
    // Edit & Delete via event delegation
    tableBody.addEventListener("click", async e => {
      const id = e.target.dataset.id;
      if (e.target.matches(".delete")) {
        await fetch(`https://seniorproject-jkm4.onrender.com/api/companies/${id}`, {
          method: "DELETE",
          headers: { "Authorization": "Bearer " + localStorage.getItem("token") }
        });
        loadCompanies();
      }
      if (e.target.matches(".edit")) {
        const newName = prompt("New company name?");
        const newMax = prompt("New max teams?");
        await fetch(`https://seniorproject-jkm4.onrender.com/api/companies/${id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + localStorage.getItem("token")
          },
          body: JSON.stringify({ name: newName, maxTeams: Number(newMax) })
        });
        loadCompanies();
      }
    });
  
    // initial load
    loadCompanies();
  });