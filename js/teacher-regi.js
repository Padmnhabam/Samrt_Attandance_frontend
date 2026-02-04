document.getElementById("registerForm").addEventListener("submit", function(e) {
    e.preventDefault(); // prevent form from submitting normally

    // Get form values
    const user = {
        name: document.getElementById("name").value.trim(),
        subject: document.getElementById("subject").value.trim(),
        email: document.getElementById("email").value.trim(),
        password: document.getElementById("password").value.trim()
    };

    // Validate inputs (optional but recommended)
    if (!user.name || !user.subject || !user.email || !user.password) {
        document.getElementById("message").textContent = "All fields are required!";
        document.getElementById("message").style.color = "red";
        return;
    }

    // Send data to backend API
    fetch("http://localhost:8080/api/teacher/register", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(user)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Show success message
            document.getElementById("message").textContent = "Registration successful! Redirecting to login...";
            document.getElementById("message").style.color = "green";
            // Redirect after 2 seconds
            setTimeout(() => {
                window.location.href = "index.html"; // your login page
            }, 2000);
        } else {
            // Show error message from backend
            document.getElementById("message").textContent = data.message || "Registration failed!";
            document.getElementById("message").style.color = "red";
        }
    })
    .catch(error => {
        console.error("Error:", error);
        document.getElementById("message").textContent = "An error occurred. Please try again.";
        document.getElementById("message").style.color = "red";
    });
});
