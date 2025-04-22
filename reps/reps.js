// connect.js
async function render() {
    const { reps } = await fetch('/api/representatives').then(r=>r.json());
    const container = document.getElementById('repContainer');
    container.innerHTML = reps.map(r=>`
      <div class="rep-bubble">
        <h3>${r.name}</h3>
        <p><strong>${r.position}</strong>, ${r.company}</p>
        <a href="${r.linkedinURL}" target="_blank">LinkedIn</a>
      </div>
    `).join('');
  }
  render();