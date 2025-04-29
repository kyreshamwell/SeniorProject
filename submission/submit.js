// Check if user is logged in
function checkAuth() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'https://senior-project-delta.vercel.app/login/login.html';
        return false;
    }
    return true;
}

// Handle file upload
async function handleSubmit(e) {
    e.preventDefault();
    
    if (!checkAuth()) return;

    const form = document.getElementById('uploadForm');
    const formData = new FormData(form);
    const resultDiv = document.getElementById('result');
    const submitButton = document.querySelector('button[type="submit"]');

    try {
        // Disable submit button and show loading state
        submitButton.disabled = true;
        submitButton.textContent = 'Submitting...';
        resultDiv.innerHTML = '<p style="color: #666;">Uploading your project...</p>';

        const response = await fetch('https://seniorproject-jkm4.onrender.com/submit-project', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: formData
        });

        const data = await response.json();

        if (response.ok) {
            resultDiv.innerHTML = `
                <div style="color: green; margin: 20px 0;">
                    <h3>✅ Project Submitted Successfully!</h3>
                    <p>File: ${data.submission.originalName}</p>
                    <p>Submitted at: ${new Date(data.submission.submittedAt).toLocaleString()}</p>
                </div>
            `;
            // Clear the form
            form.reset();
        } else {
            resultDiv.innerHTML = `
                <div style="color: red; margin: 20px 0;">
                    <h3>❌ Submission Failed</h3>
                    <p>${data.error || 'Something went wrong. Please try again.'}</p>
                </div>
            `;
        }
    } catch (error) {
        console.error('Submission error:', error);
        resultDiv.innerHTML = `
            <div style="color: red; margin: 20px 0;">
                <h3>❌ Error</h3>
                <p>Something went wrong. Please try again.</p>
            </div> 
        `;
    } finally {
        // Re-enable submit button
        submitButton.disabled = false;
        submitButton.textContent = 'Submit Project';
    }
}

// Initialize the form
document.addEventListener('DOMContentLoaded', () => {
    if (!checkAuth()) return;

    const form = document.getElementById('uploadForm');
    form.addEventListener('submit', handleSubmit);
});
