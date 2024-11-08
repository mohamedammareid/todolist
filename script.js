document.addEventListener("DOMContentLoaded", function() {
    // Existing code variables
    const loginForm = document.getElementById("loginForm");
    const registerForm = document.getElementById("registerForm");
    const mainContent = document.getElementById("mainContent");
    const logoutButton = document.getElementById("logoutButton");
    const addTaskForm = document.getElementById("addTaskForm");
    const taskInput = document.getElementById("taskInput");
    const taskList = document.getElementById("taskList");
    const completedTasksList = document.getElementById("completedTasksList");
    const viewCompletedTasksButton = document.getElementById("viewCompletedTasksButton");
    const completedTasksPercentage = document.getElementById("completedTasksPercentage");
    const progressBar = document.getElementById("progressBar");

    let users = JSON.parse(localStorage.getItem("users")) || [];
    let currentUser = JSON.parse(localStorage.getItem("currentUser")) || null;

    // Check if a user is logged in
    if (currentUser) {
        showMainContent();
    }

    loginForm.addEventListener("submit", function(e) {
        e.preventDefault();
        const email = document.getElementById("loginEmail").value;
        const password = document.getElementById("loginPassword").value;

        const user = users.find(user => user.email === email && user.password === password);
        if (user) {
            currentUser = user;
            localStorage.setItem("currentUser", JSON.stringify(currentUser));
            showMainContent();
        } else {
            alert("Login failed! Please check your credentials or register for an account.");
        }
    });

    function showMainContent() {
        loginForm.style.display = "none";
        registerForm.style.display = "none";
        mainContent.style.display = "block";
        logoutButton.style.display = "block";
        viewCompletedTasksButton.style.display = "block";
        loadTasks();
        updateProgressBar();
    }

    registerForm.addEventListener("submit", function(e) {
        e.preventDefault();
        const email = document.getElementById("registerEmail").value;
        const password = document.getElementById("registerPassword").value;
        const userName = document.getElementById("registerName").value;

        const existingUser = users.find(user => user.email === email);
        if (existingUser) {
            alert("This email is already registered. Please log in.");
            registerForm.style.display = "none";
            loginForm.style.display = "block";
        } else {
            const newUser = { email, password, userName, tasks: [] };
            users.push(newUser);
            localStorage.setItem("users", JSON.stringify(users));
            alert("Registration successful! Please log in.");
            registerForm.style.display = "none";
            loginForm.style.display = "block";
        }
    });

    function loadTasks() {
        taskList.innerHTML = '';
        completedTasksList.innerHTML = '';
        const tasks = currentUser.tasks || [];
        tasks.forEach(task => renderTask(task));
    }

    addTaskForm.addEventListener("submit", function(e) {
        e.preventDefault();
        const taskName = taskInput.value;
        if (taskName) {
            const task = {
                name: taskName,
                completed: false,
                addedDate: new Date().toLocaleString(),
                completedDate: null
            };
            currentUser.tasks.push(task);
            saveUserTasks();
            taskInput.value = '';
            renderTask(task);
            updateProgressBar();
        }
    });

    function saveUserTasks() {
        const userIndex = users.findIndex(user => user.email === currentUser.email);
        users[userIndex].tasks = currentUser.tasks;
        localStorage.setItem("users", JSON.stringify(users));
        localStorage.setItem("currentUser", JSON.stringify(currentUser));
    }

    function renderTask(task) {
        const li = document.createElement("li");
        li.className = "list-group-item d-flex justify-content-between align-items-center";
        li.textContent = task.name + (task.completed ? ` (Completed on: ${task.completedDate})` : '');

        const completeButton = document.createElement("button");
        completeButton.className = "btn btn-success btn-sm";
        completeButton.textContent = task.completed ? "Completed" : "Complete";
        completeButton.disabled = task.completed;

        completeButton.onclick = function() {
            completeTask(task);
            li.remove();
            updateProgressBar();
            updateCompletedTasks();
        };

        li.appendChild(completeButton);
        task.completed ? completedTasksList.appendChild(li) : taskList.appendChild(li);
    }

    function completeTask(task) {
        task.completed = true;
        task.completedDate = new Date().toLocaleString();
        saveUserTasks();
    }

    function updateProgressBar() {
        const completedCount = currentUser.tasks.filter(task => task.completed).length;
        const totalCount = currentUser.tasks.length;

        if (totalCount > 0) {
            const percentage = (completedCount / totalCount) * 100;
            progressBar.style.width = percentage + "%";
            completedTasksPercentage.textContent = `${Math.round(percentage)}% Completed`;
        } else {
            progressBar.style.width = '0%';
            completedTasksPercentage.textContent = '0% Completed';
        }
    }

    function updateCompletedTasks() {
        completedTasksList.innerHTML = '';
        currentUser.tasks.filter(task => task.completed).forEach(task => {
            const li = document.createElement("li");
            li.className = "list-group-item";
            li.textContent = `${task.name} (Added on: ${task.addedDate}, Completed on: ${task.completedDate})`;
            completedTasksList.appendChild(li);
        });
    }

    logoutButton.addEventListener("click", function() {
        currentUser = null;
        localStorage.removeItem("currentUser");
        document.querySelector("#loginForm").style.display = "block";
        mainContent.style.display = "none";
        logoutButton.style.display = "none";
        viewCompletedTasksButton.style.display = "none";
    });

    viewCompletedTasksButton.addEventListener("click", function() {
        if (currentUser.tasks.filter(task => task.completed).length === 0) {
            alert("No completed tasks!");
        } else {
            $('#completedTasksModal').modal('show');
        }
    });

    document.getElementById("deleteAllCompletedTasksButton").addEventListener("click", function() {
        currentUser.tasks = currentUser.tasks.filter(task => !task.completed);
        saveUserTasks();
        updateCompletedTasks();
        updateProgressBar();
        $('#completedTasksModal').modal('hide');
    });

    document.getElementById("showRegisterButton").addEventListener("click", function() {
        loginForm.style.display = "none";
        registerForm.style.display = "block";
    });

    document.getElementById("cancelRegisterButton").addEventListener("click", function() {
        registerForm.style.display = "none";
        loginForm.style.display = "block";
    });
});
