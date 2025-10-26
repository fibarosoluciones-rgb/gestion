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
const profileLastLogin = document.getElementById('profile-last-login');
const profileForm = document.getElementById('profile-form');
const profileNameInput = document.getElementById('profile-name-input');
const profileEmailInput = document.getElementById('profile-email-input');
const profilePhoneInput = document.getElementById('profile-phone-input');
const profilePhotoInput = document.getElementById('profile-photo-input');
const profileCancelButton = document.getElementById('profile-cancel-button');
const profileAvatarImage = document.getElementById('profile-avatar');
const profileThumbnail = document.getElementById('profile-thumbnail');

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

const DEFAULT_AVATAR = 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=96&q=80';

const credentials = {
    admin: {
        password: 'admin',
        role: 'dios',
        name: 'Alexandra Rivera',
        email: 'alexandra.rivera@fibaro.com',
        phone: '+34 600 123 456',
        avatar: DEFAULT_AVATAR
    },
    delegado: {
        password: 'delegado',
        role: 'delegado',
        name: 'Marcos Pérez',
        email: 'marcos.perez@fibaro.com',
        phone: '+34 600 789 012',
        avatar: 'https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=crop&w=96&q=80'
    },
    empleado: {
        password: 'empleado',
        role: 'empleado',
        name: 'Lucía Gómez',
        email: 'lucia.gomez@fibaro.com',
        phone: '+34 600 456 789',
        avatar: 'https://images.unsplash.com/photo-1544723795-432537dcf0e1?auto=format&fit=crop&w=96&q=80'
    }
};

let currentUser = null;
let pendingAvatarData = null;

const updateAvatar = (source) => {
    const avatarSource = source || DEFAULT_AVATAR;

    if (profileAvatarImage) {
        profileAvatarImage.src = avatarSource;
    }

    if (profileThumbnail) {
        profileThumbnail.src = avatarSource;
    }
};

const closeProfilePanel = (reset = false) => {
    if (!profilePanel) {
        return;
    }

    const wasHidden = profilePanel.hasAttribute('hidden');

    if (!wasHidden) {
        profilePanel.setAttribute('hidden', 'hidden');
        profileButton?.setAttribute('aria-expanded', 'false');
    }

    if (reset && currentUser) {
        populateProfile(currentUser);
    }

    pendingAvatarData = null;
};

const openProfilePanel = () => {
    if (!profilePanel) {
        return;
    }

    populateProfile(currentUser);
    profilePanel.removeAttribute('hidden');
    profileButton?.setAttribute('aria-expanded', 'true');
    profileNameInput?.focus();
};

const toggleProfilePanel = () => {
    if (!profilePanel) {
        return;
    }

    if (profilePanel.hasAttribute('hidden')) {
        openProfilePanel();
    } else {
        closeProfilePanel(true);
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
    closeProfilePanel(true);
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
        closeProfilePanel(true);
        if (roleTitle) roleTitle.textContent = '';
        if (roleDescription) roleDescription.textContent = '';
        if (roleMenu) roleMenu.innerHTML = '';
    } else {
        godDashboard?.setAttribute('hidden', 'hidden');
        standardDashboard?.removeAttribute('hidden');
        if (roleTitle) roleTitle.textContent = roleInfo.title;
        if (roleDescription) roleDescription.textContent = roleInfo.description;
        if (roleMenu) roleMenu.innerHTML = roleInfo.menu.map((item) => `<li>${item}</li>`).join('');
        closeProfilePanel(true);
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

    if (profileNameInput) {
        profileNameInput.value = userData.name ?? '';
    }

    if (profileEmailInput) {
        profileEmailInput.value = userData.email ?? '';
    }

    if (profilePhoneInput) {
        profilePhoneInput.value = userData.phone ?? '';
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

    updateAvatar(userData.avatar);

    if (profilePhotoInput) {
        profilePhotoInput.value = '';
    }
};

const handleDocumentClick = (event) => {
    if (!profilePanel || profilePanel.hasAttribute('hidden')) {
        return;
    }

    const target = event.target;

    if (profilePanel.contains(target) || profileButton?.contains(target)) {
        return;
    }

    closeProfilePanel(true);
};

const handleEscapeKey = (event) => {
    if (event.key === 'Escape') {
        closeProfilePanel(true);
    }
};

const handlePhotoChange = (event) => {
    const input = event.target;

    if (!(input instanceof HTMLInputElement) || !input.files || input.files.length === 0) {
        pendingAvatarData = null;
        if (currentUser) {
            updateAvatar(currentUser.avatar);
        }
        return;
    }

    const [file] = input.files;

    if (!file) {
        return;
    }

    const reader = new FileReader();
    reader.addEventListener('load', () => {
        if (typeof reader.result === 'string') {
            pendingAvatarData = reader.result;
            updateAvatar(reader.result);
        }
    });
    reader.readAsDataURL(file);
};

const handleProfileSubmit = (event) => {
    event.preventDefault();

    if (!currentUser) {
        return;
    }

    const updatedUser = {
        ...currentUser,
        name: profileNameInput?.value.trim() || currentUser.name,
        email: profileEmailInput?.value.trim() || currentUser.email,
        phone: profilePhoneInput?.value.trim() || currentUser.phone,
        avatar: pendingAvatarData ?? currentUser.avatar
    };

    currentUser = updatedUser;
    sessionStorage.setItem('fibaroUser', JSON.stringify(updatedUser));
    populateProfile(updatedUser);
    pendingAvatarData = null;
    closeProfilePanel();
};

const handleProfileCancel = () => {
    closeProfilePanel(true);
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

    const credentialDefaults = userData?.username ? credentials[userData.username] : undefined;

    currentUser = {
        username: userData.username,
        role: userData.role ?? credentialDefaults?.role ?? '',
        name: userData.name ?? credentialDefaults?.name ?? '',
        email: userData.email ?? credentialDefaults?.email ?? '',
        phone: userData.phone ?? credentialDefaults?.phone ?? '',
        avatar: userData.avatar ?? credentialDefaults?.avatar ?? DEFAULT_AVATAR,
        lastLogin: userData.lastLogin ?? ''
    };

    sessionStorage.setItem('fibaroUser', JSON.stringify(currentUser));

    renderRoleDashboard(currentUser.role);
    populateProfile(currentUser);

    if (logoutButton) {
        logoutButton.addEventListener('click', () => {
            sessionStorage.removeItem('fibaroUser');
            window.location.replace('index.html');
        });
    }

    if (profileButton) {
        profileButton.addEventListener('click', toggleProfilePanel);
    }

    if (profileForm) {
        profileForm.addEventListener('submit', handleProfileSubmit);
    }

    if (profileCancelButton) {
        profileCancelButton.addEventListener('click', handleProfileCancel);
    }

    if (profilePhotoInput) {
        profilePhotoInput.addEventListener('change', handlePhotoChange);
    }

    document.addEventListener('click', handleDocumentClick);
    document.addEventListener('keydown', handleEscapeKey);

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
            phone: user.phone,
            avatar: user.avatar,
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
