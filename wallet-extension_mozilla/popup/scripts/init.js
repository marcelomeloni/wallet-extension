document.addEventListener('DOMContentLoaded', () => {
    const isLoggedIn = !!localStorage.getItem('walletData');
    
    if (isLoggedIn && window.location.pathname.includes('import.html')) {
        window.location.href = 'dashboard.html';
    }
    
    if (!isLoggedIn && !window.location.pathname.includes('import.html')) {
        window.location.href = 'main.html';
    }
});