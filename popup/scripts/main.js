// main.js
document.addEventListener('DOMContentLoaded', () => {
  // Função de verificação local
  function isAuthenticated() {
      try {
          const data = localStorage.getItem('walletData');
          return !!data && !!JSON.parse(data)?.address;
      } catch {
          return false;
      }
  }

  // Verificação de autenticação
  if (isAuthenticated()) {
      window.location.href = 'dashboard.html';
      return;
  }

  // Código original
  const createBtn = document.getElementById('createWalletBtn');
  const importBtn = document.getElementById('importWalletBtn');

  createBtn.addEventListener('click', () => {
      window.location.href = 'create.html';
  });

  importBtn.addEventListener('click', () => {
      window.location.href = 'import.html';
  });
});