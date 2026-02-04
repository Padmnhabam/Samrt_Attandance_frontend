document.addEventListener("DOMContentLoaded", function () {

    const role = localStorage.getItem("role");
    const userData = JSON.parse(localStorage.getItem("loggedUser"));

    // Security check
    if (!userData || role !== "teacher") {
        window.location.href = "index.html";
        return;
    }

    console.log("Teacher Logged In:", userData);

    // Get teacher name from any possible field
    const name =
        userData.name ||
        userData.fullName ||
        userData.teacherName ||
        userData.username ||
        "Teacher";

    // Show name on dashboard
    const nameElement = document.getElementById("teacherName");
    if (nameElement) nameElement.innerText = name;
});

function logout() {
    localStorage.clear();
    window.location.href = "index.html";
}
