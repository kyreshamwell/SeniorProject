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

// Check if check-in system is enabled
async function checkCheckInStatus() {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Not authenticated');
    }

    const response = await fetch('https://seniorproject-jkm4.onrender.com/api/checkin-status', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) throw new Error('Failed to fetch check-in status');
    
    const data = await response.json();
    if (!data.enabled) {
      alert('Check-in system is currently disabled by the administrator.');
      window.location.href = '/home/home.html';
      return false;
    }
    return true;
  } catch (err) {
    console.error('Error checking check-in status:', err);
    alert('Error checking check-in status. Please try again later.');
    window.location.href = '/home/home.html';
    return false;
  }
}

// Camera functions
async function startCamera() {
  try {
    // Check if check-in is enabled before starting camera
    const isEnabled = await checkCheckInStatus();
    if (!isEnabled) return;

    stream = await navigator.mediaDevices.getUserMedia({ 
      video: { 
        facingMode: 'user',
        width: { ideal: 640 },
        height: { ideal: 480 }
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
  }, 'image/jpeg', 0.7);
}

function retakePhoto() {
  photoPreview.style.display = 'none';
  camera.style.display = 'block';
  captureBtn.style.display = 'inline-block';
  retakeBtn.style.display = 'none';
  submitBtn.style.display = 'none';
}

// Function to compress image
async function compressImage(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 640;
        const MAX_HEIGHT = 480;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to base64 with reduced quality
        const base64String = canvas.toDataURL('image/jpeg', 0.6);
        resolve(base64String.split(',')[1]);
      };
    };
  });
}

async function submitCheckIn() {
  try {
    // Get the user's token from localStorage
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Not authenticated');
    }

    // Convert the captured photo to blob
    const response = await fetch(capturedPhoto.src);
    const blob = await response.blob();
    
    // Compress the image
    const compressedBase64 = await compressImage(blob);
    
    try {
      const checkInResponse = await fetch('https://seniorproject-jkm4.onrender.com/api/checkin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          photo: compressedBase64
        })
      });

      const data = await checkInResponse.json();

      if (checkInResponse.ok) {
        alert('Check-in successful!');
        stopCamera();
        window.location.href = '/home/home.html';
      } else {
        throw new Error(data.error || 'Check-in failed');
      }
    } catch (err) {
      console.error('Error submitting check-in:', err);
      alert(err.message || 'Failed to submit check-in. Please try again.');
    }
  } catch (err) {
    console.error('Error in submitCheckIn:', err);
    alert('Error submitting check-in. Please make sure you are logged in.');
  }
}

function goBack() {
  stopCamera();
  window.location.href = '/home/home.html';
}

// Event Listeners
startCameraBtn.addEventListener('click', startCamera);
captureBtn.addEventListener('click', capturePhoto);
retakeBtn.addEventListener('click', retakePhoto);
submitBtn.addEventListener('click', submitCheckIn);
backBtn.addEventListener('click', goBack);

// Initialize
window.addEventListener('DOMContentLoaded', async () => {
  // Check if user is authenticated
  const token = localStorage.getItem('token');
  if (!token) {
    alert('Please log in to use the check-in system.');
    window.location.href = '/login.html';
    return;
  }

  // Check if check-in system is enabled
  await checkCheckInStatus();
});
  