// Check if user is admin
function checkAdminAuth() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/login/login.html';
        return false;
    }
    return true;
}

// Validate token and refresh if needed
async function validateToken() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/login/login.html';
        return false;
    }

    try {
        const response = await fetch('https://seniorproject-jkm4.onrender.com/api/user', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            // Token is invalid, redirect to login
            localStorage.removeItem('token');
            window.location.href = '/login/login.html';
            return false;
        }

        const data = await response.json();
        if (data.role !== 'admin') {
            // User is not an admin, redirect to home
            window.location.href = '/home/home.html';
            return false;
        }

        return true;
    } catch (error) {
        console.error('Error validating token:', error);
        localStorage.removeItem('token');
        window.location.href = '/login/login.html';
        return false;
    }
}

// Fetch all submissions
async function fetchSubmissions() {
    const spinner = document.getElementById('loadingSpinner');
    const errorMessage = document.getElementById('errorMessage');
    const submissionsBody = document.getElementById('submissionsBody');

    try {
        // Validate token before proceeding
        if (!await validateToken()) {
            return;
        }

        spinner.classList.remove('hidden');
        errorMessage.classList.add('hidden');

        console.log('Fetching submissions...');
        const response = await fetch('https://seniorproject-jkm4.onrender.com/api/admin/submissions', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        console.log('Response status:', response.status);
        const data = await response.json();
        console.log('Received data:', data);

        if (!response.ok) {
            throw new Error(data.error || 'Failed to fetch submissions');
        }

        displaySubmissions(data.submissions);
    } catch (error) {
        console.error('Error fetching submissions:', error);
        errorMessage.textContent = error.message || 'Failed to load submissions. Please try again.';
        errorMessage.classList.remove('hidden');
    } finally {
        spinner.classList.add('hidden');
    }
}

// Display submissions in the table
function displaySubmissions(submissions) {
    const submissionsBody = document.getElementById('submissionsBody');
    submissionsBody.innerHTML = '';

    if (!submissions || submissions.length === 0) {
        submissionsBody.innerHTML = `
            <tr>
                <td colspan="5" style="text-align: center;">No submissions found</td>
            </tr>
        `;
        return;
    }

    submissions.forEach(submission => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${submission.username}</td>
            <td>${submission.company ? submission.company.name : 'No Company'}</td>
            <td>${submission.originalName}</td>
            <td>${new Date(submission.submittedAt).toLocaleString()}</td>
            <td>
                <button class="action-btn view-btn" onclick="viewSubmission('${submission._id}')">View</button>
                <button class="action-btn download-btn" onclick="downloadSubmission('${submission._id}')">Download</button>
            </td>
        `;
        submissionsBody.appendChild(row);
    });
}

// View submission
async function viewSubmission(submissionId) {
    try {
        console.log('Attempting to view submission:', submissionId);
        
        // Validate token before proceeding
        if (!await validateToken()) {
            return;
        }

        const response = await fetch(`https://seniorproject-jkm4.onrender.com/api/admin/submissions/${submissionId}/view`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        console.log('View response status:', response.status);
        
        if (!response.ok) {
            const errorData = await response.json();
            console.error('View submission error:', errorData);
            throw new Error(errorData.error || 'Failed to view submission');
        }

        const blob = await response.blob();
        console.log('Received blob:', blob.type, blob.size);
        
        if (blob.size === 0) {
            throw new Error('Received empty file');
        }

        const url = window.URL.createObjectURL(blob);
        window.open(url, '_blank');
    } catch (error) {
        console.error('Error viewing submission:', error);
        alert(error.message || 'Failed to view submission. Please try again.');
    }
}

// Download submission
async function downloadSubmission(submissionId) {
    try {
        console.log('Attempting to download submission:', submissionId);
        
        // Validate token before proceeding
        if (!await validateToken()) {
            return;
        }

        const response = await fetch(`https://seniorproject-jkm4.onrender.com/api/admin/submissions/${submissionId}/download`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        console.log('Download response status:', response.status);

        if (!response.ok) {
            const errorData = await response.json();
            console.error('Download submission error:', errorData);
            throw new Error(errorData.error || 'Failed to download submission');
        }

        const blob = await response.blob();
        console.log('Received blob:', blob.type, blob.size);
        
        if (blob.size === 0) {
            throw new Error('Received empty file');
        }

        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'submission.pdf';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    } catch (error) {
        console.error('Error downloading submission:', error);
        alert(error.message || 'Failed to download submission. Please try again.');
    }
}

// Filter submissions
function filterSubmissions() {
    const searchInput = document.getElementById('searchInput');
    const teamFilter = document.getElementById('teamFilter');
    const dateFilter = document.getElementById('dateFilter');
    const searchTerm = searchInput.value.toLowerCase();
    const teamValue = teamFilter.value;
    const dateValue = dateFilter.value;

    const rows = document.querySelectorAll('#submissionsBody tr');

    rows.forEach(row => {
        const username = row.cells[0].textContent.toLowerCase();
        const team = row.cells[1].textContent.toLowerCase();
        const date = new Date(row.cells[3].textContent);

        const matchesSearch = username.includes(searchTerm) || team.includes(searchTerm);
        const matchesTeam = !teamValue || team === teamValue.toLowerCase();
        const matchesDate = !dateValue || isWithinDateRange(date, dateValue);

        row.style.display = matchesSearch && matchesTeam && matchesDate ? '' : 'none';
    });
}

// Check if date is within selected range
function isWithinDateRange(date, range) {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    switch (range) {
        case 'today':
            return date >= startOfDay;
        case 'week':
            return date >= startOfWeek;
        case 'month':
            return date >= startOfMonth;
        default:
            return true;
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
    // Validate token before proceeding
    if (!await validateToken()) {
        return;
    }

    // Fetch initial submissions
    fetchSubmissions();

    // Set up event listeners
    document.getElementById('refreshBtn').addEventListener('click', fetchSubmissions);
    document.getElementById('goBackBtn').addEventListener('click', () => {
        window.location.href = '/admin/admin.html';
    });
    document.getElementById('searchInput').addEventListener('input', filterSubmissions);
    document.getElementById('teamFilter').addEventListener('change', filterSubmissions);
    document.getElementById('dateFilter').addEventListener('change', filterSubmissions);
});
