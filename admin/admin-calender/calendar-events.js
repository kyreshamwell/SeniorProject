const API   = "https://seniorproject-jkm4.onrender.com";
const token = localStorage.getItem("token");

document.addEventListener("DOMContentLoaded", () => {
  const tbl  = document.querySelector("#eventsTable tbody");
  const form = document.getElementById("eventForm");

  async function load() {
    try {
      const res = await fetch(`${API}/api/events`, {
        headers: { "Authorization": "Bearer " + token }
      });
      if (!res.ok) throw new Error(await res.text());
      const { events } = await res.json();
      tbl.innerHTML = events.map(ev => `
        <tr>
          <td>${new Date(ev.date).toLocaleDateString()}</td>
          <td>${ev.startTime}–${ev.endTime}</td>
          <td>${ev.title}</td>
          <td><button data-id="${ev._id}" class="delete">×</button></td>
        </tr>
      `).join("");
    } catch (err) {
      console.error("Failed to load events:", err);
      tbl.innerHTML = `<tr><td colspan="4">Unable to load events.</td></tr>`;
    }
  }

  form.addEventListener("submit", async e => {
    e.preventDefault();
    const payload = {
      date:      form.date.value,
      startTime: form.startTime.value,
      endTime:   form.endTime.value,
      title:     form.title.value
    };
    await fetch(`${API}/api/events`, {
      method:  "POST",
      headers: {
        "Content-Type":  "application/json",
        "Authorization": "Bearer " + token
      },
      body: JSON.stringify(payload)
    });
    form.reset();
    await load();
  });

  tbl.addEventListener("click", async e => {
    if (!e.target.matches(".delete")) return;
    await fetch(`${API}/api/events/${e.target.dataset.id}`, {
      method: "DELETE",
      headers:{ "Authorization": "Bearer " + token }
    });
    await load();
  });

  load();
});