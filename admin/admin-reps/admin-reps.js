// admin-reps.js

const API   = 'https://seniorproject-jkm4.onrender.com';  // your Render backend
const form  = document.getElementById('repForm');
const tbody = document.querySelector('#repTable tbody');
const token = localStorage.getItem('token');

// 1) Load existing reps
async function load() {
  try {
    const res  = await fetch(`${API}/api/representatives`);
    const { reps } = await res.json();
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
  } catch (err) {
    console.error('Failed to load reps:', err);
  }
}

// 2) Create a new rep
form.addEventListener('submit', async e => {
  e.preventDefault();
  const body = Object.fromEntries(new FormData(form));

  try {
    await fetch(`${API}/api/representatives`, {
      method: 'POST',
      headers: {
        'Content-Type':  'application/json',
        'Authorization': 'Bearer ' + token
      },
      body: JSON.stringify(body)
    });
    form.reset();
    load();
  } catch (err) {
    console.error('Failed to add rep:', err);
  }
});

// 3) Delete via event delegation
tbody.addEventListener('click', async e => {
  if (!e.target.matches('.delete')) return;
  const id = e.target.dataset.id;

  try {
    await fetch(`${API}/api/representatives/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': 'Bearer ' + token }
    });
    load();
  } catch (err) {
    console.error('Failed to delete rep:', err);
  }
});

// initial load
load();