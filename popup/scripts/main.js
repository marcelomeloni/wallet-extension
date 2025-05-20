document.addEventListener('DOMContentLoaded', () => {
    const createBtn = document.getElementById('createWalletBtn');
    const importBtn = document.getElementById('importWalletBtn');
  
    createBtn.addEventListener('click', () => {
      window.location.href = 'create.html';
    });
  
    importBtn.addEventListener('click', () => {
      window.location.href = 'import.html';
    });
  });
  