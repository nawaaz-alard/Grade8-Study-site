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

function initGoogleLogin() {
    const authStep2 = document.getElementById('auth-step-2');
    const userProfile = document.getElementById('user-profile');
    const signinBtn = document.querySelector('.g_id_signin');
    const userAvatar = document.getElementById('user-avatar');
    const signOutBtn = document.getElementById('sign-out-btn');

    const userSession = localStorage.getItem('studyHubUser');
    const profileCompleted = sessionStorage.getItem('studyHubProfileCompleted');

    // Check Login State
    if (userSession) {
        const user = JSON.parse(userSession);
        if (signinBtn) signinBtn.style.display = 'none';
        if (userProfile) userProfile.style.display = 'flex';
        if (userAvatar) userAvatar.src = user.picture;

        // Profile Completion Check
        if (!profileCompleted) {
            authStep2.style.display = 'flex';
        }
    } else {
        if (signinBtn) signinBtn.style.display = 'block';
        if (userProfile) userProfile.style.display = 'none';
    }

    // Profile Setup Logic (Replaces PIN)
    const birthYearInput = document.getElementById('birth-year');
    const usernameInput = document.getElementById('display-username');
    const finishSetupBtn = document.getElementById('finish-setup-btn');
    const setupError = document.getElementById('setup-error');

    function saveProfile() {
        const year = birthYearInput.value;
        const username = usernameInput.value.trim();

        if (year && username && year > 1900 && year <= new Date().getFullYear()) {
            // Update existing user session in localStorage
            const user = JSON.parse(localStorage.getItem('studyHubUser')) || {};
            user.birthYear = year;
            user.username = username;
            localStorage.setItem('studyHubUser', JSON.stringify(user));

            // Mark profile as completed for this session
            sessionStorage.setItem('studyHubProfileCompleted', 'true');

            // Hide setup box
            authStep2.style.display = 'none';

            // Update UI with new username if needed
            console.log('Profile setup complete for', username);
        } else {
            setupError.style.display = 'block';
        }
    }

    if (finishSetupBtn) {
        finishSetupBtn.addEventListener('click', saveProfile);
    }

    [birthYearInput, usernameInput].forEach(input => {
        if (input) {
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') saveProfile();
            });
        }
    });

    // Sign Out Logic
    signOutBtn.addEventListener('click', () => {
        localStorage.removeItem('studyHubUser');
        sessionStorage.removeItem('studyHubProfileCompleted');
        location.reload();
    });

    // Guest Mode Logic
    const guestBtn = document.getElementById('enter-guest');
    const guestContainer = document.getElementById('guest-login');

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

function renderContent() {
    const container = document.getElementById('terms-container');
    const terms = [1, 2, 3, 4];

    terms.forEach((term) => {
        const termLinks = siteConfig.links.filter(link => link.term === term);

        const section = document.createElement('section');
        section.id = `term${term}`;
        section.className = `term-section ${term === 1 ? 'active' : ''}`;

        const cardsHtml = termLinks.map(link => `
            <a href="${link.url}" class="card" target="_blank">
                <div class="card-icon"><i class="fa-solid ${link.icon}"></i></div>
                <div class="card-content">
                    <h3>${link.subject}</h3>
                    <p>${link.topic}</p>
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

function initTodo() {
    const input = document.getElementById('todo-input');
    const addBtn = document.getElementById('add-todo');
    const list = document.getElementById('todo-list');

    let todos = JSON.parse(localStorage.getItem('studyHubTodos')) || [];

    function save() {
        localStorage.setItem('studyHubTodos', JSON.stringify(todos));
        render();
    }

    function render() {
        list.innerHTML = '';
        todos.forEach((todo, index) => {
            const li = document.createElement('li');
            li.className = todo.completed ? 'completed' : '';
            li.innerHTML = `
                <span onclick="toggleTodo(${index})">${todo.text}</span>
                <button class="delete-todo" onclick="deleteTodo(${index})"><i class="fa-solid fa-trash"></i></button>
            `;
            list.appendChild(li);
        });
    }

    window.toggleTodo = (index) => {
        todos[index].completed = !todos[index].completed;
        save();
    };

    window.deleteTodo = (index) => {
        todos.splice(index, 1);
        save();
    };

    addBtn.addEventListener('click', () => {
        if (input.value.trim()) {
            todos.push({ text: input.value, completed: false });
            input.value = '';
            save();
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
