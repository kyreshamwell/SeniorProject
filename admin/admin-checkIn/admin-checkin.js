// DOM Elements
const checkinGrid = document.getElementById('checkin-grid');
const visibilityFilter = document.getElementById('visibility-filter');
const groupFilter = document.getElementById('group-filter');
const searchBox = document.getElementById('search-box');
const dateFilter = document.getElementById('date-filter');
const resetDateBtn = document.getElementById('reset-date');
const backToAdminBtn = document.getElementById('back-to-admin');
const globalCheckinToggle = document.getElementById('global-checkin-toggle');

// State
let allCheckins = [];
let currentFilters = {
  visibility: 'all',
  group: 'all',
  search: '',
  date: null
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

// Fetch check-in system status
async function fetchCheckInStatus() {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Not authenticated');
    }

    const response = await fetch('https://seniorproject-jkm4.onrender.com/api/admin/checkin-status', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) throw new Error('Failed to fetch check-in status');
    
    const data = await response.json();
    globalCheckinToggle.checked = data.enabled;
  } catch (err) {
    console.error('Error fetching check-in status:', err);
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

  // Apply visibility filter
  if (currentFilters.visibility !== 'all') {
    filtered = filtered.filter(checkin => 
      currentFilters.visibility === 'visible' ? checkin.isVisible : !checkin.isVisible
    );
  }

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

  // Apply date filter
  if (currentFilters.date) {
    const filterDate = new Date(currentFilters.date);
    filtered = filtered.filter(checkin => {
      const checkinDate = new Date(checkin.timestamp);
      return checkinDate.toDateString() === filterDate.toDateString();
    });
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
    
    const statusClass = checkin.isVisible ? 'status-visible' : 'status-hidden';
    const statusText = checkin.isVisible ? 'Visible' : 'Hidden';

    card.innerHTML = `
      <img src="data:image/jpeg;base64,${checkin.photo}" alt="Check-in photo" class="checkin-photo">
      <div class="checkin-info">
        <p>
          <strong>Team:</strong> ${checkin.teamName}
          <span class="status-badge ${statusClass}">${statusText}</span>
        </p>
        <p><strong>Time:</strong> ${new Date(checkin.timestamp).toLocaleString()}</p>
        <div class="visibility-toggle">
          <label>
            <input type="checkbox" 
                   ${checkin.isVisible ? 'checked' : ''} 
                   onchange="toggleVisibility('${checkin._id}', this.checked)">
            Visible to students
          </label>
        </div>
      </div>
    `;
    
    checkinGrid.appendChild(card);
  });
}

// Toggle visibility of a check-in
async function toggleVisibility(checkinId, isVisible) {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(`https://seniorproject-jkm4.onrender.com/api/admin/checkins/${checkinId}/visibility`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ isVisible })
    });

    if (!response.ok) throw new Error('Failed to update visibility');

    // Update the local state
    const checkin = allCheckins.find(c => c._id === checkinId);
    if (checkin) {
      checkin.isVisible = isVisible;
      applyFilters();
    }
  } catch (err) {
    console.error('Error updating visibility:', err);
    alert('Failed to update visibility. Please make sure you are logged in as an admin.');
  }
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
visibilityFilter.addEventListener('change', (e) => {
  currentFilters.visibility = e.target.value;
  applyFilters();
});

groupFilter.addEventListener('change', (e) => {
  currentFilters.group = e.target.value;
  applyFilters();
});

searchBox.addEventListener('input', (e) => {
  currentFilters.search = e.target.value;
  applyFilters();
});

dateFilter.addEventListener('change', (e) => {
  currentFilters.date = e.target.value;
  applyFilters();
});

resetDateBtn.addEventListener('click', () => {
  dateFilter.value = '';
  currentFilters.date = null;
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
    fetchCheckInStatus();
    fetchCheckIns();
  })
  .catch(err => {
    console.error('Error verifying admin status:', err);
    alert('Error verifying admin status. Please try again.');
  });
}); 