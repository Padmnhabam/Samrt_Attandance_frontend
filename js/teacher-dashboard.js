// DOM Elements
const navLinks = document.querySelectorAll('.nav-link');
const tabContents = document.querySelectorAll('.tab-content');
const pageTitle = document.getElementById('pageTitle');

// Initialize the dashboard
document.addEventListener('DOMContentLoaded', function () {
    // Check authentication
    const role = localStorage.getItem("role");
    const userData = JSON.parse(localStorage.getItem("loggedUser"));


    // Security check
    if (!userData || role !== "teacher") {
        window.location.href = "index.html";
        return;
    }

    console.log("Teacher Logged In:", userData);

    const name = userData.name || userData.fullName || userData.teacherName || userData.username || "Teacher";

    // Update all name elements
    const nameElements = document.querySelectorAll('[id*="TeacherName"], [id*="teacherName"], #headerName');
    nameElements.forEach(element => {
        element.textContent = name;
    });

    const classTeacherInput = document.getElementById("classTeacher");
    if (classTeacherInput) {
        classTeacherInput.value = name;
    }
    // Update avatar
    const headerAvatar = document.getElementById('headerAvatar');
    if (headerAvatar) {
        const initials = getInitials(name);
        headerAvatar.textContent = initials;
        headerAvatar.style.backgroundColor = stringToColor(name);
    }

    // Initialize date and time
    updateDateTime();
    setInterval(updateDateTime, 1000);

    // Setup event listeners
    setupEventListeners();

    // Show initial tab (dashboard)
    showTab('dashboard');

    // Set active nav link
    setActiveNavLink('dashboard');
});

// Get initials for avatar
function getInitials(name) {
    return name.split(' ')
        .map(word => word[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
}

// Generate color from string
function stringToColor(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    let color = '#';
    for (let i = 0; i < 3; i++) {
        const value = (hash >> (i * 8)) & 0xFF;
        color += ('00' + value.toString(16)).substr(-2);
    }
    return color;
}

// Update date and time
function updateDateTime() {
    const now = new Date();

    // Format date
    const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const dateElement = document.getElementById('currentDate');
    if (dateElement) {
        dateElement.textContent = now.toLocaleDateString('en-US', dateOptions);
    }

    // Format time
    const timeElement = document.getElementById('currentTime');
    if (timeElement) {
        timeElement.textContent = now.toLocaleTimeString('en-US', {
            hour12: true,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    }
}

// Setup event listeners
function setupEventListeners() {
    // Navigation links
    navLinks.forEach(link => {
        link.addEventListener('click', function (e) {
            e.preventDefault();
            const tab = this.getAttribute('data-tab');
            showTab(tab);
            setActiveNavLink(tab);
        });
    });

    // QR Generator
    setupQRGenerator();

    // Classes tab
    setupClassesTab();

    // Students tab
    setupStudentsTab();

    // Teacher Profile
    setupTeacherProfile();

    // Reports
    setupReportsTab();

    // Settings
    setupSettingsTab();
}

// Show specific tab
function showTab(tabName) {
    // Hide all tabs
    tabContents.forEach(tab => {
        tab.classList.remove('active');
    });

    // Show selected tab
    const selectedTab = document.getElementById(`${tabName}-tab`);
    if (selectedTab) {
        selectedTab.classList.add('active');

        // Update page title
        const tabTitles = {
            'dashboard': 'Teacher Dashboard',
            'qr-generator': 'Generate QR Code',
            'classes': 'My Classes',
            'students': 'Student Management',
            'teacher-profile': 'My Profile',
            'reports': 'Attendance Reports',
            'settings': 'System Settings'
        };

        if (pageTitle) {
            pageTitle.textContent = tabTitles[tabName] || 'Dashboard';
        }

        // Load tab-specific content
        loadTabContent(tabName);
    }
}

// Set active navigation link
function setActiveNavLink(tabName) {
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('data-tab') === tabName) {
            link.classList.add('active');
        }
    });
}

// Load tab-specific content
function loadTabContent(tabName) {
    switch (tabName) {
        case 'dashboard':
            loadDashboardContent();
            break;
        case 'qr-generator':
            loadQRGeneratorContent();
            break;
        case 'classes':
            loadClassesContent();
            break;
        case 'students':
            loadStudentsContent();
            break;
        case 'teacher-profile':
            loadTeacherProfileContent();
            break;
        case 'reports':
            loadReportsContent();
            break;
        case 'settings':
            loadSettingsContent();
            break;
    }
}

// Setup QR Generator functionality
function setupQRGenerator() {
    const generateQRBtn = document.getElementById('generateQRBtn');
    const qrDisplay = document.getElementById('qrDisplay');

    if (generateQRBtn) {
        generateQRBtn.addEventListener('click', function () {
            const classSelect = document.getElementById('classSelect');
            const divisionSelect = document.getElementById('divisionSelect');
            const durationSelect = document.getElementById('durationSelect');

            const selectedClass = classSelect.value;
            const selectedDivision = divisionSelect.value;
            const duration = parseInt(durationSelect.value);

            if (!selectedClass || !selectedDivision) {
                alert('Please select both class and division');
                return;
            }

            // Show QR display
            if (qrDisplay) {
                qrDisplay.style.display = 'flex';

                // Update QR info
                const classText = classSelect.options[classSelect.selectedIndex].text;
                document.getElementById('qrClassInfo').textContent = `${classText} - Division ${selectedDivision}`;

                // Update teacher name
                const teacherName = document.getElementById('headerName').textContent;
                document.getElementById('qrTeacherName').textContent = teacherName;

                // Update timestamp
                const now = new Date();
                document.getElementById('qrTimestamp').textContent =
                    `Today, ${now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;

                // Update timer text
                document.getElementById('qrTimerText').textContent = `${duration} minutes`;

                // Generate QR code
                generateQRCode(selectedClass, selectedDivision, duration);
            }
        });
    }
}

// Generate QR code
function generateQRCode(className, division, duration) {
    const qrImage = document.getElementById('qrImage');
    const qrTimer = document.getElementById('qrTimer');

    // Generate unique data for QR
    const teacherName = document.getElementById('headerName').textContent;
    const timestamp = Date.now();
    const qrData =
  `http://192.168.1.42:5500/student-attendance.html` +
  `?class=${className}&division=${division}`;


    // Update QR image
    qrImage.src = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrData)}`;

    // Start countdown timer
    startCountdown(duration * 60, qrTimer);

    // Add share buttons if not already present
    addShareButtons();
}

// Start countdown timer
function startCountdown(seconds, timerElement) {
    let timeLeft = seconds;

    // Clear any existing timer
    if (window.qrTimerInterval) {
        clearInterval(window.qrTimerInterval);
    }

    window.qrTimerInterval = setInterval(() => {
        if (timeLeft <= 0) {
            clearInterval(window.qrTimerInterval);
            timerElement.textContent = '00:00';

            // Show expired message
            const qrDisplay = document.getElementById('qrDisplay');
            if (qrDisplay) {
                const expiredMsg = document.createElement('div');
                expiredMsg.className = 'expired-message';
                expiredMsg.innerHTML = '<i class="fas fa-exclamation-circle"></i> QR Code has expired!';
                qrDisplay.appendChild(expiredMsg);
            }

            return;
        }

        const minutes = Math.floor(timeLeft / 60);
        const secs = timeLeft % 60;
        timerElement.textContent = `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        timeLeft--;
    }, 1000);
}

// Add share buttons
function addShareButtons() {
    const qrDisplay = document.getElementById('qrDisplay');
    if (!qrDisplay) return;

    // Remove existing share buttons
    const existingShare = qrDisplay.querySelector('.share-buttons');
    if (existingShare) {
        existingShare.remove();
    }

    // Create share buttons container
    const shareButtons = document.createElement('div');
    shareButtons.className = 'share-buttons';
    shareButtons.innerHTML = `
        <h4>Share QR Code:</h4>
        <div class="share-options">
            <button class="btn btn-whatsapp" id="shareWhatsAppBtn">
                <i class="fab fa-whatsapp"></i> Share to WhatsApp
            </button>
            <button class="btn btn-secondary" id="downloadQRBtn">
                <i class="fas fa-download"></i> Download QR
            </button>
            <button class="btn btn-secondary" id="copyQRBtn">
                <i class="fas fa-copy"></i> Copy QR Link
            </button>
        </div>
    `;

    qrDisplay.appendChild(shareButtons);

    // Add event listeners to share buttons
    document.getElementById('shareWhatsAppBtn')?.addEventListener('click', shareToWhatsApp);
    document.getElementById('downloadQRBtn')?.addEventListener('click', downloadQRCode);
    document.getElementById('copyQRBtn')?.addEventListener('click', copyQRCode);
}

// Share to WhatsApp
// function shareToWhatsApp() {
//     const classInfo = document.getElementById('qrClassInfo').textContent;
//     const teacherName = document.getElementById('qrTeacherName').textContent;
//     const qrImageUrl = document.getElementById('qrImage').src;

//     const message = `📱 Attendance QR Code\n\n` +
//         `📚 ${classInfo}\n` +
//         `👨‍🏫 Teacher: ${teacherName}\n` +
//         `⏰ Valid for: ${document.getElementById('qrTimerText').textContent}\n\n` +
//         `Scan the QR code to mark your attendance!`;

//     // Encode message for WhatsApp URL
//     const encodedMessage = encodeURIComponent(message);
//     const whatsappUrl = `https://wa.me/?text=${encodedMessage}`;

//     // Open WhatsApp in new tab
//     window.open(whatsappUrl, '_blank');
// }

function shareToWhatsApp() {
    const classInfo = document.getElementById('qrClassInfo').textContent;
    const teacherName = document.getElementById('qrTeacherName').textContent;
    const qrImageUrl = document.getElementById('qrImage').src;

    const message =
        `📱 Attendance QR Code\n\n` +
        `📚 ${classInfo}\n` +
        `👨‍🏫 Teacher: ${teacherName}\n\n` +
        `📸 Scan QR using this link:\n${qrImageUrl}\n\n` +
        `⏰ ${document.getElementById('qrTimerText').textContent}`;

    const whatsappUrl =
        `https://wa.me/?text=${encodeURIComponent(message)}`;

    window.open(whatsappUrl, '_blank');
}


// Download QR code
function downloadQRCode() {
    const qrImage = document.getElementById('qrImage');
    const classInfo = document.getElementById('qrClassInfo').textContent
        .replace(/[^a-zA-Z0-9]/g, '_');

    // Create temporary link
    const link = document.createElement('a');
    link.href = qrImage.src;
    link.download = `QR_Attendance_${classInfo}_${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    alert('QR Code downloaded successfully!');
}

// Copy QR code URL
function copyQRCode() {
    const qrImage = document.getElementById('qrImage');

    // Create temporary input element
    const tempInput = document.createElement('input');
    tempInput.value = qrImage.src;
    document.body.appendChild(tempInput);
    tempInput.select();
    document.execCommand('copy');
    document.body.removeChild(tempInput);

    alert('QR Code URL copied to clipboard!');
}

// Setup Classes Tab
function setupClassesTab() {
    // Tab switching within classes tab
    const classTabs = document.querySelectorAll('#classes-tab .tab');
    classTabs.forEach(tab => {
        tab.addEventListener('click', function () {
            const subtab = this.getAttribute('data-subtab');
            showSubTab('classes-tab', subtab);

            // Update active class tab
            classTabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
        });
    });



    function addNewClass() {
        const teacherName = document.getElementById('headerName').textContent;

        const data = {
            className: document.getElementById('className').value,
            department: document.getElementById('department').value,
            schedule: document.getElementById('classSchedule').value,
            room: document.getElementById('classRoom').value,
            divisions: [...document.querySelectorAll('input[name="divisions"]:checked')]
                .map(cb => cb.value).join(","),
            teacherName: teacherName,
            description: document.getElementById('classDescription').value
        };

        fetch("http://localhost:8080/api/classes/add", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        })
            .then(res => res.json())
            .then(() => {
                alert("Class saved successfully!");
                document.getElementById('addClassForm').reset();
                loadClassesContent();
            })
            .catch(err => console.error("Error saving class:", err));
    }

    function loadClassesFromBackend() {
        const teacherName = document.getElementById('headerName').textContent;

        fetch(`http://localhost:8080/api/classes/teacher/${teacherName}`)
            .then(res => res.json())
            .then(classes => {
                const container = document.getElementById('classesContainer');

                container.innerHTML = classes.map(cls => `
                <div class="class-card">
                    <div class="class-title">${cls.className} - ${cls.department}</div>
                    <p><strong>Schedule:</strong> ${cls.schedule}</p>
                    <p><strong>Room:</strong> ${cls.room}</p>
                    <p><strong>Divisions:</strong> ${cls.divisions}</p>
                </div>
            `).join('');
            });
    }


    // Add class form submission
    const addClassForm = document.getElementById('addClassForm');
    if (addClassForm) {
        addClassForm.addEventListener('submit', function (e) {
            e.preventDefault();
            addNewClass();
        });
    }
}

// Show subtab
function showSubTab(parentTabId, subtabName) {
    const parentTab = document.getElementById(parentTabId);
    const subtabs = parentTab.querySelectorAll('.tab-content');

    subtabs.forEach(tab => {
        tab.classList.remove('active');
    });

    const selectedSubtab = document.getElementById(`${subtabName}-subtab`);
    if (selectedSubtab) {
        selectedSubtab.classList.add('active');
    }
}

// Add new class
function addNewClass() {
    const className = document.getElementById('className').value;
    const department = document.getElementById('department').value;
    const schedule = document.getElementById('classSchedule').value;
    const room = document.getElementById('classRoom').value;
    const divisions = Array.from(document.querySelectorAll('input[name="divisions"]:checked'))
        .map(cb => cb.value);

    if (!className || !department || !schedule || !room || divisions.length === 0) {
        alert('Please fill all required fields');
        return;
    }

    // Create class object
    const teacherName = document.getElementById('headerName').textContent;
    const newClass = {
        id: Date.now(),
        name: className,
        department: department,
        schedule: schedule,
        room: room,
        divisions: divisions,
        teacher: teacherName,
        students: 0,
        attendance: '0%',
        description: document.getElementById('classDescription').value
    };

    // Save to localStorage (for demo)
    let classes = JSON.parse(localStorage.getItem('teacherClasses') || '[]');
    classes.push(newClass);
    localStorage.setItem('teacherClasses', JSON.stringify(classes));

    // Reset form
    document.getElementById('addClassForm').reset();

    // Show success message
    alert('Class added successfully!');

    // Switch back to class list
    showSubTab('classes-tab', 'class-list');

    // Update class list
    loadClassesContent();
}

// Setup Students Tab
function setupStudentsTab() {
    // Tab switching within students tab
    const studentTabs = document.querySelectorAll('#students-tab .tab');
    studentTabs.forEach(tab => {
        tab.addEventListener('click', function () {
            const subtab = this.getAttribute('data-subtab');
            showSubTab('students-tab', subtab);

            // Update active student tab
            studentTabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
        });
    });

    // Add student button
    const addStudentBtn = document.getElementById('addStudentBtn');
    if (addStudentBtn) {
        addStudentBtn.addEventListener('click', function (e) {
            e.preventDefault();
            showSubTab('students-tab', 'add-student');
        });
    }

    // Add student form
    const addStudentForm = document.getElementById('addStudentForm');
    if (addStudentForm) {
        addStudentForm.addEventListener('submit', function (e) {
            e.preventDefault();
            addNewStudent();
        });
    }

    // Manual attendance form
    const manualAttendanceForm = document.getElementById('manualAttendanceForm');
    if (manualAttendanceForm) {
        manualAttendanceForm.addEventListener('submit', function (e) {
            e.preventDefault();
            saveManualAttendance();
        });
    }
}

// Setup Teacher Profile
function setupTeacherProfile() {
    const editProfileBtn = document.getElementById('editTeacherProfileBtn');
    if (editProfileBtn) {
        editProfileBtn.addEventListener('click', function () {
            openEditProfileModal();
        });
    }
}

function loadTeacherProfileContent() {
    const userData = JSON.parse(localStorage.getItem("loggedUser"));

    if (!userData?.email) {
        console.error("No user email found in localStorage");
        return;
    }

    fetch(`http://localhost:8080/api/teachers/${encodeURIComponent(userData.email)}`)
        .then(res => res.json())
        .then(t => {

            // ===== HEADER SAFE UPDATE =====
            const headerName = document.getElementById("headerName");
            const headerRole = document.getElementById("headerRole");
            const headerAvatar = document.getElementById("headerAvatar");

            if (headerName) headerName.textContent = t.name || "Teacher";
            if (headerRole) headerRole.textContent = "Teacher";
            if (headerAvatar) {
                headerAvatar.textContent = getInitials(t.name || "T");
                headerAvatar.style.backgroundColor = stringToColor(t.name || "Teacher");
            }

            // ===== PROFILE CARD SAFE UPDATE =====
            const nameEl = document.getElementById("teacherName");
            const emailEl = document.getElementById("teacherEmail");
            const phoneEl = document.getElementById("teacherPhone");
            const deptEl = document.getElementById("teacherDepartment");

            if (nameEl) nameEl.textContent = t.name || "-";
            if (emailEl) emailEl.textContent = t.email || "-";
            if (phoneEl) phoneEl.textContent = t.mobilenumber || "-";
            if (deptEl) deptEl.textContent = t.department || "-";

            // ===== PROFILE AVATAR =====
            const profileAvatar = document.getElementById("teacherAvatar");
            if (profileAvatar) {
                profileAvatar.textContent = getInitials(t.name || "T");
                profileAvatar.style.backgroundColor = stringToColor(t.name || "Teacher");
            }

            // ===== ACCOUNT SETTINGS =====
            const accName = document.getElementById("accountTeacherName");
            const accEmail = document.getElementById("accountTeacherEmail");
            const accPhone = document.getElementById("accountTeacherPhone");
            const accDept = document.getElementById("accountDepartment");

            if (accName) accName.value = t.name || "";
            if (accEmail) accEmail.value = t.email || "";
            if (accPhone) accPhone.value = t.mobilenumber || "";
            if (accDept) accDept.value = t.department || "";

            // ===== EDIT MODAL =====
            const editName = document.getElementById("editTeacherName");
            const editEmail = document.getElementById("editTeacherEmail");
            const editPhone = document.getElementById("editTeacherPhone");
            const editDept = document.getElementById("editTeacherDepartment");

            if (editName) editName.value = t.name || "";
            if (editEmail) editEmail.value = t.email || "";
            if (editPhone) editPhone.value = t.mobilenumber || "";
            if (editDept) editDept.value = t.department || "";
        })
        .catch(err => console.error("Profile load error:", err));
}



// Setup Reports Tab
function setupReportsTab() {
    const generateReportBtn = document.getElementById('generateReportBtn');
    if (generateReportBtn) {
        generateReportBtn.addEventListener('click', function () {
            generateReport();
        });
    }
}

// Setup Settings Tab
function setupSettingsTab() {
    // Settings menu items
    const settingsItems = document.querySelectorAll('.settings-item');
    settingsItems.forEach(item => {
        item.addEventListener('click', function () {
            const settingsType = this.getAttribute('data-settings');
            showSettingsSection(settingsType);

            // Update active item
            settingsItems.forEach(i => i.classList.remove('active'));
            this.classList.add('active');
        });
    });
}

// Show settings section
function showSettingsSection(settingsType) {
    const sections = document.querySelectorAll('.settings-section');
    sections.forEach(section => {
        section.classList.remove('active');
    });

    const selectedSection = document.getElementById(`${settingsType}-settings`);
    if (selectedSection) {
        selectedSection.classList.add('active');
    }
}


function loadDashboardContent() {
    const teacherName = document.getElementById('headerName').textContent;

    fetch(`http://localhost:8080/api/classes/teacher/${teacherName}`)
        .then(res => res.json())
        .then(classes => {
            const container = document.querySelector('#dashboard-tab .classes-container');
            if (!container) return;

            container.innerHTML = classes.map(cls => `
                <div class="class-card">
                    <div class="class-title">${cls.className} - ${cls.subject}</div>
                    <p>${cls.schedule} | ${cls.room}</p>
                </div>
            `).join('');
        });
}


// Load QR Generator content
function loadQRGeneratorContent() {
    const classSelect = document.getElementById('classSelect');
    const teacherName = document.getElementById('headerName').textContent.trim();

    if (!teacherName) {
        console.error("Teacher name not found in header");
        return;
    }

    fetch(`http://localhost:8080/api/classes/teacher/${teacherName}`)
        .then(res => {
            if (!res.ok) throw new Error("Failed to fetch classes");
            return res.json();
        })
        .then(classes => {
            console.log("Classes from DB:", classes);
            classSelect.innerHTML = `<option value="">Select Class</option>`;

            classes.forEach(cls => {
                const option = document.createElement("option");
                option.value = cls.id;
                option.textContent = `${cls.className} - ${cls.subject}`;
                classSelect.appendChild(option);
            });
        })
        .catch(err => console.error("Error loading classes:", err));
}


function loadClassesContent() {
    const teacherName = document.getElementById('headerName').textContent;

    fetch(`http://localhost:8080/api/classes/teacher/${teacherName}`)
        .then(res => res.json())
        .then(classes => {
            const container = document.getElementById('classesContainer');
            if (!container) return;

            if (classes.length === 0) {
                container.innerHTML = `
                    <div class="empty-state">
                        <h3>No Classes Yet</h3>
                        <p>Create your first class.</p>
                    </div>`;
                return;
            }

            container.innerHTML = classes.map(cls => `
                <div class="class-card">
                    <div class="class-title">${cls.className} - ${cls.subject}</div>
                    <p><strong>Schedule:</strong> ${cls.schedule}</p>
                    <p><strong>Room:</strong> ${cls.room}</p>
                    <p><strong>Divisions:</strong> ${cls.divisions}</p>
                </div>
            `).join('');
        })
        .catch(err => console.error("Error loading classes:", err));
}

// Load Students content
function loadStudentsContent() {
    // Sample student data
    const students = [
        { id: 'S001', name: 'Arun Kumar', class: 'MCA-Java', division: 'A', status: 'present' },
        { id: 'S002', name: 'Priya Sharma', class: 'MCA-Java', division: 'A', status: 'absent' },
        { id: 'S003', name: 'Rahul Singh', class: 'MCA-Web Development', division: 'B', status: 'present' },
        { id: 'S004', name: 'Anjali Patel', class: 'MBA-OB', division: 'A', status: 'late' },
        { id: 'S005', name: 'Vikram Reddy', class: 'MBA-Marketing', division: 'B', status: 'present' }
    ];

    const tbody = document.getElementById('studentTableBody');
    if (tbody) {
        tbody.innerHTML = students.map(student => `
            <tr>
                <td>${student.id}</td>
                <td>${student.name}</td>
                <td>${student.class}</td>
                <td>${student.division}</td>
                <td>
                    <span class="status-badge status-${student.status}">
                        ${student.status.charAt(0).toUpperCase() + student.status.slice(1)}
                    </span>
                </td>
                <td>
                    <button class="btn-icon" title="View Details">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn-icon" title="Edit Student">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-icon" title="Mark Attendance">
                        <i class="fas fa-calendar-check"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    }
}

// Load Reports content
function loadReportsContent() {
    // Initialize reports tab
    console.log('Reports tab loaded');
}

// Load Settings content
function loadSettingsContent() {
    // Initialize settings tab
    console.log('Settings tab loaded');
}

// Add new student
function addNewStudent() {
    const name = document.getElementById('newStudentName').value;
    const studentId = document.getElementById('newStudentId').value;
    const studentClass = document.getElementById('newStudentClass').value;
    const division = document.getElementById('newStudentDivision').value;

    if (!name || !studentId || !studentClass || !division) {
        alert('Please fill all required fields');
        return;
    }

    alert(`Student ${name} added successfully!`);
    document.getElementById('addStudentForm').reset();
    showSubTab('students-tab', 'student-list');
}

// Save manual attendance
function saveManualAttendance() {
    const studentId = document.getElementById('manualStudentId').value;
    const studentClass = document.getElementById('manualClassSelect').value;
    const division = document.getElementById('manualDivisionSelect').value;
    const status = document.getElementById('attendanceStatusSelect').value;
    const remarks = document.getElementById('attendanceRemarks').value;

    if (!studentId || !studentClass || !division) {
        alert('Please fill all required fields');
        return;
    }

    alert(`Attendance marked successfully for Student ID: ${studentId}`);
    document.getElementById('manualAttendanceForm').reset();
}

// Open edit profile modal
function openEditProfileModal() {
    const modal = document.getElementById('editTeacherProfileModal');
    if (modal) {
        modal.style.display = 'flex';

        // Populate form with current data
        const userData = JSON.parse(localStorage.getItem("loggedUser"));
        document.getElementById('editTeacherName').value = userData?.name || '';
        document.getElementById('editTeacherEmail').value = userData?.email || '';
        document.getElementById('editTeacherPhone').value = userData?.mobilenumber || '';
        document.getElementById('editTeacherDepartment').value = userData?.department || '';
    }
}

// Generate QR for specific class
function generateQRForClass(className, division) {
    // Switch to QR generator tab
    showTab('qr-generator');

    // Pre-select class and division
    const classSelect = document.getElementById('classSelect');
    const divisionSelect = document.getElementById('divisionSelect');

    if (classSelect && divisionSelect) {
        // Find and select the class
        for (let i = 0; i < classSelect.options.length; i++) {
            if (classSelect.options[i].text.includes(className)) {
                classSelect.selectedIndex = i;
                break;
            }
        }

        // Select division
        divisionSelect.value = division;

        // Auto-generate QR after a short delay
        setTimeout(() => {
            document.getElementById('generateQRBtn').click();
        }, 100);
    }
}

// Generate report
function generateReport() {
    const period = document.getElementById('reportPeriod').value;
    const classFilter = document.getElementById('reportClass').value;
    const reportType = document.getElementById('reportType').value;

    alert(`Generating ${reportType} report for ${period}...`);
}

// Edit class
function editClass(classId) {
    alert(`Edit class ${classId} - This would open edit modal in a real application`);
}

// Delete class
function deleteClass(classId) {
    if (confirm('Are you sure you want to delete this class?')) {
        let classes = JSON.parse(localStorage.getItem('teacherClasses') || '[]');
        classes = classes.filter(cls => cls.id !== classId);
        localStorage.setItem('teacherClasses', JSON.stringify(classes));

        // Reload classes
        loadClassesContent();
        loadDashboardContent();

        alert('Class deleted successfully!');
    }
}

// Logout function
function logout() {
    localStorage.clear();
    window.location.href = "index.html";
}

// Export functions for onclick attributes
window.logout = logout;
window.generateReport = generateReport;
window.editClass = editClass;
window.deleteClass = deleteClass;
window.generateQRForClass = generateQRForClass;

function finalizeAttendance() {

    const subject = document.getElementById("classSelect").value;
    const className = document.getElementById("classSelect").value;

    if (!subject) {
        alert("Select class before finalizing");
        return;
    }

    fetch(`http://localhost:8080/api/attendance/finalize?subject=${subject}&className=${className}`, {
        method: "POST"
    })
    .then(res => res.text())
    .then(msg => {
        alert(msg);
    })
    .catch(err => {
        console.error(err);
        alert("Error finalizing attendance");
    });
}
