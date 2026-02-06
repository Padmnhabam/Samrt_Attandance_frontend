const params = new URLSearchParams(window.location.search);
const className = params.get("class");

document.getElementById("attendanceForm").addEventListener("submit", e => {
  e.preventDefault();

  const rollNo = document.getElementById("rollNo").value;

  fetch("http://192.168.1.42:8080/api/attendance/mark", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `rollNo=${rollNo}&subject=${className}`
  })
    .then(res => res.json())
    .then(data => {
      document.getElementById("msg").textContent = data.message;
    })
    .catch(() => {
      document.getElementById("msg").textContent = "Error marking attendance";
    });
});
