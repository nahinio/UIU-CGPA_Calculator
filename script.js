class AdvancedCGPACalculator {
    constructor() {
        this.courses = [];
        this.currentCGPA = 0;
        this.completedCredits = 0;
        this.isDarkMode = true;
        this.initializeEventListeners();
        this.loadSavedData();
        this.updateAllCalculations();
        this.initializeTheme();
    }

    initializeEventListeners() {
        // Form submission
        const form = document.getElementById('courseForm');
        form.addEventListener('submit', (e) => this.handleAddCourse(e));

        // Current CGPA and credits input
        document.getElementById('currentCGPA').addEventListener('input', (e) => {
            this.currentCGPA = parseFloat(e.target.value) || 0;
            this.updateAllCalculations();
            this.saveData();
        });

        document.getElementById('completedCredits').addEventListener('input', (e) => {
            this.completedCredits = parseFloat(e.target.value) || 0;
            this.updateAllCalculations();
            this.saveData();
        });

        // Clear all button
        document.getElementById('clearAllBtn').addEventListener('click', () => {
            this.clearAllCourses();
        });

        // Theme toggle
        document.getElementById('themeToggle').addEventListener('click', () => {
            this.toggleTheme();
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleKeyboardShortcuts(e));

        // Input validation
        this.setupInputValidation();
    }

    initializeTheme() {
        const savedTheme = localStorage.getItem('uiu-cgpa-theme');
        if (savedTheme) {
            this.isDarkMode = savedTheme === 'dark';
        }
        this.applyTheme();
    }

    toggleTheme() {
        this.isDarkMode = !this.isDarkMode;
        this.applyTheme();
        localStorage.setItem('uiu-cgpa-theme', this.isDarkMode ? 'dark' : 'light');
    }

    applyTheme() {
        const body = document.body;
        const themeToggle = document.getElementById('themeToggle');
        
        if (this.isDarkMode) {
            body.classList.add('dark-mode');
            themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
        } else {
            body.classList.remove('dark-mode');
            themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
        }
    }

    setupInputValidation() {
        const cgpaInput = document.getElementById('currentCGPA');
        const creditsInput = document.getElementById('completedCredits');
        const courseCreditsInput = document.getElementById('creditHours');

        cgpaInput.addEventListener('input', (e) => {
            const value = parseFloat(e.target.value);
            if (value < 0) e.target.value = '0';
            if (value > 4) e.target.value = '4';
        });

        creditsInput.addEventListener('input', (e) => {
            const value = parseFloat(e.target.value);
            if (value < 0) e.target.value = '0';
        });

        courseCreditsInput.addEventListener('input', (e) => {
            const value = parseFloat(e.target.value);
            if (value < 0.5) e.target.value = '0.5';
            if (value > 6) e.target.value = '6';
        });
    }

    handleKeyboardShortcuts(e) {
        // Ctrl/Cmd + Enter to add course
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            e.preventDefault();
            document.getElementById('courseForm').dispatchEvent(new Event('submit'));
        }
        
        // Escape to clear form
        if (e.key === 'Escape') {
            this.clearForm();
        }
    }

    handleAddCourse(e) {
        e.preventDefault();
        
        const courseName = document.getElementById('courseName').value.trim();
        const grade = parseFloat(document.getElementById('grade').value);
        const creditHours = parseFloat(document.getElementById('creditHours').value);

        if (isNaN(grade) || isNaN(creditHours)) {
            this.showNotification('Please select grade and enter credit hours.', 'error');
            return;
        }

        if (creditHours < 0.5 || creditHours > 6) {
            this.showNotification('Credit hours must be between 0.5 and 6.0', 'error');
            return;
        }

        const course = {
            id: Date.now(),
            name: courseName || `Course ${this.courses.length + 1}`,
            grade: grade,
            creditHours: creditHours,
            addedAt: new Date().toISOString()
        };

        this.courses.push(course);
        this.renderCourses();
        this.updateAllCalculations();
        this.clearForm();
        this.saveData();
        this.showNotification('Course added successfully!', 'success');
        
        // Focus back to course name input
        document.getElementById('courseName').focus();
    }

    removeCourse(courseId) {
        this.courses = this.courses.filter(course => course.id !== courseId);
        this.renderCourses();
        this.updateAllCalculations();
        this.saveData();
        this.showNotification('Course removed successfully!', 'success');
    }

    clearAllCourses() {
        if (this.courses.length === 0) return;
        
        if (confirm('Are you sure you want to remove all courses? This action cannot be undone.')) {
            this.courses = [];
            this.renderCourses();
            this.updateAllCalculations();
            this.saveData();
            this.showNotification('All courses cleared!', 'success');
        }
    }

    renderCourses() {
        const coursesList = document.getElementById('coursesList');
        const clearAllBtn = document.getElementById('clearAllBtn');
        
        if (this.courses.length === 0) {
            coursesList.innerHTML = `
                <div class="no-courses">
                    <i class="fas fa-book-open"></i>
                    <p>No courses added yet</p>
                    <small>Add your first course above to get started!</small>
                </div>
            `;
            clearAllBtn.style.display = 'none';
            return;
        }

        clearAllBtn.style.display = 'flex';
        
        coursesList.innerHTML = this.courses.map(course => `
            <div class="course-item">
                <div class="course-details">
                    <div class="course-name">${course.name}</div>
                    <div class="course-info">
                        <span>
                            <i class="fas fa-medal"></i>
                            <span class="grade-badge">${this.getGradeLetter(course.grade)}</span>
                            ${course.grade.toFixed(2)}
                        </span>
                        <span>
                            <i class="fas fa-clock"></i>
                            ${course.creditHours} credits
                        </span>
                        <span>
                            <i class="fas fa-calculator"></i>
                            ${(course.grade * course.creditHours).toFixed(2)} points
                        </span>
                    </div>
                </div>
                <button class="remove-btn" onclick="calculator.removeCourse(${course.id})">
                    <i class="fas fa-trash"></i>
                    Remove
                </button>
            </div>
        `).join('');
    }

    getGradeLetter(gradePoint) {
        const gradeMap = {
            4.00: 'A',
            3.67: 'A-',
            3.33: 'B+',
            3.00: 'B',
            2.67: 'B-',
            2.33: 'C+',
            2.00: 'C',
            1.67: 'C-',
            1.33: 'D+',
            1.00: 'D',
            0.00: 'F'
        };
        return gradeMap[gradePoint] || 'N/A';
    }

    getGradeStatus(cgpa) {
        if (cgpa >= 3.75) return 'Excellent';
        if (cgpa >= 3.25) return 'Very Good';
        if (cgpa >= 2.75) return 'Good';
        if (cgpa >= 2.25) return 'Average';
        if (cgpa >= 2.00) return 'Below Average';
        if (cgpa >= 1.00) return 'Poor';
        return 'Failing';
    }

    updateAllCalculations() {
        // Calculate semester values
        const semesterCredits = this.courses.reduce((sum, course) => sum + course.creditHours, 0);
        const semesterGradePoints = this.courses.reduce((sum, course) => sum + (course.grade * course.creditHours), 0);
        const semesterGPA = semesterCredits > 0 ? semesterGradePoints / semesterCredits : 0;

        // Calculate overall values
        const totalCredits = this.completedCredits + semesterCredits;
        let overallCGPA;
        
        if (this.currentCGPA > 0 && this.completedCredits > 0) {
            const totalGradePoints = (this.currentCGPA * this.completedCredits) + semesterGradePoints;
            overallCGPA = totalCredits > 0 ? totalGradePoints / totalCredits : 0;
        } else {
            overallCGPA = semesterGPA;
        }

        // Update UI
        this.updateResultsDisplay(semesterCredits, semesterGPA, totalCredits, overallCGPA);
        this.updateProgressBar(overallCGPA);
    }

    updateResultsDisplay(semesterCredits, semesterGPA, totalCredits, overallCGPA) {
        document.getElementById('semesterCredits').textContent = semesterCredits.toFixed(1);
        document.getElementById('semesterGPA').textContent = semesterGPA.toFixed(2);
        document.getElementById('totalCredits').textContent = totalCredits.toFixed(1);
        document.getElementById('cgpa').textContent = overallCGPA.toFixed(2);
        
        const cgpaStatus = document.getElementById('cgpaStatus');
        cgpaStatus.textContent = this.getGradeStatus(overallCGPA);
        
        // Add animation to CGPA card
        const cgpaElement = document.getElementById('cgpa');
        cgpaElement.style.animation = 'pulse 0.5s ease-in-out';
        setTimeout(() => {
            cgpaElement.style.animation = '';
        }, 500);
    }

    updateProgressBar(cgpa) {
        const progressFill = document.getElementById('progressFill');
        const progressPercentage = document.getElementById('progressPercentage');
        
        const percentage = (cgpa / 4.0) * 100;
        progressFill.style.width = `${percentage}%`;
        progressPercentage.textContent = `${percentage.toFixed(1)}%`;
        
        // Change color based on CGPA
        if (cgpa >= 3.5) {
            progressFill.style.background = 'linear-gradient(90deg, #10b981 0%, #059669 100%)';
        } else if (cgpa >= 3.0) {
            progressFill.style.background = 'linear-gradient(90deg, #F48807 0%, #FF6B35 100%)';
        } else if (cgpa >= 2.5) {
            progressFill.style.background = 'linear-gradient(90deg, #f59e0b 0%, #d97706 100%)';
        } else {
            progressFill.style.background = 'linear-gradient(90deg, #ef4444 0%, #dc2626 100%)';
        }
    }

    clearForm() {
        document.getElementById('courseName').value = '';
        document.getElementById('grade').value = '';
        document.getElementById('creditHours').value = '';
        document.getElementById('courseName').focus();
    }

    showNotification(message, type) {
        // Remove any existing notifications
        const existingNotification = document.querySelector('.notification');
        if (existingNotification) {
            existingNotification.remove();
        }

        // Create and show new notification
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        
        const icon = type === 'success' ? 'fas fa-check-circle' : 'fas fa-exclamation-circle';
        notification.innerHTML = `
            <i class="${icon}"></i>
            <span>${message}</span>
        `;
        
        // Style the notification
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 16px 20px;
            border-radius: 12px;
            color: white;
            font-weight: 600;
            z-index: 1000;
            transform: translateX(100%);
            transition: transform 0.3s ease;
            display: flex;
            align-items: center;
            gap: 10px;
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.2);
            backdrop-filter: blur(10px);
            ${type === 'success' ? 'background: linear-gradient(135deg, #10b981 0%, #059669 100%);' : 'background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);'}
        `;

        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);

        // Remove after 4 seconds
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 4000);
    }

    saveData() {
        const data = {
            courses: this.courses,
            currentCGPA: this.currentCGPA,
            completedCredits: this.completedCredits,
            lastUpdated: new Date().toISOString()
        };
        localStorage.setItem('uiu-cgpa-calculator', JSON.stringify(data));
    }

    loadSavedData() {
        try {
            const savedData = localStorage.getItem('uiu-cgpa-calculator');
            if (savedData) {
                const data = JSON.parse(savedData);
                this.courses = data.courses || [];
                this.currentCGPA = data.currentCGPA || 0;
                this.completedCredits = data.completedCredits || 0;
                
                // Update input fields
                document.getElementById('currentCGPA').value = this.currentCGPA || '';
                document.getElementById('completedCredits').value = this.completedCredits || '';
                
                this.renderCourses();
            }
        } catch (error) {
            console.error('Error loading saved data:', error);
        }
    }

    exportData() {
        const data = {
            courses: this.courses,
            currentCGPA: this.currentCGPA,
            completedCredits: this.completedCredits,
            exportDate: new Date().toISOString(),
            totalCourses: this.courses.length,
            overallCGPA: this.calculateOverallCGPA()
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `uiu-cgpa-data-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.showNotification('Data exported successfully!', 'success');
    }

    calculateOverallCGPA() {
        const semesterCredits = this.courses.reduce((sum, course) => sum + course.creditHours, 0);
        const semesterGradePoints = this.courses.reduce((sum, course) => sum + (course.grade * course.creditHours), 0);
        const totalCredits = this.completedCredits + semesterCredits;
        const totalGradePoints = (this.currentCGPA * this.completedCredits) + semesterGradePoints;
        return totalCredits > 0 ? totalGradePoints / totalCredits : 0;
    }
}

// Initialize calculator
const calculator = new AdvancedCGPACalculator();

// Add welcome message on first load
document.addEventListener('DOMContentLoaded', () => {
    const isFirstVisit = !localStorage.getItem('uiu-cgpa-calculator');
    if (isFirstVisit) {
        setTimeout(() => {
            calculator.showNotification('Welcome to UIU CGPA Calculator! Start by adding your courses.', 'success');
        }, 1000);
    }
    
    // Auto-focus on course name input
    document.getElementById('courseName').focus();
});

// Add export functionality (can be triggered via console or future button)
window.exportCGPAData = () => calculator.exportData();