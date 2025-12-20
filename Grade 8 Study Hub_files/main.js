// Initialize Dashboard
document.addEventListener('DOMContentLoaded', () => {
    initThemes();
    renderContent();
    startClock();
    showMotivation();
    initNavigation();
    initTools();
});

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
