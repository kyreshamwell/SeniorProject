// main.js

// Camera elements
const camera = document.getElementById('camera');
const canvas = document.getElementById('canvas');
const startCameraBtn = document.getElementById('start-camera-btn');
const captureBtn = document.getElementById('capture-btn');
const retakeBtn = document.getElementById('retake-btn');
const submitBtn = document.getElementById('submit-btn');
const photoPreview = document.getElementById('photo-preview');
const capturedPhoto = document.getElementById('captured-photo');
const backBtn = document.getElementById('back-btn');

// State
let stream = null;

// Camera functions
async function startCamera() {
  try {
    stream = await navigator.mediaDevices.getUserMedia({ 
      video: { 
        facingMode: 'user',
        width: { ideal: 1280 },
        height: { ideal: 720 }
      } 
    });
    camera.srcObject = stream;
    startCameraBtn.style.display = 'none';
    captureBtn.style.display = 'inline-block';
  } catch (err) {
    console.error('Error accessing camera:', err);
    alert('Error accessing camera. Please make sure you have granted camera permissions.');
    startCameraBtn.style.display = 'inline-block';
  }
}

function stopCamera() {
  if (stream) {
    stream.getTracks().forEach(track => track.stop());
    stream = null;
  }
}

function capturePhoto() {
  canvas.width = camera.videoWidth;
  canvas.height = camera.videoHeight;
  canvas.getContext('2d').drawImage(camera, 0, 0);
  
  canvas.toBlob(async (blob) => {
    const photoUrl = URL.createObjectURL(blob);
    capturedPhoto.src = photoUrl;
    photoPreview.style.display = 'block';
    camera.style.display = 'none';
    captureBtn.style.display = 'none';
    retakeBtn.style.display = 'inline-block';
    submitBtn.style.display = 'inline-block';
  }, 'image/jpeg', 0.95);
}

function retakePhoto() {
  photoPreview.style.display = 'none';
  camera.style.display = 'block';
  captureBtn.style.display = 'inline-block';
  retakeBtn.style.display = 'none';
  submitBtn.style.display = 'none';
}

async function submitCheckIn() {
  try {
    // Get the user's token from localStorage
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Not authenticated');
    }

    // Convert the captured photo to base64
    const response = await fetch(capturedPhoto.src);
    const blob = await response.blob();
    const reader = new FileReader();
    
    reader.onloadend = async () => {
      const base64data = reader.result.split(',')[1];
      
      try {
        const checkInResponse = await fetch('https://seniorproject-jkm4.onrender.com/api/checkin', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            photo: base64data,
            groupId: 'default' // You might want to get this from somewhere
          })
        });

        if (checkInResponse.ok) {
          alert('Check-in successful!');
          stopCamera();
          window.location.href = '/home.html'; // Redirect to home page
        } else {
          throw new Error('Check-in failed');
        }
      } catch (err) {
        console.error('Error submitting check-in:', err);
        alert('Failed to submit check-in. Please try again.');
      }
    };

    reader.readAsDataURL(blob);
  } catch (err) {
    console.error('Error in submitCheckIn:', err);
    alert('Error submitting check-in. Please make sure you are logged in.');
  }
}

function goBack() {
  stopCamera();
  window.location.href = '/home/home.html'; // Redirect to home page
}

// Event Listeners
startCameraBtn.addEventListener('click', startCamera);
captureBtn.addEventListener('click', capturePhoto);
retakeBtn.addEventListener('click', retakePhoto);
submitBtn.addEventListener('click', submitCheckIn);
backBtn.addEventListener('click', goBack);

// Initialize
window.addEventListener('DOMContentLoaded', () => {
  // Check if user is authenticated
  const token = localStorage.getItem('token');
  if (!token) {
    alert('Please log in to use the check-in system.');
    window.location.href = '/login.html';
  }
});
  