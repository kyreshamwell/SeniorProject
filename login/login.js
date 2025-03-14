function openPopup(type) {
    document.getElementById(type + 'Popup').style.display = 'block';
    document.getElementById('popupOverlay').style.display = 'block';
}

function closePopup(type) {
    document.getElementById(type + 'Popup').style.display = 'none';
    document.getElementById('popupOverlay').style.display = 'none';
}

function closeAllPopups() {
    document.getElementById('signinPopup').style.display = 'none';
    document.getElementById('signupPopup').style.display = 'none';
    document.getElementById('popupOverlay').style.display = 'none';
}