// DOM Elements
const checkinGrid = document.getElementById('checkin-grid');
const groupFilter = document.getElementById('group-filter');
const searchBox = document.getElementById('search-box');
const backToAdminBtn = document.getElementById('back-to-admin');
const globalCheckinToggle = document.getElementById('global-checkin-toggle');

// State
let allCheckins = [];
let currentFilters = {
  group: 'all',
  search: ''
};

// Fetch check-ins from the server
async function fetchCheckIns() {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Not authenticated');
    }

    const response = await fetch('https://seniorproject-jkm4.onrender.com/api/admin/checkins', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) throw new Error('Failed to fetch check-ins');
    
    const data = await response.json();
    allCheckins = data.checkins;
    updateGroupFilter();
    applyFilters();
  } catch (err) {
    console.error('Error fetching check-ins:', err);
    alert('Failed to load check-ins. Please make sure you are logged in as an admin.');
  }
}

// Update the group filter options based on available groups
function updateGroupFilter() {
  const groups = [...new Set(allCheckins.map(checkin => checkin.teamName))];
  const groupFilter = document.getElementById('group-filter');
  
  // Keep the "All Groups" option
  groupFilter.innerHTML = '<option value="all">All Teams</option>';
  
  // Add group options
  groups.forEach(teamName => {
    if (teamName && teamName !== 'No Team') {  // Only add non-default teams
      const option = document.createElement('option');
      option.value = teamName;
      option.textContent = teamName;
      groupFilter.appendChild(option);
    }
  });
}

// Apply all current filters to the check-ins
function applyFilters() {
  let filtered = [...allCheckins];

  // Apply group filter
  if (currentFilters.group !== 'all') {
    filtered = filtered.filter(checkin => checkin.teamName === currentFilters.group);
  }

  // Apply search filter
  if (currentFilters.search) {
    const searchLower = currentFilters.search.toLowerCase();
    filtered = filtered.filter(checkin => 
      checkin.teamName.toLowerCase().includes(searchLower)
    );
  }

  // Sort by timestamp (newest first)
  filtered.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  displayCheckIns(filtered);
}

// Display check-ins in the grid
function displayCheckIns(checkins) {
  checkinGrid.innerHTML = '';

  checkins.forEach(checkin => {
    const card = document.createElement('div');
    card.className = 'checkin-card';
    
    card.innerHTML = `
      <img src="data:image/jpeg;base64,${checkin.photo}" alt="Check-in photo" class="checkin-photo">
      <div class="checkin-info">
        <p>
          <strong>Team:</strong> ${checkin.teamName}
        </p>
        <p><strong>Time:</strong> ${new Date(checkin.timestamp).toLocaleString()}</p>
      </div>
    `;
    
    checkinGrid.appendChild(card);
  });
}

// Update check-in system status
async function updateCheckInStatus(enabled) {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Not authenticated');
    }

    const response = await fetch('https://seniorproject-jkm4.onrender.com/api/admin/checkin-status', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ enabled })
    });

    if (!response.ok) throw new Error('Failed to update check-in status');
    
    alert(`Check-in system ${enabled ? 'enabled' : 'disabled'}`);
  } catch (err) {
    console.error('Error updating check-in status:', err);
    alert('Failed to update check-in status. Please try again.');
    // Revert the toggle if the update failed
    globalCheckinToggle.checked = !enabled;
  }
}

// Event Listeners
groupFilter.addEventListener('change', (e) => {
  currentFilters.group = e.target.value;
  applyFilters();
});

searchBox.addEventListener('input', (e) => {
  currentFilters.search = e.target.value;
  applyFilters();
});

backToAdminBtn.addEventListener('click', () => {
  window.location.href = '/admin/admin.html';
});

globalCheckinToggle.addEventListener('change', (e) => {
  updateCheckInStatus(e.target.checked);
});

// Initialize
window.addEventListener('DOMContentLoaded', () => {
  // Check if user is authenticated and is admin
  const token = localStorage.getItem('token');
  if (!token) {
    alert('Please log in to access the admin dashboard.');
    window.location.href = '/login.html';
    return;
  }

  // Verify admin role
  fetch('https://seniorproject-jkm4.onrender.com/api/user', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  })
  .then(response => response.json())
  .then(data => {
    if (data.role !== 'admin') {
      alert('Access denied. Admin privileges required.');
      window.location.href = '/home/home.html';
      return;
    }
    fetchCheckIns();
  })
  .catch(err => {
    console.error('Error verifying admin status:', err);
    alert('Error verifying admin status. Please try again.');
  });
}); 