const rolePills = document.querySelectorAll('.role-pill');
const rolePanels = document.querySelectorAll('.role-panel');
const yearLabel = document.getElementById('year');
const loginForm = document.getElementById('login-form');
const loginFeedback = document.getElementById('login-feedback');
const roleAccess = document.getElementById('role-access');
const roleAccessTitle = document.getElementById('role-access-title');
const roleAccessDescription = document.getElementById('role-access-description');
const roleAccessActions = document.getElementById('role-access-actions');

const rolesContent = {
    dios: {
        title: 'Panel Modo Dios',
        description: 'Control total sobre la operación, configuración de permisos y reportes estratégicos.',
        actions: [
            'Gestiona catálogos, inventarios y reglas globales.',
            'Define permisos por departamento y asigna delegados.',
            'Aprueba cambios críticos y audita reportes ejecutivos.'
        ]
    },
    delegado: {
        title: 'Panel Delegado',
        description: 'Gestión táctica de equipos con KPIs y seguimiento detallado por departamento.',
        actions: [
            'Asigna tareas a empleados y controla el avance diario.',
            'Monitorea indicadores operativos y solicita recursos.',
            'Escala incidencias directamente al modo dios.'
        ]
    },
    empleado: {
        title: 'Panel Empleado',
        description: 'Herramientas de campo para ejecutar tareas y reportar resultados en tiempo real.',
        actions: [
            'Consulta la agenda diaria y confirma instalaciones completadas.',
            'Adjunta evidencias y checklists de cada servicio.',
            'Reporta incidencias al delegado con un clic.'
        ]
    }
};

const credentials = {
    admin: { password: 'admin', role: 'dios' },
    delegado: { password: 'delegado', role: 'delegado' },
    empleado: { password: 'empleado', role: 'empleado' }
};

const setActiveRole = (selectedRole) => {
    rolePills.forEach((btn) => {
        const isActive = btn.dataset.role === selectedRole;
        btn.classList.toggle('active', isActive);
        btn.setAttribute('aria-selected', String(isActive));
    });

    rolePanels.forEach((panel) => {
        const shouldShow = panel.id === `rol-${selectedRole}`;
        panel.classList.toggle('active', shouldShow);
        if (shouldShow) {
            panel.removeAttribute('hidden');
        } else {
            panel.setAttribute('hidden', 'hidden');
        }
    });
};

rolePills.forEach((pill) => {
    pill.addEventListener('click', () => {
        setActiveRole(pill.dataset.role);
    });
});

if (loginForm) {
    loginForm.addEventListener('submit', (event) => {
        event.preventDefault();

        const usernameInput = loginForm.username.value.trim().toLowerCase();
        const passwordInput = loginForm.password.value.trim();
        const user = credentials[usernameInput];

        loginFeedback.classList.remove('error', 'success');

        if (!user || user.password !== passwordInput) {
            loginFeedback.textContent = 'Credenciales incorrectas. Verifica usuario y contraseña.';
            loginFeedback.classList.add('error');
            roleAccess.setAttribute('hidden', 'hidden');
            roleAccessActions.innerHTML = '';
            roleAccessTitle.textContent = '';
            roleAccessDescription.textContent = '';
            return;
        }

        const { role } = user;
        const roleInfo = rolesContent[role];

        loginFeedback.textContent = 'Acceso concedido. Redirigiendo a tu panel asignado.';
        loginFeedback.classList.add('success');

        if (roleInfo) {
            roleAccessTitle.textContent = roleInfo.title;
            roleAccessDescription.textContent = roleInfo.description;
            roleAccessActions.innerHTML = roleInfo.actions
                .map((action) => `<li>${action}</li>`)
                .join('');
            roleAccess.removeAttribute('hidden');
        }

        setActiveRole(role);
    });
}

if (yearLabel) {
    yearLabel.textContent = new Date().getFullYear();
}
