// ----------------- GET LOGGED-IN USER -----------------
const user = JSON.parse(localStorage.getItem("loggedUser"));

if (!user) {
    window.location.href = "index.html";
}

// ----------------- UPDATE WELCOME & PROFILE INFO -----------------
document.getElementById("welcomeText").innerText = "Welcome, " + user.name + " 👋";
document.getElementById("profileName").innerText = user.name;
document.getElementById("profileEmail").innerText = user.email;
document.getElementById("profileRoll").innerText = user.rollNo;
document.getElementById("profileClass").innerText = user.className;

// ----------------- FETCH DASHBOARD DATA -----------------
fetch(`http://localhost:8080/api/student/dashboard/${user.id}`)
    .then(res => {
        if (!res.ok) throw new Error("Failed to fetch dashboard data");
        return res.json();
    })
    .then(data => {
        // Update main cards
        document.querySelector(".card.blue p").innerText = data.totalClasses;
        document.querySelector(".card.green p").innerText = data.present;
        document.querySelector(".card.red p").innerText = data.absent;
        document.querySelector(".card.purple p").innerText = data.percentage + "%";

        // Update Attendance Stats Cards
        const statCards = document.querySelectorAll(".attendance-stats .stat-card");

        // Present
        statCards[0].querySelector(".stat-value").innerText = data.present;
        statCards[0].querySelector(".stat-progress-bar.present").style.width = data.percentage + "%";

        // Absent
        statCards[1].querySelector(".stat-value").innerText = data.absent;
        statCards[1].querySelector(".stat-progress-bar.absent").style.width = (100 - data.percentage) + "%";

        // Load chart
        loadChart(data.present, data.absent);
    })
    .catch(err => {
        console.error(err);
        alert("Could not load dashboard data. Please try again later.");
    });

// ----------------- FETCH ATTENDANCE TABLE -----------------
fetch(`http://localhost:8080/api/student/attendance/${user.id}`)
    .then(res => {
        if (!res.ok) throw new Error("Failed to fetch attendance records");
        return res.json();
    })
    .then(records => {
        const tbody = document.querySelector("#attendance table tbody");
        tbody.innerHTML = ""; // clear previous rows

        records.forEach(r => {
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td>${r.date}</td>
                <td>${r.subject}</td>
                <td class="${r.status.toLowerCase()}">${r.status}</td>
            `;
            tbody.appendChild(tr);
        });

        setupFilters(); // initialize filter buttons after loading
    })
    .catch(err => {
        console.error(err);
        alert("Could not load attendance records. Please try again later.");
    });

// ----------------- LOAD CHART -----------------
function loadChart(present, absent) {
    const ctx = document.getElementById("attendanceChart");

    new Chart(ctx, {
        type: "doughnut",
        data: {
            labels: ["Present", "Absent"],
            datasets: [{
                data: [present, absent],
                backgroundColor: ["#1cc88a", "#e74a3b"],
                borderWidth: 0
            }]
        },
        options: {
            plugins: { legend: { position: "bottom" } },
            cutout: "70%"
        }
    });
}

// ----------------- SECTION SWITCH -----------------
function showSection(id) {
    document.querySelectorAll(".section").forEach(sec =>
        sec.classList.add("hidden")
    );
    document.getElementById(id).classList.remove("hidden");
}

// ----------------- LOGOUT -----------------
function logout() {
    localStorage.removeItem("loggedUser");
    window.location.href = "index.html";
}

// ----------------- ATTENDANCE FILTERS -----------------
function setupFilters() {
    const buttons = document.querySelectorAll(".filter-btn");
    buttons.forEach(btn => {
        btn.addEventListener("click", () => {
            const filter = btn.innerText.toLowerCase(); // "all", "present", "absent", "this month"
            buttons.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");

            document.querySelectorAll("#attendance table tbody tr").forEach(tr => {
                const status = tr.children[2].innerText.toLowerCase();
                const date = new Date(tr.children[0].innerText);
                const now = new Date();

                if (filter === "all") {
                    tr.style.display = "";
                } else if (filter === "this month") {
                    tr.style.display = (date.getMonth() === now.getMonth() &&
                        date.getFullYear() === now.getFullYear()) ? "" : "none";
                } else {
                    tr.style.display = (status === filter) ? "" : "none";
                }
            });
        });
    });
}
