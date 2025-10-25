const loginForm = document.getElementById('login-form');
const loginCard = document.getElementById('login-card');
const loginFeedback = document.getElementById('login-feedback');
const roleDashboard = document.getElementById('role-dashboard');
const roleTitle = document.getElementById('role-title');
const roleDescription = document.getElementById('role-description');
const roleMenu = document.getElementById('role-menu');
const logoutButton = document.getElementById('logout-button');

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

const credentials = {
    admin: { password: 'admin', role: 'dios' },
    delegado: { password: 'delegado', role: 'delegado' },
    empleado: { password: 'empleado', role: 'empleado' }
};

const renderRoleDashboard = (roleKey) => {
    const roleInfo = rolesContent[roleKey];

    if (!roleInfo) {
        return;
    }

    roleTitle.textContent = roleInfo.title;
    roleDescription.textContent = roleInfo.description;
    roleMenu.innerHTML = roleInfo.menu.map((item) => `<li>${item}</li>`).join('');

    loginCard.setAttribute('hidden', 'hidden');
    roleDashboard.removeAttribute('hidden');

    if (logoutButton) {
        logoutButton.focus();
    }
};

const resetToLogin = () => {
    if (!loginForm) {
        return;
    }

    loginForm.reset();
    loginFeedback.textContent = '';
    loginFeedback.classList.remove('error');
    roleTitle.textContent = '';
    roleDescription.textContent = '';
    roleMenu.innerHTML = '';
    roleDashboard.setAttribute('hidden', 'hidden');
    loginCard.removeAttribute('hidden');
    loginForm.username.focus();
};

if (loginForm) {
    loginForm.addEventListener('submit', (event) => {
        event.preventDefault();

        const username = loginForm.username.value.trim().toLowerCase();
        const password = loginForm.password.value.trim();
        const user = credentials[username];

        loginFeedback.classList.remove('error');

        if (!user || user.password !== password) {
            loginFeedback.textContent = 'Credenciales incorrectas. Inténtalo nuevamente.';
            loginFeedback.classList.add('error');
            loginForm.password.focus();
            return;
        }

        loginFeedback.textContent = '';
        renderRoleDashboard(user.role);
    });
}

if (logoutButton) {
    logoutButton.addEventListener('click', () => {
        resetToLogin();
    });
}

window.addEventListener('DOMContentLoaded', () => {
    if (loginForm) {
        loginForm.username.focus();
    }
});
