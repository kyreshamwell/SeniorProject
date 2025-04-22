// reps.js
const API = 'https://seniorproject-jkm4.onrender.com';

async function render() {
  try {
    const res = await fetch(`${API}/api/representatives`);
    if (!res.ok) throw new Error(await res.text());
    const { reps } = await res.json();
    const container = document.getElementById('repContainer');
    container.innerHTML = reps.map(r => `
      <div class="rep-bubble">
        <h3>${r.name}</h3>
        <p><strong>${r.position}</strong>, ${r.company}</p>
        <a href="${r.linkedinURL}" target="_blank">LinkedIn</a>
      </div>
    `).join('');
  } catch (err) {
    console.error('Failed to load representatives:', err);
    document.getElementById('repContainer').textContent = 
      'Sorry, could not load representatives.';
  }
}

render();