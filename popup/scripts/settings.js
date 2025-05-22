// settings.js

document.addEventListener('DOMContentLoaded', () => {
    console.log('[DEBUG] Settings page loaded');
  
    // Seleciona itens da navegação e botão logout
    const navItems = document.querySelectorAll('.nav-item');
    const logoutBtn = document.querySelector('.btn-send[style*="background: var(--error)"]'); // botão logout vermelho
  
    // Navegação entre páginas
    navItems.forEach(item => {
      item.addEventListener('click', () => {
        const page = item.dataset.page;
        if (page !== 'settings') {  // estamos na página settings
          window.location.href = `${page}.html`;
        }
      });
    });
  
    // Logout com confirmação
    logoutBtn?.addEventListener('click', () => {
      if (confirm('Tem certeza que deseja sair de todos os dispositivos?')) {
        window.location.href = '/login';
      }
    });
  
    console.log('[DEBUG] Settings page initialized');
  });
  