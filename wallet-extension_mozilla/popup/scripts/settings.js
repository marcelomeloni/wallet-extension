document.addEventListener('DOMContentLoaded', () => {
    console.log('[DEBUG] Settings page loaded');
  
    // Recupera dados da carteira do localStorage
    const walletData = JSON.parse(localStorage.getItem('walletData'));
  
    if (walletData) {
        const publicKeySpan = document.getElementById('publicKeyValue');
        publicKeySpan.textContent = walletData.public_key;
    } else {
        alert('Wallet not found. Please import your wallet.');
        window.location.href = 'main.html';
    }
  
    // Toast de cópia
    function showToast(message) {
        let toast = document.createElement('div');
        toast.className = 'copy-toast show';
        toast.textContent = message;
        document.body.appendChild(toast);
  
        setTimeout(() => {
            toast.classList.remove('show');
            document.body.removeChild(toast);
        }, 2000);
    }
  
    // Função para copiar public key
    const copyPublicKey = () => {
        const publicKey = walletData?.public_key;
        if (publicKey) {
            navigator.clipboard.writeText(publicKey).then(() => {
                showToast('Public key copied!');
            });
        }
    };
  
    // Logout function
    const logout = () => {
        if (confirm('Tem certeza que deseja sair? Isso removerá seus dados locais.')) {
            localStorage.removeItem('walletData');
            window.location.href = 'main.html';
        }
    };
  
    // Set up event listeners AFTER functions are defined
    document.getElementById('backButton').addEventListener('click', () => history.back());
    document.getElementById('copyPublicKeyBtn').addEventListener('click', copyPublicKey);
    document.getElementById('logoutBtn').addEventListener('click', logout);
  
    // Navegação entre páginas
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const page = item.dataset.page;
            if (page !== 'settings') {
                window.location.href = `${page}.html`;
            }
        });
    });
  
    console.log('[DEBUG] Settings page initialized');
  });