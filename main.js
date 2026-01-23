// Initialize Dashboard
document.addEventListener('DOMContentLoaded', () => {
    initThemes();
    initGoogleLogin(); // New
    renderContent();
    startClock();
    showMotivation();
    initVisualEffects(); // New
    initNavigation();
    initTools();
    initAIChat(); // New
});

// --- Notifications & UI Helpers ---
function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return; // Guard

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <i class="fa-solid ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i>
        <span>${message}</span>
    `;

    container.appendChild(toast);

    // Auto remove after 3s
    setTimeout(() => {
        toast.style.animation = 'fadeOutRight 0.3s forwards';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// --- AI Assistant ---
function initAIChat() {
    const fab = document.getElementById('ai-fab');
    const windowEl = document.getElementById('ai-chat-window');
    const closeBtn = document.getElementById('close-chat');
    const sendBtn = document.getElementById('chat-send');
    const input = document.getElementById('chat-input');
    const messages = document.getElementById('chat-messages');

    if (!fab) return;

    function toggleChat() {
        windowEl.classList.toggle('active');
        if (windowEl.classList.contains('active')) input.focus();
    }

    fab.addEventListener('click', toggleChat);
    closeBtn.addEventListener('click', toggleChat);

    async function sendMessage() {
        const text = input.value.trim();
        if (!text) return;

        // User Message
        appendMessage('user', text);
        input.value = '';

        // Mock AI Response (Loading)
        const loadingId = appendMessage('bot', '<i class="fa-solid fa-spinner fa-spin"></i> Thinking...');

        // Simulate delay/API call
        setTimeout(() => {
            const loadingMsg = document.querySelector(`[data-id="${loadingId}"]`);
            if (loadingMsg) loadingMsg.remove();

            // Simple keyword matching for demo
            let reply = "That's an interesting question! I recommend checking the term resources.";
            if (text.toLowerCase().includes('math')) reply = "For Mathematics, focus on the Algebra section in Term 2.";
            if (text.toLowerCase().includes('english')) reply = "English revision is key! Have you reviewed your poetry notes?";
            if (text.toLowerCase().includes('science')) reply = "Science rocks! Don't forget to practice your chemical equations.";
            if (text.toLowerCase().includes('history')) reply = "History is all about context. Make sure you know your dates!";

            appendMessage('bot', reply);
        }, 1500);
    }

    function appendMessage(role, html) {
        const div = document.createElement('div');
        div.className = `chat-message ${role}`;
        const id = Date.now();
        div.dataset.id = id;
        div.innerHTML = html;
        messages.appendChild(div);
        messages.scrollTop = messages.scrollHeight;
        return id;
    }

    sendBtn.addEventListener('click', sendMessage);
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendMessage();
    });
}

function initVisualEffects() {
    // 1. Custom Cursor (Single Instance)
    if (!document.querySelector('.cursor-dot')) {
        const cursorDot = document.createElement('div');
        const cursorOutline = document.createElement('div');
        cursorDot.className = 'cursor-dot';
        cursorOutline.className = 'cursor-outline';
        document.body.appendChild(cursorDot);
        document.body.appendChild(cursorOutline);

        window.addEventListener('mousemove', (e) => {
            const posX = e.clientX;
            const posY = e.clientY;

            cursorDot.style.left = `${posX}px`;
            cursorDot.style.top = `${posY}px`;

            cursorOutline.animate({
                left: `${posX}px`,
                top: `${posY}px`
            }, { duration: 500, fill: "forwards" });
        });
    }

    // 2. Vanilla 3D Tilt Effect (Re-attachable)
    const tiltElements = document.querySelectorAll('.glass-panel-md, .card');

    tiltElements.forEach(el => {
        el.addEventListener('mousemove', (e) => {
            const rect = el.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            // Calculate rotation
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            const rotateX = ((y - centerY) / centerY) * -5; // Max 5deg
            const rotateY = ((x - centerX) / centerX) * 5;

            el.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
        });

        el.addEventListener('mouseleave', () => {
            el.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)';
        });
    });
}

// --- API Helper ---
async function apiCall(endpoint, method = 'GET', body = null) {
    // MOCK MODE: Intercept calls for local testing
    if (siteConfig.useMockApi) {
        console.log(`[MOCK API] ${method} ${endpoint}`, body);
        await new Promise(r => setTimeout(r, 500)); // Simulate latency

        if (endpoint === '/auth/google' || endpoint === '/auth/signup' || endpoint === '/auth/signin') {
            return {
                id: 'mock-user-123',
                name: 'Test Student',
                email: 'student@test.local',
                picture: 'https://ui-avatars.com/api/?name=Test+Student&background=random',
                subscription: 'free',
                token: 'mock-jwt-token'
            };
        }
        if (endpoint === '/verifyPayment') {
            return { success: true };
        }
        if (endpoint === '/tasks' && method === 'GET') {
            return [
                { _id: '1', text: 'Complete Math Worksheet', completed: false },
                { _id: '2', text: 'Read History Chapter 4', completed: true }
            ];
        }
        if (endpoint === '/tasks' && method === 'POST') {
            return { _id: Date.now().toString(), text: body.text, completed: false };
        }
        if (endpoint.startsWith('/tasks/')) {
            return { success: true };
        }
        return {};
    }

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

        // AUTO-FIX: Force guest completion
        if (user.id === 'guest') {
            sessionStorage.setItem('studyHubProfileCompleted', 'true');
            if (authStep2) authStep2.style.display = 'none';
        }
        const isProfileDone = sessionStorage.getItem('studyHubProfileCompleted');

        if (signinBtn) signinBtn.style.display = 'none';
        if (guestContainer) guestContainer.style.display = 'none';
        if (userProfile) userProfile.style.display = 'flex';
        if (userAvatar) userAvatar.src = user.picture;
        if (usernameText) usernameText.textContent = user.username || user.name;

        const upgradeBtn = document.getElementById('upgrade-btn');
        if (upgradeBtn) {
            if (user.subscription === 'premium') {
                upgradeBtn.style.display = 'none';
                if (usernameText) usernameText.innerHTML += ' <i class="fa-solid fa-check-circle" style="color: #ffd700; margin-left: 5px;" title="Premium Member"></i>';
            } else {
                upgradeBtn.style.display = 'block';
                // Attach payment handler
                upgradeBtn.onclick = () => startPayment(user);
            }
        }

        // Profile Completion Check
        if (!isProfileDone && user.id !== 'guest') {
            authStep2.style.display = 'flex';
        } else {
            authStep2.style.display = 'none';
        }
    } else {
        // Not Logged In
        if (signinBtn) signinBtn.style.display = 'block';
        if (guestContainer) guestContainer.style.display = 'block';
        if (userProfile) userProfile.style.display = 'none';
    }

    // Manual Auth Form
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
                data = await apiCall('/auth/signup', 'POST', { email, password, username });
            } else {
                data = await apiCall('/auth/signin', 'POST', { email, password });
            }

            localStorage.setItem('studyHubToken', data.token);
            if (data.user) {
                localStorage.setItem('studyHubUser', JSON.stringify(data.user));
            }

            sessionStorage.setItem('studyHubProfileCompleted', 'true');
            location.reload();

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

            // Immediately complete guest profile
            sessionStorage.setItem('studyHubProfileCompleted', 'true');
            location.reload();
        });
    }

    // Hide guest button if already logged in
    if (userSession && guestContainer) {
        guestContainer.style.display = 'none';
    }

    // Global callback for Google Sign-In
    window.handleCredentialResponse = async (response) => {
        try {
            const token = response.credential;
            localStorage.setItem('studyHubToken', token);
            const userProfile = await apiCall('/auth/google', 'POST', { credential: token });

            if (userProfile) {
                localStorage.setItem('studyHubUser', JSON.stringify(userProfile));
                sessionStorage.setItem('studyHubProfileCompleted', 'true');
                location.reload();
            }
        } catch (e) {
            console.error('Login failed', e);
            showToast('Login failed: ' + e.message, 'error');
            localStorage.removeItem('studyHubToken');
        }
    };
}

// Payment Helper Function
// Payment Helper Function
function startPayment(user) {
    // MOCK MODE: Bypass Paystack for local testing
    if (siteConfig.useMockApi) {
        showToast('Processing mock payment...', 'info');
        setTimeout(async () => {
            const result = await apiCall('/verifyPayment', 'POST', {
                reference: 'mock-ref-' + Date.now(),
                credential: localStorage.getItem('studyHubToken') || 'mock-jwt-token'
            });

            if (result && result.success) {
                showToast('Upgrade Successful! Refreshing...', 'success');
                const updatedUser = { ...user, subscription: 'premium' };
                localStorage.setItem('studyHubUser', JSON.stringify(updatedUser));
                location.reload();
            }
        }, 1500);
        return;
    }

    const paystack = new PaystackPop();
    paystack.newTransaction({
        key: siteConfig.paystackPublicKey,
        email: user.email,
        amount: 5000,
        currency: 'ZAR',
        ref: '' + Math.floor((Math.random() * 1000000000) + 1),
        onSuccess: async (transaction) => {
            showToast('Payment processing... Please wait.', 'info');
            try {
                const result = await apiCall('/verifyPayment', 'POST', {
                    reference: transaction.reference,
                    credential: localStorage.getItem('studyHubToken')
                });

                if (result && result.success) {
                    showToast('Upgrade Successful! Refreshing...', 'success');
                    const updatedUser = { ...user, subscription: 'premium' };
                    localStorage.setItem('studyHubUser', JSON.stringify(updatedUser));
                    location.reload();
                } else {
                    showToast('Verification failed: ' + (result?.error || 'Unknown error'), 'error');
                }
            } catch (e) {
                showToast('Verification error: ' + e.message, 'error');
            }
        },
        onCancel: () => {
            showToast('Transaction was cancelled.', 'info');
        }
    });
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

    // Re-initialize tilt for new cards
    initVisualEffects();
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
                showToast('Error adding task: ' + e.message, 'error');
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
