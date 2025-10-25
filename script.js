const rolePills = document.querySelectorAll('.role-pill');
const rolePanels = document.querySelectorAll('.role-panel');
const yearLabel = document.getElementById('year');

rolePills.forEach((pill) => {
    pill.addEventListener('click', () => {
        const selectedRole = pill.dataset.role;

        rolePills.forEach((btn) => {
            const isActive = btn === pill;
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
    });
});

if (yearLabel) {
    yearLabel.textContent = new Date().getFullYear();
}
