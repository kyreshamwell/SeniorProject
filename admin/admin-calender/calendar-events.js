const API = 'https://seniorproject-jkm4.onrender.com';
const token = localStorage.getItem('token');
const tbl = document.querySelector('#eventsTable tbody');
const form = document.getElementById('eventForm');

async function load() {
  const res = await fetch(`${API}/api/events?date=ALL`); // implement ALL server‐side if you like
  const { events } = await res.json();
  tbl.innerHTML = events.map(ev=>`
    <tr>
      <td>${new Date(ev.date).toLocaleDateString()}</td>
      <td>${ev.startTime}–${ev.endTime}</td>
      <td>${ev.title}</td>
      <td><button data-id="${ev._id}" class="delete">×</button></td>
    </tr>
  `).join('');
}

form.addEventListener('submit', async e => {
  e.preventDefault();
  const payload = {
    date:        document.getElementById('date').value,
    startTime:   document.getElementById('startTime').value,
    endTime:     document.getElementById('endTime').value,
    title:       document.getElementById('title').value,
    description: document.getElementById('description').value,
  };
  await fetch(`${API}/api/events`, {
    method:'POST',
    headers:{
      'Content-Type':'application/json',
      'Authorization':'Bearer '+token
    },
    body: JSON.stringify(payload)
  });
  form.reset();
  await load();
});

tbl.addEventListener('click', async e => {
  if (!e.target.matches('.delete')) return;
  const id = e.target.dataset.id;
  await fetch(`${API}/api/events/${id}`, {
    method:'DELETE',
    headers:{ 'Authorization':'Bearer '+token }
  });
  await load();
});

load();