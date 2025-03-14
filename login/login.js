/**
 * Opens the specified popup and displays the overlay.
 * @param {string} id - The ID of the popup to be opened.
 */
function openPopup(id) {
    document.getElementById(id).style.display = 'block';
    document.getElementById('popupOverlay').style.display = 'block';
}

/**
 * Closes the specified popup and hides the overlay.
 * @param {string} id - The ID of the popup to be closed.
 */
function closePopup(id) {
    document.getElementById(id).style.display = 'none';
    document.getElementById('popupOverlay').style.display = 'none';
}

/**
 * Closes all popups and hides the overlay.
 */
function closeAllPopups() {
    document.getElementById('signinPopup').style.display = 'none';
    document.getElementById('signupPopup').style.display = 'none';
    document.getElementById('popupOverlay').style.display = 'none';
}