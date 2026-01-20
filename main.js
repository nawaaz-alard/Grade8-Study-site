// Initialize Dashboard
document.addEventListener('DOMContentLoaded', () => {
    initThemes();
    initGoogleLogin(); // New
    renderContent();
    startClock();
    showMotivation();
    initNavigation();
    initTools();
});

// --- API Helper ---
async function apiCall(endpoint, method = 'GET', body = null) {
    const token = localStorage.getItem('studyHubToken');
    const headers = {
        'Content-Type': 'application/json'
    };
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    try {
        const response = await fetch(`${siteConfig.apiBaseUrl}${endpoint}`, {
            method,
            headers,
            body: body ? JSON.stringify(body) : null
        });

        if (response.status === 401) {
            // Token expired or invalid
            console.warn('Session expired, logging out...');
            localStorage.removeItem('studyHubToken');
            localStorage.removeItem('studyHubUser');
            location.reload();
            return null;
        }

        if (!response.ok) {
            const errData = await response.json();
            throw new Error(errData.message || 'API Error');
        }

        return await response.json();
    } catch (error) {
        console.error('API Call Failed:', error);
        throw error;
    }
}

// --- Auth Logic ---
function initGoogleLogin() {
    const authStep2 = document.getElementById('auth-step-2');
    const userProfile = document.getElementById('user-profile');
    const signinBtn = document.querySelector('.g_id_signin');
    const userAvatar = document.getElementById('user-avatar');
    const usernameText = document.getElementById('username-text');
    const signOutBtn = document.getElementById('sign-out-btn');
    const guestContainer = document.getElementById('guest-login');

    const userSession = localStorage.getItem('studyHubUser');
    const profileCompleted = sessionStorage.getItem('studyHubProfileCompleted');

    // Check Login State
    if (userSession) {
        const user = JSON.parse(userSession);
        if (signinBtn) signinBtn.style.display = 'none';
        if (guestContainer) guestContainer.style.display = 'none';
        if (userProfile) userProfile.style.display = 'flex';
        if (userAvatar) userAvatar.src = user.picture;
        if (usernameText) usernameText.textContent = user.username || user.name;

        // Profile Completion Check
        if (!profileCompleted) {
            authStep2.style.display = 'flex';
        }
    } else {
        if (signinBtn) signinBtn.style.display = 'block';
        if (guestContainer) guestContainer.style.display = 'block';
        if (userProfile) userProfile.style.display = 'none';
    }

    const authEmail = document.getElementById('auth-email');
    const authPassword = document.getElementById('auth-password');
    const authUsername = document.getElementById('auth-username');
    const loginBtn = document.getElementById('btn-login');
    const signupBtn = document.getElementById('btn-signup');
    const setupError = document.getElementById('setup-error');

    async function handleAuth(mode) {
        const email = authEmail.value;
        const password = authPassword.value;
        const username = authUsername.value;

        if (!email || !password) {
            setupError.textContent = "Please enter email and password.";
            setupError.style.display = 'block';
            return;
        }

        try {
            let data;
            if (mode === 'signup') {
                if (!username) {
                    setupError.textContent = "Username required for signup.";
                    setupError.style.display = 'block';
                    return;
                }
                // Call API Signup
                data = await apiCall('/auth/signup', 'POST', { email, password, username });
            } else {
                // Call API Login
                data = await apiCall('/auth/signin', 'POST', { email, password });
            }

            // Success
            localStorage.setItem('studyHubToken', data.token);
            // We need to fetch the user profile if login didn't return it full (authService usually returns {user, token})
            // Let's assume data.user is present
            if (data.user) {
                localStorage.setItem('studyHubUser', JSON.stringify(data.user));
            }

            sessionStorage.setItem('studyHubProfileCompleted', 'true');
            location.reload(); // Refresh to load state

        } catch (err) {
            setupError.textContent = err.message;
            setupError.style.display = 'block';
        }
    }

    if (loginBtn) loginBtn.addEventListener('click', () => handleAuth('login'));
    if (signupBtn) signupBtn.addEventListener('click', () => handleAuth('signup'));

    // Sign Out Logic
    if (signOutBtn) {
        signOutBtn.addEventListener('click', () => {
            localStorage.removeItem('studyHubUser');
            localStorage.removeItem('studyHubToken');
            sessionStorage.removeItem('studyHubProfileCompleted');
            location.reload();
        });
    }

    // Guest Mode Logic
    const guestBtn = document.getElementById('enter-guest');

    if (guestBtn) {
        guestBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const guestUser = {
                id: 'guest',
                name: 'Guest User',
                email: 'guest@portal.local',
                picture: 'https://ui-avatars.com/api/?name=Guest+User&background=6a11cb&color=fff'
            };
            localStorage.setItem('studyHubUser', JSON.stringify(guestUser));

            // Show Profile
            if (signinBtn) signinBtn.style.display = 'none';
            if (guestContainer) guestContainer.style.display = 'none';
            if (userProfile) userProfile.style.display = 'flex';
            if (userAvatar) userAvatar.src = guestUser.picture;

            // Trigger 2FA for security
            authStep2.style.display = 'flex';
        });
    }

    // Hide guest button if already logged in
    if (userSession && guestContainer) {
        guestContainer.style.display = 'none';
    }

    // Global callback for Google Sign-In
    window.handleCredentialResponse = (response) => {
        try {
            const responsePayload = decodeJwtResponse(response.credential);

            const user = {
                id: responsePayload.sub,
                name: responsePayload.name,
                email: responsePayload.email,
                picture: responsePayload.picture
            };
            localStorage.setItem('studyHubUser', JSON.stringify(user));

            // Update UI immediately
            if (signinBtn) signinBtn.style.display = 'none';
            if (userProfile) userProfile.style.display = 'flex';
            if (userAvatar) userAvatar.src = user.picture;

            // Trigger 2FA
            authStep2.style.display = 'flex';

        } catch (e) {
            console.error('Login failed', e);
        }
    };
}

function decodeJwtResponse(token) {
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    var jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function (c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload);
}

async function renderContent() {
    const container = document.getElementById('terms-container');
    const terms = [1, 2, 3, 4];
    let allResources = siteConfig.links; // Default/Fallback

    // Try fetching from API
    try {
        const apiResources = await apiCall('/resources', 'GET');
        if (apiResources && apiResources.length > 0) {
            allResources = apiResources;
            console.log('Loaded resources from API');
        }
    } catch (e) {
        console.log('Using local config resources');
    }

    container.innerHTML = ''; // Clear previous content

    terms.forEach((term) => {
        const termLinks = allResources.filter(link => link.term === term);

        const section = document.createElement('section');
        section.id = `term${term}`;
        section.className = `term-section ${term === 1 ? 'active' : ''}`;

        const cardsHtml = termLinks.map(link => `
            <a href="${link.url}" class="card" target="_blank">
                <div class="card-icon"><i class="fa-solid ${link.icon || 'fa-book'}"></i></div>
                <div class="card-content">
                    <h3>${link.subject}</h3>
                    <p>${link.topic || link.description || 'Study Material'}</p>
                </div>
            </a>
        `).join('');

        section.innerHTML = `
            <div class="cards-grid">
                ${cardsHtml}
            </div>
        `;

        container.appendChild(section);
    });
}

function startClock() {
    const display = document.getElementById('datetime-display');
    const update = () => {
        const now = new Date();
        display.textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) +
            ' • ' + now.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' });
    };
    update();
    setInterval(update, 1000);
}

function showMotivation() {
    const quoteEl = document.getElementById('quote-text');
    const quotes = siteConfig.motivationalQuotes;
    quoteEl.textContent = quotes[Math.floor(Math.random() * quotes.length)];
    setInterval(() => {
        quoteEl.style.opacity = 0;
        setTimeout(() => {
            quoteEl.textContent = quotes[Math.floor(Math.random() * quotes.length)];
            quoteEl.style.opacity = 1;
        }, 500);
    }, 20000);
}

function initNavigation() {
    const navPills = document.querySelectorAll('.nav-pill');
    navPills.forEach(pill => {
        pill.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            navPills.forEach(p => p.classList.remove('active'));
            this.classList.add('active');
            document.querySelectorAll('.term-section').forEach(sec => {
                sec.classList.remove('active');
                if (sec.id === targetId) {
                    sec.classList.add('active');
                    sec.style.animation = 'none';
                    sec.offsetHeight;
                    sec.style.animation = 'fadeIn 0.5s ease-out';
                }
            });
        });
    });
}

// --- Tools Implementation ---

function initTools() {
    initTimer();
    initTodo();
}

function initTimer() {
    let timeLeft = 30 * 60;
    let timerId = null;
    const display = document.getElementById('timer-display');
    const status = document.querySelector('.timer-status');
    const startBtn = document.getElementById('start-timer');

    function updateDisplay() {
        const m = Math.floor(timeLeft / 60);
        const s = timeLeft % 60;
        display.textContent = `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }

    startBtn.addEventListener('click', () => {
        if (timerId) {
            clearInterval(timerId);
            timerId = null;
            startBtn.textContent = 'Start Focus';
            status.textContent = 'Paused';
        } else {
            status.textContent = 'Focusing...';
            startBtn.textContent = 'Pause';
            timerId = setInterval(() => {
                if (timeLeft > 0) {
                    timeLeft--;
                    updateDisplay();
                } else {
                    clearInterval(timerId);
                    timerId = null;
                    status.textContent = 'Break Time!';
                    // Simple alarm tone could go here
                }
            }, 1000);
        }
    });

    document.getElementById('reset-timer').addEventListener('click', () => {
        clearInterval(timerId);
        timerId = null;
        timeLeft = 30 * 60;
        updateDisplay();
        startBtn.textContent = 'Start';
        status.textContent = 'Ready to focus?';
    });
}

async function initTodo() {
    const input = document.getElementById('todo-input');
    const addBtn = document.getElementById('add-todo');
    const list = document.getElementById('todo-list');

    // 1. Fetch initial Tasks from API
    let todos = [];
    try {
        todos = await apiCall('/tasks', 'GET');
    } catch (e) {
        console.log('Could not fetch tasks (maybe offline or guest)', e);
        // Fallback to local? Or empty.
        todos = [];
    }

    // Sort: Uncompleted first
    // todos.sort((a, b) => a.completed === b.completed ? 0 : a.completed ? 1 : -1);

    function render() {
        list.innerHTML = '';
        if (!todos) return;

        todos.forEach((todo, index) => {
            const li = document.createElement('li');
            li.className = todo.completed ? 'completed' : '';
            li.innerHTML = `
                <span onclick="toggleTodo('${todo._id}')">${todo.text}</span>
                <button class="delete-todo" onclick="deleteTodo('${todo._id}')"><i class="fa-solid fa-trash"></i></button>
            `;
            list.appendChild(li);
        });
    }

    window.toggleTodo = async (id) => {
        // Optimistic UI update
        const task = todos.find(t => t._id === id);
        if (task) {
            task.completed = !task.completed;
            render();
            // Sync
            try {
                await apiCall(`/tasks/${id}`, 'PUT', { completed: task.completed });
            } catch (e) {
                console.error('Failed to update task', e);
            }
        }
    };

    window.deleteTodo = async (id) => {
        // Optimistic UI
        const idx = todos.findIndex(t => t._id === id);
        if (idx > -1) {
            todos.splice(idx, 1);
            render();
            // Sync
            try {
                await apiCall(`/tasks/${id}`, 'DELETE');
            } catch (e) {
                console.error('Failed to delete task', e);
            }
        }
    };

    addBtn.addEventListener('click', async () => {
        const text = input.value.trim();
        if (text) {
            input.value = '';
            try {
                const newTask = await apiCall('/tasks', 'POST', { text });
                todos.push(newTask);
                render();
            } catch (e) {
                alert('Error adding task: ' + e.message);
            }
        }
    });

    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addBtn.click();
    });

    render();
}

// --- Personalization ---



function initThemes() {
    const savedColor = localStorage.getItem('studyHubTheme') || '#6a11cb'; // Default Purple
    setTheme(savedColor);

    document.querySelectorAll('.theme-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const color = btn.getAttribute('data-color');
            setTheme(color);
            localStorage.setItem('studyHubTheme', color);
        });
    });
}

function setTheme(color) {
    document.documentElement.style.setProperty('--primary-color', color);

    // Adjust gradient based on primary color
    let secondary = '#2575fc'; // Default Blue
    if (color === '#00b894') secondary = '#0984e3'; // Green -> Blue
    if (color === '#e17055') secondary = '#d63031'; // Orange -> Red
    if (color === '#0984e3') secondary = '#6c5ce7'; // Blue -> Purple

    document.documentElement.style.setProperty('--secondary-color', secondary);
}
