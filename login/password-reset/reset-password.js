document.addEventListener("DOMContentLoaded", () => {
    const BACKEND_URL = "https://seniorproject-jkm4.onrender.com"; // Add this constant at the top
    const resetPasswordForm = document.getElementById("resetPasswordForm");
    const successMessage = document.getElementById("successMessage");
    const backToLoginBtn = document.getElementById("backToLogin");

    resetPasswordForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get("token");
        const newPassword = document.getElementById("newPassword").value;

        if (!token) {
            alert("Invalid or missing token.");
            return;
        }

        try {
            const response = await fetch(`${BACKEND_URL}/reset-password`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token, password: newPassword }),
            });

            const data = await response.json();

            if (response.ok) {
                // ✅ Hide form, show success message
                resetPasswordForm.style.display = "none";
                successMessage.style.display = "block";
            } else {
                alert(data.error || "Error resetting password.");
            }
        } catch (error) {
            console.error("Reset Password Error:", error);
            alert("An error occurred. Please try again.");
        }
    });

    document.getElementById('backToLogin').addEventListener('click', function() {
        window.location.href = "/index.html";  // ✅ This should match where index.html is
    });
});