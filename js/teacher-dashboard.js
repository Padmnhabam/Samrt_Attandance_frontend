// DOM Elements
const navLinks = document.querySelectorAll('.nav-link');
const tabContents = document.querySelectorAll('.tab-content');
const pageTitle = document.getElementById('pageTitle');

// Initialize the dashboard
document.addEventListener('DOMContentLoaded', function() {
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
        link.addEventListener('click', function(e) {
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
    switch(tabName) {
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
        generateQRBtn.addEventListener('click', function() {
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
    const qrData = `ATTENDANCE:${className}:${division}:${teacherName}:${timestamp}:${duration}`;
    
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
function shareToWhatsApp() {
    const classInfo = document.getElementById('qrClassInfo').textContent;
    const teacherName = document.getElementById('qrTeacherName').textContent;
    const qrImage = document.getElementById('qrImage').src;
    
    const message = `📱 Attendance QR Code\n\n` +
                   `📚 ${classInfo}\n` +
                   `👨‍🏫 Teacher: ${teacherName}\n` +
                   `⏰ Valid for: ${document.getElementById('qrTimerText').textContent}\n\n` +
                   `Scan the QR code to mark your attendance!`;
    
    // Encode message for WhatsApp URL
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/?text=${encodedMessage}`;
    
    // Open WhatsApp in new tab
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
        tab.addEventListener('click', function() {
            const subtab = this.getAttribute('data-subtab');
            showSubTab('classes-tab', subtab);
            
            // Update active class tab
            classTabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
        });
    });
    
    // Add new class button
    // const addNewClassBtn = document.getElementById('addNewClassBtn');
    // if (addNewClassBtn) {
    //     addNewClassBtn.addEventListener('click', function() {
    //         showSubTab('classes-tab', 'add-class');
    //     });
    // }
    function addNewClass() {
    const className = document.getElementById('className').value;
    const subjectName = document.getElementById('subjectName').value;
    const schedule = document.getElementById('classSchedule').value;
    const room = document.getElementById('classRoom').value;
    const divisions = Array.from(document.querySelectorAll('input[name="divisions"]:checked'))
        .map(cb => cb.value).join(",");

    const teacherName = document.getElementById('headerName').textContent;
    const description = document.getElementById('classDescription').value;

    fetch("http://localhost:8080/api/classes/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            className,
            subject: subjectName,
            schedule,
            room,
            divisions,
            teacherName,
            description
        })
    })
    .then(res => res.json())
    .then(data => {
        alert("Class saved to database!");
        document.getElementById('addClassForm').reset();
        loadClassesFromBackend();
    })
    .catch(err => console.error(err));
}

function loadClassesFromBackend() {
    const teacherName = document.getElementById('headerName').textContent;

    fetch(`http://localhost:8080/api/classes/teacher/${teacherName}`)
        .then(res => res.json())
        .then(classes => {
            const container = document.getElementById('classesContainer');

            container.innerHTML = classes.map(cls => `
                <div class="class-card">
                    <div class="class-title">${cls.className} - ${cls.subject}</div>
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
        addClassForm.addEventListener('submit', function(e) {
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
    const subjectName = document.getElementById('subjectName').value;
    const schedule = document.getElementById('classSchedule').value;
    const room = document.getElementById('classRoom').value;
    const divisions = Array.from(document.querySelectorAll('input[name="divisions"]:checked'))
        .map(cb => cb.value);
    
    if (!className || !subjectName || !schedule || !room || divisions.length === 0) {
        alert('Please fill all required fields');
        return;
    }
    
    // Create class object
    const teacherName = document.getElementById('headerName').textContent;
    const newClass = {
        id: Date.now(),
        name: className,
        subject: subjectName,
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
        tab.addEventListener('click', function() {
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
        addStudentBtn.addEventListener('click', function(e) {
            e.preventDefault();
            showSubTab('students-tab', 'add-student');
        });
    }
    
    // Add student form
    const addStudentForm = document.getElementById('addStudentForm');
    if (addStudentForm) {
        addStudentForm.addEventListener('submit', function(e) {
            e.preventDefault();
            addNewStudent();
        });
    }
    
    // Manual attendance form
    const manualAttendanceForm = document.getElementById('manualAttendanceForm');
    if (manualAttendanceForm) {
        manualAttendanceForm.addEventListener('submit', function(e) {
            e.preventDefault();
            saveManualAttendance();
        });
    }
}

// Setup Teacher Profile
function setupTeacherProfile() {
    const editProfileBtn = document.getElementById('editTeacherProfileBtn');
    if (editProfileBtn) {
        editProfileBtn.addEventListener('click', function() {
            openEditProfileModal();
        });
    }
}

// Setup Reports Tab
function setupReportsTab() {
    const generateReportBtn = document.getElementById('generateReportBtn');
    if (generateReportBtn) {
        generateReportBtn.addEventListener('click', function() {
            generateReport();
        });
    }
}

// Setup Settings Tab
function setupSettingsTab() {
    // Settings menu items
    const settingsItems = document.querySelectorAll('.settings-item');
    settingsItems.forEach(item => {
        item.addEventListener('click', function() {
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

// Load dashboard content
function loadDashboardContent() {
    // Load classes for dashboard
    const classes = JSON.parse(localStorage.getItem('teacherClasses') || '[]');
    const classesContainer = document.querySelector('#dashboard-tab .classes-container');
    
    if (classesContainer) {
        if (classes.length === 0) {
            classesContainer.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-chalkboard-teacher"></i>
                    <h3>No Classes Yet</h3>
                    <p>You haven't created any classes yet. Add your first class to get started!</p>
                </div>
            `;
        } else {
            classesContainer.innerHTML = classes.map(cls => `
                <div class="class-card">
                    <div class="class-header">
                        <div class="class-title">${cls.name} - ${cls.subject}</div>
                    </div>
                    <div class="class-info">
                        <p><strong>Schedule:</strong> ${cls.schedule}</p>
                        <p><strong>Room:</strong> ${cls.room}</p>
                        <p><strong>Divisions:</strong> ${cls.divisions.join(', ')}</p>
                    </div>
                    <div class="class-stats">
                        <div class="stat-item">
                            <div class="stat-value">${cls.students}</div>
                            <div class="stat-label">Students</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-value">${cls.attendance}</div>
                            <div class="stat-label">Attendance</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-value">0</div>
                            <div class="stat-label">QR Today</div>
                        </div>
                    </div>
                </div>
            `).join('');
        }
    }
}

// Load QR Generator content
function loadQRGeneratorContent() {
    // Populate class dropdown with teacher's classes
    const classes = JSON.parse(localStorage.getItem('teacherClasses') || '[]');
    const classSelect = document.getElementById('classSelect');
    
    if (classSelect && classes.length > 0) {
        // Clear existing options except the first one
        while (classSelect.options.length > 1) {
            classSelect.remove(1);
        }
        
        // Add teacher's classes
        classes.forEach(cls => {
            const option = document.createElement('option');
            option.value = cls.id;
            option.textContent = `${cls.name} - ${cls.subject}`;
            classSelect.appendChild(option);
        });
    }
}

// Load Classes content
function loadClassesContent() {
    const classes = JSON.parse(localStorage.getItem('teacherClasses') || '[]');
    const classesContainer = document.getElementById('classesContainer');
    
    if (classesContainer) {
        if (classes.length === 0) {
            classesContainer.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-chalkboard-teacher"></i>
                    <h3>No Classes Found</h3>
                    <p>You haven't created any classes yet.</p>
                    <button class="btn btn-primary" id="addFirstClassBtn">
                        <i class="fas fa-plus"></i> Add Your First Class
                    </button>
                </div>
            `;
            
            // Add event listener to the button
            document.getElementById('addFirstClassBtn')?.addEventListener('click', function() {
                showSubTab('classes-tab', 'add-class');
            });
        } else {
            classesContainer.innerHTML = classes.map(cls => `
                <div class="class-card">
                    <div class="class-header">
                        <div class="class-title">${cls.name} - ${cls.subject}</div>
                        <div class="class-actions">
                            <button class="btn-icon" onclick="editClass(${cls.id})">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn-icon" onclick="deleteClass(${cls.id})">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                    <div class="class-info">
                        <p><strong>Schedule:</strong> ${cls.schedule}</p>
                        <p><strong>Room:</strong> ${cls.room}</p>
                        <p><strong>Divisions:</strong> ${cls.divisions.join(', ')}</p>
                        ${cls.description ? `<p><strong>Description:</strong> ${cls.description}</p>` : ''}
                    </div>
                    <div class="class-stats">
                        <div class="stat-item">
                            <div class="stat-value">${cls.students}</div>
                            <div class="stat-label">Students</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-value">${cls.attendance}</div>
                            <div class="stat-label">Attendance</div>
                        </div>
                        <div class="stat-item">
                            <button class="btn btn-sm" onclick="generateQRForClass('${cls.name}', '${cls.divisions[0]}')">
                                <i class="fas fa-qrcode"></i> Generate QR
                            </button>
                        </div>
                    </div>
                </div>
            `).join('');
        }
    }
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

// Load Teacher Profile content
function loadTeacherProfileContent() {
    const userData = JSON.parse(localStorage.getItem("loggedUser"));
    const name = userData?.name || userData?.fullName || userData?.teacherName || "Teacher";
    
    // Update profile information
    document.getElementById('teacherName').textContent = name;
    document.getElementById('teacherEmail').textContent = userData?.email || 'teacher@example.com';
    document.getElementById('teacherPhone').textContent = userData?.phone || 'Not provided';
    document.getElementById('teacherDepartment').textContent = userData?.department || 'Computer Science';
    
    // Update avatar
    const teacherAvatar = document.getElementById('teacherAvatar');
    if (teacherAvatar) {
        const initials = getInitials(name);
        teacherAvatar.textContent = initials;
        teacherAvatar.style.backgroundColor = stringToColor(name);
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
        document.getElementById('editTeacherPhone').value = userData?.phone || '';
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