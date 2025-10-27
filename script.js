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
const profilePhone = document.getElementById('profile-phone');
const profileAvatarImage = document.getElementById('profile-avatar-image');
const profileButtonImage = document.getElementById('profile-button-image');
const profileDataView = document.getElementById('profile-data-view');
const profileEditForm = document.getElementById('profile-edit-form');
const profileNameInput = document.getElementById('profile-name-input');
const profileEmailInput = document.getElementById('profile-email-input');
const profilePhoneInput = document.getElementById('profile-phone-input');
const profileLastLoginStatic = document.getElementById('profile-last-login-static');
const profileCurrentPasswordInput = document.getElementById('profile-current-password-input');
const profileNewPasswordInput = document.getElementById('profile-new-password-input');
const profileConfirmPasswordInput = document.getElementById('profile-confirm-password-input');
const profilePasswordFeedback = document.getElementById('profile-password-feedback');
const editProfileButton = document.getElementById('edit-profile-button');
const cancelEditButton = document.getElementById('cancel-edit-button');
const avatarInput = document.getElementById('avatar-input');
const avatarDropzone = document.getElementById('avatar-dropzone');
const avatarSelectButton = document.getElementById('avatar-select-button');
const godViewSwitch = document.getElementById('god-view-switch');
const godDepartmentView = document.getElementById('god-department-view');
const userManagementPanel = document.getElementById('user-management-panel');
const userList = document.getElementById('user-list');
const toggleCreateUserButton = document.getElementById('toggle-create-user');
const createUserForm = document.getElementById('create-user-form');
const cancelCreateUserButton = document.getElementById('cancel-create-user');
const userManagementFeedback = document.getElementById('user-management-feedback');

const defaultAvatar =
    'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=256&q=80';

const CREDENTIAL_OVERRIDES_KEY = 'fibaroCredentialOverrides';

let activeUser = null;
let activeGodView = 'departments';

const escapeHtml = (value) => {
    if (value === undefined || value === null) {
        return '';
    }

    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
};

const escapeAttribute = (value) => escapeHtml(value).replace(/\n/g, '&#10;');

const readCredentialOverrides = () => {
    if (typeof localStorage === 'undefined') {
        return {};
    }

    try {
        const stored = localStorage.getItem(CREDENTIAL_OVERRIDES_KEY);
        return stored ? JSON.parse(stored) : {};
    } catch (error) {
        return {};
    }
};

const writeCredentialOverrides = (overrides) => {
    if (typeof localStorage === 'undefined') {
        return;
    }

    try {
        localStorage.setItem(CREDENTIAL_OVERRIDES_KEY, JSON.stringify(overrides));
    } catch (error) {
        /* ignore write errors */
    }
};

const removeCredentialOverride = (username) => {
    if (!username) {
        return;
    }

    const overrides = readCredentialOverrides();

    if (overrides[username]) {
        delete overrides[username];
        writeCredentialOverrides(overrides);
    }
};

const getMergedCredential = (username) => {
    if (!username) {
        return undefined;
    }

    const baseCredential = credentials[username];
    const overrides = readCredentialOverrides();
    const overrideData = overrides[username];

    if (overrideData?.disabled) {
        return undefined;
    }

    if (!baseCredential) {
        return overrideData ? { ...overrideData } : undefined;
    }

    return overrideData ? { ...baseCredential, ...overrideData } : { ...baseCredential };
};

const getAllManagedUsers = () => {
    const overrides = readCredentialOverrides();
    const combined = new Map();

    Object.entries(credentials).forEach(([username, data]) => {
        combined.set(username, { username, ...data });
    });

    Object.entries(overrides).forEach(([username, data]) => {
        if (data?.disabled) {
            combined.delete(username);
            return;
        }

        const existing = combined.get(username);

        if (existing) {
            combined.set(username, { ...existing, ...data, username });
        } else {
            combined.set(username, { username, ...data });
        }
    });

    return Array.from(combined.values()).sort((a, b) => a.username.localeCompare(b.username));
};

const persistCredentialOverride = (username, updates) => {
    if (!username || !updates) {
        return;
    }

    const overrides = readCredentialOverrides();
    overrides[username] = {
        ...(overrides[username] ?? {}),
        ...updates
    };
    writeCredentialOverrides(overrides);
};

const persistCurrentUserOverride = (updates) => {
    if (!activeUser?.username || !updates) {
        return;
    }

    persistCredentialOverride(activeUser.username, updates);
};

const showUserManagementFeedback = (message, isError = false) => {
    if (!userManagementFeedback) {
        return;
    }

    userManagementFeedback.textContent = message ?? '';
    const hasMessage = Boolean(message);
    userManagementFeedback.classList.toggle('error', hasMessage && isError);
    userManagementFeedback.classList.toggle('success', hasMessage && !isError);
};

const toggleCreateUserForm = (shouldShow) => {
    if (!createUserForm) {
        return;
    }

    const show = typeof shouldShow === 'boolean' ? shouldShow : createUserForm.hasAttribute('hidden');

    if (show) {
        createUserForm.removeAttribute('hidden');
        showUserManagementFeedback('');
        if (toggleCreateUserButton) {
            toggleCreateUserButton.textContent = 'Ocultar formulario';
        }
        const firstField = createUserForm.querySelector('input, select');
        if (firstField instanceof HTMLElement) {
            firstField.focus();
        }
    } else {
        createUserForm.reset();
        createUserForm.setAttribute('hidden', 'hidden');
        showUserManagementFeedback('');
        if (toggleCreateUserButton) {
            toggleCreateUserButton.textContent = 'Nuevo usuario';
        }
    }
};

const setGodView = (viewKey) => {
    const normalizedView = viewKey === 'users' ? 'users' : 'departments';
    activeGodView = normalizedView;

    if (godViewSwitch) {
        const buttons = godViewSwitch.querySelectorAll('button[data-view]');
        buttons.forEach((button) => {
            const isActive = button.dataset.view === normalizedView;
            button.setAttribute('aria-selected', String(isActive));
        });
    }

    if (normalizedView === 'users') {
        godDepartmentView?.setAttribute('hidden', 'hidden');
        userManagementPanel?.removeAttribute('hidden');
        renderUserList();
    } else {
        userManagementPanel?.setAttribute('hidden', 'hidden');
        godDepartmentView?.removeAttribute('hidden');
        toggleCreateUserForm(false);
        showUserManagementFeedback('');
    }
};

const buildRoleOptions = (selectedRole) =>
    Object.entries(rolesContent)
        .map(([roleKey, info]) => {
            const isSelected = roleKey === selectedRole;
            return `<option value="${roleKey}"${isSelected ? ' selected' : ''}>${escapeHtml(info.title)}</option>`;
        })
        .join('');

const renderUserList = () => {
    if (!userList) {
        return;
    }

    const users = getAllManagedUsers();

    if (!users.length) {
        userList.innerHTML = '<p class="user-empty-state">Aún no hay usuarios configurados.</p>';
        return;
    }

    userList.innerHTML = users
        .map((user) => {
            const displayName = user.name || 'Sin nombre asignado';
            const roleTitle = rolesContent[user.role]?.title ?? user.role;
            const roleOptions = buildRoleOptions(user.role);
            const isSelf = activeUser?.username === user.username;
            const deleteAttributes = isSelf ? ' disabled aria-disabled="true"' : '';

            return `
                <article class="user-card" data-username="${escapeAttribute(user.username)}" role="listitem">
                    <header class="user-card-header">
                        <h3>${escapeHtml(displayName)}</h3>
                        <span class="user-role-chip">${escapeHtml(roleTitle)}</span>
                    </header>
                    <p class="user-card-username">@${escapeHtml(user.username)}</p>
                    <div class="user-card-grid">
                        <label class="form-field">
                            <span>Nombre</span>
                            <input type="text" data-field="name" value="${escapeAttribute(user.name ?? '')}" placeholder="Nombre completo">
                        </label>
                        <label class="form-field">
                            <span>Correo</span>
                            <input type="email" data-field="email" value="${escapeAttribute(user.email ?? '')}" placeholder="usuario@fibaro.com">
                        </label>
                        <label class="form-field">
                            <span>Rol</span>
                            <select data-field="role">
                                ${roleOptions}
                            </select>
                        </label>
                    </div>
                    <div class="user-card-actions">
                        <button type="button" class="secondary-button" data-action="save">Guardar cambios</button>
                        <button type="button" class="danger-button" data-action="delete"${deleteAttributes}>Eliminar</button>
                    </div>
                </article>
            `;
        })
        .join('');
};

const applyUserUpdates = (username, updates) => {
    if (!username || !updates) {
        return;
    }

    if (credentials[username]) {
        persistCredentialOverride(username, updates);
    } else {
        const overrides = readCredentialOverrides();
        overrides[username] = {
            ...(overrides[username] ?? {}),
            ...updates
        };
        writeCredentialOverrides(overrides);
    }

    if (activeUser?.username === username) {
        const roleChanged = updates.role && updates.role !== activeUser.role;
        activeUser = {
            ...activeUser,
            ...updates
        };
        persistActiveUser();
        populateProfile(activeUser);
        if (roleChanged && activeUser.role) {
            renderRoleDashboard(activeUser.role);
        }
    }

    renderUserList();
    showUserManagementFeedback('Cambios guardados correctamente.', false);
};

const createUserAccount = ({ username, name, email, role, password }) => {
    const normalizedUsername = username?.trim().toLowerCase();
    const trimmedName = name?.trim();
    const trimmedEmail = email?.trim();
    const normalizedRole = role ?? 'empleado';
    const trimmedPassword = password?.trim();

    if (!normalizedUsername || !/^[a-z0-9._-]{3,}$/i.test(normalizedUsername)) {
        showUserManagementFeedback('El usuario debe tener al menos 3 caracteres y solo puede contener letras, números, puntos, guiones o guiones bajos.', true);
        return false;
    }

    if (!trimmedName) {
        showUserManagementFeedback('Indica un nombre para la nueva cuenta.', true);
        return false;
    }

    if (!trimmedPassword || trimmedPassword.length < 4) {
        showUserManagementFeedback('La contraseña debe tener al menos 4 caracteres.', true);
        return false;
    }

    const overrides = readCredentialOverrides();
    const existingOverride = overrides[normalizedUsername];
    const existsInBase = Boolean(credentials[normalizedUsername]);

    if ((existsInBase && !existingOverride?.disabled) || (!existsInBase && existingOverride && !existingOverride.disabled)) {
        showUserManagementFeedback('Ese nombre de usuario ya está en uso. Elige otro diferente.', true);
        return false;
    }

    overrides[normalizedUsername] = {
        username: normalizedUsername,
        name: trimmedName,
        email: trimmedEmail ?? '',
        role: normalizedRole,
        password: trimmedPassword,
        phone: '',
        avatar: defaultAvatar
    };

    writeCredentialOverrides(overrides);
    renderUserList();
    if (createUserForm) {
        createUserForm.reset();
        const firstField = createUserForm.querySelector('input, select');
        if (firstField instanceof HTMLElement) {
            firstField.focus();
        }
    }
    showUserManagementFeedback('Usuario creado correctamente.', false);
    return true;
};

const deleteUserAccount = (username) => {
    if (!username) {
        return;
    }

    if (credentials[username]) {
        persistCredentialOverride(username, { disabled: true });
    } else {
        removeCredentialOverride(username);
    }

    if (activeUser?.username === username) {
        sessionStorage.removeItem('fibaroUser');
        window.location.replace('index.html');
        return;
    }

    renderUserList();
    showUserManagementFeedback('Usuario eliminado correctamente.', false);
};

const clearProfilePasswordFeedback = () => {
    if (profilePasswordFeedback) {
        profilePasswordFeedback.textContent = '';
        profilePasswordFeedback.classList.remove('error', 'success');
    }
};

const showProfilePasswordFeedback = (message, isError = true) => {
    if (!profilePasswordFeedback) {
        return;
    }

    profilePasswordFeedback.textContent = message;
    profilePasswordFeedback.classList.toggle('error', isError);
    profilePasswordFeedback.classList.toggle('success', !isError);
};

const resetProfileSecurityState = () => {
    if (profileCurrentPasswordInput) {
        profileCurrentPasswordInput.value = '';
    }
    if (profileNewPasswordInput) {
        profileNewPasswordInput.value = '';
    }
    if (profileConfirmPasswordInput) {
        profileConfirmPasswordInput.value = '';
    }
    clearProfilePasswordFeedback();
};

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
        email: 'alexandra.rivera@fibaro.com',
        phone: '+34 600 123 456',
        avatar: defaultAvatar
    },
    delegado: {
        password: 'delegado',
        role: 'delegado',
        name: 'Marcos Pérez',
        email: 'marcos.perez@fibaro.com',
        phone: '+34 600 987 654',
        avatar: defaultAvatar
    },
    empleado: {
        password: 'empleado',
        role: 'empleado',
        name: 'Lucía Gómez',
        email: 'lucia.gomez@fibaro.com',
        phone: '+34 600 741 258',
        avatar: defaultAvatar
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
    setProfileEditMode(false);
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
        setGodView(activeGodView);
        toggleCreateUserForm(false);
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

const formatLastLoginDate = (value) => {
    if (!value) {
        return '';
    }

    try {
        return new Date(value).toLocaleString('es-ES', {
            dateStyle: 'short',
            timeStyle: 'short'
        });
    } catch (error) {
        return '';
    }
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

    if (profilePhone) {
        profilePhone.textContent = userData.phone ?? '';
    }

    const formattedLastLogin = formatLastLoginDate(userData.lastLogin);

    if (profileLastLogin) {
        profileLastLogin.textContent = formattedLastLogin;
    }

    if (profileLastLoginStatic) {
        profileLastLoginStatic.textContent = formattedLastLogin || 'Sin registros';
    }

    const avatarSource = userData.avatar || defaultAvatar;

    if (profileAvatarImage) {
        profileAvatarImage.src = avatarSource;
    }

    if (profileButtonImage) {
        profileButtonImage.src = avatarSource;
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

    resetProfileSecurityState();
};

const setProfileEditMode = (isEditing) => {
    if (!profilePanel) {
        return;
    }

    if (isEditing) {
        profilePanel.setAttribute('data-editing', 'true');
        profileDataView?.setAttribute('hidden', 'hidden');
        profileEditForm?.removeAttribute('hidden');
        editProfileButton?.setAttribute('hidden', 'hidden');
        const firstField = profileEditForm?.querySelector('input:not([readonly]):not([type="hidden"])');
        if (firstField instanceof HTMLInputElement) {
            firstField.focus();
        }
    } else {
        profilePanel.removeAttribute('data-editing');
        profileDataView?.removeAttribute('hidden');
        profileEditForm?.setAttribute('hidden', 'hidden');
        editProfileButton?.removeAttribute('hidden');
        resetProfileSecurityState();
    }
};

const persistActiveUser = () => {
    if (!activeUser) {
        return;
    }

    sessionStorage.setItem('fibaroUser', JSON.stringify(activeUser));
};

const handleAvatarFile = (file) => {
    if (!file || !file.type.startsWith('image/')) {
        return;
    }

    const reader = new FileReader();
    reader.onload = () => {
        const result = reader.result;

        if (typeof result !== 'string') {
            return;
        }

        if (activeUser) {
            activeUser = {
                ...activeUser,
                avatar: result
            };
            persistActiveUser();
            persistCurrentUserOverride({ avatar: result });
            populateProfile(activeUser);
        }

        if (avatarInput) {
            avatarInput.value = '';
        }
    };

    reader.readAsDataURL(file);
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

    if (!userData?.role) {
        sessionStorage.removeItem('fibaroUser');
        window.location.replace('index.html');
        return;
    }

    userData.avatar = userData.avatar || defaultAvatar;
    userData.phone = userData.phone ?? '';

    if (!userData.password && userData.username) {
        const mergedCredential = getMergedCredential(userData.username);
        if (mergedCredential?.password) {
            userData.password = mergedCredential.password;
        }
    }

    activeUser = userData;

    renderRoleDashboard(activeUser.role);
    populateProfile(activeUser);
    setProfileEditMode(false);

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
                setProfileEditMode(false);
                if (activeUser) {
                    populateProfile(activeUser);
                }
                profilePanel.removeAttribute('hidden');
                profilePanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
            } else {
                setProfileEditMode(false);
                profilePanel.setAttribute('hidden', 'hidden');
            }
        });
    }

    if (editProfileButton) {
        editProfileButton.addEventListener('click', () => {
            if (!activeUser) {
                return;
            }

            populateProfile(activeUser);
            setProfileEditMode(true);
        });
    }

    if (cancelEditButton) {
        cancelEditButton.addEventListener('click', () => {
            if (activeUser) {
                populateProfile(activeUser);
            }
            setProfileEditMode(false);
        });
    }

    if (profileEditForm) {
        profileEditForm.addEventListener('submit', (event) => {
            event.preventDefault();

            if (!profileEditForm.checkValidity()) {
                profileEditForm.reportValidity();
                return;
            }

            if (!activeUser) {
                return;
            }

            clearProfilePasswordFeedback();

            const trimmedEmail = profileEmailInput?.value.trim() ?? '';
            const trimmedPhone = profilePhoneInput?.value.trim() ?? '';

            const updatedUser = {
                ...activeUser,
                email: trimmedEmail,
                phone: trimmedPhone
            };

            const currentPasswordValue = (profileCurrentPasswordInput?.value ?? '').trim();
            const newPasswordValue = (profileNewPasswordInput?.value ?? '').trim();
            const confirmPasswordValue = (profileConfirmPasswordInput?.value ?? '').trim();

            const wantsPasswordChange =
                currentPasswordValue.length > 0 ||
                newPasswordValue.length > 0 ||
                confirmPasswordValue.length > 0;

            if (wantsPasswordChange) {
                if (!currentPasswordValue) {
                    showProfilePasswordFeedback('Introduce tu contraseña actual para poder actualizarla.');
                    profileCurrentPasswordInput?.focus();
                    return;
                }

                if (currentPasswordValue !== activeUser.password) {
                    showProfilePasswordFeedback('La contraseña actual no es correcta.');
                    if (profileCurrentPasswordInput) {
                        profileCurrentPasswordInput.focus();
                        profileCurrentPasswordInput.select();
                    }
                    return;
                }

                if (!newPasswordValue || !confirmPasswordValue) {
                    showProfilePasswordFeedback('Escribe y confirma tu nueva contraseña.');
                    if (!newPasswordValue) {
                        profileNewPasswordInput?.focus();
                    } else {
                        profileConfirmPasswordInput?.focus();
                    }
                    return;
                }

                if (newPasswordValue !== confirmPasswordValue) {
                    showProfilePasswordFeedback('La nueva contraseña no coincide en ambos campos.');
                    profileConfirmPasswordInput?.focus();
                    profileConfirmPasswordInput?.select();
                    return;
                }

                if (newPasswordValue === activeUser.password) {
                    showProfilePasswordFeedback('La nueva contraseña debe ser diferente a la actual.');
                    profileNewPasswordInput?.focus();
                    profileNewPasswordInput?.select();
                    return;
                }

                updatedUser.password = newPasswordValue;
            }

            activeUser = updatedUser;
            persistActiveUser();
            persistCurrentUserOverride({
                email: updatedUser.email,
                phone: updatedUser.phone,
                ...(updatedUser.password ? { password: updatedUser.password } : {})
            });
            populateProfile(activeUser);
            setProfileEditMode(false);
        });
    }

    if (avatarSelectButton) {
        avatarSelectButton.addEventListener('click', (event) => {
            event.preventDefault();
            avatarInput?.click();
        });
    }

    if (avatarInput) {
        avatarInput.addEventListener('change', (event) => {
            const target = event.target;
            if (!(target instanceof HTMLInputElement) || !target.files?.length) {
                return;
            }

            const [file] = target.files;
            handleAvatarFile(file);
        });
    }

    if (avatarDropzone) {
        const clearDragState = () => {
            avatarDropzone.classList.remove('is-dragover');
        };

        avatarDropzone.addEventListener('dragover', (event) => {
            event.preventDefault();
            avatarDropzone.classList.add('is-dragover');
        });

        avatarDropzone.addEventListener('dragleave', (event) => {
            event.preventDefault();
            clearDragState();
        });

        avatarDropzone.addEventListener('drop', (event) => {
            event.preventDefault();
            clearDragState();
            const file = event.dataTransfer?.files?.[0];
            handleAvatarFile(file ?? null);
        });

        avatarDropzone.addEventListener('click', () => {
            avatarInput?.click();
        });

        avatarDropzone.addEventListener('keydown', (event) => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                avatarInput?.click();
            }
        });
    }

    if (godViewSwitch) {
        godViewSwitch.addEventListener('click', (event) => {
            const target = event.target;

            if (!(target instanceof HTMLButtonElement) || !target.dataset.view) {
                return;
            }

            setGodView(target.dataset.view);
        });
    }

    if (toggleCreateUserButton) {
        toggleCreateUserButton.addEventListener('click', () => {
            const shouldShow = createUserForm?.hasAttribute('hidden');
            toggleCreateUserForm(Boolean(shouldShow));
        });
    }

    if (cancelCreateUserButton) {
        cancelCreateUserButton.addEventListener('click', () => {
            toggleCreateUserForm(false);
        });
    }

    if (createUserForm) {
        createUserForm.addEventListener('submit', (event) => {
            event.preventDefault();

            const formData = new FormData(createUserForm);
            createUserAccount({
                username: formData.get('username'),
                name: formData.get('name'),
                email: formData.get('email'),
                role: formData.get('role'),
                password: formData.get('password')
            });
        });
    }

    if (userList) {
        userList.addEventListener('click', (event) => {
            const target = event.target;

            if (!(target instanceof HTMLElement)) {
                return;
            }

            const action = target.dataset.action;

            if (!action) {
                return;
            }

            const card = target.closest('.user-card');

            if (!card) {
                return;
            }

            const { username } = card.dataset;

            if (!username) {
                return;
            }

            if (action === 'save') {
                const nameField = card.querySelector('input[data-field="name"]');
                const emailField = card.querySelector('input[data-field="email"]');
                const roleField = card.querySelector('select[data-field="role"]');

                const nameValue = typeof nameField?.value === 'string' ? nameField.value.trim() : '';
                const emailValue = typeof emailField?.value === 'string' ? emailField.value.trim() : '';
                const roleValue = roleField?.value ?? 'empleado';

                if (!nameValue) {
                    showUserManagementFeedback('El nombre no puede quedar vacío.', true);
                    nameField?.focus();
                    return;
                }

                applyUserUpdates(username, {
                    name: nameValue,
                    email: emailValue,
                    role: roleValue
                });
            }

            if (action === 'delete') {
                const displayName = card.querySelector('input[data-field="name"]')?.value || username;

                if (!window.confirm(`¿Seguro que quieres eliminar la cuenta de "${displayName}"?`)) {
                    return;
                }

                deleteUserAccount(username);
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
        const user = getMergedCredential(username);

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
            phone: user.phone ?? '',
            avatar: user.avatar ?? defaultAvatar,
            lastLogin: new Date().toISOString(),
            password: user.password
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
