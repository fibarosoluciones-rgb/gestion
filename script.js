const loginForm = document.getElementById('login-form');
const loginFeedback = document.getElementById('login-feedback');
const roleDashboard = document.getElementById('role-dashboard');
const authLayout = document.querySelector('.auth-layout');
const pageBody = document.body;
const roleTitle = document.getElementById('role-title');
const roleDescription = document.getElementById('role-description');
const roleMenu = document.getElementById('role-menu');
const logoutButton = document.getElementById('logout-button');
const godDashboard = document.getElementById('god-dashboard');
const standardDashboard = document.getElementById('standard-dashboard');
const departmentTabs = document.getElementById('department-tabs');
const departmentPanel = document.getElementById('department-panel');
const profileButton = document.getElementById('profile-button');
const profilePanel = document.getElementById('profile-panel');
const profileRole = document.getElementById('profile-role');
const profileName = document.getElementById('profile-name');
const profileEmail = document.getElementById('profile-email');
const profileLastLogin = document.getElementById('profile-last-login');

const rolesContent = {
    dios: {
        title: 'Modo Dios',
        description: 'Accede a la configuración completa de la plataforma y supervisa todos los departamentos.',
        menu: [
            'Dashboard general',
            'Gestión de roles y permisos',
            'Reportes estratégicos',
            'Configuración de procesos'
        ]
    },
    delegado: {
        title: 'Delegado',
        description: 'Gestiona tu departamento, asigna tareas y da seguimiento a la operación diaria.',
        menu: [
            'Panel del departamento',
            'Agenda del equipo',
            'Solicitudes de recursos',
            'Indicadores operativos'
        ]
    },
    empleado: {
        title: 'Empleado',
        description: 'Consulta tus pendientes del día, reporta avances y mantén informado a tu delegado.',
        menu: [
            'Mis tareas',
            'Registro de instalaciones',
            'Reportar incidencias',
            'Materiales asignados'
        ]
    }
};

const departmentContent = {
    flota: {
        name: 'Flota',
        summary: 'Controla la disponibilidad y el estado de los vehículos asignados a los equipos de campo.',
        metrics: [
            '35 vehículos activos',
            '4 en mantenimiento programado',
            'Cobertura del 98% para rutas críticas'
        ],
        notes: 'Las unidades eléctricas se encuentran al 85% de su capacidad. Programar revisiones para la semana próxima.'
    },
    almacen: {
        name: 'Almacén',
        summary: 'Supervisa inventario, pedidos y movimientos críticos de materiales.',
        metrics: [
            'Inventario disponible: 1,248 unidades',
            '14 órdenes pendientes de despacho',
            'Tiempo medio de preparación: 3h 12m'
        ],
        notes: 'Se recomienda realizar un inventario físico parcial en la zona de cableado de cobre.'
    },
    gestion: {
        name: 'Gestión',
        summary: 'Visualiza la coordinación general de proyectos y la carga de trabajo de los equipos.',
        metrics: [
            '12 proyectos activos',
            'Satisfacción del cliente: 92%',
            '5 alertas de prioridad media en seguimiento'
        ],
        notes: 'El lanzamiento del proyecto Aurora requiere confirmación de presupuesto antes del viernes.'
    },
    contabilidad: {
        name: 'Contabilidad',
        summary: 'Controla flujos de caja, facturación y cumplimiento de obligaciones fiscales.',
        metrics: [
            'Facturación del mes: 184.200 €',
            'Cobros pendientes: 36.450 €',
            'Cumplimiento fiscal: 100%'
        ],
        notes: 'Revisar las facturas de proveedores externos antes de su aprobación final.'
    },
    empleados: {
        name: 'Empleados',
        summary: 'Gestiona altas, bajas, formación interna y seguimiento de desempeño.',
        metrics: [
            'Plantilla total: 78 personas',
            '3 incorporaciones en proceso',
            'Horas de formación mensual promedio: 6.5'
        ],
        notes: 'Se planifica una sesión de capacitación en seguridad para la próxima semana.'
    }
};

const credentials = {
    admin: {
        password: 'admin',
        role: 'dios',
        name: 'Alexandra Rivera',
        email: 'alexandra.rivera@fibaro.com'
    },
    delegado: {
        password: 'delegado',
        role: 'delegado',
        name: 'Marcos Pérez',
        email: 'marcos.perez@fibaro.com'
    },
    empleado: {
        password: 'empleado',
        role: 'empleado',
        name: 'Lucía Gómez',
        email: 'lucia.gomez@fibaro.com'
    }
};

const renderDepartment = (departmentKey) => {
    if (!departmentPanel) {
        return;
    }

    const info = departmentContent[departmentKey];

    if (!info) {
        departmentPanel.innerHTML = '';
        return;
    }

    departmentPanel.innerHTML = `
        <div class="department-header">
            <h2>${info.name}</h2>
            <p>${info.summary}</p>
        </div>
        <ul class="department-metrics">
            ${info.metrics.map((metric) => `<li>${metric}</li>`).join('')}
        </ul>
        <p class="department-notes">${info.notes}</p>
    `;
};

const buildDepartmentTabs = () => {
    if (!departmentTabs) {
        return;
    }

    const entries = Object.entries(departmentContent);
    departmentTabs.innerHTML = entries
        .map(([key, value], index) => `
            <button type="button" role="tab" data-department="${key}" aria-selected="${index === 0}">
                ${value.name.toUpperCase()}
            </button>
        `)
        .join('');

    const firstDepartment = entries[0]?.[0];
    if (firstDepartment) {
        renderDepartment(firstDepartment);
    }
};

const handleDepartmentClick = (event) => {
    const target = event.target;

    if (!(target instanceof HTMLButtonElement) || !target.dataset.department) {
        return;
    }

    const buttons = departmentTabs?.querySelectorAll('button') ?? [];
    buttons.forEach((button) => {
        button.setAttribute('aria-selected', String(button === target));
    });

    renderDepartment(target.dataset.department);
    profilePanel?.setAttribute('hidden', 'hidden');
};

const renderRoleDashboard = (roleKey) => {
    const roleInfo = rolesContent[roleKey];

    if (!roleInfo) {
        return;
    }

    if (roleKey === 'dios') {
        standardDashboard?.setAttribute('hidden', 'hidden');
        godDashboard?.removeAttribute('hidden');
        buildDepartmentTabs();
        profilePanel?.setAttribute('hidden', 'hidden');
        if (roleTitle) roleTitle.textContent = '';
        if (roleDescription) roleDescription.textContent = '';
        if (roleMenu) roleMenu.innerHTML = '';
    } else {
        godDashboard?.setAttribute('hidden', 'hidden');
        standardDashboard?.removeAttribute('hidden');
        if (roleTitle) roleTitle.textContent = roleInfo.title;
        if (roleDescription) roleDescription.textContent = roleInfo.description;
        if (roleMenu) roleMenu.innerHTML = roleInfo.menu.map((item) => `<li>${item}</li>`).join('');
        profilePanel?.setAttribute('hidden', 'hidden');
    }

    roleDashboard?.removeAttribute('hidden');
    authLayout?.classList.add('dashboard-active');
    pageBody?.classList.add('dashboard-mode');
};

const populateProfile = (userData) => {
    if (!userData) {
        return;
    }

    if (profileRole) {
        profileRole.textContent = rolesContent[userData.role]?.title ?? '';
    }

    if (profileName) {
        profileName.textContent = userData.name;
    }

    if (profileEmail) {
        profileEmail.textContent = userData.email;
    }

    if (profileLastLogin) {
        const formatted = userData.lastLogin
            ? new Date(userData.lastLogin).toLocaleString('es-ES', {
                  dateStyle: 'short',
                  timeStyle: 'short'
              })
            : '';
        profileLastLogin.textContent = formatted;
    }
};

const initializeDashboard = () => {
    const storedUser = sessionStorage.getItem('fibaroUser');

    if (!storedUser) {
        window.location.replace('index.html');
        return;
    }

    let userData;

    try {
        userData = JSON.parse(storedUser);
    } catch (error) {
        sessionStorage.removeItem('fibaroUser');
        window.location.replace('index.html');
        return;
    }

    renderRoleDashboard(userData.role);
    populateProfile(userData);

    if (logoutButton) {
        logoutButton.addEventListener('click', () => {
            sessionStorage.removeItem('fibaroUser');
            window.location.replace('index.html');
        });
    }

    if (profileButton) {
        profileButton.addEventListener('click', () => {
            if (!profilePanel) {
                return;
            }

            const isHidden = profilePanel.hasAttribute('hidden');
            if (isHidden) {
                profilePanel.removeAttribute('hidden');
                profilePanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
            } else {
                profilePanel.setAttribute('hidden', 'hidden');
            }
        });
    }

    if (departmentTabs) {
        departmentTabs.addEventListener('click', handleDepartmentClick);
    }
};

if (loginForm) {
    const existingSession = sessionStorage.getItem('fibaroUser');

    if (existingSession) {
        try {
            const parsedSession = JSON.parse(existingSession);
            if (parsedSession?.role) {
                window.location.replace('dashboard.html');
            }
        } catch (error) {
            sessionStorage.removeItem('fibaroUser');
        }
    }

    loginForm.addEventListener('submit', (event) => {
        event.preventDefault();

        const username = loginForm.username.value.trim().toLowerCase();
        const password = loginForm.password.value.trim();
        const user = credentials[username];

        loginFeedback?.classList.remove('error');

        if (!user || user.password !== password) {
            if (loginFeedback) {
                loginFeedback.textContent = 'Credenciales incorrectas. Inténtalo nuevamente.';
                loginFeedback.classList.add('error');
            }
            loginForm.password.focus();
            return;
        }

        const loginData = {
            username,
            role: user.role,
            name: user.name,
            email: user.email,
            lastLogin: new Date().toISOString()
        };

        sessionStorage.setItem('fibaroUser', JSON.stringify(loginData));

        if (loginFeedback) {
            loginFeedback.textContent = '';
        }

        window.location.href = 'dashboard.html';
    });

    window.addEventListener('DOMContentLoaded', () => {
        loginForm.username.focus();
    });
}

if (roleDashboard) {
    initializeDashboard();
}
