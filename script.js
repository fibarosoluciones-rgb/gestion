const SESSION_KEY = 'fibaroKidUser';
const PROGRESS_KEY = 'fibaroKidProgress';

const kidAccounts = {
    luna: {
        password: '1234',
        name: 'Luna',
        role: 'Capitana de Ventas',
        favoriteDepartment: 'ventas'
    },
    rio: {
        password: '4567',
        name: 'Río',
        role: 'Guardián de Atención',
        favoriteDepartment: 'soporte'
    },
    sol: {
        password: '7890',
        name: 'Sol',
        role: 'Inventor de Almacén',
        favoriteDepartment: 'almacen'
    }
};

const departmentSections = [
    {
        id: 'home',
        label: 'Inicio',
        icon: '🏠',
        build: (section, user) => {
            section.innerHTML = `
                <header>
                    <h1>Bienvenido al panel mágico</h1>
                    <p class="kid-intro">
                        Aquí puedes cuidar cada rincón de Fíbaro Kids. Usa la barra de la izquierda para saltar entre los departamentos.
                        Lee cada tarjeta, completa tus misiones y deja todo listo para el equipo.
                    </p>
                </header>
                <div class="kid-cards">
                    <article class="kid-card" data-theme="yellow">
                        <div class="kid-card-title"><span>✨</span>Explora paso a paso</div>
                        <p>Elige un departamento y sigue sus historias. Cada apartado tiene poquitos datos para que sea fácil de entender.</p>
                    </article>
                    <article class="kid-card" data-theme="pink">
                        <div class="kid-card-title"><span>📝</span>Tus misiones</div>
                        <p>Marca las tareas cuando las completes. ¡Verás la barra de progreso subir como por arte de magia!</p>
                    </article>
                    <article class="kid-card" data-theme="green">
                        <div class="kid-card-title"><span>💡</span>Consejos rápidos</div>
                        <p>Si algo no te queda claro, pide ayuda a un adulto. Compartir dudas también es parte de aprender.</p>
                    </article>
                </div>
            `;

            if (user?.favoriteDepartment) {
                const favoriteButton = document.querySelector(`[data-section="${user.favoriteDepartment}"]`);
                if (favoriteButton) {
                    favoriteButton.setAttribute('aria-describedby', 'home-favorite-note');
                    const note = document.createElement('p');
                    note.id = 'home-favorite-note';
                    note.className = 'kid-intro';
                    note.textContent = `¿No sabes por dónde empezar? Visita primero ${favoriteButton.textContent.trim()}. ¡Es tu zona especial!`;
                    section.appendChild(note);
                }
            }
        }
    },
    {
        id: 'ventas',
        label: 'Ventas felices',
        icon: '🛍️',
        theme: 'yellow',
        story: 'En ventas contamos historias que convencen a las familias para elegirnos.',
        numbers: [
            { label: 'Sonrisas logradas hoy', value: '12' },
            { label: 'Llamadas pendientes', value: '3' },
            { label: 'Pedidos listos', value: '5' }
        ],
        tasks: [
            'Revisar la lista de clientes curiosos',
            'Contar una historia del producto estrella',
            'Enviar un gracias gigante por el último pedido'
        ],
        tip: 'Sonríe al hablar y usa palabras sencillas. A todos nos gusta entender rápido.',
        build: buildDepartmentSection
    },
    {
        id: 'soporte',
        label: 'Atención amable',
        icon: '🤝',
        theme: 'pink',
        story: 'Aquí respondemos dudas y cuidamos que cada persona se sienta escuchada.',
        numbers: [
            { label: 'Preguntas contestadas', value: '8' },
            { label: 'Mensajes por responder', value: '2' },
            { label: 'Caritas felices', value: '10' }
        ],
        tasks: [
            'Leer el buzón de mensajes bonitos',
            'Responder una duda con un dibujo',
            'Anotar una idea para mejorar el saludo'
        ],
        tip: 'Escucha con calma y repite la respuesta con tus propias palabras para asegurarte de que se entienda.',
        build: buildDepartmentSection
    },
    {
        id: 'almacen',
        label: 'Almacén ordenado',
        icon: '📦',
        theme: 'green',
        story: 'Guardamos los materiales mágicos en estantes bien señalados y coloridos.',
        numbers: [
            { label: 'Cajas revisadas', value: '7' },
            { label: 'Etiquetas nuevas', value: '4' },
            { label: 'Pedidos en camino', value: '3' }
        ],
        tasks: [
            'Contar las cajas amarillas',
            'Colocar pegatinas a tres cajas',
            'Preparar un carrito para la entrega'
        ],
        tip: 'Ordena de mayor a menor tamaño. Así es más fácil encontrar todo sin preguntar.',
        build: buildDepartmentSection
    },
    {
        id: 'creativos',
        label: 'Ideas brillantes',
        icon: '🎨',
        theme: 'purple',
        story: 'El laboratorio creativo inventa campañas, dibujos y sonidos para sorprender.',
        numbers: [
            { label: 'Bocetos listos', value: '6' },
            { label: 'Canciones creadas', value: '2' },
            { label: 'Presentaciones preparadas', value: '1' }
        ],
        tasks: [
            'Elegir una paleta de colores divertida',
            'Grabar un saludo de 10 segundos',
            'Mostrar tu boceto favorito al equipo'
        ],
        tip: 'No borres tus ideas rápidas, muchas veces son las que más sorprenden a todos.',
        build: buildDepartmentSection
    }
];

function readSession() {
    if (typeof sessionStorage === 'undefined') {
        return undefined;
    }

    try {
        const stored = sessionStorage.getItem(SESSION_KEY);
        return stored ? JSON.parse(stored) : undefined;
    } catch (error) {
        return undefined;
    }
}

function writeSession(user) {
    if (typeof sessionStorage === 'undefined') {
        return;
    }

    try {
        if (!user) {
            sessionStorage.removeItem(SESSION_KEY);
        } else {
            sessionStorage.setItem(SESSION_KEY, JSON.stringify(user));
        }
    } catch (error) {
        // ignore
    }
}

function readProgress(username) {
    if (typeof localStorage === 'undefined' || !username) {
        return {};
    }

    try {
        const stored = localStorage.getItem(PROGRESS_KEY);
        if (!stored) {
            return {};
        }

        const parsed = JSON.parse(stored);
        return parsed?.[username] ?? {};
    } catch (error) {
        return {};
    }
}

function writeProgress(username, progress) {
    if (typeof localStorage === 'undefined' || !username) {
        return;
    }

    try {
        const stored = localStorage.getItem(PROGRESS_KEY);
        const parsed = stored ? JSON.parse(stored) : {};
        parsed[username] = progress;
        localStorage.setItem(PROGRESS_KEY, JSON.stringify(parsed));
    } catch (error) {
        // ignore write errors
    }
}

function handleLogin(event) {
    event.preventDefault();
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const feedback = document.getElementById('login-feedback');

    if (!usernameInput || !passwordInput || !feedback) {
        return;
    }

    const username = usernameInput.value.trim().toLowerCase();
    const password = passwordInput.value.trim();

    if (!username || !password) {
        feedback.textContent = 'Necesitas escribir nombre y clave secreta.';
        feedback.classList.add('is-error');
        return;
    }

    const account = kidAccounts[username];

    if (!account || account.password !== password) {
        feedback.textContent = 'Ups, esos datos no coinciden. Inténtalo de nuevo.';
        feedback.classList.add('is-error');
        return;
    }

    feedback.classList.remove('is-error');
    feedback.textContent = '¡Listo! Entrando al panel...';
    writeSession({ username, ...account });
    window.location.href = 'dashboard.html';
}

function buildDepartmentSection(section, user, config) {
    const progress = readProgress(user?.username);
    const departmentProgress = progress[config.id] ?? { tasksDone: [] };
    const completed = new Set(departmentProgress.tasksDone ?? []);

    section.innerHTML = '';

    const header = document.createElement('header');
    header.innerHTML = `
        <h1>${config.icon} ${config.label}</h1>
        <p class="kid-intro">${config.story}</p>
    `;

    section.appendChild(header);

    const cards = document.createElement('div');
    cards.className = 'kid-cards';

    const numbersCard = document.createElement('article');
    numbersCard.className = 'kid-card';
    numbersCard.dataset.theme = config.theme ?? 'yellow';
    numbersCard.innerHTML = `
        <div class="kid-card-title"><span>📊</span>Datos brillantes</div>
        <ul class="kid-list">
            ${config.numbers
                .map((item) => `<li>${item.value} — ${item.label}</li>`)
                .join('')}
        </ul>
    `;

    const tipCard = document.createElement('article');
    tipCard.className = 'kid-card';
    tipCard.dataset.theme = config.theme ?? 'yellow';
    tipCard.innerHTML = `
        <div class="kid-card-title"><span>💬</span>Consejo rápido</div>
        <p>${config.tip}</p>
    `;

    cards.append(numbersCard, tipCard);
    section.appendChild(cards);

    const tasksWrapper = document.createElement('article');
    tasksWrapper.className = 'kid-progress';
    tasksWrapper.innerHTML = `
        <h2>Misiones del día</h2>
        <ul class="kid-list" role="list"></ul>
        <div class="kid-progress-bar"><div class="kid-progress-fill"></div></div>
        <p class="kid-intro" data-progress-text></p>
    `;

    const list = tasksWrapper.querySelector('ul');
    const progressFill = tasksWrapper.querySelector('.kid-progress-fill');
    const progressText = tasksWrapper.querySelector('[data-progress-text]');

    config.tasks.forEach((task, index) => {
        const item = document.createElement('li');
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = `${config.id}-task-${index}`;
        checkbox.checked = completed.has(index);
        checkbox.dataset.taskIndex = String(index);

        const label = document.createElement('label');
        label.setAttribute('for', checkbox.id);
        label.textContent = task;

        item.append(checkbox, label);
        list?.appendChild(item);
    });

    const updateProgress = () => {
        const totalTasks = config.tasks.length;
        const done = section.querySelectorAll('input[type="checkbox"]:checked').length;
        const percentage = totalTasks === 0 ? 0 : Math.round((done / totalTasks) * 100);
        if (progressFill) {
            progressFill.style.width = `${percentage}%`;
        }
        if (progressText) {
            progressText.textContent = `Completaste ${done} de ${totalTasks} misiones. ¡${percentage}% listo!`;
        }
    };

    list?.addEventListener('change', (event) => {
        const target = event.target;
        if (!(target instanceof HTMLInputElement) || !target.dataset.taskIndex) {
            return;
        }

        if (!user?.username) {
            return;
        }

        const index = Number(target.dataset.taskIndex);
        const next = readProgress(user.username);
        const department = next[config.id] ?? { tasksDone: [] };
        const tasksDone = new Set(department.tasksDone ?? []);

        if (target.checked) {
            tasksDone.add(index);
        } else {
            tasksDone.delete(index);
        }

        department.tasksDone = Array.from(tasksDone.values()).sort((a, b) => a - b);
        next[config.id] = department;
        writeProgress(user.username, next);
        updateProgress();
    });

    updateProgress();
    section.appendChild(tasksWrapper);
}

function renderMenu(menu, sections, user) {
    menu.innerHTML = '';

    sections.forEach((config, index) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.dataset.section = config.id;
        button.innerHTML = `<span class="kid-menu-icon">${config.icon}</span>${config.label}`;
        button.setAttribute('role', 'tab');
        button.setAttribute('aria-selected', String(index === 0));
        menu.appendChild(button);
    });

    menu.addEventListener('click', (event) => {
        const target = event.target;
        if (!(target instanceof HTMLElement)) {
            return;
        }

        const button = target.closest('button[data-section]');
        if (!(button instanceof HTMLButtonElement)) {
            return;
        }

        const sectionId = button.dataset.section;
        switchSection(sectionId, sections, user);
    });
}

function switchSection(sectionId, sections, user) {
    const menuButtons = document.querySelectorAll('[data-section]');
    menuButtons.forEach((button) => {
        button.setAttribute('aria-selected', String(button.dataset.section === sectionId));
    });

    sections.forEach((config) => {
        let section = document.getElementById(`section-${config.id}`);
        if (!section) {
            section = document.createElement('section');
            section.id = `section-${config.id}`;
            section.className = 'kid-section';
            document.getElementById('kid-main')?.appendChild(section);
        }

        if (config.id === sectionId) {
            section.classList.add('is-active');
            if (!section.dataset.rendered) {
                config.build(section, user, config);
                section.dataset.rendered = 'true';
            }
        } else {
            section.classList.remove('is-active');
        }
    });
}

function setupDashboard() {
    const storedUser = readSession();
    const main = document.getElementById('kid-main');
    const menu = document.getElementById('kid-menu');
    const missingSection = document.getElementById('missing-user');
    const logoutButton = document.getElementById('logout-button');
    const userCard = document.getElementById('kid-user-card');
    const userName = document.getElementById('kid-user-name');
    const userRole = document.getElementById('kid-user-role');

    if (!main || !menu || !missingSection || !logoutButton) {
        return;
    }

    if (!storedUser) {
        missingSection.classList.add('is-active');
        return;
    }

    missingSection.classList.remove('is-active');

    if (userCard && userName && userRole) {
        userName.textContent = storedUser.name;
        userRole.textContent = storedUser.role;
        userCard.hidden = false;
    }

    renderMenu(menu, departmentSections, storedUser);
    switchSection('home', departmentSections, storedUser);

    logoutButton.addEventListener('click', () => {
        writeSession(undefined);
        window.location.href = 'index.html';
    });
}

function init() {
    const loginForm = document.getElementById('login-form');
    const app = document.querySelector('[data-kid-app]');

    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    if (app) {
        setupDashboard();
    }
}

document.addEventListener('DOMContentLoaded', init);
