// main.js
window.addEventListener('DOMContentLoaded', async () => {
    const statusElem = document.getElementById('status');
  
    // Parse URL query param for userId
    const queryParams = new URLSearchParams(window.location.search);
    const userId = queryParams.get('userId');
  
    if (userId) {
      // Attempt to record a check-in
      try {
        const response = await fetch('/api/checkins', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ userId })
        });
  
        const data = await response.json();
        if (response.ok) {
          statusElem.textContent = `Check-in successful! (UserId: ${userId})`;
        } else {
          statusElem.textContent = `Check-in failed: ${data.error || 'Unknown error'}`;
        }
      } catch (error) {
        console.error(error);
        statusElem.textContent = 'Network or server error occurred.';
      }
    } else {
      statusElem.textContent = 'No userId found in URL. Please scan a valid QR code.';
    }
  });
  
// DOM Elements
const statusElem = document.getElementById('status');
const optionsSection = document.getElementById('options-section');
const qrSection = document.getElementById('qr-section');
const cameraSection = document.getElementById('camera-section');

// Camera elements
let stream = null;
const camera = document.getElementById('camera');
const canvas = document.getElementById('canvas');
const startCameraBtn = document.getElementById('start-camera-btn');
const captureBtn = document.getElementById('capture-btn');
const retakeBtn = document.getElementById('retake-btn');
const submitBtn = document.getElementById('submit-btn');
const photoPreview = document.getElementById('photo-preview');
const capturedPhoto = document.getElementById('captured-photo');

// Navigation buttons
const qrBtn = document.getElementById('qr-btn');
const cameraBtn = document.getElementById('camera-btn');
const backFromQrBtn = document.getElementById('back-from-qr');
const backFromCameraBtn = document.getElementById('back-from-camera');

// State
let currentSection = 'options';

// Navigation functions
function showSection(sectionId) {
  optionsSection.style.display = 'none';
  qrSection.style.display = 'none';
  cameraSection.style.display = 'none';
  
  document.getElementById(sectionId + '-section').style.display = 'block';
  currentSection = sectionId;
}

// Generate a daily-changing userId
function generateDailyUserId() {
  const today = new Date();
  const dateString = today.toISOString().split('T')[0];
  return btoa(dateString);
}

// QR Code generation
function generateQRCode() {
  const userId = generateDailyUserId();
  const checkinUrl = `${window.location.origin}/checkin.html?userId=${userId}`;

  new QRCode(document.getElementById("qrcode"), {
    text: checkinUrl,
    width: 256,
    height: 256,
    colorDark: "#2c3e50",
    colorLight: "#ffffff",
    correctLevel: QRCode.CorrectLevel.H
  });
}

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
        const checkInResponse = await fetch('/api/checkin', {
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
          window.location.reload(); // Refresh the page
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

// Event Listeners
qrBtn.addEventListener('click', () => {
  showSection('qr');
  generateQRCode();
});

cameraBtn.addEventListener('click', () => {
  showSection('camera');
});

backFromQrBtn.addEventListener('click', () => {
  showSection('options');
});

backFromCameraBtn.addEventListener('click', () => {
  stopCamera();
  showSection('options');
});

startCameraBtn.addEventListener('click', startCamera);
captureBtn.addEventListener('click', capturePhoto);
retakeBtn.addEventListener('click', retakePhoto);
submitBtn.addEventListener('click', submitCheckIn);

// Initialize
window.addEventListener('DOMContentLoaded', () => {
  // Check if user is authenticated
  const token = localStorage.getItem('token');
  if (!token) {
    alert('Please log in to use the check-in system.');
    window.location.href = '/login.html';
  }
});
  