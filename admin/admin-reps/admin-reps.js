// admin-reps.js
const form = document.getElementById('repForm');
const tbody = document.querySelector('#repTable tbody');
const token = localStorage.getItem('token');

// load existing
async function load() {
  const { reps } = await fetch('/api/representatives').then(r=>r.json());
  tbody.innerHTML = reps.map(r => `
    <tr>
      <td>${r.name}</td>
      <td>${r.company}</td>
      <td>${r.position}</td>
      <td><a href="${r.linkedinURL}" target="_blank">View</a></td>
      <td>
        <button data-id="${r._id}" class="delete">🗑</button>
      </td>
    </tr>
  `).join('');
}

form.addEventListener('submit', async e => {
  e.preventDefault();
  const body = Object.fromEntries(new FormData(form));
  await fetch('/api/representatives', {
    method:'POST',
    headers:{
      'Content-Type':'application/json',
      'Authorization':'Bearer '+token
    },
    body: JSON.stringify(body)
  });
  form.reset();
  load();
});

tbody.addEventListener('click', async e => {
  if (!e.target.matches('.delete')) return;
  const id = e.target.dataset.id;
  await fetch(`/api/representatives/${id}`, {
    method:'DELETE',
    headers:{ 'Authorization':'Bearer '+token }
  });
  load();
});

load();