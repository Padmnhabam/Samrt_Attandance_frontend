const messageBox = document.getElementById("message");

document.getElementById("loginForm").addEventListener("submit", function (e) {
    e.preventDefault();

    const role = document.getElementById("role").value;
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    if (!role) {
        showMessage("Please select role");
        return;
    }

    const user = { email, password };

    let url = "";
    if (role === "student") {
        url = "http://localhost:8080/api/users/login";
    } else if (role === "teacher") {
        url = "http://localhost:8080/api/teachers/login";
    }

    fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(user)
    })
    .then(async res => {
        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
            showMessage(data.message || "Invalid email or password");
            return null;
        }

        return data;
    })
    .then(data => {
        if (!data) return;

        console.log("Login Success:", data);

        // Save user & role
        localStorage.setItem("loggedUser", JSON.stringify(data));
        localStorage.setItem("role", role);

        // Redirect based on role
        if (role === "teacher") {
            window.location.href = "teacher-dashboard.html";
        } else {
            window.location.href = "dashboard.html";
        }
    })
    .catch(err => {
        console.error(err);
        showMessage("Server error. Try again.");
    });
});

function showMessage(msg) {
    messageBox.innerText = msg;
    messageBox.style.display = "block";
}

function goToRegister() {
    const role = document.getElementById("role").value;

    if (!role) {
        alert("Please select role first");
        return;
    }

    window.location.href =
        role === "student" ? "register.html" : "teacher-register.html";
}
