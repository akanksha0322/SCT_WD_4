// DOM Elements
const taskInput = document.getElementById('task-input');
const addTaskBtn = document.getElementById('add-task-btn');
const tasksList = document.getElementById('tasks-list');
const categoriesList = document.getElementById('categories-list');
const newCategoryInput = document.getElementById('new-category');
const addCategoryBtn = document.getElementById('add-category-btn');
const priorityFilter = document.getElementById('priority-filter');
const statusFilter = document.getElementById('status-filter');
const dateFilter = document.getElementById('date-filter');
const listViewBtn = document.getElementById('list-view-btn');
const boardViewBtn = document.getElementById('board-view-btn');
const calendarViewBtn = document.getElementById('calendar-view-btn');
const listView = document.getElementById('list-view');
const boardView = document.getElementById('board-view');
const calendarView = document.getElementById('calendar-view');
const pendingTasks = document.getElementById('pending-tasks');
const inProgressTasks = document.getElementById('in-progress-tasks');
const completedTasks = document.getElementById('completed-tasks');
const taskModal = document.getElementById('task-modal');
const taskForm = document.getElementById('task-form');
const modalTitle = document.getElementById('modal-title');
const taskNameInput = document.getElementById('task-name');
const taskDescriptionInput = document.getElementById('task-description');
const taskCategorySelect = document.getElementById('task-category');
const taskPrioritySelect = document.getElementById('task-priority');
const taskDueDateInput = document.getElementById('task-due-date');
const taskDueTimeInput = document.getElementById('task-due-time');
const taskStatusSelect = document.getElementById('task-status');
const taskCollaboratorsInput = document.getElementById('task-collaborators');
const taskNotesInput = document.getElementById('task-notes');
const deleteTaskBtn = document.getElementById('delete-task');
const feedbackBtn = document.getElementById('feedback-btn');
const feedbackModal = document.getElementById('feedback-modal');
const feedbackForm = document.getElementById('feedback-form');
const shareModal = document.getElementById('share-modal');
const shareEmailsInput = document.getElementById('share-emails');
const shareMessageInput = document.getElementById('share-message');
const shareTaskBtn = document.getElementById('share-task-btn');
const themeToggleBtn = document.getElementById('theme-toggle');
const miniCalendar = document.getElementById('mini-calendar');
const calendarContainer = document.getElementById('calendar-container');
const openCalendarViewBtn = document.getElementById('open-calendar-view');

// Global Variables
let tasks = [];
let categories = ['work', 'personal', 'urgent'];
let currentTaskId = null;
let currentFilter = {
    category: 'all',
    priority: 'all',
    status: 'all',
    date: 'all'
};

// Initialize the application
function initApp() {
    loadTasksFromStorage();
    loadCategoriesFromStorage();
    loadThemePreference();
    renderTasks();
    renderCategories();
    renderMiniCalendar();
    renderCalendar();
    setupEventListeners();
}

// Load tasks from local storage
function loadTasksFromStorage() {
    const storedTasks = localStorage.getItem('tasks');
    if (storedTasks) {
        tasks = JSON.parse(storedTasks);
    }
}

// Load categories from local storage
function loadCategoriesFromStorage() {
    const storedCategories = localStorage.getItem('categories');
    if (storedCategories) {
        categories = JSON.parse(storedCategories);
    }
}

// Save tasks to local storage
function saveTasksToStorage() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

// Save categories to local storage
function saveCategoriestoStorage() {
    localStorage.setItem('categories', JSON.stringify(categories));
}

// Load theme preference
function loadThemePreference() {
    const darkMode = localStorage.getItem('darkMode') === 'true';
    if (darkMode) {
        document.body.classList.add('dark-theme');
        themeToggleBtn.innerHTML = '<i class="fas fa-sun"></i>';
    }
}

// Toggle theme
function toggleTheme() {
    const isDarkMode = document.body.classList.toggle('dark-theme');
    localStorage.setItem('darkMode', isDarkMode);
    themeToggleBtn.innerHTML = isDarkMode ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
}

// Setup event listeners
function setupEventListeners() {
    // Add task
    addTaskBtn.addEventListener('click', () => {
        const taskName = taskInput.value.trim();
        if (taskName) {
            addTask(taskName);
            taskInput.value = '';
        }
    });

    taskInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const taskName = taskInput.value.trim();
            if (taskName) {
                addTask(taskName);
                taskInput.value = '';
            }
        }
    });

    // Add category
    addCategoryBtn.addEventListener('click', () => {
        const categoryName = newCategoryInput.value.trim().toLowerCase();
        if (categoryName && !categories.includes(categoryName)) {
            categories.push(categoryName);
            saveCategoriestoStorage();
            renderCategories();
            newCategoryInput.value = '';
        }
    });

    newCategoryInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const categoryName = newCategoryInput.value.trim().toLowerCase();
            if (categoryName && !categories.includes(categoryName)) {
                categories.push(categoryName);
                saveCategoriestoStorage();
                renderCategories();
                newCategoryInput.value = '';
            }
        }
    });

    // Filter changes
    priorityFilter.addEventListener('change', updateFilters);
    statusFilter.addEventListener('change', updateFilters);
    dateFilter.addEventListener('change', updateFilters);

    // View toggles
    listViewBtn.addEventListener('click', () => setActiveView('list'));
    boardViewBtn.addEventListener('click', () => setActiveView('board'));
    calendarViewBtn.addEventListener('click', () => setActiveView('calendar'));
    openCalendarViewBtn.addEventListener('click', () => setActiveView('calendar'));

    // Task form submission
    taskForm.addEventListener('submit', (e) => {
        e.preventDefault();
        saveTaskFromForm();
    });

    // Delete task
    deleteTaskBtn.addEventListener('click', () => {
        if (currentTaskId) {
            deleteTask(currentTaskId);
            closeModal(taskModal);
        }
    });

    // Feedback form
    feedbackBtn.addEventListener('click', () => openModal(feedbackModal));
    feedbackForm.addEventListener('submit', (e) => {
        e.preventDefault();
        submitFeedback();
    });

    // Share task
    shareTaskBtn.addEventListener('click', () => {
        shareTask();
        closeModal(shareModal);
    });

    // Theme toggle
    themeToggleBtn.addEventListener('click', toggleTheme);

    // Close modals when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === taskModal) closeModal(taskModal);
        if (e.target === feedbackModal) closeModal(feedbackModal);
        if (e.target === shareModal) closeModal(shareModal);
    });

    // Close buttons for modals
    document.querySelectorAll('.close').forEach(closeBtn => {
        closeBtn.addEventListener('click', () => {
            closeModal(closeBtn.closest('.modal'));
        });
    });
}

// Add a new task
function addTask(name, details = {}) {
    const newTask = {
        id: Date.now().toString(),
        name: name,
        description: details.description || '',
        category: details.category || 'personal',
        priority: details.priority || 'medium',
        status: details.status || 'pending',
        dueDate: details.dueDate || '',
        dueTime: details.dueTime || '',
        createdAt: new Date().toISOString(),
        collaborators: details.collaborators || [],
        notes: details.notes || ''
    };

    tasks.push(newTask);
    saveTasksToStorage();
    renderTasks();
}

// Edit an existing task
function editTask(taskId) {
    const task = tasks.find(task => task.id === taskId);
    if (!task) return;

    currentTaskId = taskId;
    modalTitle.textContent = 'Edit Task';
    
    // Fill the form with task details
    taskNameInput.value = task.name;
    taskDescriptionInput.value = task.description;
    taskCategorySelect.value = task.category;
    taskPrioritySelect.value = task.priority;
    taskStatusSelect.value = task.status;
    taskDueDateInput.value = task.dueDate;
    taskDueTimeInput.value = task.dueTime;
    taskCollaboratorsInput.value = task.collaborators.join(', ');
    taskNotesInput.value = task.notes;

    openModal(taskModal);
}

// Save task from form
function saveTaskFromForm() {
    const name = taskNameInput.value.trim();
    if (!name) return;

    const collaborators = taskCollaboratorsInput.value
        .split(',')
        .map(email => email.trim())
        .filter(email => email);

    const taskDetails = {
        description: taskDescriptionInput.value.trim(),
        category: taskCategorySelect.value,
        priority: taskPrioritySelect.value,
        status: taskStatusSelect.value,
        dueDate: taskDueDateInput.value,
        dueTime: taskDueTimeInput.value,
        collaborators: collaborators,
        notes: taskNotesInput.value.trim()
    };

    if (currentTaskId) {
        // Update existing task
        const taskIndex = tasks.findIndex(task => task.id === currentTaskId);
        if (taskIndex !== -1) {
            tasks[taskIndex] = {
                ...tasks[taskIndex],
                name,
                ...taskDetails
            };
        }
    } else {
        // Add new task
        addTask(name, taskDetails);
    }

    saveTasksToStorage();
    renderTasks();
    closeModal(taskModal);
}

// Delete a task
function deleteTask(taskId) {
    tasks = tasks.filter(task => task.id !== taskId);
    saveTasksToStorage();
    renderTasks();
}

// Toggle task completion status
function toggleTaskStatus(taskId) {
    const taskIndex = tasks.findIndex(task => task.id === taskId);
    if (taskIndex !== -1) {
        const newStatus = tasks[taskIndex].status === 'completed' ? 'pending' : 'completed';
        tasks[taskIndex].status = newStatus;
        saveTasksToStorage();
        renderTasks();
    }
}

// Share a task
function shareTask() {
    if (!currentTaskId) return;

    const emails = shareEmailsInput.value
        .split(',')
        .map(email => email.trim())
        .filter(email => email);

    const message = shareMessageInput.value.trim();

    // In a real app, this would send the task to these emails
    // For now, we'll just update the task's collaborators
    const taskIndex = tasks.findIndex(task => task.id === currentTaskId);
    if (taskIndex !== -1) {
        tasks[taskIndex].collaborators = [...new Set([...tasks[taskIndex].collaborators, ...emails])];
        saveTasksToStorage();
        renderTasks();
    }

    // Clear the form
    shareEmailsInput.value = '';
    shareMessageInput.value = '';

    // Show a confirmation message
    alert(`Task shared with ${emails.join(', ')}`);
}

// Submit feedback
function submitFeedback() {
    const feedbackType = document.getElementById('feedback-type').value;
    const feedbackMessage = document.getElementById('feedback-message').value.trim();

    if (!feedbackMessage) return;

    // In a real app, this would send the feedback to a server
    // For now, we'll just show a confirmation message
    alert(`Thank you for your ${feedbackType} feedback! We'll review it soon.`);

    // Clear the form
    document.getElementById('feedback-message').value = '';
    closeModal(feedbackModal);
}

// Update filters
function updateFilters() {
    currentFilter.priority = priorityFilter.value;
    currentFilter.status = statusFilter.value;
    currentFilter.date = dateFilter.value;
    renderTasks();
}

// Set active category filter
function setActiveCategory(category) {
    currentFilter.category = category;
    document.querySelectorAll('#categories-list li').forEach(li => {
        li.classList.toggle('active', li.dataset.category === category);
    });
    renderTasks();
}

// Set active view
function setActiveView(viewName) {
    // Update buttons
    listViewBtn.classList.toggle('active', viewName === 'list');
    boardViewBtn.classList.toggle('active', viewName === 'board');
    calendarViewBtn.classList.toggle('active', viewName === 'calendar');

    // Update views
    listView.classList.toggle('active', viewName === 'list');
    boardView.classList.toggle('active', viewName === 'board');
    calendarView.classList.toggle('active', viewName === 'calendar');

    // If calendar view is activated, ensure it's rendered
    if (viewName === 'calendar') {
        renderCalendar();
    }
}

// Filter tasks based on current filters
function filterTasks() {
    return tasks.filter(task => {
        // Category filter
        if (currentFilter.category !== 'all' && task.category !== currentFilter.category) {
            return false;
        }

        // Priority filter
        if (currentFilter.priority !== 'all' && task.priority !== currentFilter.priority) {
            return false;
        }

        // Status filter
        if (currentFilter.status !== 'all' && task.status !== currentFilter.status) {
            return false;
        }

        // Date filter
        if (currentFilter.date !== 'all' && task.dueDate) {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const dueDate = new Date(task.dueDate);
            dueDate.setHours(0, 0, 0, 0);

            if (currentFilter.date === 'today' && dueDate.getTime() !== today.getTime()) {
                return false;
            }

            if (currentFilter.date === 'week') {
                const weekLater = new Date(today);
                weekLater.setDate(today.getDate() + 7);
                if (dueDate < today || dueDate > weekLater) {
                    return false;
                }
            }

            if (currentFilter.date === 'month') {
                const monthLater = new Date(today);
                monthLater.setMonth(today.getMonth() + 1);
                if (dueDate < today || dueDate > monthLater) {
                    return false;
                }
            }
        }

        return true;
    });
}

// Render tasks in the list view
function renderTasksList(filteredTasks) {
    tasksList.innerHTML = '';

    filteredTasks.forEach(task => {
        const taskElement = document.createElement('div');
        taskElement.className = 'task-item';
        taskElement.dataset.id = task.id;

        const isCompleted = task.status === 'completed';

        taskElement.innerHTML = `
            <div class="task-status">
                <span class="task-checkbox ${isCompleted ? 'completed' : ''}" data-id="${task.id}"></span>
            </div>
            <div class="task-name ${isCompleted ? 'completed' : ''}">${task.name}</div>
            <div class="task-category ${task.category}">${task.category}</div>
            <div class="task-priority">
                <span class="priority-indicator priority-${task.priority}"></span>
                ${task.priority}
            </div>
            <div class="task-due-date">${task.dueDate ? formatDate(task.dueDate) : 'No date'}</div>
            <div class="task-actions">
                <button class="task-action-btn edit-btn" data-id="${task.id}"><i class="fas fa-edit"></i></button>
                <button class="task-action-btn share-btn" data-id="${task.id}"><i class="fas fa-share-alt"></i></button>
                <button class="task-action-btn delete-btn" data-id="${task.id}"><i class="fas fa-trash"></i></button>
            </div>
        `;

        tasksList.appendChild(taskElement);

        // Add event listeners
        const checkbox = taskElement.querySelector('.task-checkbox');
        checkbox.addEventListener('click', () => toggleTaskStatus(task.id));

        const editBtn = taskElement.querySelector('.edit-btn');
        editBtn.addEventListener('click', () => editTask(task.id));

        const deleteBtn = taskElement.querySelector('.delete-btn');
        deleteBtn.addEventListener('click', () => {
            if (confirm('Are you sure you want to delete this task?')) {
                deleteTask(task.id);
            }
        });

        const shareBtn = taskElement.querySelector('.share-btn');
        shareBtn.addEventListener('click', () => {
            currentTaskId = task.id;
            openShareModal(task);
        });
    });
}

// Render tasks in the board view
function renderTasksBoard(filteredTasks) {
    // Clear all columns
    pendingTasks.innerHTML = '';
    inProgressTasks.innerHTML = '';
    completedTasks.innerHTML = '';

    filteredTasks.forEach(task => {
        const taskElement = document.createElement('div');
        taskElement.className = 'board-task';
        taskElement.dataset.id = task.id;

        taskElement.innerHTML = `
            <div class="board-task-header">
                <div class="board-task-title">${task.name}</div>
                <div class="board-task-category ${task.category}">${task.category}</div>
            </div>
            <div class="board-task-details">
                <div class="board-task-priority">
                    <span class="priority-indicator priority-${task.priority}"></span>
                    ${task.priority}
                </div>
                <div class="board-task-due">${task.dueDate ? formatDate(task.dueDate) : 'No date'}</div>
            </div>
        `;

        // Add to the appropriate column
        if (task.status === 'completed') {
            completedTasks.appendChild(taskElement);
        } else if (task.status === 'in-progress') {
            inProgressTasks.appendChild(taskElement);
        } else {
            pendingTasks.appendChild(taskElement);
        }

        // Add click event to open task details
        taskElement.addEventListener('click', () => editTask(task.id));
    });
}

// Render the calendar view
function renderCalendar() {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    // Create calendar header
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    // Get the first day of the month
    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    // Get the number of days in the month
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

    // Create calendar HTML
    let calendarHTML = `
        <div class="calendar-header">
            <h2>${monthNames[currentMonth]} ${currentYear}</h2>
        </div>
        <div class="calendar-grid">
    `;

    // Add days of the week header
    daysOfWeek.forEach(day => {
        calendarHTML += `<div class="calendar-day-header">${day}</div>`;
    });

    // Add blank spaces for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
        calendarHTML += `<div class="calendar-day empty"></div>`;
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(currentYear, currentMonth, day);
        const dateString = formatDateForComparison(date);
        const isToday = day === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear();

        // Find tasks for this day
        const dayTasks = tasks.filter(task => {
            if (!task.dueDate) return false;
            return formatDateForComparison(new Date(task.dueDate)) === dateString;
        });

        calendarHTML += `
            <div class="calendar-day ${isToday ? 'today' : ''}">
                <div class="calendar-date">${day}</div>
                <div class="calendar-tasks">
        `;

        // Add tasks for this day (limit to 3 for space)
        dayTasks.slice(0, 3).forEach(task => {
            calendarHTML += `
                <div class="calendar-task ${task.priority}" data-id="${task.id}">
                    ${task.name}
                </div>
            `;
        });

        // Add a "more" indicator if there are more than 3 tasks
        if (dayTasks.length > 3) {
            calendarHTML += `<div class="calendar-more">+${dayTasks.length - 3} more</div>`;
        }

        calendarHTML += `
                </div>
            </div>
        `;
    }

    calendarHTML += `</div>`;

    // Update the calendar container
    calendarContainer.innerHTML = calendarHTML;

    // Add event listeners to tasks in the calendar
    document.querySelectorAll('.calendar-task').forEach(taskElement => {
        taskElement.addEventListener('click', () => {
            const taskId = taskElement.dataset.id;
            editTask(taskId);
        });
    });
}

// Render the mini calendar in the sidebar
function renderMiniCalendar() {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    // Create mini calendar HTML
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const daysOfWeek = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

    // Get the first day of the month
    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    // Get the number of days in the month
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

    // Create mini calendar HTML
    let miniCalendarHTML = `
        <div class="mini-calendar-header">
            <div class="mini-calendar-month">${monthNames[currentMonth]} ${currentYear}</div>
        </div>
        <div class="mini-calendar-grid">
    `;

    // Add days of the week header
    daysOfWeek.forEach(day => {
        miniCalendarHTML += `<div class="mini-calendar-day-header">${day}</div>`;
    });

    // Add blank spaces for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
        miniCalendarHTML += `<div class="mini-calendar-day empty"></div>`;
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(currentYear, currentMonth, day);
        const dateString = formatDateForComparison(date);
        const isToday = day === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear();

        // Check if there are tasks for this day
        const hasTasks = tasks.some(task => {
            if (!task.dueDate) return false;
            return formatDateForComparison(new Date(task.dueDate)) === dateString;
        });

        miniCalendarHTML += `
            <div class="mini-calendar-day ${isToday ? 'today' : ''} ${hasTasks ? 'has-tasks' : ''}">
                ${day}
            </div>
        `;
    }

    miniCalendarHTML += `</div>`;

    // Update the mini calendar container
    miniCalendar.innerHTML = miniCalendarHTML;
}

// Render categories in the sidebar
function renderCategories() {
    categoriesList.innerHTML = `
        <li data-category="all" class="${currentFilter.category === 'all' ? 'active' : ''}">All Tasks</li>
    `;

    categories.forEach(category => {
        const categoryElement = document.createElement('li');
        categoryElement.dataset.category = category;
        categoryElement.className = currentFilter.category === category ? 'active' : '';
        categoryElement.textContent = category.charAt(0).toUpperCase() + category.slice(1);
        
        // Add delete button for custom categories (not the default ones)
        if (!['work', 'personal', 'urgent'].includes(category)) {
            const deleteBtn = document.createElement('span');
            deleteBtn.className = 'delete-category';
            deleteBtn.innerHTML = '&times;';
            deleteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                deleteCategory(category);
            });
            categoryElement.appendChild(deleteBtn);
        }
        
        categoriesList.appendChild(categoryElement);
    });

    // Add event listeners to category items
    document.querySelectorAll('#categories-list li').forEach(li => {
        li.addEventListener('click', () => setActiveCategory(li.dataset.category));
    });

    // Update category select in task form
    updateCategorySelect();
}

// Update category select in task form
function updateCategorySelect() {
    taskCategorySelect.innerHTML = '';
    
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category.charAt(0).toUpperCase() + category.slice(1);
        taskCategorySelect.appendChild(option);
    });
}

// Delete a category
function deleteCategory(category) {
    if (confirm(`Are you sure you want to delete the category "${category}"?`)) {
        // Remove the category from the list
        categories = categories.filter(cat => cat !== category);
        saveCategoriestoStorage();
        
        // Update tasks with this category to 'personal'
        tasks = tasks.map(task => {
            if (task.category === category) {
                return { ...task, category: 'personal' };
            }
            return task;
        });
        saveTasksToStorage();
        
        // Reset category filter if it was set to the deleted category
        if (currentFilter.category === category) {
            currentFilter.category = 'all';
        }
        
        renderCategories();
        renderTasks();
    }
}

// Render all tasks based on current view and filters
function renderTasks() {
    const filteredTasks = filterTasks();
    
    // Render based on current view
    renderTasksList(filteredTasks);
    renderTasksBoard(filteredTasks);
    renderMiniCalendar();
    
    // If calendar view is active, update it too
    if (calendarView.classList.contains('active')) {
        renderCalendar();
    }
}

// Open a modal
function openModal(modal) {
    modal.style.display = 'block';
}

// Close a modal
function closeModal(modal) {
    modal.style.display = 'none';
    
    // Reset form if it's the task modal
    if (modal === taskModal) {
        taskForm.reset();
        currentTaskId = null;
        modalTitle.textContent = 'Add Task';
    }
}

// Open the share modal for a task
function openShareModal(task) {
    // Pre-fill with existing collaborators
    shareEmailsInput.value = task.collaborators.join(', ');
    openModal(shareModal);
}

// Format date for display
function formatDate(dateString) {
    const options = { month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
}

// Format date for comparison (YYYY-MM-DD)
function formatDateForComparison(date) {
    return date.toISOString().split('T')[0];
}

// Initialize the app when the DOM is loaded
document.addEventListener('DOMContentLoaded', initApp);

// Add CSS for mini calendar
const style = document.createElement('style');
style.textContent = `
    .mini-calendar-grid {
        display: grid;
        grid-template-columns: repeat(7, 1fr);
        gap: 2px;
        font-size: 0.8rem;
    }
    
    .mini-calendar-day-header {
        text-align: center;
        font-weight: bold;
        color: var(--text-light);
    }
    
    .mini-calendar-day {
        text-align: center;
        padding: 4px;
        border-radius: 50%;
        cursor: pointer;
    }
    
    .mini-calendar-day.empty {
        visibility: hidden;
    }
    
    .mini-calendar-day.today {
        background-color: var(--primary-color);
        color: white;
    }
    
    .mini-calendar-day.has-tasks {
        font-weight: bold;
        border: 1px solid var(--primary-color);
    }
    
    .mini-calendar-header {
        text-align: center;
        margin-bottom: 0.5rem;
        font-weight: bold;
    }
    
    .calendar-grid {
        display: grid;
        grid-template-columns: repeat(7, 1fr);
        gap: 0.5rem;
    }
    
    .calendar-day-header {
        text-align: center;
        font-weight: bold;
        padding: 0.5rem;
        color: var(--text-light);
    }
    
    .calendar-day {
        min-height: 100px;
        border: 1px solid var(--border-color);
        border-radius: var(--border-radius);
        padding: 0.5rem;
    }
    
    .calendar-day.empty {
        background-color: transparent;
        border: none;
    }
    
    .calendar-day.today {
        background-color: rgba(74, 111, 165, 0.1);
        border-color: var(--primary-color);
    }
    
    .calendar-date {
        font-weight: bold;
        margin-bottom: 0.5rem;
    }
    
    .calendar-tasks {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
    }
    
    .calendar-task {
        padding: 0.25rem 0.5rem;
        border-radius: var(--border-radius);
        font-size: 0.8rem;
        cursor: pointer;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }
    
    .calendar-task.high {
        background-color: rgba(220, 53, 69, 0.1);
        border-left: 3px solid var(--danger-color);
    }
    
    .calendar-task.medium {
        background-color: rgba(255, 193, 7, 0.1);
        border-left: 3px solid var(--warning-color);
    }
    
    .calendar-task.low {
        background-color: rgba(40, 167, 69, 0.1);
        border-left: 3px solid var(--success-color);
    }
    
    .calendar-more {
        font-size: 0.7rem;
        color: var(--text-light);
        text-align: center;
    }
    
    .calendar-header {
        text-align: center;
        margin-bottom: 1rem;
    }
    
    .calendar-header h2 {
        color: var(--primary-color);
    }
`;

document.head.appendChild(style);